// =====================================================================
// LEVEL 7 — FULL SEAT BOOKING  (server: 07-seats-full)
//
// This page is the closest to what your real SelectSeat page needs:
//   - a stable identity (clientId) sent in the handshake → reload keeps your seats
//   - several showtimes (rooms), snapshot returned by the join ack
//   - re-join + fresh snapshot on EVERY (re)connect
//   - hold expiry countdown, max 4 seats, async/await acks with timeouts
// =====================================================================

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "./useSocket";
import { useLog } from "./useLog";
import { Btn, LabPage, LogList, Screen, SeatButton, SeatLegend, Status, type SeatKind } from "./ui";

// ---- Payload types (must match the server) ----
interface ShowtimeOption { id: string; label: string }
interface TakenSeat { status: "held" | "booked"; expiresAt?: number }
interface JoinResult {
  ok: boolean;
  reason?: string;
  seats: string[];                              // every seat of the showtime
  taken: ({ seatId: string } & TakenSeat)[];    // taken seats (no owner info!)
  mine: string[];                               // the ones held by ME
}
interface SeatUpdate { seatId: string; status: "free" | "held" | "booked"; expiresAt?: number }
interface Ack { ok: boolean; reason?: string; seats?: string[] }

// sessionStorage: browser key-value storage, SEPARATE per tab, survives reload (F5),
// cleared when the tab closes. (localStorage is shared by all tabs and never cleared.)
// We use sessionStorage so 2 tabs behave like 2 different people.
// In the real app: use the userId from the login JWT instead.
function getClientId() {
  let id = sessionStorage.getItem("lab7-clientId"); // null if not set yet
  if (!id) {
    // crypto.randomUUID(): built into browsers; a random unique id like "3b241101-e2bb-...".
    id = crypto.randomUUID();
    sessionStorage.setItem("lab7-clientId", id);
  }
  return id;
}

