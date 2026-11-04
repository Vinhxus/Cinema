import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Home, Info, PhoneCall, Mail } from 'lucide-react';

export const FailureCard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[820px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-gray-800 p-6 sm:p-10 text-center font-sans">
            {/* Session Expired Clock Icon */}
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-inner">
                <div className="w-10 h-10 rounded-full bg-[#fca5a5]/40 flex items-center justify-center text-rose-600">
                    <svg className="w-6 h-6 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
            </div>

            {/* Main Title & Description */}
            <div className="mt-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Payment Session Expired
                </h1>
                <p className="text-xs text-gray-500 max-w-lg mx-auto pt-1 leading-relaxed">
                    Your reservation time limit has ended. The selected seats have been released back to the seating inventory.
                </p>
            </div>

            {/* Booking Summary Box */}
            <div className="mt-6 bg-[#f8fafc] border border-gray-200 rounded-xl p-4 text-xs text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        BOOKING REFERENCE
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                        CV-2024-88492X
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">SCREENING</span>
                        <p className="font-bold text-gray-900 mt-0.5">Dune: Part Two</p>
                        <span className="text-[10px] text-gray-500">Hall 01 • IMAX Laser</span>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">SELECTED SEATS</span>
                        <p className="font-bold text-gray-900 mt-0.5">
                            F12, F13 <span className="text-rose-600 text-[10px] ml-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Released</span>
                        </p>
                    </div>

                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">TOTAL AMOUNT</span>
                        <p className="font-mono text-gray-400 line-through mt-0.5">
                            390,000 ₫
                        </p>
                        <span className="text-[10px] text-rose-600 font-bold">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Important Notice */}
            <div className="mt-4 bg-[#eff6ff] border border-blue-200 rounded-xl p-4 text-left flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-blue-950 leading-relaxed">
                    <p>
                        To ensure fair booking access for all guests, held seats are automatically released when the countdown reaches <strong>00:00</strong>.
                    </p>
                    <p className="text-[11px] text-rose-700 font-medium pt-1">
                        <strong>Important Note:</strong> If money was already deducted from your bank account or e-wallet, please reach out to Customer Support with your Booking Reference (<strong>CV-2024-88492X</strong>) for prompt refund processing.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                    type="button"
                    onClick={() => navigate('/payment')}
                    className="w-full sm:w-1/2 py-3 px-4 bg-[#f59e0b] hover:bg-amber-600 active:scale-[0.98] text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 cursor-pointer uppercase tracking-wider"
                >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>Re-select Seats & Try Again</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/homepage')}
                    className="w-full sm:w-1/2 py-3 px-4 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-300 transition cursor-pointer uppercase tracking-wider"
                >
                    <Home className="w-4 h-4" />
                    <span>Return to Homepage</span>
                </button>
            </div>

            {/* Support Footer */}
            <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                    Need assistance? Hotline: <strong className="text-gray-800">1900 8888</strong> (24/7 Toll-Free)
                </span>
                <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    Email: <span className="text-gray-800 font-medium">support@senema.vn</span>
                </span>
            </div>
        </div>
    );
};

export default FailureCard;