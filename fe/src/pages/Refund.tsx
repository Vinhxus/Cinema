import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { RefundStepper } from '../components/RefundComponents/RefundStepper';
import { RefundCard } from '../components/RefundComponents/RefundCard';

export default function Refund() {
    const navigate = useNavigate();

    // Đếm ngược ngầm 15 giây (15000ms) rồi tự động quay về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 15000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="refund-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
            {/* Header đồng bộ nền trắng */}
            <div className="w-full pay-text-primary bg-white border-b border-gray-100">
                <Header />
            </div>

            {/* Thanh tiến trình Refund */}
            <RefundStepper />

            {/* Thẻ hiển thị thông tin hoàn tiền chính */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
                <RefundCard />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}