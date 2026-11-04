import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PaymentStepper } from '../components/PaymentComponents/PaymentStepper';
import { CustomerInfo } from '../components/PaymentComponents/CustomerInfo';
import { PaymentMethods } from '../components/PaymentComponents/PaymentMethods';
import { OrderSummary } from '../components/PaymentComponents/OrderSummary';

const Payment: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#070B12] flex flex-col font-sans">
            { }
            <div className="w-full text-gray-900">
                <Header />
            </div>

            {/* Thanh tiến trình các bước */}
            <PaymentStepper />

            {/* Khu vực thanh toán chính: Thiết lập text-gray-200 chỉ cho riêng phần này */}
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Cột trái chiếm 7 phần */}
                    <div className="lg:col-span-7 space-y-6">
                        <CustomerInfo />
                        <PaymentMethods />
                    </div>

                    {/* Cột phải chiếm 5 phần (OrderSummary) */}
                    <div className="lg:col-span-5 sticky top-4">
                        <OrderSummary />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <div className="text-gray-300">
                <Footer />
            </div>
        </div>
    );
};

export default Payment;