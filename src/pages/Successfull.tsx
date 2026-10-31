import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentStepper from '../components/SuccessComponents/PaymentStepper';
import TicketCard from '../components/SuccessComponents/TicketCard';
import InfoCards from '../components/SuccessComponents/InfoCards';

export default function Successfull() {
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

            {/* Header */}
            <div className="w-full text-gray-900">
                <Header />
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