import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { TicketHeaderActions } from '../components/DetailComponents/TicketHeaderActions';
import { MainTicketCard } from '../components/DetailComponents/MainTicketCard';
import { CancellationPolicy } from '../components/DetailComponents/CancellationPolicy';
import { TheaterLocationMap } from '../components/DetailComponents/TheaterLocationMap';
import { TicketSupportBanner } from '../components/DetailComponents/TicketSupportBanner';

export default function TicketDetails() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams();

    // Lấy ticketId từ URL params (/ticket/:ticketId) hoặc từ Search query (?ticketId=...)
    const ticketId = params.ticketId || searchParams.get('ticketId') || searchParams.get('ticketNo');

    const [ticketData, setTicketData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch thông tin chi tiết vé từ Backend Node.js
    useEffect(() => {
        if (!ticketId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`http://localhost:5000/api/tickets/${ticketId}`)
            .then((res) => res.json())
            .then((result) => {
                if (result.success && result.data) {
                    setTicketData(result.data);
                } else {
                    setError(result.error?.message || 'Không tìm thấy chi tiết vé');
                }
            })
            .catch((err) => {
                console.error('[TicketDetails] Lỗi tải thông tin vé:', err);
                setError('Không thể kết nối đến máy chủ.');
            })
            .finally(() => setLoading(false));
    }, [ticketId]);

    // Đếm ngược ngầm 30 giây tự động quay về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 30000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="ticket-details-root min-h-screen bg-white text-gray-900 font-sans flex flex-col select-none">
            <div className="w-full text-gray-900 bg-white border-b border-gray-100">
                <Header />
            </div>

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 space-y-6">
                {/* Thanh điều hướng & Các nút thao tác */}
                <TicketHeaderActions data={ticketData} />

                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        ⏳ Đang tải thông tin vé xem phim...
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center">
                        ⚠️ {error}
                    </div>
                ) : (
                    /* Thẻ vé chính & QR Code thực tế */
                    <MainTicketCard data={ticketData} />
                )}

                {/* Chính sách đổi hủy vé */}
                <CancellationPolicy bookingId={ticketData?.BookingID} />

                {/* Vị trí rạp & Bản đồ */}
                <TheaterLocationMap cinemaName={ticketData?.CinemaName} />

                {/* Banner hotline & hỗ trợ */}
                <TicketSupportBanner />
            </main>

            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}