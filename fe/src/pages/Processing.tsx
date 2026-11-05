import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/ProcessComponents/PaymentStepper';
import { MomoPayModal } from '../components/ProcessComponents/MomoPayModal';

export default function Processing() {
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

            {/* Header đồng bộ nền trắng */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-200">
                <Header />
            </div>

            {/* Stepper bước 4: Pay */}
            <PaymentStepper currentStep={4} />

            {/* Thanh Mode Switcher duy nhất: Đã đổi đúng thứ tự Payment -> MoMo QR -> Timed Out */}
            <div className="w-full flex justify-center py-3">
                <div className="bg-[#10141d] border border-gray-800 rounded-full p-1 flex items-center gap-1.5 text-xs font-semibold shadow-xl select-none">
                    <span className="text-[10px] font-bold text-gray-500 uppercase pl-2.5 pr-2 border-r border-gray-800">
                        ⚙ MODE
                    </span>

                    {/* 1. Payment: Click chuyển về trang Payment */}
                    <button
                        type="button"
                        onClick={() => navigate('/payment')}
                        className="px-3 py-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition cursor-pointer text-[11px]"
                    >
                        1. Payment
                    </button>

                    {/* 2. MoMo QR: Đang active trên trang Processing */}
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A50064] text-white shadow-md shadow-[#A50064]/30 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>2. MoMo QR</span>
                    </div>

                    {/* 3. Timed Out: Không click được, chỉ là nhãn hiển thị trạng thái */}
                    <span
                        className="px-3 py-1 rounded-full text-gray-500 opacity-40 cursor-not-allowed text-[11px]"
                        title="Tự động kích hoạt khi hết thời gian giữ chỗ"
                    >
                        3. Timed Out
                    </span>
                </div>
            </div>

            {/* Khu vực trung tâm hiển thị Modal QR */}
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 py-6 flex items-center justify-center">
                <MomoPayModal
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
