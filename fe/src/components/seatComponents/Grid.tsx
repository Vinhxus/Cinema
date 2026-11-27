import { useMemo } from 'react'
import { Seat, type SeatType, type SeatStatus } from './Seat'

/** 1 ghế lấy từ database (GET /api/showtimes/:id/seat-map) */
export interface SeatData {
  id: string // SeatID trong DB (dạng chuỗi)
  row: string
  number: number
  label: string // "A01", "H01-02" (ghế đôi)
  type: SeatType
  price: number // giá đã tính ở server cho suất này
}

interface GridProps {
  seats: SeatData[]
  /** Trạng thái được TÍNH khi render từ dữ liệu server, không lưu riêng trong state */
  statusOf: (seatId: string) => SeatStatus
  pending?: string[]
  onToggle: (id: string) => void
}

export const Grid = ({ seats, statusOf, pending = [], onToggle }: GridProps) => {
  // Gom ghế theo hàng: [['A', [...]], ['B', [...]]]
  const rows = useMemo(() => {
    const map = new Map<string, SeatData[]>()
    seats.forEach(seat => {
      const list = map.get(seat.row) ?? []
      list.push(seat)
      map.set(seat.row, list)
    })
    return Array.from(map.entries())
  }, [seats])

  return (
    <div className="flex max-w-full flex-col items-center gap-2 overflow-x-auto px-4">
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="flex justify-center gap-2">
          {rowSeats.map(seat => (
            <Seat
              key={seat.id}
              type={seat.type}
              status={statusOf(seat.id)}
              busy={pending.includes(seat.id)}
              title={`${seat.label} • ${seat.price.toLocaleString('en-US')} ₫`}
              onClick={() => onToggle(seat.id)}
            >
              {seat.label}
            </Seat>
          ))}
        </div>
      ))}
    </div>
  )
}
