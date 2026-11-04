import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { TicketHeaderActions } from '../components/DetailCoponents/TicketHeaderActions';
import { MainTicketCard } from '../components/DetailCoponents/MainTicketCard';
import { CancellationPolicy } from '../components/DetailCoponents/CancellationPolicy';
import { TheaterLocationMap } from '../components/DetailCoponents/TheaterLocationMap';
import { TicketSupportBanner } from '../components/DetailCoponents/TicketSupportBanner';

export default function TicketDetails() {
    const navigate = useNavigate();

    // Đếm ngược ngầm 30 giây (30000ms) tự động quay về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/homepage');
        }, 30000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="ticket-details-root min-h-screen bg-[#070B12] text-gray-200 font-sans flex flex-col select-none">
            {/* 
        ÉP CSS TRỰC TIẾP CHO HEADER VÀ FOOTER TẠI TRANG TICKET DETAILS
        - Giữ chữ Header luôn đen đậm trên nền trắng của Header.
        - Giữ Footer đồng bộ nền trắng tinh, chữ xám tối rõ nét và huy hiệu độ tuổi đúng màu.
      */}
            <style>{`
        /* 1. Xử lý Header */
        .ticket-details-root > div:first-child button,
        .ticket-details-root > div:first-child span:not(.font-bold) {
          color: #1f2937 !important;
        }

        /* 2. Xử lý Footer: Ép nền trắng tinh và viền trên xám nhạt */
        .ticket-details-root footer,
        .ticket-details-root > div:last-child {
          background-color: #ffffff !important;
          border-top: 1px solid #e5e7eb !important;
        }

        /* Đổi màu toàn bộ văn bản trong Footer thành màu xám tối / đen rõ nét */
        .ticket-details-root footer *,
        .ticket-details-root > div:last-child * {
          color: #4b5563 !important;
        }

        /* Giữ màu chữ tiêu đề cột Footer đậm hơn */
        .ticket-details-root footer h4,
        .ticket-details-root > div:last-child h4 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        /* Hotline màu đỏ nổi bật */
        .ticket-details-root footer strong,
        .ticket-details-root > div:last-child strong {
          color: #dc2626 !important;
        }

        /* Giữ đúng màu các huy hiệu nhãn độ tuổi (P, C13, C16, C18) */
        .ticket-details-root footer span[class*="bg-emerald"],
        .ticket-details-root > div:last-child span[class*="bg-emerald"],
        .ticket-details-root footer span[class*="bg-amber"],
        .ticket-details-root > div:last-child span[class*="bg-amber"],
        .ticket-details-root footer span[class*="bg-orange"],
        .ticket-details-root > div:last-child span[class*="bg-orange"],
        .ticket-details-root footer span[class*="bg-red"],
        .ticket-details-root > div:last-child span[class*="bg-red"] {
          color: #ffffff !important;
        }
      `}</style>

            {/* Header đồng bộ nền trắng */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-200">
                <Header />
            </div>

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 space-y-6">
                {/* Thanh điều hướng & Các nút thao tác */}
                <TicketHeaderActions />

                {/* Thẻ vé chính & Boarding pass QR */}
                <MainTicketCard />

                {/* Chính sách đổi hủy vé */}
                <CancellationPolicy />

                {/* Vị trí rạp & Bản đồ */}
                <TheaterLocationMap />

                {/* Banner hotline & hỗ trợ */}
                <TicketSupportBanner />
            </main>

            {/* Footer tự động biến thành nền trắng và chữ rõ nét */}
            <div className="w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
}