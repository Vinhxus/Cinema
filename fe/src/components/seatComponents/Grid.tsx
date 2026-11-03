import { useEffect, useMemo, useState } from 'react'
import { Seat, SeatType, SeatStatus } from './Seat'
import { useBooking } from '../../context/useBooking'

export interface SeatData {
  id: string
  row: string
  label: string
  type: SeatType
  isBooked: boolean
}

interface GridProps {
  seats: SeatData[]
  selected: string[]
  onToggle: (id: string) => boolean
}

const MAX_SEATS = 8 // khai báo biến riêng

export const Grid = ({ seats, onToggle }: GridProps) => {
  const [message, setMessage] = useState('')
  const {isSelected, } = useBooking()

  const handleClick = (id: string) => {
    const ok = onToggle(id)
    setMessage(ok ? '' : `You can only select ${MAX_SEATS} seats`)
  }
  // Tự tắt thông báo sau 3 giây
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

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
    <div className="flex flex-col items-center gap-2 overflow-x-auto">
      {message && (
        <p role="alert" className="font-semibold text-red-600">
          {message}
        </p>
      )}
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="flex justify-center gap-2">
          {rowSeats.map(seat => {
            const status: SeatStatus = seat.isBooked
              ? 'unavailable'
              : isSelected(seat.id)
              ? 'selected'
              : 'available'

            return (
              <Seat
                key={seat.id}
                type={seat.type}
                status={status}
                onClick={() => handleClick(seat.id)}
              >
                {seat.label}
              </Seat>
            )
          })}
        </div>
      ))}
    </div>
  )
}