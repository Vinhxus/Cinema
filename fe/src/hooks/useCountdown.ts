import { useEffect, useState } from 'react'

/**
 * Số giây còn lại tới `expiresAt` (epoch ms theo đồng hồ SERVER).
 * clockOffset = serverNow - Date.now(): sửa sai lệch nếu đồng hồ máy người dùng chạy lệch.
 * Thời gian là state -> mỗi giây setState 1 lần để React vẽ lại.
 */
export function useCountdown(expiresAt: number | null, clockOffset = 0): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (expiresAt == null) return
    const tick = () => setNow(Date.now())
    // Cập nhật NGAY khi có hạn mới (không để lần render đầu dùng `now` cũ từ lúc mount),
    // sau đó mỗi 500ms để số giây không bị trễ gần 1 giây.
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 500)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [expiresAt])

  if (expiresAt == null) return null
  return Math.max(0, Math.ceil((expiresAt - (now + clockOffset)) / 1000))
}

export const formatMmSs = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