export default function L7SeatsFull() {
  // Lazy initializer → getClientId runs only on the first render.
  const [clientId] = useState(getClientId);

  // auth: sent during the HANDSHAKE (before "connect"), and again on every auto-reconnect.
  // The server reads it in io.use() as socket.handshake.auth.clientId.
  const { socket, connected } = useSocket({ auth: { clientId } });
  const { lines, log } = useLog();

  const [showtimes, setShowtimes] = useState<ShowtimeOption[]>([]);
  // Remember the chosen showtime across reloads (|| "" turns null into "").
  const [showtimeId, setShowtimeId] = useState(() => sessionStorage.getItem("lab7-showtime") || "");
  const [seats, setSeats] = useState<string[]>([]);
  const [taken, setTaken] = useState<Record<string, TakenSeat>>({});
  const [mine, setMine] = useState<string[]>([]); // seat ids I'm holding
  // Current time as STATE, refreshed by a timer, so the countdown re-renders.
  // (Calling Date.now() directly while rendering would make rendering "impure".)
  const [now, setNow] = useState(() => Date.now());

  // ---- join(): ask to enter a showtime and load its snapshot ----
  // useCallback keeps the same function object between renders, so it can safely
  // sit in the dependency array of the effect below without re-running it every render.
  const join = useCallback(
    (id: string) => {
      if (!id) return;
      socket.emit("join-showtime", id, (res: JoinResult) => {
        if (!res.ok) return log(`❌ ${res.reason}`);
        setShowtimeId(id);
        sessionStorage.setItem("lab7-showtime", id);
        setSeats(res.seats);
        // REPLACE everything with the snapshot — never merge with old data, it may be stale.
        setTaken(Object.fromEntries(res.taken.map((s) => [s.seatId, { status: s.status, expiresAt: s.expiresAt }])));
        setMine(res.mine);
        log(`Joined ${id}. You hold: ${res.mine.join(", ") || "nothing"}`);
      });
    },
    [socket, log]
  );

  // ---- Connection-level events ----
  useEffect(() => {
    // IMPORTANT: on EVERY (re)connect, join again + get a fresh snapshot, because
    //  - the server may have restarted and forgotten who was in which room
    //  - while disconnected we may have missed many seat-update events
    const onConnect = () => { if (showtimeId) join(showtimeId); };
    // "connect_error": the connection was refused, e.g. the middleware called
    // next(new Error("invalid clientId")). err.message is that text.
    const onConnectError = (err: Error) => log(`connect_error: ${err.message}`);
    const onShowtimes = (list: ShowtimeOption[]) => setShowtimes(list);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("showtimes", onShowtimes);
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("showtimes", onShowtimes);
    };
    // ⚠️ STALE CLOSURE lesson: onConnect reads `showtimeId`. A handler only "sees" the
    // values from the render in which it was created. If showtimeId were NOT in the
    // dependency array, the handler registered on the first render would keep reading the
    // OLD showtimeId forever. Listing it here re-registers a fresh handler whenever it
    // changes. (off + on happen synchronously, so no event can slip in between.)
  }, [socket, log, join, showtimeId]);

  // ---- Seat updates ----
  useEffect(() => {
    const onSeatUpdate = ({ seatId, status, expiresAt }: SeatUpdate) => {
      setTaken((prev) => {
        const next = { ...prev };
        if (status === "free") delete next[seatId];
        else next[seatId] = { status, expiresAt };
        return next;
      });
      // Reading `mine` here is safe because `mine` is in this effect's dependencies
      // (same stale-closure reasoning as above).
      if (mine.includes(seatId) && status !== "held") {
        setMine((prev) => prev.filter((x) => x !== seatId)); // remove it from my list
        if (status === "free") log(`⌛ your hold on ${seatId} expired / was released`);
      }
    };
    socket.on("seat-update", onSeatUpdate);
    return () => { socket.off("seat-update", onSeatUpdate); };
  }, [socket, log, mine]);

  // ---- Countdown ticker ----
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250); // 4 times per second → smooth
    return () => clearInterval(t); // always clear timers in cleanup
  }, []);

  // ---- User actions (async/await + timeout) ----
  const onSeatClick = async (seatId: string) => {
    try {
      if (mine.includes(seatId)) {
        // emitWithAck returns a Promise of the server's ack value; more than 5s → throws.
        const res: Ack = await socket.timeout(5000).emitWithAck("release-seat", { showtimeId, seatId });
        if (res.ok) setMine((prev) => prev.filter((x) => x !== seatId));
      } else if (!taken[seatId]) {
        const res: Ack = await socket.timeout(5000).emitWithAck("hold-seat", { showtimeId, seatId });
        // The broadcast never says WHO holds a seat. The ack is the ONLY way we learn
        // that this seat is ours.
        if (res.ok) setMine((prev) => [...prev, seatId]);
        else log(`❌ ${seatId}: ${res.reason}`);
      }
    } catch {
      log("⏱ server did not respond, try again");
    }
  };

  const book = async () => {
    try {
      const res: Ack = await socket.timeout(5000).emitWithAck("book", { showtimeId });
      log(res.ok ? `🎟 Booked: ${res.seats?.join(", ")}` : `❌ ${res.reason}`);
    } catch {
      log("⏱ server did not respond");
    }
  };

  // ---- Values derived from state (computed during render) ----
  const kindOf = (id: string): SeatKind => {
    const s = taken[id];
    if (s?.status === "booked") return "booked";
    if (mine.includes(id)) return "mine";
    return s ? "held" : "free";
  };

  // Seats per row = how many seat ids start with the same letter as the first one.
  // seats[0]?.[0]: first character of the first id ("A01"[0] === "A"); safe if seats is empty.
  const perRow = seats.filter((s) => s[0] === seats[0]?.[0]).length || 1;

  // Countdown: time left on MY hold that expires first.
  // The countdown is DISPLAY ONLY — the server's setTimeout is what really releases the seat.
  const expiries = mine.map((id) => taken[id]?.expiresAt).filter((t): t is number => !!t);
  //   (t): t is number => ...  is a "type guard": it tells TypeScript the filtered array
  //   only contains numbers (no undefined), so Math.min below type-checks.
  const secondsLeft = expiries.length ? Math.max(0, Math.ceil((Math.min(...expiries) - now) / 1000)) : null;

  return (
    <LabPage
      title="Level 7 — Full seat booking"
      hint="Try: (1) hold a seat and wait 30s; (2) hold a seat and reload — it's still yours; (3) hold a seat and close the tab — other tabs see it free after ~10s; (4) try to hold a 5th seat."
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>Status: <Status connected={connected} /></span>
        <select
          value={showtimeId}
          onChange={(e) => join(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>-- pick a showtime --</option>
          {showtimes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <span>Hold expires in: <b>{secondsLeft === null ? "—" : `${secondsLeft}s`}</b></span>
      </div>
      <SeatLegend />
      <Screen />
      {/* Dynamic column count → inline style, because Tailwind can't build class names at runtime */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${perRow}, 1fr)` }}>
        {seats.map((id) => (
          <SeatButton key={id} id={id} kind={kindOf(id)} onClick={() => onSeatClick(id)} />
        ))}
      </div>
      <div><Btn onClick={book}>Pay</Btn></div>
      <LogList lines={lines} />
    </LabPage>
  );
}
