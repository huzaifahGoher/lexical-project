'use client';

import { useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import type {
  ConnectionStatus,
  CollaborationUser,
  UseCollaborationConnectionOptions,
} from '../types/collaborationTypes';

import {
  RECONNECTION_BASE_DELAY,
  RECONNECTION_MAX_DELAY,
  AWARENESS_THROTTLE_MS,
  CONNECTION_TIMEOUT_MS,
} from '../constants/collaborationConstants';

/**
 * Compute initials from a display name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate exponential backoff delay for reconnection attempts.
 */
export function getBackoffDelay(attempt: number): number {
  return Math.min(
    RECONNECTION_BASE_DELAY * Math.pow(2, attempt),
    RECONNECTION_MAX_DELAY
  );
}

export interface UseCollaborationConnectionReturn {
  providerFactory: (id: string, yjsDocMap: Map<string, Y.Doc>) => WebsocketProvider;
  connectionStatus: ConnectionStatus;
  connectedUsers: CollaborationUser[];
  disconnect: () => void;
  error: string | null;
  retry: () => void;
}

/**
 * Hook that manages the WebSocket collaboration connection lifecycle.
 *
 * CRITICAL: providerFactory must have a STABLE reference (never change between renders)
 * because the CollaborationPlugin uses it in a useEffect dependency. If it changes,
 * the plugin re-initializes, disconnects, and reconnects in a loop.
 */
export function useCollaborationConnection(
  options: UseCollaborationConnectionOptions
): UseCollaborationConnectionReturn {
  const { roomId, websocketUrl } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs for mutable state that doesn't trigger re-renders
  const providerRef = useRef<WebsocketProvider | null>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const lastAwarenessUpdateRef = useRef<number>(0);
  const awarenessThrottleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCleanedUpRef = useRef<boolean>(false);
  // Store options in a ref so providerFactory can access latest values without re-creating
  const optionsRef = useRef(options);
  optionsRef.current = options;

  /**
   * Parse awareness states into CollaborationUser[].
   * The CollaborationPlugin sets state at top level: { name, color, ... }
   */
  function parseAwarenessStates(provider: WebsocketProvider): CollaborationUser[] {
    const awareness = provider.awareness;
    const states = awareness.getStates() as Map<number, any>;
    const users: CollaborationUser[] = [];

    states.forEach((state, clientId) => {
      if (state && state.name) {
        users.push({
          clientId,
          name: state.name,
          color: state.color || '#E91E63',
          initials: getInitials(state.name),
          isObserver: state.awarenessData?.isObserver || false,
        });
      }
    });

    return users;
  }

  /**
   * Throttled awareness update.
   */
  function handleAwarenessUpdate(provider: WebsocketProvider): void {
    if (isCleanedUpRef.current) return;

    const now = Date.now();
    const elapsed = now - lastAwarenessUpdateRef.current;

    if (elapsed >= AWARENESS_THROTTLE_MS) {
      lastAwarenessUpdateRef.current = now;
      setConnectedUsers(parseAwarenessStates(provider));
    } else {
      if (awarenessThrottleTimerRef.current) {
        clearTimeout(awarenessThrottleTimerRef.current);
      }
      awarenessThrottleTimerRef.current = setTimeout(() => {
        if (isCleanedUpRef.current) return;
        lastAwarenessUpdateRef.current = Date.now();
        setConnectedUsers(parseAwarenessStates(provider));
      }, AWARENESS_THROTTLE_MS - elapsed);
    }
  }

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      try { providerRef.current.disconnect(); } catch { /* ignore */ }
    }
    isCleanedUpRef.current = true;
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (awarenessThrottleTimerRef.current) {
      clearTimeout(awarenessThrottleTimerRef.current);
      awarenessThrottleTimerRef.current = null;
    }
    providerRef.current = null;
    setConnectionStatus('offline');
  }, []);

  const retry = useCallback(() => {
    disconnect();
    setError(null);
    setConnectionStatus('connecting');
    // Force re-mount of the editor to trigger a fresh providerFactory call
    // This is handled by the parent component re-keying
  }, [disconnect]);

  /**
   * STABLE provider factory — uses useRef to avoid dependency chain issues.
   * This function reference NEVER changes between renders.
   *
   * Called once by CollaborationPlugin on mount. The plugin then owns the
   * provider lifecycle (connect/disconnect/sync).
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>): WebsocketProvider => {
      const opts = optionsRef.current;
      isCleanedUpRef.current = false;
      reconnectAttemptRef.current = 0;

      // Get or create the Y.Doc
      let doc = yjsDocMap.get(id);
      if (!doc) {
        doc = new Y.Doc();
        yjsDocMap.set(id, doc);
      }

      // Create provider with connect: false (plugin calls connect())
      const provider = new WebsocketProvider(opts.websocketUrl, opts.roomId, doc, {
        connect: false,
      });
      providerRef.current = provider;

      // --- Status tracking ---
      provider.on('status', ({ status }: { status: string }) => {
        if (isCleanedUpRef.current) return;

        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        switch (status) {
          case 'connected':
            reconnectAttemptRef.current = 0;
            setConnectionStatus('connected');
            setError(null);
            break;
          case 'connecting':
            if (reconnectAttemptRef.current > 0) {
              setConnectionStatus('reconnecting');
            } else {
              setConnectionStatus('connecting');
            }
            connectionTimeoutRef.current = setTimeout(() => {
              if (!isCleanedUpRef.current) {
                setConnectionStatus('offline');
                setError('Failed to connect to the collaboration server.');
              }
            }, CONNECTION_TIMEOUT_MS);
            break;
          case 'disconnected':
            reconnectAttemptRef.current += 1;
            setConnectionStatus('reconnecting');
            connectionTimeoutRef.current = setTimeout(() => {
              if (!isCleanedUpRef.current) {
                setConnectionStatus('offline');
                setError('Connection lost. Unable to reconnect.');
              }
            }, CONNECTION_TIMEOUT_MS);
            break;
        }
      });

      // --- Awareness tracking ---
      provider.awareness.on('change', () => {
        handleAwarenessUpdate(provider);
      });

      // Initial connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (!isCleanedUpRef.current) {
          setConnectionStatus('offline');
          setError('Failed to connect to the collaboration server.');
        }
      }, CONNECTION_TIMEOUT_MS);

      return provider;
    },
    [] // Empty deps — this reference NEVER changes
  );

  return {
    providerFactory,
    connectionStatus,
    connectedUsers,
    disconnect,
    error,
    retry,
  };
}
