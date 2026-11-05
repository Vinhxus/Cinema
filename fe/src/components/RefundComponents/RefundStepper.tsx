import React from 'react';
import { Check } from 'lucide-react';

export const RefundStepper: React.FC = () => {
    const steps = [
        { id: 1, name: 'Select seat(s)', label: 'Finish' },
        { id: 2, name: 'Food & Drinks', label: 'Finish' },
        { id: 3, name: 'Checkout', label: 'Finish' },
        { id: 4, name: 'Payment', label: 'Finish' },
        { id: 5, name: 'Refund Request', label: 'Processing' },
    ];

    return (
        <div className="w-full pay-card pay-font-primary border-b border-gray-300 py-3.5 flex items-center justify-center text-xs select-none">
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto py-1 px-4 max-w-full">
                {steps.map((step, idx) => {
                    const isFinished = step.id <= 4;
                    const isRefundStep = step.id === 5;

                    return (
                        <div key={step.id} className="flex items-center gap-3 whitespace-nowrap">
                            {/* Các bước trước đó đã xong */}
                            {isFinished && (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-payment-primary)] flex items-center justify-center text-white">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] pay-text-secondary font-medium leading-none">{step.label}</span>
                                        <span className="text-xs pay-text-secondary font-semibold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Bước Refund Request hiện tại */}
                            {isRefundStep && (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/30">
                                        5
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-amber-700 font-black leading-none uppercase">{step.label}</span>
                                        <span className="text-xs pay-text-primary font-bold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {idx < steps.length - 1 && (
                                <div className="w-8 h-[1px] bg-gray-300 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RefundStepper;