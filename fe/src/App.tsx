import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage'
import MovieDetail from './pages/MovieDetail'

/*
 * TẠM THỜI — phần của mình: Homepage + MovieDetail.
 * SelectSeat / FoodPage / Booking đang tắt vì code bên đó còn lỗi runtime
 * (`import { SeatData }` thay vì `import type`) làm trắng toàn bộ app.
 * Khi bên đó sửa xong: bỏ comment 3 dòng import + 2 route, bọc lại <BookingProvider>.
 *
 * import SelectSeat from './pages/SelectSeat'
 * import FoodPage from './pages/FoodPage'
 * import { BookingProvider } from './context/Booking'
 */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/movie" element={<MovieDetail />} />
      {/* <Route path="/select-seat" element={<SelectSeat />} /> */}
      {/* <Route path="/food" element={<FoodPage />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App