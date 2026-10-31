import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Share2, Printer, Clock, Accessibility, Headphones } from 'lucide-react';

export default function InfoCards() {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-[860px] mx-auto mt-6 space-y-6 font-sans">
            {/* Hàng nút bấm hành động */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/payment')}
                        className="bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <span>⟵ Back to Home</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="bg-[#1b2230] hover:bg-gray-800 active:scale-95 text-gray-200 border border-gray-700 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-amber-500" />
                        <span>Download Ticket (PDF)</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <button
                        onClick={() => alert('Đã sao chép liên kết chia sẻ vé!')}
                        className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Ticket</span>
                    </button>

                    <span className="text-gray-700">•</span>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                    </button>
                </div>
            </div>

            {/* 3 Thẻ Tiện ích & Hướng dẫn */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Card 1: Arrival Guidelines */}
                <div className="bg-[#10141e] border border-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                        <Clock className="w-4 h-4" />
                        <span>Arrival Guidelines</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        Arrive 15 minutes before showtime (20:00) for seamless snack collection at Counter 03 and recliner seat positioning.
                    </p>
                    <p className="text-[10px] text-gray-500 pt-1 border-t border-gray-800/80">
                        Gates close 10 mins after preview trailers begin.
                    </p>
                </div>

                {/* Card 2: Accessibility & Parking */}
                <div className="bg-[#10141e] border border-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                        <Accessibility className="w-4 h-4" />
                        <span>Accessibility & Parking</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        Elevator B2 connects directly to Basement B1 IMAX Lobby. Wheelchair companion bays and parking validation available at Guest Desk.
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium pt-1 border-t border-gray-800/80">
                        🅿 4 Hours Free Parking for IMAX patrons.
                    </p>
                </div>

                {/* Card 3: CineConcierge Hotline */}
                <div className="bg-[#10141e] border border-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                        <Headphones className="w-4 h-4" />
                        <span>CineConcierge Hotline</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        Need to amend seating or request dietary adjustments for your caramel combo? Connect our 24/7 support line.
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-800/80">
                        <strong className="text-white font-mono">📞 1900 8888</strong>
                        <span className="text-[10px] text-gray-500">Toll Free 24/7</span>
                    </div>
                </div>
            </div>
        </div>
    );
}