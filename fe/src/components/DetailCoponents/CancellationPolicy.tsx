import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const CancellationPolicy: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <div className="bg-[#10141d] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
                <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Cancellation & Refund Policy</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Transparent and automated refund policy powered by CineVerse Booking Protection.
                    </p>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold self-start">
                    ● Eligible for cancellation (3h 45m left)
                </span>
            </div>

            { }
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Cancellation Schedule & Refund Rate
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-[#0b0f17] border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">&gt; 4 hours before</span>
                            <span className="text-emerald-400 font-black text-lg">100% Refund</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-2">
                            Full ticket refund. Standard service fee of 10,000 ₫ is waived for CineClub VIP members.
                        </p>
                    </div>

                    <div className="bg-[#0b0f17] border border-amber-500/40 rounded-2xl p-4 relative overflow-hidden ring-1 ring-amber-500/30">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-amber-400 font-bold uppercase">2h - 4h before (Current)</span>
                            <span className="text-amber-400 font-black text-lg">50% Refund</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-2">
                            50% cash refund or 100% converted into CinePass Voucher valid for 90 days.
                        </p>
                    </div>

                    <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4 opacity-70">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">&lt; 2 hours before</span>
                            <span className="text-rose-500 font-black text-lg">0% Refund</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Non-refundable within 2 hours of showtime as auditorium seating is locked.
                        </p>
                    </div>
                </div>
            </div>

            { }
            <div className="space-y-2 pt-2">
                {[
                    {
                        id: 'fnb',
                        title: 'Food & Beverage (F&B) Cancellation Policy',
                        desc: 'Unredeemed popcorn and beverages are 100% refundable up to 30 minutes before showtime.'
                    },
                    {
                        id: 'refund_method',
                        title: 'Refund Processing Methods & Timelines',
                        desc: 'Refunds sent directly back to original MoMo e-wallet within 5 to 15 minutes.'
                    },
                    {
                        id: 'special',
                        title: 'Special Screenings Policy (Sneak Show, Premiere, Holidays)',
                        desc: 'Special premieres and midnight screenings have customized refund rules.'
                    }
                ].map((item) => (
                    <div
                        key={item.id}
                        className="bg-[#0b0f17] border border-gray-800/80 rounded-xl overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={() => toggleAccordion(item.id)}
                            className="w-full px-4 py-3 text-left flex justify-between items-center text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
                        >
                            <span>{item.title}</span>
                            {openAccordion === item.id ? (
                                <ChevronUp className="w-4 h-4 text-amber-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                        {openAccordion === item.id && (
                            <div className="px-4 pb-3.5 text-xs text-gray-400 border-t border-gray-800/60 pt-2.5">
                                {item.desc}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};