import { createContext, useContext } from 'react'
// `import type` = chỉ lấy kiểu cho TypeScript, bị XÓA HẲN khi chạy trên trình duyệt.
// tsconfig bật "verbatimModuleSyntax", nên nếu viết `import { BookingContextValue }`
// thì trình duyệt sẽ đi tìm một export có tên đó trong Booking.tsx lúc runtime -> không có -> SyntaxError.
import type { BookingContextValue } from './Booking'

export const BookingContext = createContext<BookingContextValue | null>(null)

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}
