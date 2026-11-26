import React from 'react';
import { Clock, MapPin, Download } from 'lucide-react';

export interface MainTicketCardProps {
    data?: {
        TicketNo?: string | number;
        BookingID?: number;
        BookingCode?: string;
        SeatLabel?: string;
        SeatType?: string;
        Price?: number;
        Barcode?: string;
        Gate?: string;
        status?: string;
        Date?: string;
        Time?: string;
        customer_name?: string;
        movieTitle?: string;
        posterUrl?: string;
        RoomNumber?: string;
        CinemaName?: string;
    } | null;
}

export const MainTicketCard: React.FC<MainTicketCardProps> = ({ data }) => {
    const movieTitle = data?.movieTitle || 'Dune: Part Two';
    // Dùng ảnh poster từ API hoặc dùng link ảnh online dự phòng, không xài import file local
    const poster = data?.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';
    const cinemaName = data?.CinemaName || 'CineVerse Cinema';
    const hallName = data?.RoomNumber ? `Hall ${data.RoomNumber}` : 'Hall 01';
    const seatLabel = data?.SeatLabel || 'F12';
    const seatType = data?.SeatType || 'VIP Prime Couple Recliner';
    const timeStr = data?.Time || '20:15';
    const dateStr = data?.Date ? new Date(data.Date).toLocaleDateString('vi-VN') : 'Thursday, Oct 24, 2024';
    const priceStr = data?.Price ? `${data.Price.toLocaleString('vi-VN')} ₫` : '390,000 ₫';
    const barcodeNo = data?.Barcode || data?.TicketNo || '2249 3414 4231';
    const customer = data?.customer_name || 'Alex Nguyen';

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(String(barcodeNo))}`;

    return (
        <div className="pay-card pay-font-primary border border-gray-300 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
            {/* Cột trái: Thông tin vé & suất chiếu */}
            <div className="lg:col-span-8 p-6 sm:p-8 space-y-6 lg:border-r border-gray-300">
                <div className="flex gap-5 items-start">
                    <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 shadow-lg border border-gray-300 relative">
                        <img
                            src={poster}
                            alt={movieTitle}
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
                        </div>

                        <h2 className="text-2xl font-black pay-text-primary tracking-tight">{movieTitle}</h2>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 text-xs font-semibold border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Trạng thái vé: <strong>{data?.status || 'VALID'}</strong></span>
                        </div>

                        <p className="text-xs pay-text-primary flex items-center gap-1.5 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span>{cinemaName} • {hallName}</span>
                        </p>
                    </div>
                </div>

                {/* Suất chiếu & Ghế */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Showtime</span>
                        <span className="text-xl font-black pay-text-primary font-mono block mt-1">{timeStr}</span>
                        <span className="text-xs pay-text-primary mt-0.5 block">{dateStr}</span>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Screen & Hall</span>
                        <span className="text-xl font-black pay-text-primary block mt-1">{hallName}</span>
                        <span className="text-xs text-amber-700 font-medium mt-0.5 block">IMAX Giant Screen</span>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4">
                        <span className="text-[10px] uppercase font-bold pay-text-secondary tracking-wider block">Assigned Seats</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-[#f59e0b] text-black font-black font-mono text-sm px-2.5 py-0.5 rounded-md">{seatLabel}</span>
                        </div>
                        <span className="text-xs pay-text-primary mt-1 block">{seatType}</span>
                    </div>
                </div>

                {/* Khách hàng & Thanh toán */}
                <div className="bg-white border border-gray-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-300 text-xs font-bold pay-text-primary">
                        <span>Customer & Payment Info</span>
                        <span className="font-mono text-amber-700 text-xs">{customer}</span>
                    </div>
                    <div className="space-y-1.5 text-xs pay-text-primary">
                        <div className="flex justify-between">
                            <span>Mã đơn hàng:</span>
                            <span className="font-mono pay-text-primary">#{data?.BookingCode || data?.BookingID || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold pay-text-primary">
                            <span>Giá vé đã thanh toán:</span>
                            <span className="font-mono text-[#f59e0b] text-base">{priceStr}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cột phải: Mã QR vé */}
            <div className="lg:col-span-4 pay-card p-6 sm:p-8 flex flex-col justify-between items-center text-center space-y-6">
                <div className="w-full space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold pay-text-secondary">
                        <span className="uppercase tracking-widest">BOARDING PASS</span>
                        <span className="pay-text-primary">{data?.Gate || 'Gate 01'}</span>
                    </div>

                    <div className="p-4 bg-white rounded-3xl shadow-2xl mx-auto my-3 w-52 h-52 flex items-center justify-center border border-gray-200">
                        <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                    </div>

                    <div className="space-y-1">
                        <p className="font-mono text-xs tracking-widest pay-text-secondary">{barcodeNo}</p>
                        <p className="text-[10px] pay-text-secondary">Scan this QR directly at Hall Gate</p>
                    </div>
                </div>

                <div className="w-full space-y-2 pt-2 border-t border-gray-300">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold pay-text-primary transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-amber-700" />
                        <span>Download PDF Ticket</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainTicketCard;