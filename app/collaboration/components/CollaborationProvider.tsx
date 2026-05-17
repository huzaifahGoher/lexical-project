'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';

import type {
  CollaborationContextValue,
  CollaborationProviderProps,
  CollaborationUser,
} from '../types/collaborationTypes';

import {
  COLLABORATION_COLORS,
  DEFAULT_ROOM_ID,
  DEFAULT_WEBSOCKET_URL,
} from '../constants/collaborationConstants';

import { useCollaborationConnection } from '../hooks/useCollaborationConnection';

/**
 * Extended context value that also exposes providerFactory and disconnect
 * for use by CollaborativeEditor and other consumers.
 */
export interface CollaborationContextExtendedValue extends CollaborationContextValue {
  providerFactory: (id: string, yjsDocMap: Map<string, Y.Doc>) => WebsocketProvider;
  disconnect: () => void;
  error: string | null;
  retry: () => void;
}

const CollaborationContext = createContext<CollaborationContextExtendedValue | null>(null);

/**
 * Hook to consume the collaboration context.
 * Must be used within a CollaborationProvider.
 */
export function useCollaboration(): CollaborationContextExtendedValue {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

/**
 * Compute a deterministic color index from a user name by hashing.
 * Uses a simple string hash to pick a color from the palette.
 */
function getColorIndexFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % COLLABORATION_COLORS.length;
}

/**
 * CollaborationProvider initializes the collaboration connection and provides
 * context to the component tree with connection status, users, and provider factory.
 */
export function CollaborationProvider({
  children,
  userName,
  isObserver = false,
  roomId = DEFAULT_ROOM_ID,
  websocketUrl = DEFAULT_WEBSOCKET_URL,
}: CollaborationProviderProps) {
  // Assign a color from the palette based on the user name
  const userColor = useMemo(() => {
    const index = getColorIndexFromName(userName);
    return COLLABORATION_COLORS[index].color;
  }, [userName]);

  // Use the collaboration connection hook
  const { providerFactory, connectionStatus, connectedUsers, disconnect, error, retry } =
    useCollaborationConnection({
      roomId,
      websocketUrl,
      userName,
      userColor,
      isObserver,
    });

  // Compute the local user from the connected users list (matching by name)
  const localUser: CollaborationUser | null = useMemo(() => {
    return connectedUsers.find((user) => user.name === userName) ?? null;
  }, [connectedUsers, userName]);

  // Memoize the context value to avoid unnecessary re-renders
  const contextValue: CollaborationContextExtendedValue = useMemo(
    () => ({
      connectionStatus,
      connectedUsers,
      localUser,
      isObserver,
      providerFactory,
      disconnect,
      error,
      retry,
    }),
    [connectionStatus, connectedUsers, localUser, isObserver, providerFactory, disconnect, error, retry]
  );

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
