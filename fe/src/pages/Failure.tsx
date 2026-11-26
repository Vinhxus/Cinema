import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { FailureStepper } from '../components/FailureComponents/FailureStepper';
import { FailureCard } from '../components/FailureComponents/FailureCard';

export default function Failure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    useEffect(() => {
        // Gọi API hủy đơn và giải phóng ghế khi vào trang Failure
        if (bookingId) {
            fetch(`http://localhost:5000/api/orders/${bookingId}/cancel`, {
                method: 'POST',
            })
                .then(res => res.json())
                .then(data => console.log('Đã giải phóng ghế đơn hàng:', data))
                .catch(err => console.error('Lỗi khi gửi yêu cầu hủy đơn:', err));
        }

        // Đếm ngược 15 giây tự chuyển về homepage
        const timer = setTimeout(() => {
            navigate('/');
        }, 15000);

        return () => clearTimeout(timer);
    }, [bookingId, navigate]);

    return (
        <div className="failure-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
            <div className="w-full pay-text-primary bg-white border-b border-gray-100">
                <Header />
            </div>

            <FailureStepper />

            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex items-center justify-center">
                <FailureCard />
            </main>

            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}