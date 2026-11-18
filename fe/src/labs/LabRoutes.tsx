// =====================================================================
// LabRoutes — all lab pages under /lab.
// App.tsx has:   <Route path="/lab/*" element={<LabRoutes />} />
// The "/*" means "/lab and everything below it is handled by LabRoutes", and the
// <Routes> below matches the rest of the URL RELATIVE to /lab:
//   /lab     → index route (the list of levels)
//   /lab/1   → level 1, ... /lab/7 → level 7
// =====================================================================

import type { ReactElement } from "react";

// Routes / Route: declare which component renders for which URL.
// Link: in-app navigation without a full page reload.
import { Link, Route, Routes } from "react-router-dom";

// Default imports: each level file has `export default function ...`,
// so we can name the import whatever we like here.
import L1Connect from "./L1Connect";
import L2Emit from "./L2Emit";
import L3Broadcast from "./L3Broadcast";
import L4Ack from "./L4Ack";
import L5Rooms from "./L5Rooms";
import L6SeatsBasic from "./L6SeatsBasic";
import L7SeatsFull from "./L7SeatsFull";

// One entry per level. `server` reminds you which server to start for that page.
const LEVELS: { path: string; title: string; server: string; element: ReactElement }[] = [
  { path: "1", title: "Connecting", server: "01-connect", element: <L1Connect /> },
  { path: "2", title: "emit / on", server: "02-emit", element: <L2Emit /> },
  { path: "3", title: "Who receives it? (broadcast)", server: "03-broadcast", element: <L3Broadcast /> },
  { path: "4", title: "Acknowledgements", server: "04-ack", element: <L4Ack /> },
  { path: "5", title: "Rooms", server: "05-rooms", element: <L5Rooms /> },
  { path: "6", title: "Basic seat booking", server: "06-seats-basic", element: <L6SeatsBasic /> },
  { path: "7", title: "Full seat booking", server: "07-seats-full", element: <L7SeatsFull /> },
];

function LabIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 font-sans text-gray-900">
      <h1 className="mb-2 text-2xl font-bold">Socket.IO Lab</h1>
      <p className="mb-4 text-sm text-gray-600">
        Start the matching server first: <code className="rounded bg-gray-100 px-1">cd be</code> then{" "}
        <code className="rounded bg-gray-100 px-1">node socket-lab/&lt;folder&gt;/server.js</code>. Only one
        server at a time (they all use port 4000).
      </p>
      <ol className="flex flex-col gap-2">
        {LEVELS.map((l) => (
          <li key={l.path}>
            <Link to={l.path} className="text-blue-600 hover:underline">
              Level {l.path} — {l.title}
            </Link>{" "}
            <span className="text-xs text-gray-500">(server: {l.server})</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LabRoutes() {
  return (
    <Routes>
      {/* `index` = the route for exactly "/lab" */}
      <Route index element={<LabIndex />} />
      {LEVELS.map((l) => (
        <Route key={l.path} path={l.path} element={l.element} />
      ))}
    </Routes>
  );
}
