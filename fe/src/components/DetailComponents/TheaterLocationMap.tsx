import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface TheaterLocationMapProps {
    cinemaName?: string;
    address?: string;
}

export const TheaterLocationMap: React.FC<TheaterLocationMapProps> = ({ cinemaName, address }) => {
    const name = cinemaName || 'CineVerse Landmark 81';
    const locationAddress = address || 'Vincom Center Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh';

    // Tạo URL nhúng Iframe Google Maps theo địa điểm thực
    const embedMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(name + ' ' + locationAddress)}&output=embed`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + locationAddress)}`;

    return (
        <div className="pay-card pay-font-primary border border-gray-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold pay-text-primary">Vị Trí Rạp Chiếu Phim</h3>
                            <span className="text-[10px] bg-gray-200 pay-text-primary px-2 py-0.5 rounded border border-gray-300 font-semibold">
                                Google Maps Live
                            </span>
                        </div>
                        <p className="text-sm font-semibold pay-text-primary mt-0.5">
                            {name}
                        </p>
                        <p className="text-xs pay-text-secondary pay-font-secondary mt-0.5">
                            {locationAddress}
                        </p>
                    </div>
                </div>

                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-amber-700 transition flex items-center gap-2 flex-shrink-0 cursor-pointer shadow-sm"
                >
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mở app chỉ đường</span>
                    <ExternalLink className="w-3.5 h-3.5 pay-text-secondary" />
                </a>
            </div>

            {/* Khối Iframe Google Maps tương tác thực tế */}
            <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-gray-300 shadow-inner bg-gray-100">
                <iframe
                    title="Google Map Cinema Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={embedMapUrl}
                />
            </div>
        </div>
    );
};

export default TheaterLocationMap;