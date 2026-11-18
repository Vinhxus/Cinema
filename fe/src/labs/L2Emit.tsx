// =====================================================================
// LEVEL 2 — EMIT / ON  (server: be/socket-lab/02-emit/server.js)
//
//   socket.emit("event", data)          → send to the server
//   socket.on("event", (data) => {...}) → listen for what the server sends
// Event names are strings YOU choose; client and server must spell them the same.
// =====================================================================

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket"; // our hook: creates + connects + cleans up a socket (see useSocket.ts)
import { useLog } from "./useLog";
import { Btn, Input, LabPage, LogList, Status } from "./ui";

// The shape of the "welcome" payload the server sends. `interface` describes an object
// type; TypeScript then checks that we use data.message, not data.mesage.
// (TypeScript cannot verify what the server REALLY sends — this is our promise.)
interface Welcome {
  message: string;
  at: number; // timestamp in ms
}

export default function L2Emit() {
  // Everything from level 1 (create, connect, disconnect on unmount) in one line.
  const { socket, connected } = useSocket();
  const { lines, log } = useLog();

  const [serverTime, setServerTime] = useState("—");
  const [name, setName] = useState("Vinh"); // controlled input (see <Input> below)

  // ---- LISTEN to events the server pushes ----
  useEffect(() => {
    // "server-time" arrives every second WITHOUT us asking — the server pushes it.
    const onTime = (t: string) => setServerTime(t);
    // JSON.stringify(obj): object → text, only for DISPLAY. Sending/receiving never
    // needs it: Socket.IO serializes for you.
    const onWelcome = (data: Welcome) => log(`← welcome: ${JSON.stringify(data)}`);

    socket.on("server-time", onTime);
    socket.on("welcome", onWelcome);

    // Cleanup: remove exactly these listeners. Without it, in dev StrictMode (mount →
    // unmount → mount) you would register each listener twice and see every log line twice.
    return () => {
      socket.off("server-time", onTime);
      socket.off("welcome", onWelcome);
    };
  }, [socket, log]);

  // ---- SEND an event to the server ----
  // A plain function called from onClick. No useEffect needed: sending is a reaction
  // to a user action, not something that must happen after every render.
  const sayHello = () => {
    const payload = { name, age: 21 };
    // socket.emit("hello", payload): the server receives it in socket.on("hello", (data) => ...)
    // with data = payload. emit does NOT wait for the server; the next line runs immediately.
    // (Level 4 shows how to wait for an answer.)
    socket.emit("hello", payload);
    log(`→ hello: ${JSON.stringify(payload)}`);
  };

  return (
    <LabPage title="Level 2 — emit / on">
      <p>Status: <Status connected={connected} /></p>
      <p>Server time (pushed every second): <b>{serverTime}</b></p>
      <div className="flex gap-2">
        {/* Controlled input: value comes from state; onChange updates state on every key.
            e.target.value = the input's current text. */}
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Btn onClick={sayHello} disabled={!connected}>emit("hello", ...)</Btn>
      </div>
      <LogList lines={lines} />
      {/* TRY: rename "hello" to "helo" in sayHello. Any error? No! The server just never
          hears it. Typos in event names fail silently — the most common socket bug. */}
    </LabPage>
  );
}
