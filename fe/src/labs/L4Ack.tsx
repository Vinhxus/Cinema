// =====================================================================
// LEVEL 4 — ACKNOWLEDGEMENTS  (server: 04-ack)
//
// An ack = "emit and wait for an answer", like a request/response:
//   socket.emit("claim-name", "vinh", (res) => ...)   ← callback style
//   const res = await socket.emitWithAck("claim-name", "vinh")   ← async/await style
// The server calls ack(result) and `result` comes back to us.
// =====================================================================

import { useState } from "react";
import { useSocket } from "./useSocket";
import { useLog } from "./useLog";
import { Btn, Input, LabPage, LogList, Status } from "./ui";

// What the server answers to "claim-name". A "discriminated union": either the ok:true
// shape OR the ok:false shape. After checking `if (res.ok)`, TypeScript knows which
// shape you have, so res.name is allowed in the true branch and res.reason in the other.
type ClaimResult = { ok: true; name: string } | { ok: false; reason: string };

export default function L4Ack() {
  const { socket, connected } = useSocket();
  const { lines, log } = useLog();
  const [name, setName] = useState("vinh");
  const [current, setCurrent] = useState<string | null>(null);

  // No useEffect in this level: we don't listen to any pushed event. Every answer
  // comes back through an ack, tied to the emit that asked for it.

  // ---- Style 1: callback ----
  const claimWithCallback = () => {
    // socket.emit(event, data, callback):
    //   data     → server receives it as `name`
    //   callback → server receives it as `ack`; when the server calls ack(obj),
    //              this callback runs with res = obj.
    // The callback runs LATER (when the answer arrives), not right now.
    socket.emit("claim-name", name, (res: ClaimResult) => {
      log(`ack (callback): ${JSON.stringify(res)}`);
      if (res.ok) setCurrent(res.name);
    });
  };

  // ---- Style 2: async/await (what you'll use most in React) ----
  // `async` lets us use `await` inside the function.
  const claimWithAwait = async () => {
    try {
      // socket.timeout(3000): give the NEXT emit a 3-second deadline.
      // emitWithAck(...) returns a Promise:
      //   resolves → with the value the server passed to ack(...)
      //   rejects  → (throws) if no answer within 3s → jump to catch
      const res: ClaimResult = await socket.timeout(3000).emitWithAck("claim-name", name);
      log(`ack (await): ${JSON.stringify(res)}`);
      if (res.ok) setCurrent(res.name);
    } catch {
      log("⏱ no answer within 3s");
    }
  };

  // ---- Timeout demo: the server takes 5s, we only wait 2s ----
  const callSlow = () => {
    log("→ slow sent, waiting at most 2s...");
    // With timeout(), the callback gets TWO arguments: (err, res)
    //   err = null on success, an Error if the deadline passed.
    socket.timeout(2000).emit("slow", (err: Error | null, res: string) => {
      if (err) log("⏱ timeout! The server didn't answer within 2s → show an error to the user");
      else log(`ack: ${res}`);
    });
  };

  return (
    <LabPage title="Level 4 — Acknowledgements" hint='Open 2 tabs and claim "vinh" in both. The second one is refused.'>
      <p>Status: <Status connected={connected} /></p>
      <div className="flex flex-wrap gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Btn onClick={claimWithCallback}>Claim (callback)</Btn>
        <Btn onClick={claimWithAwait}>Claim (async/await)</Btn>
      </div>
      <p>Current name: <b>{current ?? "(none)"}</b></p>

      <h3 className="font-semibold">Timeout</h3>
      <div><Btn onClick={callSlow}>Call slow event (server takes 5s) with a 2s timeout</Btn></div>

      <LogList lines={lines} />
      {/* TRY: open DevTools → Console and send bad data, like an attacker would:
            labSocket.emit("claim-name", 123, console.log)
            labSocket.emit("claim-name", null, console.log)
          The server refuses both thanks to its typeof checks. Never trust the client. */}
    </LabPage>
  );
}
