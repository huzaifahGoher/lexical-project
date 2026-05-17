/**
 * Standalone y-websocket collaboration server with LevelDB persistence.
 *
 * This server handles Yjs document synchronization and awareness protocol
 * for the collaborative editing feature. It persists document state to LevelDB
 * so that documents survive server restarts.
 *
 * Usage: npx tsx server/collaboration-server.ts
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { Level } from 'level';

// --- Configuration ---

const HOST = process.env.HOST || 'localhost';
const PORT = parseInt(process.env.PORT || '1234', 10);
const PERSISTENCE_DIR = process.env.PERSISTENCE_DIR || './yjs-wss-db';

// --- Message Types (matching y-websocket protocol) ---

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_QUERY_AWARENESS = 3;

// --- Persistence Layer ---

const db = new Level<string, Buffer>(PERSISTENCE_DIR, {
  valueEncoding: 'buffer',
});

async function loadDocument(docName: string, doc: Y.Doc): Promise<void> {
  try {
    const stored = await db.get(docName);
    if (stored) {
      Y.applyUpdate(doc, new Uint8Array(stored));
      console.log(`[Persistence] Loaded document "${docName}" from LevelDB`);
    }
  } catch (err: any) {
    if (err.code === 'LEVEL_NOT_FOUND') {
      console.log(`[Persistence] No persisted state for "${docName}", starting fresh`);
    } else {
      console.error(`[Persistence] Error loading document "${docName}":`, err);
    }
  }
}

async function persistDocument(docName: string, doc: Y.Doc): Promise<void> {
  try {
    const state = Y.encodeStateAsUpdate(doc);
    await db.put(docName, Buffer.from(state));
  } catch (err) {
    console.error(`[Persistence] Error persisting document "${docName}":`, err);
  }
}

// --- Document & Connection Management ---

interface SharedDoc {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  connections: Map<WebSocket, Set<number>>; // conn -> set of controlled client IDs
}

const docs = new Map<string, SharedDoc>();

async function getOrCreateDoc(docName: string): Promise<SharedDoc> {
  let shared = docs.get(docName);
  if (shared) return shared;

  const doc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(doc);

  // Load persisted state
  await loadDocument(docName, doc);

  // Persist on every update
  doc.on('update', () => {
    persistDocument(docName, doc);
  });

  shared = { doc, awareness, connections: new Map() };
  docs.set(docName, shared);
  return shared;
}

/**
 * Send a message to all connected clients except the sender.
 */
function broadcastToOthers(shared: SharedDoc, sender: WebSocket, message: Uint8Array): void {
  shared.connections.forEach((_clientIds, conn) => {
    if (conn !== sender && conn.readyState === WebSocket.OPEN) {
      conn.send(message);
    }
  });
}

/**
 * Send a message to ALL connected clients (including sender).
 */
function broadcastToAll(shared: SharedDoc, message: Uint8Array): void {
  shared.connections.forEach((_clientIds, conn) => {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
    }
  });
}

/**
 * Handle an incoming message from a client.
 */
function handleMessage(conn: WebSocket, shared: SharedDoc, message: Uint8Array): void {
  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case MESSAGE_SYNC: {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);

      const syncMessageType = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        shared.doc,
        conn
      );

      // If the encoder has a response (sync step 2 reply), send it back to the client
      if (encoding.length(encoder) > 1) {
        conn.send(encoding.toUint8Array(encoder));
      }

      // If this was a sync step 2 (update from client), broadcast to other clients
      // syncMessageType: 0 = step1, 1 = step2, 2 = update
      if (syncMessageType === syncProtocol.messageYjsSyncStep2 || syncMessageType === syncProtocol.messageYjsUpdate) {
        // The update has already been applied to shared.doc by readSyncMessage.
        // Now we need to broadcast the original message to other clients.
        broadcastToOthers(shared, conn, message);
      }
      break;
    }
    case MESSAGE_AWARENESS: {
      const update = decoding.readVarUint8Array(decoder);
      awarenessProtocol.applyAwarenessUpdate(shared.awareness, update, conn);

      // Broadcast awareness update to all OTHER clients
      broadcastToOthers(shared, conn, message);
      break;
    }
    case MESSAGE_QUERY_AWARENESS: {
      // Client is requesting all awareness states
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          shared.awareness,
          Array.from(shared.awareness.getStates().keys())
        )
      );
      conn.send(encoding.toUint8Array(encoder));
      break;
    }
    default:
      console.warn(`[Server] Unknown message type: ${messageType}`);
  }
}

