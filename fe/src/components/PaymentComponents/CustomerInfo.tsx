import React, { useState } from 'react';
import { User, Mail, Ticket, Tag, Check } from 'lucide-react';

export const CustomerInfo: React.FC = () => {
    const [saveProfile, setSaveProfile] = useState(true);
    const [sendZalo, setSendZalo] = useState(true);
    const [promoCode, setPromoCode] = useState('CINEVIP10');
    const [isApplied, setIsApplied] = useState(true);

    return (
        <div className="space-y-6 pay-font-primary">
            {/* 1. Customer Information */}
            <div className="pay-card border border-gray-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                    <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-bold flex items-center justify-center border border-amber-500/40">
                            1
                        </span>
                        <h2 className="pay-text-primary font-semibold text-base">Customer Information</h2>
                    </div>
                    <Ticket className="w-4 h-4 pay-text-secondary" />
                </div>

                <p className="text-[11px] pay-text-secondary pay-font-secondary mt-2 mb-4">
                    Your official e-ticket with entry QR gate check-in will be dispatched immediately.
                </p>

                <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                        <label className="text-[11px] pay-text-secondary pay-font-secondary block mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pay-text-secondary" />
                            <input
                                type="text"
                                defaultValue="Alex Nguyen"
                                className="w-full bg-white pay-text-primary text-xs rounded-lg pl-9 pr-3 py-2 border border-gray-300 focus:border-amber-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] pay-text-secondary pay-font-secondary block mb-1">
                                Mobile Phone <span className="text-red-500">*</span>
                            </label>
                            <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:border-amber-500">
                                <div className="flex items-center gap-1 px-2.5 bg-gray-100 border-r border-gray-300 text-xs pay-text-primary">
                                    <span className="text-xs">🇻🇳</span>
                                    <span>+84</span>
                                </div>
                                <input
                                    type="text"
                                    defaultValue="0912 345 678"
                                    className="w-full bg-transparent pay-text-primary text-xs px-3 py-2 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] pay-text-secondary pay-font-secondary block mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pay-text-secondary" />
                                <input
                                    type="email"
                                    defaultValue="alex.nguyen@example.com"
                                    className="w-full bg-white pay-text-primary text-xs rounded-lg pl-9 pr-3 py-2 border border-gray-300 focus:border-amber-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap items-center gap-5 pt-2 text-xs pay-text-primary">
                        <button
                            type="button"
                            onClick={() => setSaveProfile(!saveProfile)}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-70"
                        >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center ${saveProfile ? 'bg-blue-600 text-white' : 'border border-gray-400 bg-white'}`}>
                                {saveProfile && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className="text-[11px]">Save profile info for one-tap checkout next time</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSendZalo(!sendZalo)}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-70"
                        >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center ${sendZalo ? 'bg-blue-600 text-white' : 'border border-gray-400 bg-white'}`}>
                                {sendZalo && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span className="text-[11px]">Send instant ticket pass via Zalo / SMS</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Promotion & CinePass Voucher */}
            <div className="pay-card border border-gray-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-300">
                    <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-bold flex items-center justify-center border border-amber-500/40">
                            2
                        </span>
                        <h2 className="pay-text-primary font-semibold text-base">Promotion & CinePass Voucher</h2>
                    </div>
                    <Tag className="w-4 h-4 text-amber-600" />
                </div>

                <div className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full bg-white pay-text-primary text-xs rounded-lg pl-9 pr-3 py-2.5 border border-gray-300 uppercase font-mono tracking-wider outline-none focus:border-amber-500"
                            placeholder="ENTER VOUCHER CODE"
                        />
                    </div>
                    <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-md shadow-amber-500/10">
                        Apply Code
                    </button>
                </div>

                {isApplied && (
                    <div className="mt-3 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span><strong>CINEVIP10</strong> applied (-25,000 VND VIP Cinephile Perk)</span>
                        </span>
                        <button onClick={() => setIsApplied(false)} className="pay-text-secondary hover:opacity-70">✕</button>
                    </div>
                )}

                <div className="mt-3 text-[11px] pay-text-secondary pay-font-secondary flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold">★</span>
                    <span>Member Balance: <strong className="pay-text-primary">320 CinePoints</strong></span>
                    <button className="text-amber-700 underline ml-1 hover:opacity-70 font-medium">Redeem</button>
                </div>
            </div>
        </div>
    );
};