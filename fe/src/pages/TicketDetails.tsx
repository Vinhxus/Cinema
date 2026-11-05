import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { TicketHeaderActions } from '../components/DetailComponents/TicketHeaderActions';
import { MainTicketCard } from '../components/DetailComponents/MainTicketCard';
import { CancellationPolicy } from '../components/DetailComponents/CancellationPolicy';
import { TheaterLocationMap } from '../components/DetailComponents/TheaterLocationMap';
import { TicketSupportBanner } from '../components/DetailComponents/TicketSupportBanner';

export default function TicketDetails() {
    const navigate = useNavigate();

    // Đếm ngược ngầm 30 giây (30000ms) tự động quay về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 30000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="ticket-details-root min-h-screen bg-white text-gray-900 font-sans flex flex-col select-none">
            {/* Header đồng bộ nền trắng */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-100">
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

            {/* Footer */}
            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}
