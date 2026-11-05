import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, RotateCcw, AlertCircle, PhoneCall, Mail, ArrowRight } from 'lucide-react';

export const RefundCard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[820px] mx-auto pay-card pay-font-primary pay-text-primary rounded-2xl shadow-sm overflow-hidden border border-gray-300 p-6 sm:p-10 text-center">
            {/* Icon hoàn tiền thành công */}
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.2]" />
            </div>

            {/* Tiêu đề & Thông báo chính */}
            <div className="mt-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black pay-text-primary tracking-tight">
                    Refund Request Submitted
                </h1>
                <p className="text-xs pay-text-secondary pay-font-secondary max-w-lg mx-auto pt-1 leading-relaxed">
                    Your ticket cancellation and refund request has been received and processed according to CineVerse policy.
                </p>
            </div>

            {/* Thông tin giao dịch hoàn tiền */}
            <div className="mt-6 bg-white border border-gray-300 rounded-xl p-4 text-xs text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                    <span className="text-[10px] font-bold uppercase pay-text-secondary tracking-wider">
                        REFUND REFERENCE
                    </span>
                    <span className="font-mono font-bold pay-text-primary text-sm">
                        RF-2024-99812C
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <span className="text-[9px] font-bold pay-text-secondary uppercase block">CANCELLED SCREENING</span>
                        <p className="font-bold pay-text-primary mt-0.5">Dune: Part Two</p>
                        <span className="text-[10px] pay-text-secondary pay-font-secondary">Hall 01 • IMAX Laser (Seats F12, F13)</span>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold pay-text-secondary uppercase block">REFUND DESTINATION</span>
                        <p className="font-bold pay-text-primary mt-0.5">
                            MoMo E-Wallet
                        </p>
                        <span className="text-[10px] pay-text-secondary pay-font-secondary">Linked Phone: 0912 *** 678</span>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold pay-text-secondary uppercase block">ESTIMATED TIMELINE</span>
                        <p className="font-bold text-emerald-600 mt-0.5">
                            Instant to 24 Hours
                        </p>
                        <span className="text-[10px] pay-text-secondary pay-font-secondary">Depends on payment provider</span>
                    </div>
                </div>

                {/* Bảng chi tiết tính tiền hoàn */}
                <div className="pt-2 border-t border-gray-300 space-y-1.5 text-[11px] pay-text-secondary pay-font-secondary">
                    <div className="flex justify-between">
                        <span>Total Original Paid:</span>
                        <span className="font-mono pay-text-primary">390,000 ₫</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cancellation Policy Fee (Early Notice):</span>
                        <span className="font-mono text-emerald-600">0 ₫ (Free Cancellation)</span>
                    </div>
                    <div className="flex justify-between font-bold pay-text-primary text-xs pt-1.5 border-t border-gray-300">
                        <span>Total Amount to be Refunded:</span>
                        <span className="font-mono text-amber-600 text-sm">390,000 ₫</span>
                    </div>
                </div>
            </div>

            {/* Ghi chú chính sách */}
            <div className="mt-4 bg-[#eff6ff] border border-blue-200 rounded-xl p-4 text-left flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-blue-950 leading-relaxed">
                    <p>
                        A confirmation receipt and cancellation voucher have been dispatched to your email (<strong>alex.nguyen@example.com</strong>).
                    </p>
                    <p className="text-[11px] pay-text-secondary pay-font-secondary pt-0.5">
                        Your released seats are now accessible to other moviegoers. If the funds do not reflect within 48 hours, please reach out to CineVerse support.
                    </p>
                </div>
            </div>

            {/* Các nút điều hướng */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                    type="button"
                    onClick={() => navigate('/homepage')}
                    className="w-full sm:w-1/2 py-3 px-4 bg-[#f59e0b] hover:bg-amber-600 active:scale-[0.98] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 cursor-pointer uppercase tracking-wider"
                >
                    <Home className="w-4 h-4" />
                    <span>Return to Homepage Now</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/payment')}
                    className="w-full sm:w-1/2 py-3 px-4 bg-white hover:bg-gray-100 active:scale-[0.98] pay-text-primary font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-300 transition cursor-pointer uppercase tracking-wider"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Book Another Showtime</span>
                </button>
            </div>

            {/* Thông tin hỗ trợ */}
            <div className="mt-5 pt-4 border-t border-gray-300 text-[11px] pay-text-secondary pay-font-secondary flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                    Support Hotline: <strong className="pay-text-primary">1900 8888</strong> (24/7 Toll-Free)
                </span>
                <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email: <span className="pay-text-primary font-medium">support@senema.vn</span>
                </span>
            </div>
        </div>
    );
};

export default RefundCard;