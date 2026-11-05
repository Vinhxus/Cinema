import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/ProcessComponents/PaymentStepper';
import { MomoPayModal } from '../components/ProcessComponents/MomoPayModal';

export default function Processing() {
    const navigate = useNavigate();

    return (
        <div className="processing-page-root min-h-screen bg-white flex flex-col pay-font-primary select-none pay-text-primary">
            {/* Header with white background and subtle border */}
            <div className="w-full pay-text-primary bg-white border-b border-gray-100">
                <Header />
            </div>

            {/* Stepper Step 4: Pay */}
            <PaymentStepper currentStep={4} />

            {/* Mode Switcher toolbar (Light theme) */}
            <div className="w-full flex justify-center py-3">
                <div className="pay-card border border-gray-300 rounded-full p-1 flex items-center gap-1.5 text-xs font-semibold shadow-sm select-none">
                    <span className="text-[10px] font-bold pay-text-secondary uppercase pl-2.5 pr-2 border-r border-gray-200">
                        ⚙ MODE
                    </span>

                    {/* 1. Payment: Click to navigate back to Payment page */}
                    <button
                        type="button"
                        onClick={() => navigate('/payment')}
                        className="px-3 py-1 rounded-full pay-text-secondary hover:opacity-70 hover:bg-gray-200 transition cursor-pointer text-[11px]"
                    >
                        1. Payment
                    </button>

                    {/* 2. MoMo QR: Active state on Processing page */}
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#A50064] text-white shadow-sm shadow-[#A50064]/20 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>2. MoMo QR</span>
                    </div>

                    {/* 3. Timed Out: Status badge */}
                    <span
                        className="px-3 py-1 rounded-full pay-text-secondary opacity-60 cursor-not-allowed text-[11px]"
                        title="Automatically activates when holding time expires"
                    >
                        3. Timed Out
                    </span>
                </div>
            </div>

            {/* Main QR Modal area */}
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 py-6 flex items-center justify-center">
                <MomoPayModal
                    onClose={() => navigate('/payment')}
                    onSuccess={() => navigate('/success')}
                />
            </main>

            {/* Footer */}
            <div className="w-full mt-auto border-t border-gray-100">
                <Footer />
            </div>
        </div>
    );
}