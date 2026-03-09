import { useState, useEffect, useRef } from 'react';

export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // Storage quota exceeded or unavailable — silent fail
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [key, state]);

  return [state, setState];
}
