import { useCallback, useEffect, useRef, useState } from 'react'
import { Socket } from '../Socket'
import { fetchSeatMap } from '../api/showtimes'
import type { HoldAck, HoldFailReason, TakenStatus, VerifyAck } from '../types/seatSocket'

const ACK_TIMEOUT_MS = 5000
const POLL_MS = 7000 // fallback khi mất socket: hỏi lại sơ đồ ghế bằng HTTP

export type ToggleResult = { ok: true } | { ok: false; reason: HoldFailReason | 'PENDING' }

/**
 * Toàn bộ "giao tiếp realtime" của trang chọn ghế.
 * Nguyên tắc (giống bài lab):
 *  - Server là nguồn sự thật: ghế chỉ đổi màu khi server trả lời (ack) hoặc báo (seat-update).
 *  - Dùng socket CHUNG của app (Socket.ts) -> cleanup chỉ off() listener, không disconnect().
 *  - Mỗi lần (re)connect -> join lại + lấy snapshot mới (vì lúc mất mạng có thể đã bỏ lỡ sự kiện).
 */
export function useSeatSocket(showtimeId: string | undefined) {
  const [taken, setTaken] = useState<Record<string, TakenStatus>>({}) // ghế của người khác
  const [mine, setMine] = useState<string[]>([]) // ghế mình đang giữ (server xác nhận)
  const [expiresAt, setExpiresAt] = useState<number | null>(null) // giờ hết hạn theo đồng hồ server
  const [clockOffset, setClockOffset] = useState(0) // serverNow - Date.now() của máy này
  const [connected, setConnected] = useState(Socket.connected)
  const [pending, setPending] = useState<string[]>([]) // ghế đang chờ server trả lời

  // Dữ liệu cho handler đọc mà không cần đăng ký lại listener
  const pendingRef = useRef<string[]>([])

  /* -------- Đăng ký listener theo suất chiếu -------- */
  useEffect(() => {
    if (!showtimeId) return
    let cancelled = false
    // Lưu ý: khi đổi suất, trang cha render hook này với `key={showtimeId}`
    // -> component mount lại, state tự về rỗng, không cần reset bằng tay ở đây.

    const applyServerTime = (serverNow: number) => setClockOffset(serverNow - Date.now())

    const join = async () => {
      try {
        const res = await Socket.timeout(ACK_TIMEOUT_MS).emitWithAck('join-showtime', { showtimeId })
        if (cancelled || !res.ok) return
        setTaken(res.taken)
        setMine(res.mine)
        setExpiresAt(res.expiresAt)
        applyServerTime(res.serverNow)
      } catch {
        // timeout: chờ lần connect sau, hoặc polling bên dưới cập nhật
      }
    }

    const onConnect = () => {
      setConnected(true)
      join()
    }
    const onDisconnect = () => setConnected(false)

    const onSeatUpdate = (u: { showtimeId: string; seatIds: string[]; status: TakenStatus | 'available' }) => {
      if (u.showtimeId !== showtimeId) return // sự kiện của suất khác
      setTaken((prev) => {
        const next = { ...prev } // luôn tạo object MỚI để React render lại
        for (const id of u.seatIds) {
          if (u.status === 'available') delete next[id]
          else next[id] = u.status
        }
        return next
      })
    }

    // Tab khác của chính mình vừa chọn/bỏ ghế -> đồng bộ
    const onMyHolds = (p: { showtimeId: string; mine: string[]; expiresAt: number | null }) => {
      if (p.showtimeId !== showtimeId) return
      setMine(p.mine)
      setExpiresAt(p.expiresAt)
    }

    const onExpired = (p: { showtimeId: string }) => {
      if (p.showtimeId !== showtimeId) return
      setMine([])
      setExpiresAt(null)
    }

    Socket.on('connect', onConnect)
    Socket.on('disconnect', onDisconnect)
    Socket.on('seat-update', onSeatUpdate)
    Socket.on('my-holds', onMyHolds)
    Socket.on('hold-expired', onExpired)
    // Socket có thể đã kết nối xong TRƯỚC khi effect này chạy -> sự kiện 'connect' đã trôi qua.
    // Khi đó tự gọi onConnect để cập nhật trạng thái và join luôn.
    if (Socket.connected) onConnect()

    return () => {
      cancelled = true
      Socket.off('connect', onConnect)
      Socket.off('disconnect', onDisconnect)
      Socket.off('seat-update', onSeatUpdate)
      Socket.off('my-holds', onMyHolds)
      Socket.off('hold-expired', onExpired)
      // Rời phòng (không nhả ghế) -> sang trang Food vẫn giữ ghế
      Socket.emit('leave-showtime', { showtimeId })
    }
  }, [showtimeId])

  /* -------- Fallback: mất socket thì polling HTTP -------- */
  useEffect(() => {
    if (!showtimeId || connected) return
    const controller = new AbortController()
    const poll = () =>
      fetchSeatMap(showtimeId, controller.signal)
        .then((data) => setTaken(data.taken))
        .catch(() => {})
    poll()
    const timer = setInterval(poll, POLL_MS)
    return () => {
      clearInterval(timer)
      controller.abort()
    }
  }, [showtimeId, connected])

  /* -------- Chọn / bỏ chọn 1 ghế -------- */
  // `mine` nằm trong deps: nếu thiếu, hàm sẽ đọc `mine` CŨ (stale closure)
  // và gửi nhầm hold thay vì release.
  const toggle = useCallback(
    async (seatId: string): Promise<ToggleResult> => {
      if (!showtimeId) return { ok: false, reason: 'SHOWTIME_NOT_FOUND' }
      if (pendingRef.current.includes(seatId)) return { ok: false, reason: 'PENDING' }

      const event = mine.includes(seatId) ? 'release-seat' : 'hold-seat'
      pendingRef.current = [...pendingRef.current, seatId]
      setPending(pendingRef.current)
      try {
        const res: HoldAck = await Socket.timeout(ACK_TIMEOUT_MS).emitWithAck(event, { showtimeId, seatId })
        if (res.ok) {
          setMine(res.mine)
          setExpiresAt(res.expiresAt)
          setClockOffset(res.serverNow - Date.now())
          return { ok: true }
        }
        if (res.reason === 'TAKEN') setTaken((prev) => ({ ...prev, [seatId]: 'held' }))
        return { ok: false, reason: res.reason }
      } catch {
        return { ok: false, reason: 'TIMEOUT' }
      } finally {
        pendingRef.current = pendingRef.current.filter((id) => id !== seatId)
        setPending(pendingRef.current)
      }
    },
    [showtimeId, mine]
  )

  /* -------- Kiểm tra trước khi sang trang tiếp theo -------- */
  const verify = useCallback(async (): Promise<VerifyAck> => {
    if (!showtimeId) return { ok: false, reason: 'NO_HOLD' }
    try {
      const res: VerifyAck = await Socket.timeout(ACK_TIMEOUT_MS).emitWithAck('verify-hold', { showtimeId })
      return res
    } catch {
      return { ok: false, reason: 'TIMEOUT' }
    }
  }, [showtimeId])

  return { taken, mine, expiresAt, clockOffset, connected, pending, toggle, verify }
}
