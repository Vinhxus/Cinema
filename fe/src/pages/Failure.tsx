import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { FailureStepper } from '../components/FailureComponents/FailureStepper';
import { FailureCard } from '../components/FailureComponents/FailureCard';

export default function Failure() {
    const navigate = useNavigate();

    // Đếm ngược ngầm 15 giây tự chuyển về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 15000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="failure-page-root min-h-screen bg-white flex flex-col font-sans select-none text-gray-900">
            {/* Header đồng bộ nền trắng */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-100">
                <Header />
            </div>

            {/* Thanh tiến trình báo Hết giờ */}
            <FailureStepper />

            {/* Thẻ Failure chính */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex items-center justify-center">
                <FailureCard />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}
