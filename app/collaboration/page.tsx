'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';

import '@/app/components/editor/editorTheme.css';

import StoreProvider from '@/app/StoreProvider';
import { initializeState, themeType } from '@/lib/features/theme/themeSlice';
import { useAppSelector, useAppStore } from '@/lib/hook';
import { RootState } from '@/lib/store';
import {
  Button,
  darkSemantic,
  semantic,
  ThemeProvider,
  useTheme,
} from '@huzaifah191001/design-library';

import { COLLABORATION_COLORS } from './constants/collaborationConstants';
import { NameEntryModal } from './components/NameEntryModal';
import { CollaborationProvider, useCollaboration } from './components/CollaborationProvider';
import CollaborativeEditor from './components/CollaborativeEditor';
import { PresenceAvatarBar } from './components/PresenceAvatarBar';
import ConnectionStatusIndicator from './components/ConnectionStatusIndicator';

/**
 * Header component rendered inside CollaborationProvider so it can
 * access the collaboration context for presence and connection status.
 */
function CollaborationHeader() {
  const { connectionStatus, connectedUsers, localUser, error, retry } = useCollaboration();
  const theme = useTheme();

  return (
    <div className="flex flex-col shrink-0">
      {error && (
        <div className="flex items-center justify-between px-2 py-2 border-b text-sm" role="alert"
          style={{ backgroundColor: theme.colors.bgDanger, borderColor: theme.colors.borderDanger, color: theme.colors.textDanger }}
        >
          <span>{error}</span>
          <Button
            onClick={retry}
            variant="danger"
            style={{ marginLeft: "16px", fontSize: theme.fontSizes.sm }}
          >
            Retry
          </Button>
        </div>
      )}
      {!error && connectionStatus === 'offline' && (
        <div className="flex items-center justify-between px-2 py-2 border-b text-sm" role="status"
          style={{ backgroundColor: theme.colors.bgChecked, borderColor: theme.colors.borderChecked, color: theme.colors.actionText }}
        >
          <span>You are offline. Local edits will sync when reconnected.</span>
          <Button
            onClick={retry}
            variant="subtle"
            style={{ marginLeft: "16px", fontSize: theme.fontSizes.sm }}
          >
            Retry Connection
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200">
        <PresenceAvatarBar users={connectedUsers} localUser={localUser} />
        <div className="flex items-center gap-3">
          <ConnectionStatusIndicator status={connectionStatus} />
          <Link href="/" title="Solo Editor" style={{ textDecoration: "none" }}>
            <Button variant="filled" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: theme.fontSizes.sm }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                width={14}
                height={14}
                alt="Solo Editor"
                src="/collaboration/solo-user.svg"
              />
              Solo Editor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Inner component that has access to the Redux store for theme.
 */
function CollaborationContent({ userName, userColor, isObserver }: { userName: string; userColor: string; isObserver: boolean }) {
  const store = useAppStore();
  const initialized = useRef(false);
  if (!initialized.current) {
    store.dispatch(initializeState);
    initialized.current = true;
  }

  const currentTheme = useAppSelector(
    (state: RootState) => state.themeObject.theme
  ) as themeType;
  const theme = currentTheme === 'dark' ? darkSemantic : semantic;

  return (
    <ThemeProvider themeType={currentTheme}>
      <div
        className="flex flex-col h-screen w-full overflow-hidden"
        style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
      >
        <CollaborationProvider userName={userName} isObserver={isObserver}>
          <CollaborationHeader />
          <div className="flex-1 overflow-auto p-2">
            <CollaborativeEditor userName={userName} userColor={userColor} isObserver={isObserver} />
          </div>
        </CollaborationProvider>
      </div>
    </ThemeProvider>
  );
}

/**
 * CollaborationPage is the main page component at /collaboration.
 * It manages the user join flow and renders the collaborative editor session.
 */
export default function CollaborationPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isObserver, setIsObserver] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleSubmit = useCallback((name: string, observer: boolean) => {
    setUserName(name);
    setIsObserver(observer);
    setHasJoined(true);
  }, []);

  // Compute color from userName (stable as long as userName doesn't change)
  const userColor = useMemo(() => {
    if (!userName) return '#E91E63';
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      const char = userName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return COLLABORATION_COLORS[Math.abs(hash) % COLLABORATION_COLORS.length].color;
  }, [userName]);

  // Show name entry modal until user has joined
  if (!hasJoined || !userName) {
    return <NameEntryModal onSubmit={handleSubmit} />;
  }

  return (
    <StoreProvider>
      <CollaborationContent userName={userName} userColor={userColor} isObserver={isObserver} />
    </StoreProvider>
  );
}
