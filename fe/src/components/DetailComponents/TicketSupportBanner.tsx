import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';

export const TicketSupportBanner: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full pay-card pay-font-primary border border-gray-300 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none">
            {/* Hotline bên trái */}
            <div className="flex items-center gap-2.5 text-xs pay-text-secondary pay-font-secondary">
                <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                    Need assistance? Customer Hotline 24/7:{' '}
                    <strong className="pay-text-primary font-mono text-sm tracking-wide">1900 8888</strong>
                </span>
            </div>

            {/* Các nút bấm bên phải */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold pay-text-primary transition cursor-pointer active:scale-95 shadow-sm"
                >
                    Print Ticket
                </button>

                {/* Nút Request Cancellation / Refund kết nối tới /refund */}
                <button
                    type="button"
                    onClick={() => navigate('/refund')}
                    className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-xs font-bold text-rose-600 transition cursor-pointer active:scale-95 shadow-sm"
                >
                    Request Cancellation / Refund
                </button>
            </div>
        </div>
    );
};

export default TicketSupportBanner;