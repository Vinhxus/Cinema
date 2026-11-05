import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import momoLogo from '../../assets/momo.png';

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
                    <span>256-bit SSL Encrypted & MoMo Payment Gateway</span>
                </div>
            </div>

            {/* Thẻ chọn MoMo */}
            <div className="relative border-2 border-[#A50064] bg-[#A50064]/10 rounded-xl p-4 transition shadow-lg shadow-[#A50064]/10">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                        <img
                            src={momoLogo}
                            alt="MoMo Logo"
                            className="w-12 h-12 rounded-2xl object-cover shadow-md flex-shrink-0"
                        />

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="pay-text-primary font-bold text-sm">Ví Điện Tử MoMo</span>
                                <span className="bg-[#A50064] text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                                    MOMO APP
                                </span>
                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none border border-emerald-300">
                                    INSTANT
                                </span>
                            </div>
                            <p className="pay-text-secondary pay-font-secondary text-xs mt-1">
                                Quét mã QR qua ứng dụng MoMo để hoàn tất thanh toán vé an toàn & nhận hoàn tiền tích điểm CineClub.
                            </p>
                        </div>
                    </div>

                    <div className="w-5 h-5 rounded-full bg-[#A50064] text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 fill-white text-[#A50064]" />
                    </div>
                </div>
            </div>

            {/* Hướng dẫn quy trình quét mã */}
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 pay-text-primary font-semibold text-[11px]">
                    <Smartphone className="w-4 h-4 text-[#A50064]" />
                    <span>Quy trình thanh toán một chạm:</span>
                </div>

                <ul className="pay-text-secondary pay-font-secondary text-[11px] space-y-1.5 pl-5 list-disc leading-relaxed">
                    <li>
                        Bấm nút <strong className="pay-text-primary">PROCEED TO PAYMENT</strong> ở cột bên phải.
                    </li>
                    <li>
                        Hệ thống hiển thị mã <strong className="text-[#A50064] font-bold">MoMo QR Code</strong> động kèm số tiền cần thanh toán chính xác.
                    </li>
                    <li>
                        Mở app <strong className="text-[#A50064]">MoMo</strong> trên điện thoại, chọn <strong className="pay-text-primary">Quét Mã</strong> để xác nhận giao dịch trong vòng 10 phút.
                    </li>
                </ul>
            </div>

            {/* Cam kết bảo mật */}
            <div className="text-[10px] pay-text-secondary pay-font-secondary flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Giao dịch bảo mật qua cổng thanh toán chính thức MoMo Open API. Không lưu thông tin tài khoản trên hệ thống.</span>
            </div>
        </div>
    );
};

export default PaymentMethods;