import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PaymentStepper from '../components/SuccessComponents/PaymentStepper';
import TicketCard from '../components/SuccessComponents/TicketCard';
import InfoCards from '../components/SuccessComponents/InfoCards';

export default function Successfull() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(15);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/ticket-details');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <div className="success-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
      {/* Header đồng bộ nền trắng */}
      <div className="w-full pay-text-primary bg-white border-b border-gray-100">
        <Header />
      </div>

      {/* Thanh thông báo đếm ngược 15s tự động chuyển sang trang Ticket Details (tone sáng) */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 shadow-sm">
          <span className="font-medium">
            Payment confirmed! Automatically navigating to detailed boarding pass in:
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 text-amber-950">
              {countdown}s
            </span>
            <button
              type="button"
              onClick={() => navigate('/ticket-details')}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1 rounded-lg transition cursor-pointer shadow-sm"
            >
              Go Now →
            </button>
          </div>
        </div>
      </div>

      {/* Thanh tiến trình bước 5: Detail */}
      <PaymentStepper />

      {/* Nội dung chính: Chiếc vé và các thẻ hướng dẫn */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <TicketCard />
        <InfoCards />
      </main>

      {/* Footer */}
      <div className="w-full mt-auto border-t border-gray-100">
        <Footer />
      </div>
    </div>
  );
}