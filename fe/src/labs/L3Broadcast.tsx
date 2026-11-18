// =====================================================================
// LEVEL 3 — WHO RECEIVES IT? + SERVER-OWNED STATE  (server: 03-broadcast)
//
// The client cannot tell whether the server used socket.emit, io.emit or
// socket.broadcast.emit. It only sees "a msg event arrived". WHO receives a
// message is decided 100% on the server.
// =====================================================================

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useLog } from "./useLog";
import { Btn, Input, LabPage, LogList, Status } from "./ui";

export default function L3Broadcast() {
  const { socket, connected } = useSocket();
  const { lines, log } = useLog();

  const [online, setOnline] = useState(0);
  // number | null: null means "we haven't received the snapshot yet" (shown as "?").
  const [counter, setCounter] = useState<number | null>(null);
  const [text, setText] = useState("hello");

  useEffect(() => {
    const onOnline = (n: number) => setOnline(n);
    const onMsg = (m: string) => log(m);
    // "counter" arrives in 2 situations: the snapshot right after connecting,
    // and every time anybody clicks +1.
    const onCounter = (v: number) => setCounter(v);

    socket.on("online", onOnline);
    socket.on("msg", onMsg);
    socket.on("counter", onCounter);
    return () => {
      socket.off("online", onOnline);
      socket.off("msg", onMsg);
      socket.off("counter", onCounter);
    };
  }, [socket, log]);

  return (
    <LabPage title="Level 3 — Who receives it?" hint="Open 3 tabs side by side and try every button.">
      <p>Status: <Status connected={connected} /> · Online: <b>{online}</b></p>

      <h3 className="font-semibold">A. Three ways to send</h3>
      <div className="flex flex-wrap gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} />
        {/* Same text, different EVENT NAME. The server picks how to send based on the name. */}
        <Btn onClick={() => socket.emit("to-me", text)}>socket.emit (only me)</Btn>
        <Btn onClick={() => socket.emit("to-all", text)}>io.emit (everyone)</Btn>
        <Btn onClick={() => socket.emit("to-others", text)}>broadcast (everyone but me)</Btn>
      </div>

      <h3 className="font-semibold">B. Shared counter</h3>
      {/* counter ?? "?": show "?" while counter is null (?? = "if null/undefined, use this") */}
      <p>Value: <b className="text-3xl">{counter ?? "?"}</b></p>
      <div className="flex gap-2">
        {/* RIGHT: only ASK the server to add 1. We do NOT call setCounter here.
            The number changes when the server's "counter" event comes back. */}
        <Btn onClick={() => socket.emit("increment")}>+1</Btn>

        {/* WRONG: change only our own screen. Other tabs and the server know nothing.
            Functional update: c => (c ?? 0) + 1 computes from the latest value.
            Click it a few times, then click the right button: your number "jumps back"
            to the server's value. */}
        <Btn onClick={() => setCounter((c) => (c ?? 0) + 1)}>+1 (WRONG: local only)</Btn>
      </div>

      <LogList lines={lines} />
    </LabPage>
  );
}
