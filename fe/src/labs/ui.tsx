// =====================================================================
// Small presentational components shared by all levels (layout, buttons, log box,
// seat button). No socket logic in here, only Tailwind styling, so the level
// files stay focused on Socket.IO.
// =====================================================================

// Types only (removed at compile time, hence `import type`):
//   ComponentProps<"button"> → every prop a normal <button> accepts (onClick, disabled...)
//   ReactNode                → anything React can render: text, elements, arrays, null...
import type { ComponentProps, ReactNode } from "react";

// <Link to="..."> from react-router-dom: navigates inside the app WITHOUT reloading the page
// (a plain <a href> would reload the page and drop every socket connection).
import { Link } from "react-router-dom";

import type { LogLine } from "./useLog";

// Page frame: back link, title, optional yellow hint box, then the page content.
export function LabPage({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 font-sans text-gray-900">
      <Link to="/lab" className="text-sm text-blue-600 hover:underline">← All levels</Link>
      <h1 className="mt-2 mb-3 text-2xl font-bold">{title}</h1>
      {hint && <p className="mb-4 border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm">{hint}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

// A styled <button>.
// ({ className = "", ...props }): take `className` out (default ""), collect the rest in `props`.
// {...props} then passes everything else (onClick, disabled, children...) to the real <button>.
export function Btn({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}

// A styled <input>, same idea as Btn.
export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`rounded-md border border-gray-300 px-2 py-1.5 text-sm ${className}`} />;
}

// Green / red connection badge.
export function Status({ connected }: { connected: boolean }) {
  return (
    <span className={connected ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
      {connected ? "connected ✅" : "disconnected ❌"}
    </span>
  );
}

// The "Log" box. key={l.id}: React needs a stable unique key per list item to know
// which <li> is which when the list changes.
export function LogList({ lines }: { lines: LogLine[] }) {
  return (
    <div>
      <h3 className="mb-1 font-semibold">Log</h3>
      <ul className="max-h-80 list-disc overflow-auto pl-5 font-mono text-[13px]">
        {lines.map((l) => <li key={l.id}>{l.text}</li>)}
      </ul>
    </div>
  );
}

// ---------- Seats (levels 6 and 7) ----------

// A "union of string literals": a SeatKind can only be one of these 4 strings.
// TypeScript reports an error if you write e.g. "hold" by mistake.
export type SeatKind = "free" | "mine" | "held" | "booked";

// Record<K, V>: an object type whose keys are K and values are V.
// TypeScript checks that every SeatKind has a style here.
const SEAT_STYLE: Record<SeatKind, string> = {
  free: "border-lime-500 bg-slate-50 hover:bg-lime-50",
  mine: "border-yellow-600 bg-yellow-400",
  held: "border-red-600 bg-red-300 cursor-not-allowed",
  booked: "border-gray-600 bg-gray-400 text-white cursor-not-allowed",
};

export function SeatButton({ id, kind, onClick }: { id: string; kind: SeatKind; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-kind={kind} // not needed by React; handy for tests and for inspecting in DevTools
      className={`h-11 rounded-lg border-[3px] font-bold ${SEAT_STYLE[kind]}`}
    >
      {id}
    </button>
  );
}

export function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <span>🟩 Free</span><span>🟨 Held by you</span><span>🟥 Held by someone else</span><span>⬛ Sold</span>
    </div>
  );
}

export function Screen() {
  return <div className="rounded bg-gray-200 py-1 text-center text-xs tracking-[0.4em]">SCREEN</div>;
}
