import React from 'react';
import { Clock, MapPin, Popcorn, Download, Smartphone } from 'lucide-react';
import dunePoster from '../../assets/dune.png';

export const MainTicketCard: React.FC = () => {
    return (
        <div className="pay-card pay-font-primary border border-gray-300 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
            {/* Cột trái: Thông tin vé & suất chiếu */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-6 lg:border-r border-gray-300">
                <div className="flex gap-5 items-start">
                    <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-lg border border-gray-300 relative">
                        <img
                            src={dunePoster}
                            alt="Dune: Part Two"
                            className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            C18
                        </span>
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                            <span className="bg-gray-200 text-amber-700 px-2 py-0.5 rounded border border-gray-300">IMAX LASER 2D</span>
                            <span className="bg-gray-200 pay-text-primary px-2 py-0.5 rounded border border-gray-300">Dolby Atmos</span>
                            <span className="pay-text-secondary">166 mins</span>
                            <span className="pay-text-secondary">• English w/ Vietnamese Subtitles</span>
                        </div>

                        <h2 className="text-2xl font-black pay-text-primary tracking-tight">Dune: Part Two</h2>
                        <p className="text-xs pay-text-secondary font-medium">Hành Tinh Cát - Phần 2</p>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 text-xs font-semibold border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Showtime starts in: <strong>3 hours 45 mins</strong></span>
                        </div>

                        <p className="text-xs pay-text-primary flex items-center gap-1.5 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span>CineVerse Landmark 81 • Hall 01, Floor B1, 720A Dien Bien Phu, Ward 22, Binh Thanh</span>
                        </p>
                    </div>
                </div>

                {/* Thông tin suất chiếu, phòng & ghế */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Showtime</span>
                        <span className="text-xl font-black pay-text-primary font-mono block mt-1">20:15</span>
                        <span className="text-xs pay-text-primary mt-0.5 block">Thursday, Oct 24, 2024</span>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Screen & Hall</span>
                        <span className="text-xl font-black pay-text-primary block mt-1">Hall 01</span>
                        <span className="text-xs text-amber-700 font-medium mt-0.5 block">IMAX Giant Screen</span>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Assigned Seats</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-[#f59e0b] text-black font-black font-mono text-sm px-2.5 py-0.5 rounded-md">F12</span>
                            <span className="bg-[#f59e0b] text-black font-black font-mono text-sm px-2.5 py-0.5 rounded-md">F13</span>
                        </div>
                        <span className="text-xs pay-text-primary mt-1 block">VIP Prime Couple Recliner</span>
                    </div>
                </div>

                {/* F&B & Tổng tiền */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white border border-gray-300 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-300">
                            <div className="flex items-center gap-2 text-xs font-bold pay-text-primary">
                                <Popcorn className="w-4 h-4 text-amber-700" />
                                <span>Concessions (F&B)</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                                Ready for Pickup
                            </span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between pay-text-primary">
                                <span>1x Mega Caramel Popcorn</span>
                                <span className="font-mono">55,000 ₫</span>
                            </div>
                            <div className="flex justify-between pay-text-primary">
                                <span>2x Coca-Cola Zero Sugar (L)</span>
                                <span className="font-mono">40,000 ₫</span>
                            </div>
                        </div>
                        <p className="text-[10px] pay-text-secondary pt-1 border-t border-gray-300">
                            Pickup Barcode: <strong>FB-88492</strong> (Present at Concession Counter)
                        </p>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-300 text-xs font-bold pay-text-primary">
                            <span>Customer & Payment</span>
                            <span className="font-mono text-amber-700 text-xs">Alex Nguyen</span>
                        </div>
                        <div className="space-y-1.5 text-xs pay-text-primary">
                            <div className="flex justify-between">
                                <span>Movie Tickets (2x VIP):</span>
                                <span className="font-mono pay-text-primary">295,000 ₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>F&B Combo:</span>
                                <span className="font-mono pay-text-primary">95,000 ₫</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold pay-text-primary">
                                <span>Total Paid:</span>
                                <span className="font-mono text-[#f59e0b] text-base">390,000 ₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cột phải: Boarding pass & Mã QR vé chuẩn (Đã xóa Ticket Lookup) */}
            <div className="lg:col-span-4 pay-card p-6 sm:p-8 flex flex-col justify-between items-center text-center space-y-6">
                <div className="w-full space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold pay-text-secondary">
                        <span className="uppercase tracking-widest">BOARDING PASS</span>
                        <span className="pay-text-primary">Gate 01</span>
                    </div>

                    {/* QR vé vào rạp thuần túy */}
                    <div className="p-4 bg-white rounded-3xl shadow-2xl mx-auto my-3 w-52 h-52 flex items-center justify-center">
                        <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="4" y="4" width="28" height="28" rx="4" />
                            <rect x="8" y="8" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="12" y="12" width="12" height="12" rx="1" />

                            <rect x="68" y="4" width="28" height="28" rx="4" />
                            <rect x="72" y="8" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="76" y="12" width="12" height="12" rx="1" />

                            <rect x="4" y="68" width="28" height="28" rx="4" />
                            <rect x="8" y="72" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="12" y="76" width="12" height="12" rx="1" />

                            <rect x="36" y="8" width="8" height="8" />
                            <rect x="48" y="8" width="8" height="8" />
                            <rect x="40" y="20" width="8" height="8" />
                            <rect x="52" y="24" width="8" height="8" />
                            <rect x="12" y="40" width="8" height="8" />
                            <rect x="24" y="44" width="8" height="8" />
                            <rect x="40" y="36" width="8" height="8" />
                            <rect x="52" y="44" width="8" height="8" />
                            <rect x="68" y="40" width="8" height="8" />
                            <rect x="80" y="44" width="8" height="8" />
                            <rect x="36" y="56" width="8" height="8" />
                            <rect x="48" y="64" width="8" height="8" />
                            <rect x="68" y="68" width="8" height="8" />
                            <rect x="80" y="76" width="8" height="8" />
                            <rect x="40" y="76" width="8" height="8" />
                            <rect x="52" y="84" width="8" height="8" />
                            <rect x="68" y="84" width="8" height="8" />
                        </svg>
                    </div>

                    <div className="space-y-1">
                        <div className="h-9 w-44 mx-auto flex items-center justify-between px-1">
                            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 3, 1].map((w, idx) => (
                                <span
                                    key={idx}
                                    className="bg-[var(--color-payment-primary)] h-full rounded-sm"
                                    style={{ width: `${w * 1.5}px` }}
                                />
                            ))}
                        </div>
                        <p className="font-mono text-xs tracking-widest pay-text-secondary">2249 3414 4231</p>
                        <p className="text-[10px] pay-text-secondary">Scan this QR directly at Hall Gate</p>
                    </div>
                </div>

                {/* Chỉ giữ Download PDF Ticket & Save to Wallet */}
                <div className="w-full space-y-2 pt-2 border-t border-gray-300">
                    <button
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold pay-text-primary transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-amber-700" />
                        <span>Download PDF Ticket</span>
                    </button>

                    <button
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold pay-text-primary transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Smartphone className="w-4 h-4 text-emerald-700" />
                        <span>Save to Apple / Google Wallet</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainTicketCard;