import {createContext, useContext} from 'react'
import { BookingContextValue } from './Booking'

export const BookingContext = createContext<BookingContextValue | null>(null)

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>')
  return ctx
}