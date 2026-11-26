import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, CheckCircle2 } from 'lucide-react';

interface TicketHeaderActionsProps {
    data?: any;
}

export const TicketHeaderActions: React.FC<TicketHeaderActionsProps> = ({ data }) => {
    const navigate = useNavigate();

    const bookingCode = data?.BookingCode || data?.BookingID || 'CV-ONLINE';
    const customerName = data?.customer_name || 'Khách hàng';
    const paymentTime = data?.payment_time
        ? new Date(data.payment_time).toLocaleString('vi-VN')
        : 'Đã thanh toán';

    return (
        <div className="pay-font-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 pb-5">
            <div className="space-y-1">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs pay-text-secondary">
                    <span
                        onClick={() => navigate('/homepage')}
                        className="hover:opacity-70 cursor-pointer transition"
                    >
                        Home
                    </span>
                    <span>/</span>
                    <span className="hover:opacity-70 cursor-pointer transition">My Bookings</span>
                    <span>/</span>
                    <span className="text-amber-700 font-mono font-semibold">#{bookingCode}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <h1 className="text-2xl font-black pay-text-primary tracking-wide">
                        Ticket Details
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed & Paid
                    </span>
                </div>

                <p className="text-xs pay-text-secondary pay-font-secondary">
                    Booking Ref: <span className="pay-text-primary font-mono font-bold">#{bookingCode}</span> • Customer: {' '}
                    <strong className="text-gray-800">{customerName}</strong> ({paymentTime})
                </p>
            </div>

            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={() => {
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Ticket link copied to clipboard!');
                        }
                    }}
                    className="px-3.5 py-2 rounded-xl pay-card border border-gray-300 hover:bg-gray-200 text-xs font-semibold pay-text-primary transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                    <Share2 className="w-4 h-4 pay-text-secondary" />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

export default TicketHeaderActions;