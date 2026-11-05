import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

export const TheaterLocationMap: React.FC = () => {
    const googleMapsUrl = "https://maps.google.com/?q=Vincom+Center+Landmark+81+Ho+Chi+Minh";

    return (
        <div className="pay-card pay-font-primary border border-gray-300 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold pay-text-primary">Theater Location</h3>
                        <span className="text-[10px] bg-gray-200 pay-text-primary px-2 py-0.5 rounded border border-gray-300 font-semibold">
                            Hall IMAX 01
                        </span>
                    </div>
                    <p className="text-sm font-semibold pay-text-primary mt-0.5">
                        CineVerse Landmark 81
                    </p>
                    <p className="text-xs pay-text-secondary pay-font-secondary mt-0.5">
                        Floor B1, Vincom Center Landmark 81, 720A Dien Bien Phu, Ward 22, Binh Thanh District, HCMC
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
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5 pay-text-secondary" />
            </a>
        </div>
    );
};