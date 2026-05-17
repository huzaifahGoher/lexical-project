"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@huzaifah191001/design-library";

import type { CollaborationUser } from "../types/collaborationTypes";

interface PresenceAvatarBarProps {
  users: CollaborationUser[];
  localUser: CollaborationUser | null;
}

/**
 * Individual avatar circle for a connected user.
 * Shows initials, assigned color, observer indicator, and tooltip on hover.
 */
const Avatar = React.memo(function Avatar({
  user,
  isLocal,
  borderColor,
}: {
  user: CollaborationUser;
  isLocal: boolean;
  borderColor: string;
}) {
  return (
    <div
      className="presence-avatar-enter relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white select-none shrink-0"
      style={{
        backgroundColor: user.color,
        border: isLocal
          ? `2px solid ${borderColor}`
          : `1.5px solid ${borderColor}`,
        boxShadow: isLocal ? `0 0 0 2px ${user.color}` : undefined,
      }}
      title={`${user.name}${isLocal ? " (You)" : ""}${user.isObserver ? " — Observer" : ""}`}
      aria-label={`${user.name}${isLocal ? " (You)" : ""}${user.isObserver ? " — Observer" : ""}`}
    >
      {user.initials.slice(0, 2)}

      {/* Observer indicator: small eye icon */}
      {user.isObserver && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] leading-none"
          style={{ backgroundColor: borderColor, color: user.color }}
          aria-label="Observer"
        >
          👁
        </span>
      )}

      {/* Local user "You" indicator */}
      {isLocal && !user.isObserver && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[7px] font-bold leading-none bg-white"
          style={{ color: user.color, border: `1px solid ${user.color}` }}
        >
          ✓
        </span>
      )}
    </div>
  );
});

/**
 * Wrapper that handles fade-out animation when a user leaves.
 * Keeps the avatar rendered during the exit animation before removing it from DOM.
 */
function AnimatedAvatar({
  user,
  isLocal,
  borderColor,
  isLeaving,
  onExitComplete,
}: {
  user: CollaborationUser;
  isLocal: boolean;
  borderColor: string;
  isLeaving: boolean;
  onExitComplete: (clientId: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLeaving) {
      const timer = setTimeout(() => {
        onExitComplete(user.clientId);
      }, 300); // Match the CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [isLeaving, user.clientId, onExitComplete]);

  return (
    <div ref={ref} className={isLeaving ? "presence-avatar-exit" : ""}>
      <Avatar user={user} isLocal={isLocal} borderColor={borderColor} />
    </div>
  );
}

/**
 * PresenceAvatarBar displays connected users as colored avatar circles with initials.
 * Features fade-in/fade-out animations, tooltips, and observer indicators.
 */
const PresenceAvatarBar = React.memo(function PresenceAvatarBar({
  users,
  localUser,
}: PresenceAvatarBarProps) {
  const themeStyles = useTheme();

  const bgColor = themeStyles?.colors?.bg ?? "#ffffff";
  const borderColor = themeStyles?.colors?.border ?? "#e0e0e0";

  // Track users that are leaving (for fade-out animation)
  const [leavingUsers, setLeavingUsers] = useState<CollaborationUser[]>([]);
  const prevUsersRef = useRef<CollaborationUser[]>(users);

  useEffect(() => {
    const prevUsers = prevUsersRef.current;
    const currentIds = new Set(users.map((u) => u.clientId));

    // Find users that were in the previous list but not in the current list
    const departed = prevUsers.filter((u) => !currentIds.has(u.clientId));

    if (departed.length > 0) {
      setLeavingUsers((prev) => [...prev, ...departed]);
    }

    prevUsersRef.current = users;
  }, [users]);

  const handleExitComplete = React.useCallback((clientId: number) => {
    setLeavingUsers((prev) => prev.filter((u) => u.clientId !== clientId));
  }, []);

  // If no users and no leaving users, render nothing
  if (users.length === 0 && leavingUsers.length === 0) {
    return null;
  }

  return (
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes presenceAvatarFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes presenceAvatarFadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        .presence-avatar-enter {
          animation: presenceAvatarFadeIn 0.3s ease-out forwards;
        }

        .presence-avatar-exit {
          animation: presenceAvatarFadeOut 0.3s ease-out forwards;
        }
      `}</style>

      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
        }}
        role="group"
        aria-label="Connected users"
      >
        {/* Active users */}
        {users.map((user) => (
          <AnimatedAvatar
            key={user.clientId}
            user={user}
            isLocal={localUser?.clientId === user.clientId}
            borderColor={borderColor}
            isLeaving={false}
            onExitComplete={handleExitComplete}
          />
        ))}

        {/* Leaving users (fade-out) */}
        {leavingUsers.map((user) => (
          <AnimatedAvatar
            key={`leaving-${user.clientId}`}
            user={user}
            isLocal={false}
            borderColor={borderColor}
            isLeaving={true}
            onExitComplete={handleExitComplete}
          />
        ))}
      </div>
    </>
  );
});

export { PresenceAvatarBar };
export type { PresenceAvatarBarProps };
