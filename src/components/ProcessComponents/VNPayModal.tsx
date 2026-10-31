import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VNPayModalProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

export const VNPayModal: React.FC<VNPayModalProps> = ({ onClose, onSuccess }) => {
    const [timeLeft, setTimeLeft] = useState(14 * 60 + 58); // 14:58

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-[620px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-gray-800 font-sans transition-all">
            {/* Thanh viền cam trang trí trên cùng */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-500" />

            {/* Header Modal */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    {/* Logo VNPay */}
                    <div className="flex flex-col items-start leading-none pr-3 border-r border-gray-200">
                        <span className="text-base font-black text-[#005baa] tracking-tighter">
                            VNPAY <span className="text-[10px] font-bold text-red-500 uppercase">QR 24/7</span>
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900 text-sm">Scan QR Code to Pay via VNPay</h3>
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-500 text-white" />
                        </div>
                        <p className="text-[11px] text-gray-400">
                            Instant confirmation via Mobile Banking & VNPay E-Wallet
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Meta Bar: Mã vé & Thời gian hết hạn */}
            <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-6">
                    <div>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">BOOKING REFERENCE</span>
                        <span className="font-mono font-bold text-gray-800 text-xs">CV-2024-88492X</span>
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">SCREENING</span>
                        <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-bold text-gray-800">Dune: Part Two</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-gray-600">IMAX 01</span>
                            <span className="bg-amber-100 text-amber-800 px-1 py-0.2 text-[9px] font-bold rounded">F12, F13</span>
                        </div>
                    </div>
                </div>

                {/* Đồng hồ đếm ngược */}
                <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase">EXPIRES IN:</span>
                    <span className="font-mono font-extrabold text-xs">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Body Modal: Cột trái (QR) & Cột phải (Hướng dẫn) */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Cột trái: Khung QR Code */}
                <div className="md:col-span-5 flex flex-col items-center">
                    <div className="relative p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        {/* 4 góc viền căn khung QR */}
                        <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
                        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
                        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-amber-500" />

                        {/* Mã QR minh họa SVG sắc nét */}
                        <svg
                            className="w-40 h-40"
                            viewBox="0 0 100 100"
                            fill="currentColor"
                        >
                            {/* Vị trí mắt 1 */}
                            <rect x="5" y="5" width="28" height="28" rx="4" fill="#000" />
                            <rect x="9" y="9" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="13" y="13" width="12" height="12" rx="1" fill="#000" />

                            {/* Vị trí mắt 2 */}
                            <rect x="67" y="5" width="28" height="28" rx="4" fill="#000" />
                            <rect x="71" y="9" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="75" y="13" width="12" height="12" rx="1" fill="#000" />

                            {/* Vị trí mắt 3 */}
                            <rect x="5" y="67" width="28" height="28" rx="4" fill="#000" />
                            <rect x="9" y="71" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="13" y="75" width="12" height="12" rx="1" fill="#000" />

                            {/* Các điểm ma trận QR */}
                            <rect x="40" y="8" width="6" height="6" fill="#000" />
                            <rect x="50" y="12" width="6" height="6" fill="#000" />
                            <rect x="42" y="24" width="6" height="6" fill="#000" />
                            <rect x="52" y="26" width="6" height="6" fill="#000" />
                            <rect x="10" y="42" width="6" height="6" fill="#000" />
                            <rect x="22" y="48" width="6" height="6" fill="#000" />
                            <rect x="38" y="40" width="8" height="8" fill="#000" />
                            <rect x="54" y="42" width="6" height="6" fill="#000" />
                            <rect x="70" y="42" width="6" height="6" fill="#000" />
                            <rect x="84" y="46" width="6" height="6" fill="#000" />
                            <rect x="40" y="60" width="6" height="6" fill="#000" />
                            <rect x="52" y="66" width="6" height="6" fill="#000" />
                            <rect x="42" y="78" width="6" height="6" fill="#000" />
                            <rect x="52" y="82" width="6" height="6" fill="#000" />
                            <rect x="68" y="66" width="8" height="8" fill="#000" />
                            <rect x="80" y="76" width="6" height="6" fill="#000" />
                            <rect x="86" y="62" width="6" height="6" fill="#000" />
                            <rect x="74" y="86" width="6" height="6" fill="#000" />
                        </svg>
                    </div>

                    <span className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        VIETQR • NAPAS 247 • VNPAY
                    </span>

                    <div className="mt-4 text-center">
                        <span className="text-[10px] text-gray-400 font-medium block">Payable Total (VND)</span>
                        <span className="text-xl font-black text-[#e50914] font-mono tracking-tight">
                            390,000 ₫
                        </span>
                    </div>
                </div>

                {/* Cột phải: Hướng dẫn 3 bước */}
                <div className="md:col-span-7 space-y-3.5">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-0.5">
                            <span className="text-amber-500 font-serif italic text-sm">i</span>
                            <span>Quick Scan Instructions</span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                            Complete transaction on your smartphone in 3 effortless steps:
                        </p>
                    </div>

                    {/* Các bước hướng dẫn */}
                    <div className="bg-[#f8faff] border border-blue-50 rounded-xl p-3 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                1
                            </span>
                            <div className="text-[11px]">
                                <strong className="text-gray-800 font-semibold block">Open Banking or VNPay App</strong>
                                <span className="text-gray-500 text-[10px]">Supports 40+ Vietnam Banks: Vietcombank, BIDV, Techcombank, VPBank, MB, ACB...</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                2
                            </span>
                            <div className="text-[11px]">
                                <strong className="text-gray-800 font-semibold block">Tap "QR Pay" & Frame Code</strong>
                                <span className="text-gray-500 text-[10px]">Point your device camera directly at the QR matrix opposite.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                3
                            </span>
                            <div className="text-[11px]">
                                <strong className="text-gray-800 font-semibold block">Confirm 390,000 ₫ & Authorize</strong>
                                <span className="text-gray-500 text-[10px]">Verify recipient as "CineVerse Ent Vietnam" with Biometrics / PIN.</span>
                            </div>
                        </div>
                    </div>

                    {/* Supported Gateways & Wallets */}
                    <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            SUPPORTED GATEWAYS & WALLETS
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-gray-600">
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">VCB</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">BIDV</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">TCB</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">MB</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">VPB</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">ACB</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-[#005baa]">VNPay Wallet</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Modal: Bảo mật & Nút hành động */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit State Bank of Vietnam compliant</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="text-xs text-gray-600 hover:text-gray-900 font-semibold transition cursor-pointer"
                    >
                        Cancel Transaction
                    </button>
                    <button
                        onClick={onSuccess}
                        className="bg-[#f59e0b] hover:bg-amber-600 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <span>I Have Completed Payment</span>
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};