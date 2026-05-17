'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme, Button, Checkbox } from '@huzaifah191001/design-library';

interface NameEntryModalProps {
  onSubmit: (name: string, isObserver: boolean) => void;
}

/**
 * Modal dialog prompting the user for their display name before joining
 * the collaboration session. Uses design library components and theme tokens.
 */
export function NameEntryModal({ onSubmit }: NameEntryModalProps) {
  const [name, setName] = useState('');
  const [isObserver, setIsObserver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  // Auto-focus the name input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    const displayName = trimmedName.length > 0 ? trimmedName : 'Anonymous User';
    onSubmit(displayName, isObserver);
  }, [name, isObserver, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-entry-title"
        className="w-full max-w-md rounded-lg shadow-xl p-6 mx-4"
        style={{
          backgroundColor: theme.colors.bg,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          id="name-entry-title"
          className="text-xl font-semibold mb-4"
          style={{ color: theme.colors.text }}
        >
          Join Collaboration Session
        </h2>

        <div className="mb-4">
          <label
            htmlFor="name-input"
            className="block text-sm font-medium mb-1"
            style={{ color: theme.colors.textMuted }}
          >
            Display Name
          </label>
          <input
            ref={inputRef}
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name"
            className="w-full px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: theme.colors.bgSurface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
            }}
          />
        </div>

        <div className="mb-6">
          <Checkbox
            checked={isObserver}
            onChange={(checked) => setIsObserver(checked)}
            label="Join as Observer (read-only)"
            variant="highlighted"
          />
        </div>

        <Button onClick={handleSubmit} variant="filled" style={{ width: "100%" }}>
          Join
        </Button>
      </div>
    </div>
  );
}
