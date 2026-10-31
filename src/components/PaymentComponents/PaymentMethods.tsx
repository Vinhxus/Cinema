import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock } from 'lucide-react';

export const PaymentMethods: React.FC = () => {
    const [selectedMethod, setSelectedMethod] = useState<'vnpay' | 'momo' | 'card' | 'shopee'>('card');

    return (
        <div className="bg-[#121620] border border-gray-800 rounded-xl p-5 shadow-lg space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800/60">
                <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center justify-center border border-amber-500/30">
                        3
                    </span>
                    <h2 className="text-white font-semibold text-base">Select Payment Method</h2>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    <span>256-bit SSL Encrypted & PCI-DSS Level 1</span>
                </div>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* VNPay */}
                <div
                    onClick={() => setSelectedMethod('vnpay')}
                    className={`cursor-pointer rounded-lg p-3 border transition ${selectedMethod === 'vnpay'
                            ? 'bg-[#1b212f] border-blue-500'
                            : 'bg-[#161c28]/70 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'vnpay' ? 'border-blue-500' : 'border-gray-500'}`}>
                                {selectedMethod === 'vnpay' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                            </span>
                            <span className="text-white text-xs font-semibold">VNPay QR / VietQR</span>
                        </div>
                        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            Instant
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">
                        Scan via 40+ Vietnam Banking apps (Vietcombank, BIDV, Techcombank, VPBank...)
                    </p>
                </div>

                {/* MoMo */}
                <div
                    onClick={() => setSelectedMethod('momo')}
                    className={`cursor-pointer rounded-lg p-3 border transition ${selectedMethod === 'momo'
                            ? 'bg-[#1b212f] border-pink-500'
                            : 'bg-[#161c28]/70 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'momo' ? 'border-pink-500' : 'border-gray-500'}`}>
                                {selectedMethod === 'momo' && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                            </span>
                            <span className="text-white text-xs font-semibold">MoMo E-Wallet</span>
                        </div>
                        <span className="text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            MOMO APP
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">
                        Link directly or scan MoMo payment code for cinema voucher rebates.
                    </p>
                </div>

                {/* Credit Card */}
                <div
                    onClick={() => setSelectedMethod('card')}
                    className={`cursor-pointer rounded-lg p-3 border transition ${selectedMethod === 'card'
                            ? 'bg-[#1b212f] border-blue-500'
                            : 'bg-[#161c28]/70 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'card' ? 'border-blue-500' : 'border-gray-500'}`}>
                                {selectedMethod === 'card' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                            </span>
                            <span className="text-white text-xs font-semibold">International Cards</span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">VISA • MC • JCB</span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">
                        Zero surcharge with 3D-Secure One-Time Passcode authorization.
                    </p>
                </div>

                {/* ShopeePay */}
                <div
                    onClick={() => setSelectedMethod('shopee')}
                    className={`cursor-pointer rounded-lg p-3 border transition ${selectedMethod === 'shopee'
                            ? 'bg-[#1b212f] border-orange-500'
                            : 'bg-[#161c28]/70 border-gray-800 hover:border-gray-700'
                        }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedMethod === 'shopee' ? 'border-orange-500' : 'border-gray-500'}`}>
                                {selectedMethod === 'shopee' && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                            </span>
                            <span className="text-white text-xs font-semibold">ShopeePay</span>
                        </div>
                        <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            CASHBACK
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 pl-5">
                        Exclusive 15,000 VND cinema voucher cashback auto-applied.
                    </p>
                </div>
            </div>

            {/* Card Detail Form Preview (when Credit Card is chosen) */}
            <div className="bg-[#161c28]/50 border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-800/60">
                    <span className="flex items-center gap-1.5 font-medium text-gray-300">
                        <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                        Card Information Preview
                    </span>
                    <span className="text-[10px] text-gray-500">Powered by Stripe / VNPay Gateway</span>
                </div>

                <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Card Number</label>
                    <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            readOnly
                            value="4829 •••• •••• 9204"
                            className="w-full bg-[#1b212f] text-gray-300 text-xs rounded-lg pl-9 pr-3 py-2 border border-gray-700/60 font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Expiration Date</label>
                        <input
                            type="text"
                            readOnly
                            value="08 / 28"
                            className="w-full bg-[#1b212f] text-gray-300 text-xs rounded-lg px-3 py-2 border border-gray-700/60 font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Security Code (CVV)</label>
                        <div className="relative">
                            <input
                                type="password"
                                readOnly
                                value="•••"
                                className="w-full bg-[#1b212f] text-gray-300 text-xs rounded-lg px-3 py-2 border border-gray-700/60 tracking-widest"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 cursor-help">ⓘ</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Your payment info is encrypted and tokenized. No raw bank credentials or full CVV codes are stored on CineVerse servers.
            </p>
        </div>
    );
};