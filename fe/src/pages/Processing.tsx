import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/ProcessComponents/PaymentStepper';
import { MomoPayModal } from '../components/ProcessComponents/MomoPayModal';

export default function Processing() {
    const navigate = useNavigate();

    return (
        <div className="processing-page-root min-h-screen bg-white flex flex-col font-sans select-none">
            {/* Header đồng bộ nền trắng */}
            <div className="w-full text-gray-900 bg-white border-b border-gray-100">
                <Header />
            </div>

            {/* Stepper bước 4: Pay */}
            <PaymentStepper currentStep={4} />

            {/* Thanh Mode Switcher đồng bộ nền sáng */}
            <div className="w-full flex justify-center py-3">
                <div className="bg-gray-50 border border-gray-200 rounded-full p-1 flex items-center gap-1.5 text-xs font-semibold shadow-sm select-none">
                    <span className="text-[10px] font-bold text-gray-500 uppercase pl-2.5 pr-2 border-r border-gray-200">
                        ⚙ MODE
                    </span>

                    {/* 1. Payment: Click chuyển về trang Payment */}
                    <button
                        type="button"
                        onClick={() => navigate('/payment')}
                        className="px-3 py-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 transition cursor-pointer text-[11px]"
                    >
                        1. Payment
                    </button>

                    {/* 2. MoMo QR: Đang active trên trang Processing */}
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A50064] text-white shadow-sm shadow-[#A50064]/20 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>2. MoMo QR</span>
                    </div>

                    {/* 3. Timed Out: Hiển thị trạng thái */}
                    <span
                        className="px-3 py-1 rounded-full text-gray-400 opacity-60 cursor-not-allowed text-[11px]"
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
                    onSuccess={() => navigate('/success')}
                />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}
