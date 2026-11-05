import React from 'react';
import { Check } from 'lucide-react';

export const PaymentStepper: React.FC = () => {
    const steps = [
        { id: 1, name: 'Select seat(s)', status: 'Finish' },
        { id: 2, name: 'Food', status: 'Finish' },
        { id: 3, name: 'Checkout', status: 'Step3' },
        { id: 4, name: 'Pay', status: 'Step4' },
        { id: 5, name: 'Detail', status: 'Step5' },
    ];

    return (
        <div className="w-full pay-card pay-font-primary border-b border-gray-300 px-4 sm:px-8 py-3 flex items-center justify-center text-xs">

            {/* Danh sách các bước */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5">
                {steps.map((step, idx) => {
                    const isFinished = step.id < 3;
                    const isCurrent = step.id === 3;

                    return (
                        <div key={step.id} className="flex items-center gap-2 whitespace-nowrap">
                            {/* Bước đã xong (1, 2) */}
                            {isFinished && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-(--color-payment-primary) flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] pay-text-secondary font-semibold leading-none">{step.status}</span>
                                        <span className="text-[11px] pay-text-primary font-bold tracking-tight">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Bước hiện tại (3 - Checkout) */}
                            {isCurrent && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#e50914] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm shadow-red-950/30">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] text-[#e50914] font-bold leading-none">{step.status}</span>
                                        <span className="text-[11px] pay-text-primary font-black tracking-tight">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Các bước tiếp theo (4, 5) */}
                            {!isFinished && !isCurrent && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 pay-text-secondary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] pay-text-secondary font-medium leading-none">{step.status}</span>
                                        <span className="text-[11px] pay-text-secondary font-medium">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Nét gạch nối giữa các bước */}
                            {idx < steps.length - 1 && (
                                <div className="w-5 sm:w-7 h-[1px] bg-gray-300 mx-1 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PaymentStepper;