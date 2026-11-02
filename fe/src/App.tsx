import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage'
import SelectSeat from './pages/SelectSeat'
import MovieDetail from './pages/MovieDetail'
import FoodPage from './pages/FoodPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/movie" element={<MovieDetail />} />
      <Route path="/select-seat" element={<SelectSeat />} />
      <Route path="/food" element={<FoodPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App