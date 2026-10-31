import React from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

export default function TicketCard() {
    const copyBookingRef = () => {
        navigator.clipboard.writeText('CV-2024-88492X');
        alert('Đã sao chép mã vé: CV-2024-88492X');
    };

    return (
        <div className="w-full max-w-[860px] mx-auto text-gray-800 font-sans">
            {/* 1. Header chúc mừng và mã vé */}
            <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-black">
                        ✓
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Booking Successful! Your ticket is confirmed
                </h1>

                <p className="text-xs text-gray-400">
                    A copy of your e-ticket and official VAT invoice has been dispatched to{' '}
                    <strong className="text-gray-200">alex.nguyen@example.com</strong> and via Zalo/SMS to{' '}
                    <strong className="text-gray-200">+84 0912 345 678</strong>.
                </p>

                {/* Mã tham chiếu đặt vé */}
                <div className="inline-flex items-center gap-2 bg-[#141a26] border border-gray-800 px-3 py-1 rounded-lg text-xs mt-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">BOOKING REFERENCE:</span>
                    <span className="font-mono font-black text-amber-400 text-sm tracking-wide">CV-2024-88492X</span>
                    <button
                        onClick={copyBookingRef}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition cursor-pointer ml-1 bg-gray-800/80 px-1.5 py-0.5 rounded"
                    >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                    </button>
                </div>
            </div>

            {/* 2. Chiếc vé E-Ticket màu trắng (Có vết cắt tròn xé vé ở 2 cạnh) */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Vết khuyết cắt vé phía trên */}
                <div className="absolute top-0 right-[32%] w-6 h-3 bg-[#070B12] rounded-b-full -translate-y-[1px] hidden md:block z-10 border-b border-gray-300" />
                {/* Vết khuyết cắt vé phía dưới */}
                <div className="absolute bottom-0 right-[32%] w-6 h-3 bg-[#070B12] rounded-t-full translate-y-[1px] hidden md:block z-10 border-t border-gray-300" />

                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">

                    {/* NỬA TRÁI: THÔNG TIN CHI TIẾT VÉ (Chiếm 8 phần) */}
                    <div className="md:col-span-8 p-6 md:p-8 space-y-5 border-b md:border-b-0 md:border-r border-dashed border-gray-300">
                        {/* Top tags */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
                            <div className="flex items-center gap-1.5">
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black">C18 - ADULTS ONLY</span>
                                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">IMAX Laser 2D</span>
                                <span className="text-gray-500 font-medium">166 Mins • Dolby Atmos 12.1</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-600">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-amber-500 text-white" />
                                <span className="uppercase tracking-wider">HALL TICKET CONFIRMED</span>
                            </div>
                        </div>

                        {/* Poster & Tên phim */}
                        <div className="flex gap-4 items-start">
                            <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative border border-gray-300 shadow-md">
                                <img
                                    src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300"
                                    alt="Dune: Part Two"
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded leading-tight">
                                    IMAX
                                </span>
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[7px] px-1 rounded leading-tight font-mono">
                                    Laser 01
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                    SCI-FI / EPIC SAGA • ENGLISH WITH VIETNAMESE SUBTITLES
                                </span>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Dune: Part Two</h2>
                                <p className="text-xs text-gray-500 font-medium mb-2">Hành Tinh Cát - Phần Hai</p>

                                <div className="text-[11px] text-gray-600 flex items-start gap-1">
                                    <span className="text-red-500 mt-0.5">📍</span>
                                    <div>
                                        <strong className="text-gray-800">CGV Landmark 81 • Hall IMAX Laser 01</strong>
                                        <p className="text-[10px] text-gray-400">Floor B1, Landmark 81 Tower, Binh Thanh District, HCMC</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meta 4 cột: Ngày - Giờ - Ghế - Hạng ghế */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-xs">
                            <div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase block">SHOW DATE</span>
                                <span className="text-gray-800 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                                    📅 Thu, Oct 24, 2024
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase block">SHOWTIME</span>
                                <span className="text-[#e50914] font-bold font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                    🕒 20:15 - 23:01
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase block">SEAT NUMBERS</span>
                                <span className="text-gray-900 font-bold text-[11px] mt-0.5 block">
                                    F12, F13 (Prime)
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] text-gray-400 font-bold uppercase block">SEAT TYPE</span>
                                <span className="text-gray-700 font-medium text-[11px] mt-0.5 block">
                                    💺 2x VIP Recliner
                                </span>
                            </div>
                        </div>

                        {/* Combo & Người đặt */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                            <div className="bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg">
                                <span className="text-[9px] font-bold text-amber-800 uppercase block mb-0.5">
                                    🍿 CONCESSIONS BUNDLE
                                </span>
                                <p className="text-gray-800 font-semibold text-[11px]">
                                    1x Mega Caramel Popcorn, 2x Coca-Cola Zero
                                </p>
                                <p className="text-[9px] text-gray-500 mt-0.5">Collect at Counter 03 via Stub QR</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg">
                                <span className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">
                                    👤 ATTENDEE & TRANSACTION
                                </span>
                                <p className="text-gray-800 font-semibold text-[11px]">
                                    Alex Nguyen • <span className="text-amber-600 font-bold">CineClub Gold Tier</span>
                                </p>
                                <p className="text-[9px] text-gray-500 mt-0.5">
                                    Total Paid: <strong className="text-gray-800">390,000 ₫</strong> via VNPay QR (VNP-994287)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* NỬA PHẢI: MÃ QR SOÁT VÉ & BARCODE (Chiếm 4 phần) */}
                    <div className="md:col-span-4 p-6 flex flex-col items-center justify-between bg-white text-center">
                        <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-gray-100">
                            <span className="text-red-600 font-black tracking-wider flex items-center gap-1 text-sm">
                                <span className="text-red-500">|||</span> CinePass
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 font-bold">GATE 01</span>
                        </div>

                        {/* Khung mã QR quét cửa */}
                        <div className="my-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative">
                            <div className="w-36 h-36 relative flex items-center justify-center">
                                {/* SVG mã QR */}
                                <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                                    <rect x="5" y="5" width="26" height="26" rx="4" fill="#000" />
                                    <rect x="9" y="9" width="18" height="18" rx="2" fill="#fff" />
                                    <rect x="13" y="13" width="10" height="10" rx="1" fill="#000" />

                                    <rect x="69" y="5" width="26" height="26" rx="4" fill="#000" />
                                    <rect x="73" y="9" width="18" height="18" rx="2" fill="#fff" />
                                    <rect x="77" y="13" width="10" height="10" rx="1" fill="#000" />

                                    <rect x="5" y="69" width="26" height="26" rx="4" fill="#000" />
                                    <rect x="9" y="73" width="18" height="18" rx="2" fill="#fff" />
                                    <rect x="13" y="77" width="10" height="10" rx="1" fill="#000" />

                                    <rect x="38" y="10" width="6" height="6" fill="#000" />
                                    <rect x="48" y="14" width="6" height="6" fill="#000" />
                                    <rect x="40" y="26" width="6" height="6" fill="#000" />
                                    <rect x="52" y="28" width="6" height="6" fill="#000" />
                                    <rect x="12" y="44" width="6" height="6" fill="#000" />
                                    <rect x="24" y="50" width="6" height="6" fill="#000" />
                                    <rect x="40" y="62" width="6" height="6" fill="#000" />
                                    <rect x="52" y="68" width="6" height="6" fill="#000" />
                                    <rect x="70" y="44" width="6" height="6" fill="#000" />
                                    <rect x="84" y="48" width="6" height="6" fill="#000" />
                                    <rect x="70" y="68" width="8" height="8" fill="#000" />
                                    <rect x="82" y="78" width="6" height="6" fill="#000" />
                                </svg>

                                {/* Logo SENEMA mini ở trung tâm QR */}
                                <div className="absolute w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center text-[9px] font-black text-black shadow-md border border-white">
                                    SE
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500 leading-tight px-2">
                            Scan for direct entry at Hall Gate 01 or Kiosk.
                            <span className="block text-[9px] text-gray-400 mt-0.5">Please arrive 15 mins early.</span>
                        </p>

                        {/* Mã vạch Barcode */}
                        <div className="w-full mt-3 pt-3 border-t border-gray-100 flex flex-col items-center">
                            <div className="flex items-center gap-[2px] h-8">
                                {[2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4].map((w, i) => (
                                    <span
                                        key={i}
                                        className="bg-black inline-block h-full"
                                        style={{ width: `${w}px` }}
                                    />
                                ))}
                            </div>
                            <span className="font-mono text-[9px] text-gray-500 tracking-widest mt-1">
                                6919-2814-43201
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}