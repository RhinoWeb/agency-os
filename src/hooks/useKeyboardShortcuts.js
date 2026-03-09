import { useEffect, useRef } from 'react';

/**
 * Global keyboard shortcut handler.
 * Supports single keys, Ctrl combos, and two-key sequences (e.g., "g d").
 * Shortcuts are suppressed when focus is in an input/textarea/select.
 */
export function useKeyboardShortcuts(shortcuts) {
  const pendingRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function isInput(el) {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    }

    function handler(e) {
      // Don't intercept when typing in inputs (except for Ctrl/Meta combos and Escape)
      const inInput = isInput(document.activeElement);
      const hasModifier = e.ctrlKey || e.metaKey;

      if (inInput && !hasModifier && e.key !== 'Escape') return;

      // Build the key representation
      const key = e.key.toLowerCase();

      // Check for pending two-key sequence
      if (pendingRef.current) {
        const seqKey = `${pendingRef.current} ${key}`;
        pendingRef.current = null;
        clearTimeout(timerRef.current);

        const match = shortcuts.find(s => s.key === seqKey);
        if (match) {
          e.preventDefault();
          match.action();
          return;
        }
      }

      // Check for Ctrl/Meta combos
      if (hasModifier) {
        const combo = `ctrl+${e.shiftKey ? 'shift+' : ''}${key}`;
        const match = shortcuts.find(s => s.key === combo);
        if (match) {
          e.preventDefault();
          match.action();
          return;
        }
      }

      // Check for single key match
      const match = shortcuts.find(s => s.key === key && !s.key.includes(' ') && !s.key.includes('+'));
      if (match) {
        e.preventDefault();
        match.action();
        return;
      }

      // Check if this could be the first key of a sequence
      const isSeqStart = shortcuts.some(s => s.key.startsWith(key + ' '));
      if (isSeqStart && !inInput) {
        e.preventDefault();
        pendingRef.current = key;
        timerRef.current = setTimeout(() => { pendingRef.current = null; }, 600);
      }
    }

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(timerRef.current);
    };
  }, [shortcuts]);
}
