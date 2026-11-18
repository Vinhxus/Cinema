// =====================================================================
// LEVEL 1 — CONNECTING  (server: be/socket-lab/01-connect/server.js)
//
// Goal: see the socket life cycle from React:
//   create socket → connect → (connected) → disconnect → reconnect ...
// This level does everything BY HAND inside the component. Levels 2-7 move the
// same code into the useSocket() hook (see useSocket.ts) — compare the two!
// =====================================================================

// React hooks used here:
//   useState  → values that survive re-renders and trigger a re-render when changed
//   useEffect → run side effects (connect, subscribe) after render, with a cleanup
import { useEffect, useState } from "react";

// `io` creates a socket. It comes from socket.io-client (fe/node_modules), the CLIENT
// half of Socket.IO. The server half (`socket.io`) is only used in be/.
import { io } from "socket.io-client";

import { LAB_SERVER_URL } from "./config"; // "http://localhost:4000"
import { useLog } from "./useLog";          // our hook for the Log box
import { Btn, LabPage, LogList, Status } from "./ui"; // our styled components

export default function L1Connect() {
  // ---- 1. CREATE THE SOCKET (once) ---- 
  const [socket] = useState(() => io(LAB_SERVER_URL, { autoConnect: false }));
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();
  const { lines, log } = useLog();

  // ---- 2. CONNECT + LISTEN, AND CLEAN UP ----
  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setSocketId(socket.id);
      log(`connect, id = ${socket.id}`);
    };

    const onDisconnect = (reason: string) => {
      setConnected(false);
      log(`disconnect: ${reason}`);
    };

    // socket.on(event, handler): register a listener.
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.connect(); // start connecting (asynchronous: "connect" fires a bit later)

    // CLEANUP — React calls this when the component unmounts (you navigate away).
    return () => {
      // socket.off(event, handler): remove THAT listener. It must be the same function
      // object, which is why the handlers above are named constants.
      // Forgetting off() = every remount adds another listener → handlers run 2x, 3x...
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };

    // Re-run only if socket or log change. Neither ever changes (socket comes from
    // useState, log from useCallback), so this runs once per mount.
    // In dev, <StrictMode> mounts → unmounts → mounts on purpose, so the server terminal
    // shows connected / disconnected / connected. That's normal.
  }, [socket, log]);

  return (
    <LabPage
      title="Level 1 — Connecting"
      hint="Open this page in 3 tabs and watch the server terminal. Then stop the server (Ctrl+C) and start it again."
    >
      <p>Status: <Status connected={connected} /></p>
      <p>
        socket.id of this tab: <code className="rounded bg-gray-100 px-1">{socketId ?? "—"}</code>
      </p>
      <div className="flex gap-2">
        {/* Calling socket methods from event handlers is fine: these are user actions,
            not render logic. disconnect() = close on purpose (no auto-reconnect). */}
        <Btn onClick={() => socket.disconnect()}>socket.disconnect()</Btn>
        <Btn onClick={() => socket.connect()}>socket.connect()</Btn>
      </div>
      <LogList lines={lines} />
      {/* TRY: restart the server → the tab reconnects by itself. Does socket.id stay the same? */}
    </LabPage>
  );
}
