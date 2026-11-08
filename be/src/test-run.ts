import { checkoutSchema } from './modules/orders/checkout.validation.js';
import { MomoService } from './modules/payments/momo.service.js';

async function main() {
    console.log('--- 1. KIỂM TRA ZOD VALIDATION ---');
    const testData = {
        customerName: 'Nguyễn Văn Tuấn',
        customerEmail: 'tuan@example.com',
        customerPhone: '0912345678',
        ageConfirmed: 'T18' as const,
    };

    const validationResult = checkoutSchema.safeParse(testData);
    if (validationResult.success) {
        console.log('✅ Validation hợp lệ!');
    }

    console.log('\n--- 2. TẠO URL THANH TOÁN MOMO ---');

    // Bộ tài khoản test chính thức từ MoMo Developer Documentation
    const momoTestConfig = {
        partnerCode: 'MOMO',
        accessKey: 'F8BBA842ECF85',
        secretKey: 'K951B6PE1wa8nGNV8ua3ux05AmOmjaCW',
        endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    };

    const momoService = new MomoService(momoTestConfig);

    const testPayment = {
        orderId: `MOMO_${Date.now()}`,
        amount: 50000,
        orderInfo: 'Thanh toan ve xem phim',
        redirectUrl: 'https://momo.vn',
        ipnUrl: 'https://momo.vn',
        extraData: '',
    };

    const result = await momoService.createPaymentUrl(testPayment);
    console.log('Kết quả từ MoMo:\n', result);

    if (result.resultCode === 0 && result.payUrl) {
        console.log('\n🎉 THÀNH CÔNG! Link thanh toán của bạn:');
        console.log(result.payUrl);
    }
}

main();