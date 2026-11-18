// =====================================================================
// LEVEL 5 — ROOMS  (server: 05-rooms)
//
// The client cannot see rooms — they exist only on the server. The client just
// ASKS to join ("join-showtime"); the server decides and calls socket.join().
// After that, the server only sends this showtime's messages to us.
// =====================================================================

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useLog } from "./useLog";
import { Btn, Input, LabPage, LogList, Status } from "./ui";

export default function L5Rooms() {
  const { socket, connected } = useSocket();
  const { lines, log } = useLog();
  const [viewers, setViewers] = useState(0);
  const [showtime, setShowtime] = useState(""); // "" = nothing selected yet
  const [text, setText] = useState("which seats are good?");

  useEffect(() => {
    const onViewers = (n: number) => setViewers(n);
    const onRoomMsg = (m: string) => log(m);
    socket.on("viewers", onViewers);
    socket.on("room-msg", onRoomMsg);
    return () => {
      socket.off("viewers", onViewers);
      socket.off("room-msg", onRoomMsg);
    };
  }, [socket, log]);

  // Called by the <select>'s onChange.
  const join = (id: string) => {
    setShowtime(id);
    // Ask the server to put us in this showtime's room; the ack tells us if it agreed.
    // The type of `res` is written inline here: { ok: boolean; reason?: string }
    // (`reason?` = optional property).
    socket.emit("join-showtime", id, (res: { ok: boolean; reason?: string }) =>
      log(`join ${id}: ${JSON.stringify(res)}`)
    );
  };

  return (
    <LabPage
      title="Level 5 — Rooms"
      hint="Tabs 1 and 2 pick 19:00, tab 3 picks 21:00. Send from tab 1 → tab 3 receives nothing."
    >
      <p>Status: <Status connected={connected} /></p>
      <div className="flex flex-wrap items-center gap-3">
        {/* Controlled <select>: value from state, onChange → our join function.
            e.target.value = the value of the selected <option>. */}
        <select
          value={showtime}
          onChange={(e) => join(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>-- pick a showtime --</option>
          <option value="st-1900">19:00</option>
          <option value="st-2100">21:00</option>
          <option value="st-2300">23:00</option>
          <option value="st-hack">(fake showtime — does the server block it?)</option>
        </select>
        <span>Viewing this showtime: <b>{viewers}</b></span>
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} />
        {/* We only send the text. WHICH room it goes to is decided by the server
            (it remembered our room in socket.data.showtimeId). */}
        <Btn onClick={() => socket.emit("room-msg", text)}>Send to my room</Btn>
      </div>
      <LogList lines={lines} />
      {/* QUESTION: restart the server, then send a message. Nobody receives it. Why?
          (Hint: a freshly started server doesn't remember who was in which room.
           The client must join again on every "connect". Level 7 does exactly that —
           try adding it here first as an exercise.) */}
    </LabPage>
  );
}
