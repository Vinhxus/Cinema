import { ReactNode, useMemo, useState } from 'react'
import { seats } from '../data/seats'
import { SeatData } from '../components/seatComponents/Grid'
import { Price } from '../data/Price'
import { BookingContext } from './useBooking'

// trong kho có những gì:
export interface BookingContextValue {
  selectedIds: string[]            // id các ghế đang chọn: ['G11', 'G12']
  selectedSeats: SeatData[]        // đối tượng ghế đầy đủ (có label, type...)
  seatsTotal: number               // tổng tiền ghế
  toggleSeat: (id: string) => void // hàm chọn/bỏ chọn ghế
  clearSeats: () => void           // hàm xóa hết (dùng sau khi thanh toán)
}

//Provider
export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleSeat = (id: string) =>
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

    const clearSeats = () => setSelectedIds([])

    const selectedSeats = useMemo(
        () => seats.filter(seat => selectedIds.includes(seat.id)),
        [selectedIds]
    )

    const seatsTotal = useMemo(
        () => selectedSeats.reduce((sum, seat) => sum + Price[seat.type], 0),
        [selectedSeats]
    )

    return (
        <BookingContext.Provider
            value={{ selectedIds, selectedSeats, seatsTotal, toggleSeat, clearSeats }}
        >
            {children}
        </BookingContext.Provider>
    )
}