/**
 * Set up a new WebSocket connection for a client.
 */
function setupConnection(conn: WebSocket, shared: SharedDoc): void {
  // Track this connection
  shared.connections.set(conn, new Set());

  // Send sync step 1 to the new client (request their state)
  const encoderSync1 = encoding.createEncoder();
  encoding.writeVarUint(encoderSync1, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoderSync1, shared.doc);
  conn.send(encoding.toUint8Array(encoderSync1));

  // Send sync step 2 to the new client (our full document state)
  const encoderSync2 = encoding.createEncoder();
  encoding.writeVarUint(encoderSync2, MESSAGE_SYNC);
  syncProtocol.writeSyncStep2(encoderSync2, shared.doc);
  conn.send(encoding.toUint8Array(encoderSync2));

  // Send current awareness states to the new client
  const awarenessStates = shared.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoderAwareness = encoding.createEncoder();
    encoding.writeVarUint(encoderAwareness, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoderAwareness,
      awarenessProtocol.encodeAwarenessUpdate(
        shared.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    conn.send(encoding.toUint8Array(encoderAwareness));
  }

  // Handle incoming messages
  conn.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
    try {
      let buf: Uint8Array;
      if (data instanceof ArrayBuffer) {
        buf = new Uint8Array(data);
      } else if (Buffer.isBuffer(data)) {
        buf = new Uint8Array(data);
      } else {
        buf = new Uint8Array(Buffer.concat(data as Buffer[]));
      }
      handleMessage(conn, shared, buf);
    } catch (err) {
      console.error('[Server] Error handling message:', err);
    }
  });

  // Handle disconnect
  conn.on('close', () => {
    const controlledIds = shared.connections.get(conn);
    shared.connections.delete(conn);

    // Remove awareness states for this connection
    if (controlledIds && controlledIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(
        shared.awareness,
        Array.from(controlledIds),
        null
      );
    }

    // If no more connections, we could clean up the doc (optional)
    if (shared.connections.size === 0) {
      console.log(`[Server] No more connections, keeping doc in memory`);
    }
  });

  // Track which awareness client IDs this connection controls
  shared.awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
    const controlledIds = shared.connections.get(conn);
    if (!controlledIds) return;
    added.forEach((id) => controlledIds.add(id));
    removed.forEach((id) => controlledIds.delete(id));
  });
}

// --- HTTP + WebSocket Server ---

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('y-websocket collaboration server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', async (conn: WebSocket, req) => {
  // Extract room name from URL path (e.g., /default-room -> "default-room")
  const urlPath = req.url || '/';
  const docName = urlPath.slice(1).split('?')[0] || 'default-room';

  console.log(`[Server] Client connected to room "${docName}" (total: ${wss.clients.size})`);

  try {
    const shared = await getOrCreateDoc(docName);
    setupConnection(conn, shared);
  } catch (err) {
    console.error(`[Server] Error setting up connection for room "${docName}":`, err);
    conn.close();
  }
});

// --- Start Server ---

server.listen(PORT, HOST, () => {
  console.log(`[Server] y-websocket collaboration server running on ws://${HOST}:${PORT}`);
  console.log(`[Server] Persistence directory: ${PERSISTENCE_DIR}`);
});

// --- Graceful Shutdown ---

process.on('SIGINT', async () => {
  console.log('\n[Server] Shutting down...');
  wss.close();
  server.close();
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[Server] Shutting down...');
  wss.close();
  server.close();
  await db.close();
  process.exit(0);
});
