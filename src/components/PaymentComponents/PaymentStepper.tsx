import React from 'react';
import { Check, Clock } from 'lucide-react';

export const PaymentStepper: React.FC = () => {
    const steps = [
        { id: 1, name: 'Select seat(s)', status: 'Finish' },
        { id: 2, name: 'Food', status: 'Finish' },
        { id: 3, name: 'Checkout', status: 'Step3' },
        { id: 4, name: 'Pay', status: 'Step4' },
        { id: 5, name: 'Detail', status: 'Step5' },
    ];

    return (
        <div className="w-full bg-[#0a0e17] border-b border-gray-800/80 px-4 sm:px-8 py-3 flex items-center justify-between text-xs font-sans">
            {/* Danh sách các bước */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5">
                {steps.map((step, idx) => {
                    const isFinished = step.id < 3;
                    const isCurrent = step.id === 3;

                    return (
                        <div key={step.id} className="flex items-center gap-2 whitespace-nowrap">
                            {/* Bước đã xong (1, 2): Nền trắng, dấu tích đen */}
                            {isFinished && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black flex-shrink-0 shadow-sm">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] text-gray-400 font-semibold leading-none">{step.status}</span>
                                        <span className="text-[11px] text-white font-bold tracking-tight">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Bước hiện tại (3 - Checkout): Vòng tròn đỏ */}
                            {isCurrent && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#e50914] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm shadow-red-950">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] text-[#e50914] font-bold leading-none">{step.status}</span>
                                        <span className="text-[11px] text-white font-black tracking-tight">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Các bước tiếp theo (4, 5): Vòng tròn nền trắng/xám mờ, số xám */}
                            {!isFinished && !isCurrent && (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/90 text-gray-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[8px] text-gray-500 font-medium leading-none">{step.status}</span>
                                        <span className="text-[11px] text-gray-400 font-medium">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Nét gạch nối mỏng giữa các bước */}
                            {idx < steps.length - 1 && (
                                <div className="w-5 sm:w-7 h-[1px] bg-gray-700/80 mx-1 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Thông báo giữ vé góc phải */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                <Clock className="w-3.5 h-3.5 stroke-[2]" />
                <span>
                    Your seats are held for: <strong className="text-amber-400 font-mono font-bold">09:45</strong> <span className="text-gray-500 text-[10px]">(Secured)</span>
                </span>
            </div>
        </div>
    );
};

export default PaymentStepper;