import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Socket } from "../Socket"; // chỉnh đường dẫn nếu bạn để file ở chỗ khác

type ChatMessage = {
  id: string;       // socket.id của người gửi
  text: string;
  time: number;
};

export default function Chat() {
  const [connected, setConnected] = useState(Socket.connected);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMessage = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);

    Socket.on("connect", onConnect);
    Socket.on("disconnect", onDisconnect);
    Socket.on("chat-message", onMessage);

    return () => {
      Socket.off("connect", onConnect);
      Socket.off("disconnect", onDisconnect);
      Socket.off("chat-message", onMessage);
    };
  }, []);

  // tự cuộn xuống tin mới nhất
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !connected) return;
    Socket.emit("chat-message", text);
    setInput("");
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <strong>Chat test</strong>
        <span style={{ color: connected ? "#15803d" : "#b91c1c" }}>
          {connected ? `Đã kết nối (${Socket.id})` : "Mất kết nối"}
        </span>
      </header>

      <div style={styles.list}>
        {messages.length === 0 && (
          <p style={styles.empty}>
            Chưa có tin nhắn. Mở trang này ở 2 tab để thử gửi qua lại.
          </p>
        )}

        {messages.map((m, i) => {
          const mine = m.id === Socket.id;
          return (
            <div
              key={i}
              style={{
                ...styles.bubble,
                alignSelf: mine ? "flex-end" : "flex-start",
                background: mine ? "#2563eb" : "#e5e7eb",
                color: mine ? "#fff" : "#111827",
              }}
            >
              {!mine && <div style={styles.sender}>{m.id.slice(0, 5)}</div>}
              <div>{m.text}</div>
              <div style={styles.time}>
                {new Date(m.time).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} style={styles.form}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={!connected}
          style={styles.input}
        />
        <button type="submit" disabled={!connected || !input.trim()} style={styles.button}>
          Gửi
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 480,
    height: "90vh",
    margin: "5vh auto",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    fontFamily: "system-ui, sans-serif",
    background: "#fff",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #d1d5db",
    fontSize: 14,
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  empty: { color: "#6b7280", fontSize: 14, textAlign: "center", margin: "auto" },
  bubble: {
    maxWidth: "75%",
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 15,
    wordBreak: "break-word",
  },
  sender: { fontSize: 11, opacity: 0.7, marginBottom: 2 },
  time: { fontSize: 10, opacity: 0.6, marginTop: 2, textAlign: "right" },
  form: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #d1d5db" },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 15,
  },
  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 6,
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer",
  },
};