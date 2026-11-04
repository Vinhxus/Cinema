import React from 'react';
import { Check } from 'lucide-react';

export default function PaymentStepper() {
    const steps = [
        { id: 1, name: 'Select seat(s)', label: 'Finish' },
        { id: 2, name: 'Food', label: 'Finish' },
        { id: 3, name: 'Checkout', label: 'Finish' },
        { id: 4, name: 'Pay', label: 'Finish' },
        { id: 5, name: 'Detail', label: 'Step5' },
    ];

    return (
        <div className="w-full bg-[#0d121c] border-b border-gray-800/80 px-6 py-2.5 flex items-center justify-center text-xs">
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto py-1">
                {steps.map((step, idx) => {
                    const isFinished = step.id < 5;
                    const isCurrent = step.id === 5;

                    return (
                        <div key={step.id} className="flex items-center gap-2.5 whitespace-nowrap">
                            {/* Bước 1, 2, 3, 4 đã hoàn thành */}
                            {isFinished && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#1b212d] border border-gray-600 flex items-center justify-center text-white">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-gray-400 font-medium leading-tight">{step.label}</span>
                                        <span className="text-[11px] text-gray-200 font-semibold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Bước 5: Detail (Đang kích hoạt - Màu đỏ) */}
                            {isCurrent && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#e50914] text-white flex items-center justify-center font-bold text-[11px] shadow-sm shadow-red-900/50">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-[#e50914] font-bold leading-tight">{step.label}</span>
                                        <span className="text-[11px] text-white font-bold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {idx < steps.length - 1 && (
                                <div className="w-6 sm:w-8 h-[1px] bg-gray-700/80 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}