import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage'
import SelectSeat from './pages/SelectSeat'
import FoodPage from './pages/FoodPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MovieManagement from './pages/MovieManagement'
import Showtimes from './pages/Showtimes'
import SeatingAndPricing from './pages/SeatingAndPricing'
import TicketCheckIn from './pages/TicketCheckIn'
import { BookingProvider } from './context/Booking'

function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/select-seat" element={<SelectSeat />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/movies" element={<MovieManagement />} />
        <Route path="/admin/showtimes" element={<Showtimes />} />
        <Route path="/admin/seating" element={<SeatingAndPricing />} />
        <Route path="/admin/check-in" element={<TicketCheckIn />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BookingProvider>
  )
}

export default App
