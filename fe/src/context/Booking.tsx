import { ReactNode, useMemo, useState } from 'react'
import { seats } from '../data/seats'
import { SeatData } from '../components/seatComponents/Grid'
import { Price } from '../data/Price'
import { BookingContext } from './useBooking'

const MAX_SEATS = 8 // khai báo biến riêng

// trong kho có những gì:
export interface BookingContextValue {
    isSelected: (id: string) => boolean
    selectedIds: string[]            // id các ghế đang chọn: ['G11', 'G12']
    selectedSeats: SeatData[]        // đối tượng ghế đầy đủ (có label, type...)
    seatsTotal: number               // tổng tiền ghế
    toggleSeat: (id: string) => boolean // hàm chọn/bỏ chọn ghế
    clearSeats: () => void           // hàm xóa hết (dùng sau khi thanh toán)
}

//Provider
export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const isSelected = (id: string) => selectedIds.includes(id)
    
    const selectedSeats = useMemo(
        () => seats.filter(seat => selectedIds.includes(seat.id)),
        [selectedIds]
    )

    const seatsTotal = useMemo(
        () => selectedSeats.reduce((sum, seat) => sum + Price[seat.type], 0),
        [selectedSeats]
    )

    const toggleSeat = (id: string): boolean => {
        const isSelected = selectedIds.includes(id)

        // Ghế mới mà đã đủ 8 → chặn, báo thất bại
        if (!isSelected && selectedIds.length >= MAX_SEATS) return false

        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
        return true
    }

    const clearSeats = () => setSelectedIds([])

    return (
        <BookingContext.Provider
            value={{ isSelected ,selectedIds, selectedSeats, seatsTotal, toggleSeat, clearSeats }}
        >
            {children}
        </BookingContext.Provider>
    )
}

