import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, ArrowRight, X } from 'lucide-react';
import momoLogo from '../../assets/momo.png';

interface MomoPayModalProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

export const MomoPayModal: React.FC<MomoPayModalProps> = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(585); // 09:45 đếm ngược

    useEffect(() => {
        if (timeLeft <= 0) {
            // Hết hạn quét mã QR tự động chuyển sang trang Failure
            navigate('/failure');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="w-full max-w-[500px] bg-[#10141d] border border-gray-800 rounded-2xl p-6 shadow-2xl font-sans relative text-gray-200">
            {/* Nút đóng */}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Header Modal MoMo */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-800">
                <img
                    src={momoLogo}
                    alt="MoMo Logo"
                    className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-[#A50064]/20 flex-shrink-0"
                />
                <div>
                    <h2 className="text-white font-bold text-base leading-tight">Cổng Thanh Toán MoMo</h2>
                    <p className="text-xs text-gray-400">Quét mã QR bằng ứng dụng MoMo để thanh toán</p>
                </div>
            </div>

            {/* Thông tin số tiền & đếm ngược */}
            <div className="mt-4 bg-[#0a0d14] border border-gray-800/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Số tiền thanh toán</span>
                    <span className="text-xl font-black text-[#A50064] font-mono">390,000 ₫</span>
                </div>

                <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Thời gian giữ vé</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-amber-400 text-sm">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{formattedTime}</span>
                    </div>
                </div>
            </div>

            {/* Khung QR MoMo */}
            <div className="my-5 flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-[#A50064]/30 relative">
                    <div className="w-48 h-48 relative flex items-center justify-center">
                        <svg className="w-full h-full text-black" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="4" y="4" width="28" height="28" rx="4" fill="#A50064" />
                            <rect x="8" y="8" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="12" y="12" width="12" height="12" rx="1" fill="#A50064" />

                            <rect x="68" y="4" width="28" height="28" rx="4" fill="#A50064" />
                            <rect x="72" y="8" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="76" y="12" width="12" height="12" rx="1" fill="#A50064" />

                            <rect x="4" y="68" width="28" height="28" rx="4" fill="#A50064" />
                            <rect x="8" y="72" width="20" height="20" rx="2" fill="#fff" />
                            <rect x="12" y="76" width="12" height="12" rx="1" fill="#A50064" />

                            <rect x="36" y="8" width="8" height="8" />
                            <rect x="48" y="8" width="8" height="8" />
                            <rect x="40" y="20" width="8" height="8" />
                            <rect x="52" y="24" width="8" height="8" />
                            <rect x="12" y="40" width="8" height="8" />
                            <rect x="24" y="44" width="8" height="8" />
                            <rect x="40" y="36" width="8" height="8" />
                            <rect x="52" y="44" width="8" height="8" />
                            <rect x="68" y="40" width="8" height="8" />
                            <rect x="80" y="44" width="8" height="8" />
                            <rect x="36" y="56" width="8" height="8" />
                            <rect x="48" y="64" width="8" height="8" />
                            <rect x="68" y="68" width="8" height="8" />
                            <rect x="80" y="76" width="8" height="8" />
                            <rect x="40" y="76" width="8" height="8" />
                            <rect x="52" y="84" width="8" height="8" />
                            <rect x="68" y="84" width="8" height="8" />
                        </svg>

                        {/* Logo MoMo mini đặt tại tâm mã QR */}
                        <div className="absolute w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-md">
                            <img
                                src={momoLogo}
                                alt="MoMo Mini"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 text-center">
                    Sử dụng App <strong>MoMo</strong> hoặc ứng dụng Camera có hỗ trợ QR để quét mã
                </p>
            </div>

            {/* Thông tin đơn hàng */}
            <div className="bg-[#0b0f17] border border-gray-800/60 rounded-xl p-3 text-xs space-y-1.5 mb-5">
                <div className="flex justify-between text-gray-400">
                    <span>Nhà cung cấp:</span>
                    <span className="text-white font-medium">SENEMA Cinema HCMC</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Mã đơn hàng:</span>
                    <span className="font-mono text-gray-200 font-bold">MOMO-2024-88492X</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>Phim & Suất chiếu:</span>
                    <span className="text-gray-200">Dune 2 • 20:15 (Ghế F12, F13)</span>
                </div>
            </div>

            {/* Nút bấm chuyển sang Successfull */}
            <button
                type="button"
                onClick={onSuccess}
                className="w-full bg-[#A50064] hover:bg-[#880052] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wide transition shadow-lg shadow-[#A50064]/30 cursor-pointer"
            >
                <span>Tôi đã hoàn tất thanh toán</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Cam kết bảo mật */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Giao dịch được bảo vệ và mã hóa bởi MoMo Payment Security</span>
            </div>
        </div>
    );
};

export default MomoPayModal;