import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Armchair, Popcorn, CupSoda, Lock, ShieldAlert, PhoneCall } from 'lucide-react';

export const OrderSummary: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[420px] mx-auto space-y-3 font-sans text-gray-200">
            {/* 1. SEAT HOLD TIMER (Thanh cam có ô thời gian bo góc chuẩn mẫu) */}
            <div className="bg-[#f59e0b] text-black px-3.5 py-1.5 rounded-lg font-bold flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    <span>SEAT HOLD TIMER</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs bg-black/15 px-2.5 py-0.5 rounded-md font-black">
                    <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>09:45</span>
                </div>
            </div>

            {/* 2. ORDER SUMMARY CARD */}
            <div className="bg-[#10141d] border border-gray-800 rounded-xl p-4 shadow-xl space-y-3.5">

                {/* Poster & Movie Meta */}
                <div className="flex gap-3 items-start">
                    <div className="w-[64px] h-[86px] rounded-md overflow-hidden bg-gray-900 flex-shrink-0 relative border border-gray-700 shadow-md">
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
                            <span className="bg-gray-800 text-gray-300 px-1 py-0.5 rounded border border-gray-700/60">IMAX Laser 2D</span>
                            <span className="bg-[#e50914] text-white px-1 py-0.5 rounded">C18</span>
                            <span className="text-gray-400 font-normal">166 mins</span>
                        </div>
                        <h3 className="text-white font-bold text-sm truncate leading-tight">Dune: Part Two</h3>
                        <p className="text-gray-400 text-[10px] truncate mb-1.5">Hành Tinh Cát - Phần Hai</p>

                        <p className="text-[10px] text-gray-300 font-medium">📅 Today, Oct 24 • 20:15 - 23:01</p>
                        <p className="text-[10px] text-gray-400">📍 CGV Landmark 81 • Hall IMAX 01</p>
                    </div>
                </div>

                {/* Selected Seats & Add-ons */}
                <div className="space-y-2 pt-2.5 border-t border-gray-800/80 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>SELECTED SEATS & ADD-ONS</span>
                        <button className="text-amber-500 hover:text-amber-400 text-[10px] font-semibold transition underline underline-offset-2 cursor-pointer">
                            edit items
                        </button>
                    </div>

                    {/* Vé ghế */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                                <Armchair className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-xs leading-none">2x VIP Prime Recliner</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">Row F • Seats F12, F13 (Sweet Spot)</p>
                            </div>
                        </div>
                        <span className="text-white font-bold font-mono text-xs whitespace-nowrap">280,000 ₫</span>
                    </div>

                    {/* Bắp rang */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                                <Popcorn className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-xs leading-none">1x Mega Caramel Popcorn</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">Large Tub (Warm Butter Infused)</p>
                            </div>
                        </div>
                        <span className="text-white font-bold font-mono text-xs whitespace-nowrap">85,000 ₫</span>
                    </div>

                    {/* Nước uống */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                                <CupSoda className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-xs leading-none">2x Coca-Cola Zero Sugar</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">Medium 22oz (Chilled)</p>
                            </div>
                        </div>
                        <span className="text-white font-bold font-mono text-xs whitespace-nowrap">50,000 ₫</span>
                    </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-1 pt-2.5 border-t border-gray-800/80 text-[11px] text-gray-400">
                    <div className="flex justify-between">
                        <span>Tickets Subtotal</span>
                        <span className="text-gray-200 font-mono">280,000 ₫</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Concessions Combo</span>
                        <span className="text-gray-200 font-mono">135,000 ₫</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-medium">
                        <span>CinePass Voucher (CINEVIP10)</span>
                        <span className="font-mono">-25,000 ₫</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                        <span>VAT Included (8%)</span>
                        <span className="font-mono">31,200 ₫</span>
                    </div>
                </div>

                {/* Total Price */}
                <div className="pt-2.5 border-t border-gray-800/80">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <p className="text-white font-bold text-xs">Total Amount Due</p>
                            <p className="text-[9px] text-gray-500">All entertainment taxes included</p>
                        </div>
                        <span className="text-[#f59e0b] font-black text-xl font-mono tracking-tight">
                            390,000 ₫
                        </span>
                    </div>

                    <div className="mt-1 text-[10px] text-amber-400 flex items-center gap-1.5">
                        <span className="text-amber-500">★</span>
                        <span>You will earn <strong>+39 CinePoints</strong> upon screening admission.</span>
                    </div>
                </div>

                {/* Nút Proceed to Payment đỏ rực rỡ có icon khóa và mũi tên chuẩn mẫu */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/processing')}
                        className="w-full bg-[#e50914] hover:bg-[#c90711] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/50 cursor-pointer"
                    >
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>PROCEED TO PAYMENT (390,000 ₫) →</span>
                    </button>
                </div>

                {/* Cam kết & Hỗ trợ */}
                <div className="space-y-1 text-[9px] text-gray-500 pt-2.5 border-t border-gray-800/60 leading-relaxed">
                    <p className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✦</span> Instant digital pass & QR check-in sent to phone and email.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 text-gray-400 flex-shrink-0" /> 100% full refund policy if session is cancelled or rescheduled.
                    </p>
                    <p className="flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 text-gray-400 flex-shrink-0" /> Vietnam Support Hotline 24/7: <strong className="text-gray-300">1900 8888</strong>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default OrderSummary;