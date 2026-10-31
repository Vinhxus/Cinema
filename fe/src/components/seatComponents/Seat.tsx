import { ReactNode } from 'react'

export type SeatType = 'standard' | 'vip' | 'couple'
export type SeatStatus = 'available' | 'selected' | 'unavailable'

const TYPE_STYLES: Record<SeatType, string> = {
  standard: 'bg-slate-50 border-4 border-lime-400 text-black',
  vip: 'bg-slate-50 border-4 border-[#FF4B4B] text-black',
  couple: 'w-26 bg-[#F06DC2] border-4 border-[#D53C3C] text-white', // ~2 ghế + gap
}


const STATUS_STYLES: Record<Exclude<SeatStatus, 'available'>, string> = {
  selected: 'bg-[#FFCC00] text-black',
  unavailable: 'bg-[#979EA6] border-4 border-[#EC911A] text-black cursor-not-allowed',
}

interface SeatProps {
  children: ReactNode
  type?: SeatType
  status?: SeatStatus
  onClick?: () => void
}

export const Seat = ({
  children,
  type = 'standard',
  status = 'available',
  onClick,
}: SeatProps) => {
  const style = status === 'available' ? TYPE_STYLES[type] : STATUS_STYLES[status]
  const widthClass = type === 'couple' ? 'w-26' : 'w-12'
  return (
    <button
      type="button"
      disabled={status === 'unavailable'}
      onClick={onClick}
      className={`${widthClass} h-12 rounded-[9.6px] inline-flex justify-center items-center
        text-base font-bold font-['Inter'] ${style}`}
    >
      {children}
    </button>
  )
}