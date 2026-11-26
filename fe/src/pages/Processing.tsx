import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/ProcessComponents/PaymentStepper';
import { MomoPayModal } from '../components/ProcessComponents/MomoPayModal';

export default function Processing() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const transactionRef = searchParams.get('transactionRef');
    const bookingId = searchParams.get('bookingId');

    const [statusMessage, setStatusMessage] = useState('Đang chờ xác thực giao dịch từ MoMo...');

    useEffect(() => {
        if (!transactionRef && !bookingId) {
            return;
        }

        const targetRef = transactionRef || bookingId;

        // Polling kiểm tra trạng thái thanh toán mỗi 3 giây từ Backend
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/payments/status/${targetRef}`);
                const result = await res.json();

                if (res.ok && result.success) {
                    const status = result.data.paymentStatus || result.data.status;
                    const bId = result.data.bookingId || bookingId;

                    if (status === 'SUCCESS' || result.data.isCompleted) {
                        clearInterval(interval);
                        setStatusMessage('Thanh toán thành công! Đang chuyển hướng...');
                        setTimeout(() => {
                            navigate(`/successfull?bookingId=${bId}`);
                        }, 1000);
                    } else if (status === 'FAILED' || status === 'CANCELED') {
                        clearInterval(interval);
                        setStatusMessage('Giao dịch thất bại hoặc bị hủy.');
                        setTimeout(() => {
                            navigate(`/failure?bookingId=${bId}`);
                        }, 1500);
                    }
                }
            } catch (err) {
                console.error('[Processing Polling] Lỗi kiểm tra trạng thái:', err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [transactionRef, bookingId, navigate]);

    return (
        <div className="processing-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
            <div className="w-full pay-text-primary bg-white border-b border-gray-100">
                <Header />
            </div>

            <PaymentStepper currentStep={4} />

            <div className="w-full flex justify-center py-3">
                <div className="pay-card border border-gray-300 rounded-full p-1 flex items-center gap-1.5 text-xs font-semibold shadow-sm select-none">
                    <span className="text-[10px] font-bold pay-text-secondary uppercase pl-2.5 pr-2 border-r border-gray-200">
                        ⚙ MODE
                    </span>

                    <button
                        type="button"
                        onClick={() => navigate('/payment')}
                        className="px-3 py-1 rounded-full pay-text-secondary hover:opacity-70 hover:bg-gray-200 transition cursor-pointer text-[11px]"
                    >
                        1. Payment
                    </button>

                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A50064] text-white shadow-sm shadow-[#A50064]/20 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>2. MoMo QR (Đang xử lý)</span>
                    </div>

                    <span
                        className="px-3 py-1 rounded-full pay-text-secondary opacity-60 cursor-not-allowed text-[11px]"
                        title="Automatically activates when holding time expires"
                    >
                        3. Timed Out
                    </span>
                </div>
            </div>

            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 py-6 flex flex-col items-center justify-center">
                <p className="mb-4 text-sm font-semibold text-pink-600 animate-pulse">{statusMessage}</p>
                <MomoPayModal
                    onClose={() => navigate('/payment')}
                    onSuccess={() => navigate(`/successfull?bookingId=${bookingId || ''}`)}
                />
            </main>

            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}