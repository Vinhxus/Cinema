import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { PaymentStepper } from '../components/PaymentComponents/PaymentStepper';

export default function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Lấy bookingId từ URL (?bookingId=X) hoặc từ localStorage nếu có, mặc định là 0
    const urlBookingId = Number(searchParams.get('bookingId'));
    const localBookingId = Number(localStorage.getItem('currentBookingId'));
    const bookingId = urlBookingId || localBookingId || 0;

    // 1. State lưu thông tin khách hàng
    const [customerInfo, setCustomerInfo] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        ageConfirmed: 'T18' as 'P' | 'T13' | 'T16' | 'T18',
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State lưu dữ liệu phản hồi từ MoMo (PayUrl, QR code)
    const [momoResult, setMomoResult] = useState<{
        payUrl: string;
        qrCodeUrl: string;
        transactionRef: string;
        isMock: boolean;
    } | null>(null);

    // Kiểm tra bookingId hợp lệ khi vào trang
    useEffect(() => {
        if (!bookingId || bookingId <= 0) {
            setErrorMessage('Không tìm thấy mã đơn hàng hợp lệ. Vui lòng quay lại chọn ghế.');
        }
    }, [bookingId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCustomerInfo({
            ...customerInfo,
            [e.target.name]: e.target.value,
        });
    };

    // 2. Hàm xử lý Thanh toán MoMo qua Backend
    const handleProcessPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingId || bookingId <= 0) {
            setErrorMessage('Mã đơn hàng không hợp lệ (bookingId = 0). Vui lòng chọn ghế mới.');
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            console.log(`[Payment] Đang thực hiện checkout cho BookingID: ${bookingId}`);

            // ĐƯỜNG BAY 1: Gọi API Checkout cập nhật thông tin khách hàng
            const checkoutRes = await fetch(`http://localhost:5000/api/orders/${bookingId}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerInfo),
            });

            const checkoutData = await checkoutRes.json();

            if (!checkoutRes.ok || !checkoutData.success) {
                throw new Error(checkoutData.error?.message || 'Không thể cập nhật thông tin khách hàng.');
            }

            // ĐƯỜNG BAY 2: Gọi API khởi tạo cổng MoMo
            const momoRes = await fetch('http://localhost:5000/api/payments/momo/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId }),
            });

            const momoData = await momoRes.json();

            if (!momoRes.ok || !momoData.success) {
                throw new Error(momoData.error?.message || 'Khởi tạo thanh toán MoMo thất bại.');
            }

            // Lưu kết quả MoMo vào state để hiển thị QR / Link
            const paymentData = momoData.data;
            setMomoResult({
                payUrl: paymentData.payUrl,
                qrCodeUrl: paymentData.qrCodeUrl,
                transactionRef: paymentData.transactionRef,
                isMock: paymentData.isMock,
            });

        } catch (err: any) {
            console.error('[Payment Error]:', err);
            setErrorMessage(err.message || 'Có lỗi xảy ra khi kết nối thanh toán.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col pay-font-primary">
            <div className="w-full pay-text-primary border-b border-gray-100">
                <Header />
            </div>

            <PaymentStepper />

            <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pay-font-primary pay-text-primary">
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
                        <span>⚠️ {errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="underline font-bold text-red-800 text-xs ml-4"
                        >
                            Về chọn ghế
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Cột trái: Form nhập & Chọn phương thức */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={handleProcessPayment} className="space-y-6">
                            {/* Khối Thông tin khách hàng */}
                            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">
                                    1. Thông tin người đặt vé {bookingId > 0 ? `(Đơn #${bookingId})` : ''}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={customerInfo.customerName}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nguyễn Văn A"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email nhận vé</label>
                                            <input
                                                type="email"
                                                name="customerEmail"
                                                value={customerInfo.customerEmail}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="email@example.com"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                name="customerPhone"
                                                value={customerInfo.customerPhone}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="0912345678"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận độ tuổi</label>
                                        <select
                                            name="ageConfirmed"
                                            value={customerInfo.ageConfirmed}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        >
                                            <option value="P">P - Phù hợp với mọi độ tuổi</option>
                                            <option value="T13">T13 - Phim dành cho khán giả từ 13 tuổi trở lên</option>
                                            <option value="T16">T16 - Phim dành cho khán giả từ 16 tuổi trở lên</option>
                                            <option value="T18">T18 - Phim dành cho khán giả từ 18 tuổi trở lên</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Khối chọn cổng MoMo */}
                            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">2. Phương thức thanh toán</h3>
                                <div className="flex items-center space-x-3 p-4 border border-pink-500 bg-pink-50 rounded-lg cursor-pointer">
                                    <input type="radio" checked readOnly className="w-5 h-5 text-pink-600" />
                                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-8 h-8 object-contain" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Ví MoMo / QR Code MoMo</p>
                                        <p className="text-xs text-gray-500">Thanh toán an toàn, quét mã nhận vé ngay lập tức</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || bookingId <= 0}
                                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:bg-gray-400 cursor-pointer"
                            >
                                {loading ? '⏳ Đang khởi tạo đơn thanh toán...' : '💳 Mở cổng thanh toán MoMo'}
                            </button>
                        </form>
                    </div>

                    {/* Cột phải: Hiển thị Mã QR MoMo */}
                    <div className="lg:col-span-5 sticky top-4">
                        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Thông tin thanh toán</h3>

                            {momoResult ? (
                                <div className="text-center space-y-4">
                                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-md font-semibold">
                                        ✅ Tạo mã MoMo thành công!
                                    </div>

                                    {momoResult.qrCodeUrl && (
                                        <div className="flex flex-col items-center">
                                            <img
                                                src={momoResult.qrCodeUrl}
                                                alt="MoMo QR Code"
                                                className="w-48 h-48 border p-2 rounded-lg shadow-md"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Quét mã bằng ứng dụng MoMo để thanh toán</p>
                                        </div>
                                    )}

                                    <div className="pt-2 space-y-2">
                                        <a
                                            href={momoResult.payUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-2.5 bg-pink-600 text-white font-semibold rounded-lg text-sm hover:bg-pink-700 text-center shadow"
                                        >
                                            🔗 Chuyển sang Cổng MoMo Pay
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/processing?transactionRef=${momoResult.transactionRef}&bookingId=${bookingId}`)}
                                            className="block w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-200 cursor-pointer"
                                        >
                                            Kiểm tra kết quả thanh toán (Processing)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-4xl mb-2">📲</p>
                                    <p className="text-sm">Điền thông tin bên trái và bấm <br /> <strong>Mở cổng thanh toán MoMo</strong> để tạo mã QR.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <div className="w-full">
                <Footer />
            </div>
        </div>
    );
}