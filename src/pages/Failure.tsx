import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FailureStepper } from '../components/FailureComponents/FailureStepper';
import { FailureCard } from '../components/FailureComponents/FailureCard';

export default function Failure() {
    const navigate = useNavigate();

    // Đếm ngược ngầm 15 giây tự chuyển về homepage
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/homepage');
        }, 15000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="failure-page-root min-h-screen bg-[#070B12] flex flex-col font-sans select-none text-gray-200">
            {/* Đồng bộ Header & Footer nền trắng chữ rõ nét */}
            <style>{`
        .failure-page-root > div:first-child button,
        .failure-page-root > div:first-child span:not(.font-bold) {
          color: #1f2937 !important;
        }

        .failure-page-root footer,
        .failure-page-root > div:last-child {
          background-color: #ffffff !important;
          border-top: 1px solid #e5e7eb !important;
        }

        .failure-page-root footer *,
        .failure-page-root > div:last-child * {
          color: #4b5563 !important;
        }

        .failure-page-root footer h4,
        .failure-page-root > div:last-child h4 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        .failure-page-root footer strong,
        .failure-page-root > div:last-child strong {
          color: #dc2626 !important;
        }
      `}</style>

            {/* Header */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-200">
                <Header />
            </div>

            {/* Thanh tiến trình báo Hết giờ */}
            <FailureStepper />

            {/* Thẻ Failure chính */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex items-center justify-center">
                <FailureCard />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
}