import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/PaymentComponents/PaymentStepper';
import { CustomerInfo } from '../components/PaymentComponents/CustomerInfo';
import { PaymentMethods } from '../components/PaymentComponents/PaymentMethods';
import { OrderSummary } from '../components/PaymentComponents/OrderSummary';
import { useBooking } from '../context/useBooking';

const Payment: React.FC = () => {
    const { selectedSeats } = useBooking();

    // Vào thẳng /payment (hoặc F5 làm mất state) mà chưa có ghế -> quay lại chọn ghế
    if (selectedSeats.length === 0) return <Navigate to="/select-seat" replace />;

    return (
        <div className="min-h-screen bg-white flex flex-col pay-font-primary">
            {/* Header */}
            <div className="w-full pay-text-primary border-b border-gray-100">
                <Header />
            </div>

            {/* Thanh tiến trình các bước */}
            <PaymentStepper />

            {/* Khu vực thanh toán chính */}
            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pay-font-primary pay-text-primary">
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
            <div className="w-full">
                <Footer />
            </div>
        </div>
    );
};

export default Payment;
