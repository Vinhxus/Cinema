import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Armchair, Popcorn, CupSoda, Lock, ShieldAlert, PhoneCall } from 'lucide-react';

export const OrderSummary: React.FC = () => {
    const navigate = useNavigate();

    // 1. Logic đếm ngược 10 phút (600 giây)
    const [secondsLeft, setSecondsLeft] = useState<number>(600);

    useEffect(() => {
        if (secondsLeft <= 0) {
            // Hết thời gian giữ ghế tự động chuyển sang trang Failure
            navigate('/failure');
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, navigate]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Cảnh báo khi còn dưới 2 phút
    const isUrgent = secondsLeft < 120;

    return (
        <div className="w-full max-w-[420px] mx-auto space-y-3 pay-font-primary pay-text-primary">
            {/* 1. SEAT HOLD TIMER */}
            <div
                className={`w-full rounded-xl px-4 py-2 flex items-center justify-between border transition-all duration-300 shadow-sm ${isUrgent
                    ? 'bg-rose-50 border-rose-400/60'
                    : 'pay-card border-amber-500/40'
                    }`}
            >
                {/* Trạng thái đếm giữ ghế */}
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUrgent ? 'bg-rose-400' : 'bg-amber-400'
                                }`}
                        />
                        <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${isUrgent ? 'bg-rose-500' : 'bg-amber-500'
                                }`}
                        />
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold pay-text-primary">
                        Seat Hold Timer
                    </span>
                </div>

                {/* Ô hiển thị đồng hồ số */}
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs tracking-wider transition-colors ${isUrgent
                        ? 'bg-rose-100 border-rose-400/60 text-rose-600 animate-pulse'
                        : 'bg-amber-100 border-amber-500/40 text-amber-700'
                        }`}
                >
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{formattedTime}</span>
                </div>
            </div>

            {/* 2. ORDER SUMMARY CARD */}
            <div className="pay-card border border-gray-300 rounded-xl p-4 shadow-sm space-y-3.5">

                {/* Poster & Movie Meta */}
                <div className="flex gap-3 items-start">
                    <div className="w-[64px] h-[86px] rounded-md overflow-hidden bg-gray-200 flex-shrink-0 relative border border-gray-300 shadow-md">
                        <img
                            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300"
                            alt="Dune: Part Two"
                            className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[7px] font-black px-1 py-0.5 rounded leading-none">
                            IMAX
                        </span>
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[9px] font-bold">
                            <span className="bg-gray-200 pay-text-primary px-1 py-0.5 rounded border border-gray-300">IMAX Laser 2D</span>
                            <span className="bg-[#e50914] text-white px-1 py-0.5 rounded">C18</span>
                            <span className="pay-text-secondary font-normal">166 mins</span>
                        </div>
                        <h3 className="pay-text-primary font-bold text-sm truncate leading-tight">Dune: Part Two</h3>
                        <p className="pay-text-secondary pay-font-secondary text-[10px] truncate mb-1.5">Hành Tinh Cát - Phần Hai</p>

                        <p className="text-[10px] pay-text-primary font-medium">📅 Today, Oct 24 • 20:15 - 23:01</p>
                        <p className="text-[10px] pay-text-secondary pay-font-secondary">📍 CGV Landmark 81 • Hall IMAX 01</p>
                    </div>
                </div>

                {/* Selected Seats & Add-ons */}
                <div className="space-y-2 pt-2.5 border-t border-gray-300 text-xs">
                    <div className="flex items-center justify-between text-[10px] pay-text-secondary font-bold uppercase tracking-wider">
                        <span>SELECTED SEATS & ADD-ONS</span>
                        <button
                            type="button"
                            className="text-amber-700 hover:opacity-70 text-[10px] font-semibold transition underline underline-offset-2 cursor-pointer"
                        >
                            edit items
                        </button>
                    </div>

                    {/* Vé ghế */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <Armchair className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="pay-text-primary font-semibold text-xs leading-none">2x VIP Prime Recliner</p>
                                <p className="text-[9px] pay-text-secondary pay-font-secondary mt-0.5">Row F • Seats F12, F13 (Sweet Spot)</p>
                            </div>
                        </div>
                        <span className="pay-text-primary font-bold font-mono text-xs whitespace-nowrap">280,000 ₫</span>
                    </div>

                    {/* Bắp rang */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <Popcorn className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="pay-text-primary font-semibold text-xs leading-none">1x Mega Caramel Popcorn</p>
                                <p className="text-[9px] pay-text-secondary pay-font-secondary mt-0.5">Large Tub (Warm Butter Infused)</p>
                            </div>
                        </div>
                        <span className="pay-text-primary font-bold font-mono text-xs whitespace-nowrap">85,000 ₫</span>
                    </div>

                    {/* Nước uống */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                                <CupSoda className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="pay-text-primary font-semibold text-xs leading-none">2x Coca-Cola Zero Sugar</p>
                                <p className="text-[9px] pay-text-secondary pay-font-secondary mt-0.5">Medium 22oz (Chilled)</p>
                            </div>
                        </div>
                        <span className="pay-text-primary font-bold font-mono text-xs whitespace-nowrap">50,000 ₫</span>
                    </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-1 pt-2.5 border-t border-gray-300 text-[11px] pay-text-secondary pay-font-secondary">
                    <div className="flex justify-between">
                        <span>Tickets Subtotal</span>
                        <span className="pay-text-primary font-mono">280,000 ₫</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Concessions Combo</span>
                        <span className="pay-text-primary font-mono">135,000 ₫</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                        <span>CinePass Voucher (CINEVIP10)</span>
                        <span className="font-mono">-25,000 ₫</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>VAT Included (8%)</span>
                        <span className="font-mono">31,200 ₫</span>
                    </div>
                </div>

                {/* Total Price */}
                <div className="pt-2.5 border-t border-gray-300">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <p className="pay-text-primary font-bold text-xs">Total Amount Due</p>
                            <p className="text-[9px] pay-text-secondary pay-font-secondary">All entertainment taxes included</p>
                        </div>
                        <span className="text-amber-600 font-black text-xl font-mono tracking-tight">
                            390,000 ₫
                        </span>
                    </div>

                    <div className="mt-1 text-[10px] text-amber-700 flex items-center gap-1.5">
                        <span className="text-amber-600">★</span>
                        <span>You will earn <strong>+39 CinePoints</strong> upon screening admission.</span>
                    </div>
                </div>

                {/* Nút Proceed to Payment */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/processing')}
                        className="w-full bg-[#e50914] hover:bg-[#c90711] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/30 cursor-pointer"
                    >
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PROCEED TO PAYMENT (390,000 ₫) →</span>
                    </button>
                </div>

                {/* Cam kết & Hỗ trợ */}
                <div className="space-y-1 text-[9px] pay-text-secondary pay-font-secondary pt-2.5 border-t border-gray-300 leading-relaxed">
                    <p className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✦</span> Instant digital pass & QR check-in sent to phone and email.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 pay-text-secondary flex-shrink-0" /> 100% full refund policy if session is cancelled or rescheduled.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 pay-text-secondary flex-shrink-0" /> Vietnam Support Hotline 24/7: <strong className="pay-text-primary">1900 8888</strong>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default OrderSummary;