import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage'
// import SelectSeat from './pages/SelectSeat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      {/* <Route path="/select-seat" element={<SelectSeat />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App