import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Payment from "./pages/Payment";
import Processing from "./pages/Processing";
import Successfull from "./pages/Successfull";

function NavigationBar() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-wrap gap-2 bg-[#10141d]/90 backdrop-blur-md p-1.5 rounded-full border border-gray-700 shadow-2xl text-xs font-semibold">
      <Link
        to="/payment"
        className="px-3 py-1.5 rounded-full bg-[#e50914] text-white hover:bg-red-700 transition"
      >
        1. Payment
      </Link>
      <Link
        to="/processing"
        className="px-3 py-1.5 rounded-full bg-[#f59e0b] text-black hover:bg-amber-500 transition"
      >
        2. Processing
      </Link>
      <Link
        to="/successfull"
        className="px-3 py-1.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition"
      >
        3. Successfull
      </Link>
    </div>
  );
}

function App() {
  return (
    <div className="w-full min-h-screen bg-[#070B12]">
      <Router>
        {/* Nút bấm chuyển nhanh 3 trang ở góc dưới màn hình */}
        <NavigationBar />

        <Routes>
          <Route path="/" element={<Navigate to="/payment" replace />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/successfull" element={<Successfull />} />
          <Route path="*" element={<Navigate to="/payment" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;