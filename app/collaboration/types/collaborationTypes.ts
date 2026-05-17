import type React from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';

export interface CollaborationUser {
  clientId: number;
  name: string;
  color: string;
  initials: string;
  isObserver: boolean;
}

export interface CollaborationContextValue {
  connectionStatus: ConnectionStatus;
  connectedUsers: CollaborationUser[];
  localUser: CollaborationUser | null;
  isObserver: boolean;
}

export interface AwarenessState {
  user: {
    name: string;
    color: string;
    colorLight: string;
    isObserver: boolean;
  };
}

export interface CollaborationProviderProps {
  children: React.ReactNode;
  userName: string;
  isObserver?: boolean;
  roomId?: string;
  websocketUrl?: string;
}

export interface UseCollaborationConnectionOptions {
  roomId: string;
  websocketUrl: string;
  userName: string;
  userColor: string;
  isObserver: boolean;
}
