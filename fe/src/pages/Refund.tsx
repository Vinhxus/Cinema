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
            navigate('/homepage');
        }, 15000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="refund-page-root min-h-screen bg-[#070B12] flex flex-col font-sans select-none text-gray-200">
            {/* Ép CSS Header & Footer đồng bộ nền trắng */}
            <style>{`
        .refund-page-root > div:first-child button,
        .refund-page-root > div:first-child span:not(.font-bold) {
          color: #1f2937 !important;
        }

        .refund-page-root footer,
        .refund-page-root > div:last-child {
          background-color: #ffffff !important;
          border-top: 1px solid #e5e7eb !important;
        }

        .refund-page-root footer *,
        .refund-page-root > div:last-child * {
          color: #4b5563 !important;
        }

        .refund-page-root footer h4,
        .refund-page-root > div:last-child h4 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        .refund-page-root footer strong,
        .refund-page-root > div:last-child strong {
          color: #dc2626 !important;
        }

        .refund-page-root footer span[class*="bg-emerald"],
        .refund-page-root > div:last-child span[class*="bg-emerald"],
        .refund-page-root footer span[class*="bg-amber"],
        .refund-page-root > div:last-child span[class*="bg-amber"],
        .refund-page-root footer span[class*="bg-orange"],
        .refund-page-root > div:last-child span[class*="bg-orange"],
        .refund-page-root footer span[class*="bg-red"],
        .refund-page-root > div:last-child span[class*="bg-red"] {
          color: #ffffff !important;
        }
      `}</style>

            {/* Header */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-200">
                <Header />
            </div>

            {/* Thanh tiến trình Refund */}
            <RefundStepper />

            {/* Thẻ hiển thị thông tin hoàn tiền chính */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
                <RefundCard />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
}
