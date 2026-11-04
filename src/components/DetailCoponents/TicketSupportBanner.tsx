import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export const TicketSupportBanner: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-[#10141d] border border-gray-800 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl select-none">
            {/* Hotline bên trái */}
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <PhoneCall className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                    Need assistance? Customer Hotline 24/7:{' '}
                    <strong className="text-white font-mono text-sm tracking-wide">1900 8888</strong>
                </span>
            </div>

            {/* Các nút bấm bên phải */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-700/80 hover:bg-gray-800 text-xs font-semibold text-gray-300 transition cursor-pointer active:scale-95 shadow-sm"
                >
                    Print Ticket
                </button>

                {/* Nút Request Cancellation / Refund kết nối tới /refund */}
                <button
                    type="button"
                    onClick={() => navigate('/refund')}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold text-rose-400 transition cursor-pointer active:scale-95 shadow-sm"
                >
                    Request Cancellation / Refund
                </button>
            </div>
        </div>
    );
};

export default TicketSupportBanner;