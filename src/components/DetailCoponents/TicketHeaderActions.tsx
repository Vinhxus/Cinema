import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, CheckCircle2 } from 'lucide-react';

export const TicketHeaderActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
            <div className="space-y-1">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span
                        onClick={() => navigate('/homepage')}
                        className="hover:text-white cursor-pointer transition"
                    >
                        Home
                    </span>
                    <span>/</span>
                    <span className="hover:text-white cursor-pointer transition">My Bookings</span>
                    <span>/</span>
                    <span className="text-amber-400 font-mono font-semibold">CV-2024-88492X</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <h1 className="text-2xl font-black text-white tracking-wide">
                        Ticket Details
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed & Paid
                    </span>
                </div>

                <p className="text-xs text-gray-400">
                    Booking Ref: <span className="text-gray-200 font-mono font-bold">CV-2024-88492X</span> • Paid via{' '}
                    <strong className="text-[#A50064]">MoMo App</strong> at 20:20, Oct 24, 2024
                </p>
            </div>

            {/* Chỉ giữ lại nút Share */}
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={() => {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Ticket link copied to clipboard!');
                        }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700/80 hover:bg-gray-800 text-xs font-semibold text-gray-200 transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                    <Share2 className="w-4 h-4 text-gray-400" />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

export default TicketHeaderActions;