// Address of the lab socket servers (be/socket-lab/*/server.js all listen on port 4000).
//
// Why a full URL here? The React app is served by Vite on http://localhost:5173,
// while the socket server runs on :4000. They are different "origins", so the
// client must say exactly where to connect. (In your real app, fe/src/Socket.ts
// does the same thing with "http://localhost:3000".)
//
// Real projects usually read this from an environment variable instead:
//   export const LAB_SERVER_URL = import.meta.env.VITE_SOCKET_URL
export const LAB_SERVER_URL = "http://localhost:4000";
