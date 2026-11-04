import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, RotateCcw, AlertCircle, PhoneCall, Mail, ArrowRight } from 'lucide-react';

export const RefundCard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[820px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-gray-800 p-6 sm:p-10 text-center font-sans">
            {/* Icon hoàn tiền thành công */}
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 stroke-[2.2]" />
            </div>

            {/* Tiêu đề & Thông báo chính */}
            <div className="mt-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Refund Request Submitted
                </h1>
                <p className="text-xs text-gray-500 max-w-lg mx-auto pt-1 leading-relaxed">
                    Your ticket cancellation and refund request has been received and processed according to CineVerse policy.
                </p>
            </div>

            {/* Thông tin giao dịch hoàn tiền */}
            <div className="mt-6 bg-[#f8fafc] border border-gray-200 rounded-xl p-4 text-xs text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        REFUND REFERENCE
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                        RF-2024-99812C
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">CANCELLED SCREENING</span>
                        <p className="font-bold text-gray-900 mt-0.5">Dune: Part Two</p>
                        <span className="text-[10px] text-gray-500">Hall 01 • IMAX Laser (Seats F12, F13)</span>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">REFUND DESTINATION</span>
                        <p className="font-bold text-gray-900 mt-0.5">
                            MoMo E-Wallet
                        </p>
                        <span className="text-[10px] text-gray-500">Linked Phone: 0912 *** 678</span>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">ESTIMATED TIMELINE</span>
                        <p className="font-bold text-emerald-600 mt-0.5">
                            Instant to 24 Hours
                        </p>
                        <span className="text-[10px] text-gray-400">Depends on payment provider</span>
                    </div>
                </div>

                {/* Bảng chi tiết tính tiền hoàn */}
                <div className="pt-2 border-t border-gray-200 space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex justify-between">
                        <span>Total Original Paid:</span>
                        <span className="font-mono text-gray-800">390,000 ₫</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Cancellation Policy Fee (Early Notice):</span>
                        <span className="font-mono text-emerald-600">0 ₫ (Free Cancellation)</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-xs pt-1.5 border-t border-gray-200/80">
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
                    <p className="text-[11px] text-gray-600 pt-0.5">
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
                    className="w-full sm:w-1/2 py-3 px-4 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-300 transition cursor-pointer uppercase tracking-wider"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span>Book Another Showtime</span>
                </button>
            </div>

            {/* Thông tin hỗ trợ */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    Support Hotline: <strong className="text-gray-800">1900 8888</strong> (24/7 Toll-Free)
                </span>
                <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    Email: <span className="text-gray-800 font-medium">support@senema.vn</span>
                </span>
            </div>
        </div>
    );
};

export default RefundCard;