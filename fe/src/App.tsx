import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage'
import SelectSeat from './pages/SelectSeat'
import MovieDetail from './pages/MovieDetail'
import FoodPage from './pages/FoodPage'
import { BookingProvider } from './context/Booking'

function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/movie" element={<MovieDetail />} />
        <Route path="/select-seat" element={<SelectSeat />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BookingProvider>
  )
}

export default App