import { useMemo } from 'react'
import { Seat, SeatType, SeatStatus } from './Seat'

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
  onToggle: (id: string) => void
}

export const Grid = ({ seats, selected, onToggle }: GridProps) => {

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
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="flex justify-center gap-2">
          {rowSeats.map(seat => {
            const status: SeatStatus = seat.isBooked
              ? 'unavailable'
              : selected.includes(seat.id)
              ? 'selected'
              : 'available'

            return (
              <Seat
                key={seat.id}
                type={seat.type}
                status={status}
                onClick={() => onToggle(seat.id)}
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