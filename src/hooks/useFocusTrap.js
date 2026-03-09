import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap() {
  const ref = useRef(null);
  const prevFocus = useRef(null);

  useEffect(() => {
    prevFocus.current = document.activeElement;
    const el = ref.current;
    if (!el) return;

    // Focus first focusable element
    const first = el.querySelector(FOCUSABLE);
    if (first) first.focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      const focusable = [...el.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
      if (prevFocus.current && typeof prevFocus.current.focus === 'function') {
        prevFocus.current.focus();
      }
    };
  }, []);

  return ref;
}
