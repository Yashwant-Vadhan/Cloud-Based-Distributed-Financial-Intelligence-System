import { useEffect, useRef } from "react";

// Events that count as "user activity" and reset the inactivity timer
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

/**
 * useInactivityLogout
 * Automatically calls `onLogout` after `timeoutMs` milliseconds of inactivity.
 * Resets the timer whenever the user performs any activity.
 *
 * @param {number|null} timeoutMs - Timeout in ms (e.g. 5 * 60 * 1000 for 5 min). Pass null to disable.
 * @param {Function} onLogout    - Callback to invoke on timeout (should clear session + redirect).
 */
function useInactivityLogout(timeoutMs, onLogout) {
  const timerRef = useRef(null);

  useEffect(() => {
    // If timeoutMs is null/0/undefined, do nothing (hook is disabled)
    if (!timeoutMs) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onLogout, timeoutMs);
    };

    // Start timer immediately
    resetTimer();

    // Listen for activity events on the window (capture phase for reliability)
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, true)
    );

    // Cleanup on unmount or when deps change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer, true)
      );
    };
  }, [timeoutMs, onLogout]);
}

export default useInactivityLogout;
