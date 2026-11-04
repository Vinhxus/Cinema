import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
    <div className="success-page-root min-h-screen bg-[#070B12] flex flex-col font-sans select-none">
      {/* 
        ÉP CSS TRỰC TIẾP CHO HEADER VÀ FOOTER TẠI TRANG SUCCESSFULL
        - Giữ chữ Header luôn đen đậm trên nền trắng của Header.
        - Ép Footer sang nền trắng tinh và làm nổi bật toàn bộ chữ, nhãn độ tuổi.
      */}
      <style>{`
        /* 1. Xử lý Header */
        .success-page-root > div:first-child button,
        .success-page-root > div:first-child span:not(.font-bold) {
          color: #1f2937 !important;
        }

        /* 2. Xử lý Footer: Ép nền trắng tinh và viền trên xám nhạt */
        .success-page-root footer,
        .success-page-root > div:last-child {
          background-color: #ffffff !important;
          border-top: 1px solid #e5e7eb !important;
        }

        /* Đổi màu toàn bộ văn bản trong Footer thành màu xám tối / đen rõ nét */
        .success-page-root footer *,
        .success-page-root > div:last-child * {
          color: #4b5563 !important;
        }

        /* Giữ màu chữ tiêu đề cột Footer đậm hơn */
        .success-page-root footer h4,
        .success-page-root > div:last-child h4 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        /* Hotline màu đỏ nổi bật */
        .success-page-root footer strong,
        .success-page-root > div:last-child strong {
          color: #dc2626 !important;
        }

        /* Giữ đúng màu các huy hiệu nhãn độ tuổi (P, C13, C16, C18) */
        .success-page-root footer span[class*="bg-emerald"],
        .success-page-root > div:last-child span[class*="bg-emerald"],
        .success-page-root footer span[class*="bg-amber"],
        .success-page-root > div:last-child span[class*="bg-amber"],
        .success-page-root footer span[class*="bg-orange"],
        .success-page-root > div:last-child span[class*="bg-orange"],
        .success-page-root footer span[class*="bg-red"],
        .success-page-root > div:last-child span[class*="bg-red"] {
          color: #ffffff !important;
        }
      `}</style>

      {/* Header: Đặt nền trắng tinh và viền mỏng phía dưới */}
      <div className="w-full text-gray-900 bg-white border-b border-gray-200">
        <Header />
      </div>

      {/* Thanh thông báo đếm ngược 15s tự động chuyển sang trang Ticket Details */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-400">
          <span className="font-semibold">
            Payment confirmed! Automatically navigating to detailed boarding pass in:
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {countdown}s
            </span>
            <button
              type="button"
              onClick={() => navigate('/ticket-details')}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1 rounded-lg transition cursor-pointer"
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

      {/* Footer tự động biến thành nền trắng và chữ rõ nét */}
      <div className="w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
}