// =====================================================================
// useLog — a tiny custom hook that keeps a list of log lines for the "Log" box.
// Not socket-related; it just keeps the level pages short.
// =====================================================================

// useState    → the list of lines (state, so the UI re-renders when it grows)
// useCallback → keep the SAME `log` function object between renders
import { useCallback, useState } from "react";

export interface LogLine {
  id: number;   // unique id, used as the React `key` when rendering the list
  text: string;
}

// Module-level counter: lives outside any component, shared by all calls, never reset.
let nextId = 0;

export function useLog() {
  const [lines, setLines] = useState<LogLine[]>([]);

  // Why useCallback? Pages put `log` in useEffect dependency arrays, e.g.
  //   useEffect(() => { socket.on("msg", (m) => log(m)) ... }, [socket, log])
  // Without useCallback, `log` would be a NEW function on every render, so that effect
  // would unsubscribe and re-subscribe after every single render.
  // With useCallback(fn, []), React returns the same function forever.
  const log = useCallback((text: string) => {
    const line = { id: nextId++, text: `${new Date().toLocaleTimeString()}  ${text}` };
    // Functional update setLines(prev => ...): compute the new list from the LATEST list.
    // Important when many logs arrive quickly, because `lines` captured in a closure
    // could be outdated ("stale").
    // [line, ...prev]: new array, newest first (spread copies the old items after it).
    // .slice(0, 100): keep at most 100 lines.
    setLines((prev) => [line, ...prev].slice(0, 100));
  }, []);

  return { lines, log };
}
