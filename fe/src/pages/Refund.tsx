import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { RefundStepper } from '../components/RefundComponents/RefundStepper';
import { RefundCard } from '../components/RefundComponents/RefundCard';

export default function Refund() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    const [refundData, setRefundData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Tải chi tiết đơn hoàn tiền từ Backend
    useEffect(() => {
        if (bookingId) {
            fetch(`http://localhost:5000/api/orders/${bookingId}/refund`)
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        setRefundData(result.data);
                    }
                })
                .catch(err => console.error('Lỗi lấy dữ liệu hoàn tiền:', err));
        }

        // Tự động quay lại trang chủ sau 15 giây
        const timer = setTimeout(() => {
            navigate('/');
        }, 15000);

        return () => clearTimeout(timer);
    }, [bookingId, navigate]);

    return (
        <div className="refund-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
            <div className="w-full pay-text-primary bg-white border-b border-gray-100">
                <Header />
            </div>

            <RefundStepper />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center">
                <RefundCard data={refundData} />
            </main>

            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}