// =====================================================================
// LEVEL 6 — BASIC SEAT BOOKING  (server: 06-seats-basic)
//
// The client keeps a COPY of the seat state, only for display. It changes ONLY
// from two server events:
//   "snapshot"    → once, right after connecting: the full current state
//   "seat-update" → every time any seat changes
// Clicking a seat never colors it directly; it only ASKS the server.
// =====================================================================

import { useEffect, useState } from "react";
import { io } from "socket.io-client"; // only for the race test (extra connections)
import { LAB_SERVER_URL } from "./config";
import { useSocket } from "./useSocket";
import { useLog } from "./useLog";
import { Btn, LabPage, LogList, Screen, SeatButton, SeatLegend, Status, type SeatKind } from "./ui";

// ---- Payload types (must match what the server sends) ----
interface TakenSeat {
  status: "held" | "booked";
  by: string; // socket.id of the holder
}
interface Snapshot {
  seats: string[]; // every seat id, e.g. ["A01", ..., "C06"]
  taken: ({ seatId: string } & TakenSeat)[]; // array of objects having seatId + status + by
}
interface SeatUpdate {
  seatId: string;
  status: "free" | "held" | "booked";
  by?: string;
}
interface Ack {
  ok: boolean;
  reason?: string;
  seats?: string[];
}

export default function L6SeatsBasic() {
  const { socket, connected } = useSocket();
  const { lines, log } = useLog();

  const [allSeats, setAllSeats] = useState<string[]>([]);
  // Record<string, TakenSeat> = a plain object used as a dictionary: { "A01": {status, by}, ... }
  // A seat missing from it = free.
  //
  // Why not a Map like on the server? React decides whether to re-render by comparing
  // the OLD and NEW state object (Object.is). If you mutate a Map (map.set) it's still the
  // SAME object → React thinks nothing changed → no re-render. With state you must always
  // create a NEW object. A plain object + spread `{ ...prev }` makes that easy.
  const [taken, setTaken] = useState<Record<string, TakenSeat>>({});

  useEffect(() => {
    // ({ seats, taken: list }): destructure the payload and rename `taken` to `list`
    // so it doesn't clash with our `taken` state variable.
    const onSnapshot = ({ seats, taken: list }: Snapshot) => {
      setAllSeats(seats);
      // Object.fromEntries([[k, v], ...]) builds an object { k: v, ... }.
      // We REPLACE the whole state (not merge): after a reconnect, old data may be wrong.
      setTaken(Object.fromEntries(list.map((s) => [s.seatId, { status: s.status, by: s.by }])));
    };

    const onSeatUpdate = ({ seatId, status, by }: SeatUpdate) => {
      // Functional update: compute from `prev` (the latest state), and return a NEW object.
      setTaken((prev) => {
        const next = { ...prev }; // shallow copy — never modify prev itself
        if (status === "free") delete next[seatId];
        else next[seatId] = { status, by: by ?? "" };
        return next;
      });
    };

    socket.on("snapshot", onSnapshot);
    socket.on("seat-update", onSeatUpdate);
    return () => {
      socket.off("snapshot", onSnapshot);
      socket.off("seat-update", onSeatUpdate);
    };
  }, [socket]);

  // Derive how a seat looks from the state. Computed during render, not stored:
  // anything you can calculate from existing state should NOT be its own state.
  const kindOf = (id: string): SeatKind => {
    const s = taken[id];
    if (!s) return "free";
    if (s.status === "booked") return "booked";
    return s.by === socket.id ? "mine" : "held"; // compare holder with OUR socket.id
  };

  const onSeatClick = (id: string) => {
    const kind = kindOf(id);
    if (kind === "mine") {
      // `!res.ok && log(...)`: short-circuit — log only when res.ok is false.
      socket.emit("release-seat", id, (res: Ack) => !res.ok && log(`❌ ${res.reason}`));
    } else if (kind === "free") {
      // DON'T color the seat here. Its color changes when "seat-update" arrives.
      // The ack is only used to show success / failure in the log.
      socket.emit("hold-seat", id, (res: Ack) => log(res.ok ? `✅ holding ${id}` : `❌ ${id}: ${res.reason}`));
    }
    // "held" (someone else's) or "booked" → do nothing.
  };

  const book = () =>
    socket.emit("book", (res: Ack) => log(res.ok ? `🎟 Booked: ${res.seats?.join(", ")}` : `❌ ${res.reason}`));

  // ---- RACE TEST: 2 extra connections ask for the SAME free seat at the SAME time ----
  const raceTest = () => {
    // .find(fn): the FIRST item where fn returns true → the first free seat.
    const free = allSeats.find((id) => !taken[id]);
    if (!free) return log("No free seat left to test");

    // io(url, { forceNew: true }): always open a NEW, independent connection with its own
    // socket.id, so the server sees a and b as two different users.
    // These are plain variables (not state): they live only for these 3 seconds and
    // nothing on screen depends on them.
    const a = io(LAB_SERVER_URL, { forceNew: true });
    const b = io(LAB_SERVER_URL, { forceNew: true });

    // Wait until BOTH are connected, then fire both requests back to back.
    let ready = 0;
    const go = () => {
      if (++ready < 2) return; // ++ready increments THEN compares; first call: ready = 1 → wait
      log(`🏁 A and B both ask for ${free}...`);
      a.emit("hold-seat", free, (r: Ack) => log(`   A: ${JSON.stringify(r)}`));
      b.emit("hold-seat", free, (r: Ack) => log(`   B: ${JSON.stringify(r)}`));
      // 3s later, close both → the server's "disconnect" handler releases the seat.
      setTimeout(() => { a.disconnect(); b.disconnect(); }, 3000);
    };
    a.on("connect", go);
    b.on("connect", go);
  };

  return (
    <LabPage
      title="Level 6 — Basic seat booking"
      hint="Open 2 tabs side by side. Pick a seat here → it turns red there instantly. Close the tab → the seat is free again."
    >
      <p>Status: <Status connected={connected} /></p>
      <SeatLegend />
      <Screen />
      {/* CSS grid with 6 equal columns → 6 seats per row */}
      <div className="grid grid-cols-6 gap-2">
        {allSeats.map((id) => (
          <SeatButton key={id} id={id} kind={kindOf(id)} onClick={() => onSeatClick(id)} />
        ))}
      </div>
      <div className="flex gap-2">
        <Btn onClick={book}>Pay (book)</Btn>
        <Btn onClick={raceTest}>🏁 Race condition test</Btn>
      </div>
      <LogList lines={lines} />
    </LabPage>
  );
}
