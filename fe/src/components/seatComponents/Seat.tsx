import type { ReactNode } from 'react'

export type SeatType = 'standard' | 'vip' | 'couple'
/**
 * available   : trống, bấm được
 * selected    : MÌNH đang giữ (server đã xác nhận)
 * held        : NGƯỜI KHÁC đang giữ (có thể trống lại khi họ bỏ / hết giờ)
 * unavailable : đã bán
 */
export type SeatStatus = 'available' | 'selected' | 'held' | 'unavailable'

const TYPE_STYLES: Record<SeatType, string> = {
  standard: 'bg-slate-50 border-4 border-lime-400 text-black',
  vip: 'bg-slate-50 border-4 border-[#FF4B4B] text-black',
  couple: 'w-26 bg-[#F06DC2] border-4 border-[#D53C3C] text-white', // ~2 ghế + gap
}

const STATUS_STYLES: Record<Exclude<SeatStatus, 'available'>, string> = {
  selected: 'bg-[#FFCC00] text-black',
  held: 'bg-amber-100 border-4 border-dashed border-amber-500 text-amber-800 cursor-not-allowed',
  unavailable: 'bg-[#979EA6] border-4 border-[#EC911A] text-black cursor-not-allowed',
}

interface SeatProps {
  children: ReactNode
  type?: SeatType
  status?: SeatStatus
  busy?: boolean // đang chờ server trả lời
  title?: string
  onClick?: () => void
}

export const Seat = ({
  children,
  type = 'standard',
  status = 'available',
  busy = false,
  title,
  onClick,
}: SeatProps) => {
  const style = status === 'available' ? TYPE_STYLES[type] : STATUS_STYLES[status]
  const widthClass = type === 'couple' ? 'w-26' : 'w-12'
  const locked = status === 'unavailable' || status === 'held'
  return (
    <button
      type="button"
      title={title}
      disabled={locked || busy}
      aria-pressed={status === 'selected'}
      onClick={onClick}
      className={`${widthClass} h-12 rounded-[9.6px] inline-flex justify-center items-center
        text-base font-bold font-['Inter'] transition ${style} ${busy ? 'animate-pulse opacity-60' : ''}`}
    >
      {children}
    </button>
  )
}
