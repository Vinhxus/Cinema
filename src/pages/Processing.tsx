import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PaymentStepper } from '../components/ProcessComponents/PaymentStepper';
import { VNPayModal } from '../components/ProcessComponents/VNPayModal';

export default function Processing() {
    const [activeMode, setActiveMode] = useState<'vnpay' | 'processing' | 'timeout'>('vnpay');
    const navigate = useNavigate();

    return (
        <div className="processing-page-root min-h-screen bg-[#070B12] flex flex-col font-sans select-none">
            {/* 
        ÉP CSS CHO HEADER VÀ FOOTER TRỰC TIẾP TẠI TRANG PROCESSING
        - Chữ Header màu tối rõ nét trên nền trắng.
        - Footer chuyển sang nền trắng tinh, toàn bộ chữ đen/xám rõ ràng.
      */}
            <style>{`
        /* 1. Xử lý Header */
        .processing-page-root > div:first-child button,
        .processing-page-root > div:first-child span:not(.font-bold) {
          color: #1f2937 !important;
        }

        /* 2. Xử lý Footer: Nền trắng và viền trên nhạt */
        .processing-page-root footer,
        .processing-page-root > div:last-child {
          background-color: #ffffff !important;
          border-top: 1px solid #e5e7eb !important;
        }

        /* Đổi màu toàn bộ văn bản trong Footer thành màu xám tối / đen rõ nét */
        .processing-page-root footer *,
        .processing-page-root > div:last-child * {
          color: #4b5563 !important;
        }

        /* Tiêu đề cột Footer màu đen đậm */
        .processing-page-root footer h4,
        .processing-page-root > div:last-child h4 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        /* Hotline màu đỏ */
        .processing-page-root footer strong,
        .processing-page-root > div:last-child strong {
          color: #dc2626 !important;
        }

        /* Giữ chữ trắng bên trong các nhãn độ tuổi (P, C13, C16, C18) */
        .processing-page-root footer span[class*="bg-emerald"],
        .processing-page-root > div:last-child span[class*="bg-emerald"],
        .processing-page-root footer span[class*="bg-amber"],
        .processing-page-root > div:last-child span[class*="bg-amber"],
        .processing-page-root footer span[class*="bg-orange"],
        .processing-page-root > div:last-child span[class*="bg-orange"],
        .processing-page-root footer span[class*="bg-red"],
        .processing-page-root > div:last-child span[class*="bg-red"] {
          color: #ffffff !important;
        }
      `}</style>

            {/* Header */}
            <div className="w-full text-gray-900">
                <Header />
            </div>

            {/* Stepper bước 4: Pay */}
            <PaymentStepper />

            {/* Thanh Mode Switcher */}
            <div className="w-full flex justify-center py-3">
                <div className="bg-[#121722] border border-gray-800/80 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-gray-400 shadow-md">
                    <span className="text-[9px] font-bold text-gray-500 uppercase px-1">⚙ MODE</span>

                    <button
                        onClick={() => setActiveMode('vnpay')}
                        className={`px-3 py-0.5 rounded-full font-semibold transition cursor-pointer flex items-center gap-1.5 ${activeMode === 'vnpay'
                            ? 'bg-[#f59e0b] text-black shadow'
                            : 'hover:text-white'
                            }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        <span>1. VNPay QR</span>
                    </button>

                    <button
                        onClick={() => setActiveMode('processing')}
                        className={`px-3 py-0.5 rounded-full font-semibold transition cursor-pointer flex items-center gap-1.5 ${activeMode === 'processing'
                            ? 'bg-[#f59e0b] text-black shadow'
                            : 'hover:text-white'
                            }`}
                    >
                        <span>⟳ 2. Processing</span>
                    </button>

                    <button
                        onClick={() => setActiveMode('timeout')}
                        className={`px-3 py-0.5 rounded-full font-semibold transition cursor-pointer ${activeMode === 'timeout'
                            ? 'bg-[#f59e0b] text-black shadow'
                            : 'hover:text-white'
                            }`}
                    >
                        3. Timed Out
                    </button>
                </div>
            </div>

            {/* Khu vực trung tâm hiển thị Modal QR */}
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 py-6 flex items-center justify-center">
                <VNPayModal
                    onClose={() => navigate('/payment')}
                    onSuccess={() => navigate('/successfull')}
                />
            </main>

            {/* Footer tự động hiển thị nền trắng và chữ rõ nét */}
            <div className="w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
}