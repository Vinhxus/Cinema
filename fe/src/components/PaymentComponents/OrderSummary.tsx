import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Armchair, Popcorn, Lock, ShieldAlert, PhoneCall } from 'lucide-react';
import { useBooking } from '../../context/useBooking';
import type { SeatType } from '../seatComponents/Seat';
import { useCountdown } from '../../hooks/useCountdown';
import { vnd } from '../../utils/currency';
import dune from '../../assets/dune.png';
import { createSepayPayment, redirectToCheckout } from '../../api/payments';
import { getClientId } from '../../utils/clientId';

const SEAT_LABEL: Record<SeatType, string> = {
    standard: 'Standard Seat',
    vip: 'VIP Prime Recliner',
    couple: 'Couple Sweetbox',
};

export const OrderSummary: React.FC = () => {
    const navigate = useNavigate();
    const { movie, showtime, selectedSeats, foodItems, customer, voucher, totals, holdExpiresAt, clockOffset } = useBooking();

    // 1. Đếm ngược tới hạn giữ ghế do SERVER đặt (FR-BK-10/11), không tự đếm lại 10 phút
    const secondsLeft = useCountdown(holdExpiresAt, clockOffset) ?? 0;

    useEffect(() => {
        // Hết thời gian giữ ghế tự động chuyển sang trang Failure
        if (holdExpiresAt != null && secondsLeft <= 0) navigate('/failure');
    }, [holdExpiresAt, secondsLeft, navigate]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Cảnh báo khi còn dưới 2 phút
    const isUrgent = secondsLeft < 120;

    // Gom ghế theo loại: [{ type: 'vip', labels: ['C08','C09'] }, ...]
    const seatGroups = useMemo(() => {
        const map = new Map<SeatType, { labels: string[]; total: number }>();
        selectedSeats.forEach((s) => {
            const g = map.get(s.type) ?? { labels: [], total: 0 };
            map.set(s.type, { labels: [...g.labels, s.label], total: g.total + s.price });
        });
        return Array.from(map, ([type, g]) => ({ type, ...g }));
    }, [selectedSeats]);

    // Gọi backend tạo đơn SePay rồi chuyển sang trang thanh toán của SePay
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState<string | null>(null);

    const handlePay = async () => {
        if (!showtime) return;
        setPaying(true);
        setPayError(null);
        try {
            const result = await createSepayPayment({
                clientId: getClientId(),
                showtimeId: showtime.showtimeId,
                customer: { name: customer.fullName.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
                voucher, // chỉ gửi TÊN mã, server tự tính số tiền giảm
            });
            redirectToCheckout(result); // rời khỏi trang -> không cần setPaying(false)
        } catch (e) {
            setPayError(e instanceof Error ? e.message : 'Could not create the payment');
            setPaying(false);
        }
    };

    // Chỉ cho bấm thanh toán khi form đã điền đủ
    const canPay =
        customer.fullName.trim() !== '' &&
        customer.phone.trim() !== '' &&
        /^\S+@\S+\.\S+$/.test(customer.email);

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

                {/* Poster & Movie Meta (fallback về Dune nếu chưa chọn phim) */}
                <div className="flex gap-3 items-start">
                    <div className="w-[64px] h-[86px] rounded-md overflow-hidden bg-gray-200 flex-shrink-0 relative border border-gray-300 shadow-md">
                        <img
                            src={movie?.poster ?? dune}
                            alt={movie?.title ?? 'Dune: Part Two'}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[9px] font-bold">
                            <span className="bg-gray-200 pay-text-primary px-1 py-0.5 rounded border border-gray-300">
                                {movie?.formats ?? 'IMAX Laser 2D'}
                            </span>
                            <span className="bg-[#e50914] text-white px-1 py-0.5 rounded">{movie?.age ?? 'C18'}</span>
                        </div>
                        <h3 className="pay-text-primary font-bold text-sm truncate leading-tight">
                            {movie?.title ?? 'Dune: Part Two'}
                        </h3>
                        <p className="pay-text-secondary pay-font-secondary text-[10px] truncate mb-1.5">
                            {movie?.subtitle ?? 'Dune: Part Two'}
                        </p>

                        <p className="text-[10px] pay-text-primary font-medium">
                            📅 {showtime ? `${showtime.date} • ${showtime.time}` : 'Today, Oct 24 • 20:15'}
                        </p>
                        <p className="text-[10px] pay-text-secondary pay-font-secondary">
                            📍 {showtime ? `${showtime.cinemaName} • ${showtime.hallName}` : 'CGV Landmark 81 • Hall IMAX 01'}
                        </p>
                    </div>
                </div>

                {/* Selected Seats & Add-ons */}
                <div className="space-y-2 pt-2.5 border-t border-gray-300 text-xs">
                    <div className="flex items-center justify-between text-[10px] pay-text-secondary font-bold uppercase tracking-wider">
                        <span>SELECTED SEATS & ADD-ONS</span>
                        <button
                            type="button"
                            onClick={() => navigate('/food')}
                            className="text-amber-700 hover:opacity-70 text-[10px] font-semibold transition underline underline-offset-2 cursor-pointer"
                        >
                            edit items
                        </button>
                    </div>

                    {/* Vé ghế — mỗi loại ghế một dòng */}
                    {seatGroups.map((g) => (
                        <div key={g.type} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
                                    <Armchair className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="pay-text-primary font-semibold text-xs leading-none">
                                        {g.labels.length}x {SEAT_LABEL[g.type]}
                                    </p>
                                    <p className="text-[9px] pay-text-secondary pay-font-secondary mt-0.5">
                                        Seats {g.labels.join(', ')}
                                    </p>
                                </div>
                            </div>
                            <span className="pay-text-primary font-bold font-mono text-xs whitespace-nowrap">
                                {vnd(g.total)}
                            </span>
                        </div>
                    ))}

                    {/* Bắp nước — lấy từ giỏ đã chọn ở FoodPage */}
                    {foodItems.map(({ combo, qty }) => (
                        <div key={combo.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
                                    <Popcorn className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="pay-text-primary font-semibold text-xs leading-none">
                                        {qty}x {combo.name}
                                    </p>
                                    <p className="text-[9px] pay-text-secondary pay-font-secondary mt-0.5">{combo.summary}</p>
                                </div>
                            </div>
                            <span className="pay-text-primary font-bold font-mono text-xs whitespace-nowrap">
                                {vnd(combo.price * qty)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-1 pt-2.5 border-t border-gray-300 text-[11px] pay-text-secondary pay-font-secondary">
                    <div className="flex justify-between">
                        <span>Tickets Subtotal</span>
                        <span className="pay-text-primary font-mono">{vnd(totals.seats)}</span>
                    </div>
                    {totals.fb > 0 && (
                        <>
                            <div className="flex justify-between">
                                <span>Concessions Combo</span>
                                <span className="pay-text-primary font-mono">{vnd(totals.fb)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-medium">
                                <span>CineClub VIP Discount (-10% F&B)</span>
                                <span className="font-mono">-{vnd(totals.vipDiscount)}</span>
                            </div>
                        </>
                    )}
                    {voucher && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                            <span>CinePass Voucher ({voucher})</span>
                            <span className="font-mono">-{vnd(totals.voucherDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[10px]">
                        <span>VAT Included (8%)</span>
                        <span className="font-mono">{vnd(totals.vat)}</span>
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
                            {vnd(totals.total)}
                        </span>
                    </div>

                    <div className="mt-1 text-[10px] text-amber-700 flex items-center gap-1.5">
                        <span className="text-amber-600">★</span>
                        <span>You will earn <strong>+{totals.points} CinePoints</strong> upon screening admission.</span>
                    </div>
                </div>

                {/* Nút Proceed to Payment */}
                <div className="pt-2">
                    <button
                        type="button"
                        disabled={!canPay || paying}
                        onClick={handlePay}
                        className="w-full bg-[#e50914] hover:bg-[#c90711] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/30 cursor-pointer disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{paying ? 'REDIRECTING TO SEPAY…' : `PROCEED TO PAYMENT (${vnd(totals.total)}) →`}</span>
                    </button>
                    {payError && (
                        <p className="mt-1.5 text-center text-[10px] text-rose-600">{payError}</p>
                    )}
                    {totals.fb > 0 && (
                        <p className="mt-1.5 text-center text-[10px] text-amber-700">
                            Note: the payment gateway currently charges tickets only (after voucher). Food &amp; drinks are not sent to the server yet.
                        </p>
                    )}
                    {!canPay && (
                        <p className="mt-1.5 text-center text-[10px] text-rose-600">
                            Please enter your full name, phone number and a valid email.
                        </p>
                    )}
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
