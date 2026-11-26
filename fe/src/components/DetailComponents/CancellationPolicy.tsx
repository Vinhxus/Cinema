import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface CancellationPolicyProps {
    bookingId?: number;
}

export const CancellationPolicy: React.FC<CancellationPolicyProps> = ({ bookingId }) => {
    const navigate = useNavigate();
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <div className="pay-card pay-font-primary border border-gray-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-300">
                <div>
                    <h3 className="text-base font-bold pay-text-primary flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Cancellation & Refund Policy</span>
                    </h3>
                    <p className="text-xs pay-text-secondary pay-font-secondary mt-0.5">
                        Transparent and automated refund policy powered by CineVerse Booking Protection.
                    </p>
                </div>

                {bookingId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/refund?bookingId=${bookingId}`)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm self-start"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Yêu cầu hoàn vé</span>
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold pay-text-primary uppercase tracking-wider">
                    Cancellation Schedule & Refund Rate
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-emerald-300 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] pay-text-secondary font-bold uppercase">&gt; 4 hours before</span>
                            <span className="text-emerald-700 font-black text-lg">100% Refund</span>
                        </div>
                    </div>

                    <div className="bg-white border border-amber-400 rounded-2xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-amber-700 font-bold uppercase">2h - 4h before</span>
                            <span className="text-amber-700 font-black text-lg">50% Refund</span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-300 rounded-2xl p-4 opacity-70">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] pay-text-secondary font-bold uppercase">&lt; 2 hours before</span>
                            <span className="text-rose-600 font-black text-lg">0% Refund</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};