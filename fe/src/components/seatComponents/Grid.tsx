import { useMemo, useState } from 'react'
import { Seat, SeatType, SeatStatus } from './Seat'

export interface SeatData {
  id: string
  row: string
  label: string
  type: SeatType
  isBooked: boolean
}

export const Grid = ({ seats }: { seats: SeatData[] }) => {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

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
                onClick={() => toggle(seat.id)}
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