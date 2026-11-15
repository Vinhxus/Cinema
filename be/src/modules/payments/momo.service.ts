
import crypto from 'crypto';

interface MoMoCreateResponse {
    partnerCode: string;
    requestId: string;
    orderId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl?: string;
    deeplink?: string;
    qrCodeUrl?: string;
}

interface MoMoIpnPayload {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    orderInfo: string;
    orderType: string;
    transId: number;
    resultCode: number;
    message: string;
    payType: string;
    responseTime: number;
    extraData: string;
    signature: string;
}

export class MomoService {
    private readonly partnerCode: string;
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly endpoint: string;

    constructor() {
        this.partnerCode = process.env.MOMO_PARTNER_CODE || '';
        this.accessKey = process.env.MOMO_ACCESS_KEY || '';
        this.secretKey = process.env.MOMO_SECRET_KEY || '';

        // Sandbox hoặc Production
        this.endpoint =
            process.env.MOMO_ENDPOINT ||
            'https://test-payment.momo.vn/v2/gateway/api/create';

        if (!this.partnerCode || !this.accessKey || !this.secretKey) {
            throw new Error('Missing MoMo configuration in environment variables');
        }
    }

    // 1. Tạo chữ ký HMAC-SHA256
    private createSignature(rawSignature: string): string {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(rawSignature, 'utf8')
            .digest('hex');
    }

    // 2. So sánh chữ ký an toàn
    private compareSignature(
        signature: string,
        expectedSignature: string
    ): boolean {
        if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
            return false;
        }

        const received = Buffer.from(signature, 'hex');
        const expected = Buffer.from(expectedSignature, 'hex');

        return (
            received.length === expected.length &&
            crypto.timingSafeEqual(received, expected)
        );
    }

    // 3. Tạo URL thanh toán MoMo
    async createPaymentUrl(
        bookingId: number,
        amount: number,
        bookingCode: string
    ) {
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error('Invalid payment amount');
        }

        if (!bookingCode || bookingCode.length > 50) {
            throw new Error('Invalid booking code');
        }

        const requestId = `${bookingCode}_${Date.now()}`;
        const orderId = bookingCode;

        const orderInfo = `Thanh toán đơn hàng ${bookingCode}`;

        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;

        if (!redirectUrl || !ipnUrl) {
            throw new Error('Missing MoMo redirect or IPN URL');
        }

        const requestType = 'captureWallet';
        const extraData = '';

        // Chuỗi ký phải sắp xếp các trường theo đúng thứ tự MoMo quy định
        const rawSignature =
            `accessKey=${this.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&ipnUrl=${ipnUrl}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&partnerCode=${this.partnerCode}` +
            `&redirectUrl=${redirectUrl}` +
            `&requestId=${requestId}` +
            `&requestType=${requestType}`;

        const signature = this.createSignature(rawSignature);

        // Payload gửi đến MoMo
        const payload = {
            partnerCode: this.partnerCode,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            requestType,
            extraData,
            signature
        };

        // Gọi MoMo API
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            throw new Error(`MoMo API HTTP error: ${response.status}`);
        }

        const result = (await response.json()) as MoMoCreateResponse;

        if (result.resultCode !== 0 || !result.payUrl) {
            throw new Error(
                `MoMo payment creation failed: ${result.message}`
            );
        }

        return {
            bookingId,
            orderId: result.orderId,
            requestId: result.requestId,
            amount: result.amount,
            payUrl: result.payUrl,
            deeplink: result.deeplink,
            qrCodeUrl: result.qrCodeUrl
        };
    }

    // 4. Xác thực chữ ký IPN từ MoMo
    verifyIpnSignature(body: MoMoIpnPayload): boolean {
        if (!body || typeof body !== 'object') {
            return false;
        }

        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = body;

        // Kiểm tra dữ liệu bắt buộc
        if (
            typeof signature !== 'string' ||
            partnerCode !== this.partnerCode ||
            typeof amount !== 'number' ||
            typeof resultCode !== 'number' ||
            typeof transId !== 'number' ||
            typeof responseTime !== 'number' ||
            typeof orderId !== 'string' ||
            typeof requestId !== 'string' ||
            typeof orderInfo !== 'string' ||
            typeof orderType !== 'string' ||
            typeof message !== 'string' ||
            typeof payType !== 'string' ||
            typeof extraData !== 'string'
        ) {
            return false;
        }

        // Chuỗi ký IPN theo tài liệu MoMo
        const rawSignature =
            `accessKey=${this.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&message=${message}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&orderType=${orderType}` +
            `&partnerCode=${partnerCode}` +
            `&payType=${payType}` +
            `&requestId=${requestId}` +
            `&responseTime=${responseTime}` +
            `&resultCode=${resultCode}` +
            `&transId=${transId}`;

        const expectedSignature = this.createSignature(rawSignature);

        return this.compareSignature(signature, expectedSignature);
    }
}
