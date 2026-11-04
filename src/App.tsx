import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Payment from "./pages/Payment";
import Processing from "./pages/Processing";
import Successfull from "./pages/Successfull";
import TicketDetails from "./pages/TicketDetails";
import Failure from "./pages/Failure";
import Refund from "./pages/Refund";

// 1. Component tự động cuộn lên đầu trang mỗi khi chuyển URL
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Đưa ngay lập tức lên đầu trước khi animation hiển thị
    });
  }, [pathname]);

  return null;
}

// 2. Component bọc tạo animation chuyển trang mượt mà
function PageWrapper({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition w-full min-h-screen overflow-x-hidden">
      {children}
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-wrap gap-2 bg-[#10141d]/90 backdrop-blur-md p-1.5 rounded-full border border-gray-700 shadow-2xl text-xs font-semibold">
      <Link
        to="/homepage"
        className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700 transition"
      >
        Home
      </Link>
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
      <Link
        to="/ticket-details"
        className="px-3 py-1.5 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition"
      >
        4. Ticket Details
      </Link>
      <Link
        to="/failure"
        className="px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition"
      >
        5. Failure
      </Link>
      <Link
        to="/refund"
        className="px-3 py-1.5 rounded-full bg-purple-600 text-white hover:bg-purple-500 transition"
      >
        6. Refund
      </Link>
    </div>
  );
}

function App() {
  return (
    <div className="w-full min-h-screen bg-[#070B12]">
      <Router>
        {/* Tự động cuộn lên vị trí cao nhất */}
        <ScrollToTop />

        {/* Thanh điều hướng thử nghiệm nhanh */}
        <NavigationBar />

        <Routes>
          <Route path="/" element={<Navigate to="/homepage" replace />} />
          <Route path="/homepage" element={<PageWrapper><Homepage /></PageWrapper>} />
          <Route path="/payment" element={<PageWrapper><Payment /></PageWrapper>} />
          <Route path="/processing" element={<PageWrapper><Processing /></PageWrapper>} />
          <Route path="/successfull" element={<PageWrapper><Successfull /></PageWrapper>} />
          <Route path="/ticket-details" element={<PageWrapper><TicketDetails /></PageWrapper>} />
          <Route path="/failure" element={<PageWrapper><Failure /></PageWrapper>} />
          <Route path="/refund" element={<PageWrapper><Refund /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/homepage" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;