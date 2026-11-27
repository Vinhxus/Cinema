import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, QrCode } from 'lucide-react';

export const PaymentMethods: React.FC = () => {
    return (
        <div className="pay-card border border-gray-300 rounded-xl p-5 shadow-sm space-y-4 pay-font-primary pay-text-primary">
            {/* Tiêu đề mục 3 */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#f59e0b] text-black text-xs font-black flex items-center justify-center">
                        3
                    </span>
                    <h3 className="pay-text-primary font-bold text-sm tracking-wide">
                        Select Payment Method
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] px-2.5 py-1 rounded-full font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SePay Payment Gateway · VietQR</span>
                </div>
            </div>

            {/* Thẻ chọn SePay / VietQR */}
            <div className="relative border-2 border-[#0b5bd3] bg-[#0b5bd3]/10 rounded-xl p-4 transition shadow-lg shadow-[#0b5bd3]/10">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-center flex-shrink-0">
                            <QrCode className="w-7 h-7 text-[#0b5bd3]" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="pay-text-primary font-bold text-sm">VietQR Bank Transfer</span>
                                <span className="bg-[#0b5bd3] text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                                    ALL BANKS
                                </span>
                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none border border-emerald-300">
                                    INSTANT
                                </span>
                            </div>
                            <p className="pay-text-secondary pay-font-secondary text-xs mt-1">
                                Scan the VietQR code with any banking app. Your ticket is confirmed automatically as soon as the payment arrives.
                            </p>
                        </div>
                    </div>

                    <div className="w-5 h-5 rounded-full bg-[#0b5bd3] text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 fill-white text-[#0b5bd3]" />
                    </div>
                </div>
            </div>

            {/* Hướng dẫn quy trình quét mã */}
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 pay-text-primary font-semibold text-[11px]">
                    <Smartphone className="w-4 h-4 text-[#0b5bd3]" />
                    <span>How it works:</span>
                </div>

                <ul className="pay-text-secondary pay-font-secondary text-[11px] space-y-1.5 pl-5 list-disc leading-relaxed">
                    <li>
                        Click <strong className="pay-text-primary">PROCEED TO PAYMENT</strong> in the right column.
                    </li>
                    <li>
                        You will be redirected to <strong className="text-[#0b5bd3] font-bold">SePay</strong>, where a VietQR code is pre-filled with the amount and transfer note.
                    </li>
                    <li>
                        Open your <strong className="text-[#0b5bd3]">banking</strong> app, tap <strong className="pay-text-primary">Scan QR</strong> and confirm before your seat hold expires. Do not edit the transfer note.
                    </li>
                </ul>
            </div>

            {/* Cam kết bảo mật */}
            <div className="text-[10px] pay-text-secondary pay-font-secondary flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Payments are processed by the SePay gateway. We never store your bank account details.</span>
            </div>
        </div>
    );
};

export default PaymentMethods;