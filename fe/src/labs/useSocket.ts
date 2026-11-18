// =====================================================================
// useSocket — a custom hook that gives a component its own socket connection.
//
// Level 1 writes this logic by hand inside the component so you can see every
// step. From level 2 on, the levels call this hook instead, so each page can
// focus on the new socket concept.
//
// What it does:
//   1. creates ONE socket object for the lifetime of the component
//   2. connects when the component appears (mounts)
//   3. disconnects when the component disappears (unmounts) — e.g. you leave the page
//   4. exposes `connected` as React state, so the UI re-renders when it changes
// =====================================================================

// React hooks:
//   useState  → state that survives re-renders; changing it triggers a re-render
//   useEffect → run "side effects" (connecting, subscribing, timers) AFTER render,
//               with an optional cleanup function that undoes them
import { useEffect, useState } from "react";

// From the socket.io-client package (installed in fe/node_modules):
//   io                → function that creates a socket (a connection to a server)
//   type Socket       → TypeScript type of the object io() returns
//   type ManagerOptions / SocketOptions → TypeScript types of the options io() accepts
// The `type` keyword marks type-only imports. They disappear when TypeScript is
// compiled to JavaScript. Your tsconfig has "verbatimModuleSyntax": true, which
// REQUIRES this keyword for type-only imports.
import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

import { LAB_SERVER_URL } from "./config";

// Tell TypeScript that `window` may have a `labSocket` property (used below).
// `declare global` adds to a type that already exists globally (Window, from the DOM lib).
declare global {
  interface Window {
    labSocket?: Socket;
  }
}

// Partial<A & B>: TypeScript utility types.
//   A & B       → an object type having all properties of A and of B
//   Partial<T>  → the same type but with every property optional
// So `options` may contain any io() option, e.g. { auth: { clientId } } in level 7.
export function useSocket(options?: Partial<ManagerOptions & SocketOptions>) {
  // useState(() => ...) with a FUNCTION = "lazy initializer": React calls it only on the
  // first render and keeps the result forever. So io() runs once, not on every render.
  // (Writing useState(io(...)) without the arrow would call io() on EVERY render.)
  //
  // autoConnect: false → create the socket object but do NOT connect yet. We connect
  // in useEffect below, so connecting is tied to the component's lifecycle.
  //
  // We ignore the setter (no `setSocket`) because the socket object never changes.
  const [socket] = useState<Socket>(() => io(LAB_SERVER_URL, { ...options, autoConnect: false }));

  // Mirrors socket.connected as React state. Reading socket.connected directly in JSX
  // would NOT update the screen, because React only re-renders when state/props change.
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Named handler functions (not inline arrows) so cleanup can remove EXACTLY these.
    // socket.off(event, fn) only removes the listener if it's the very same function object.
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.connect(); // open the connection now that the component is on screen

    // Dev-only helper: expose the socket as window.labSocket so you can play with it in
    // the browser DevTools console, e.g.  labSocket.emit("claim-name", 123, console.log)
    // import.meta.env.DEV is provided by Vite: true for `npm run dev`, false in a build.
    if (import.meta.env.DEV) window.labSocket = socket;

    // The function returned from useEffect is the CLEANUP. React runs it when the
    // component unmounts (or before re-running the effect if a dependency changed).
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect(); // close the connection; the server receives "disconnect"
    };

    // Dependency array: re-run the effect only when `socket` changes — which never
    // happens — so in production it runs once on mount.
    //
    // ⚠️ In development your main.tsx wraps the app in <StrictMode>. StrictMode mounts
    // every component, immediately unmounts it, then mounts it again, on purpose, to
    // catch effects with missing cleanup. So in dev the server logs:
    //   connected → disconnected → connected
    // That is expected, and it's exactly why the cleanup above must be correct.
  }, [socket]);

  return { socket, connected };
}
