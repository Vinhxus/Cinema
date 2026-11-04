import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Settings, CreditCard, QrCode, AlertOctagon } from 'lucide-react';

export const FailureStepper: React.FC = () => {
    const navigate = useNavigate();

    const steps = [
        { id: 1, name: 'Select seat(s)', label: 'Finish' },
        { id: 2, name: 'Food & Drinks', label: 'Finish' },
        { id: 3, name: 'Checkout', label: 'Finish' },
        { id: 4, name: 'Payment', label: 'Expired' },
        { id: 5, name: 'Ticket Details', label: 'Step 5' },
    ];

    return (
        <div className="w-full bg-[#0d121c] border-b border-gray-800/80 py-3 flex flex-col items-center justify-center text-xs space-y-3 select-none">
            {/* 1. Progress Steps Bar */}
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto py-1 px-4 max-w-full">
                {steps.map((step, idx) => {
                    const isFinished = step.id <= 3;
                    const isExpired = step.id === 4;

                    return (
                        <div key={step.id} className="flex items-center gap-3 whitespace-nowrap">
                            {/* Finished Steps (1, 2, 3) */}
                            {isFinished && (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#1e2330] border border-gray-600 flex items-center justify-center text-white">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-gray-400 font-medium leading-none">{step.label}</span>
                                        <span className="text-xs text-gray-200 font-semibold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Expired Step 4 */}
                            {isExpired && (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-red-900/50">
                                        !
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-rose-500 font-black leading-none uppercase">{step.label}</span>
                                        <span className="text-xs text-rose-400 font-bold">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {/* Step 5 */}
                            {step.id === 5 && (
                                <div className="flex items-center gap-2 opacity-30">
                                    <div className="w-6 h-6 rounded-full border border-gray-600 text-gray-500 flex items-center justify-center text-xs">
                                        {step.id}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] text-gray-500 font-medium leading-none">{step.label}</span>
                                        <span className="text-xs text-gray-500">{step.name}</span>
                                    </div>
                                </div>
                            )}

                            {idx < steps.length - 1 && (
                                <div className="w-8 h-[1px] bg-gray-800 hidden sm:block" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 2. MODE Switcher Bar */}
            <div className="inline-flex items-center gap-1.5 bg-[#10141d] border border-gray-800 rounded-full p-1 shadow-xl text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-gray-400 pl-2.5 pr-2 border-r border-gray-800">
                    <Settings className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">MODE</span>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/payment')}
                    className="px-3 py-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition cursor-pointer flex items-center gap-1.5 text-[11px]"
                >
                    <CreditCard className="w-3 h-3" />
                    <span>1. Payment</span>
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/processing')}
                    className="px-3 py-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition cursor-pointer flex items-center gap-1.5 text-[11px]"
                >
                    <QrCode className="w-3 h-3" />
                    <span>2. MoMo QR</span>
                </button>

                {/* Tab 3: Timed Out Status (Read-only) */}
                <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#dc2626] text-white shadow-md shadow-red-600/30 text-[11px] font-black cursor-default">
                    <AlertOctagon className="w-3 h-3 stroke-[2.5]" />
                    <span>3. Timed Out</span>
                </div>
            </div>
        </div>
    );
};

export default FailureStepper;