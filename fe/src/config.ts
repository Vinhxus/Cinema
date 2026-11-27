// Địa chỉ backend (Express + Socket.io chạy chung 1 cổng).
// Đổi bằng file fe/.env:  VITE_API_URL=http://localhost:5000
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
