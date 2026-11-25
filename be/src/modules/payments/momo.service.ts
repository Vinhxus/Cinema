import crypto from 'node:crypto';

export interface MoMoCreateResponse {
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

export interface MoMoIpnPayload {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number | string;
    orderInfo: string;
    orderType: string;
    transId: number | string;
    resultCode: number | string;
    message: string;
    payType: string;
    responseTime: number | string;
    extraData: string;
    signature: string;
}

export class MomoService {
    public readonly partnerCode: string;
    public readonly accessKey: string;
    public readonly secretKey: string;
    public readonly endpoint: string;

    constructor() {
        this.partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
        this.accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
        this.secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1wa8nGNV8ua3ux05AmOmjaCW';
        this.endpoint =
            process.env.MOMO_ENDPOINT ||
            'https://test-payment.momo.vn/v2/gateway/api/create';

        if (!process.env.MOMO_PARTNER_CODE || !process.env.MOMO_ACCESS_KEY || !process.env.MOMO_SECRET_KEY) {
            console.warn('⚠️ [MomoService] Thiếu biến môi trường MoMo, đang sử dụng cấu hình mặc định Sandbox.');
        }
    }

    /**
     * 1. Tạo chữ ký HMAC-SHA256
     */
    public createSignature(rawSignature: string): string {
        return crypto
            .createHmac('sha256', this.secretKey)
            .update(rawSignature, 'utf8')
            .digest('hex');
    }

    /**
     * 2. So sánh chữ ký an toàn bằng timingSafeEqual
     */
    public compareSignature(
        signature: string,
        expectedSignature: string
    ): boolean {
        if (!signature || !expectedSignature) return false;
        if (!/^[a-fA-F0-9]{64}$/.test(signature) || !/^[a-fA-F0-9]{64}$/.test(expectedSignature)) {
            return false;
        }

        const received = Buffer.from(signature.toLowerCase(), 'hex');
        const expected = Buffer.from(expectedSignature.toLowerCase(), 'hex');

        return (
            received.length === expected.length &&
            crypto.timingSafeEqual(received, expected)
        );
    }

    /**
     * 3. Sinh chữ ký chuẩn cho Payload IPN (dùng cho cả verify lẫn test mock)
     */
    public buildIpnRawSignature(body: Omit<MoMoIpnPayload, 'signature'>): string {
        return (
            `accessKey=${this.accessKey}` +
            `&amount=${body.amount}` +
            `&extraData=${body.extraData ?? ''}` +
            `&message=${body.message ?? ''}` +
            `&orderId=${body.orderId}` +
            `&orderInfo=${body.orderInfo ?? ''}` +
            `&orderType=${body.orderType ?? ''}` +
            `&partnerCode=${this.partnerCode}` +
            `&payType=${body.payType ?? ''}` +
            `&requestId=${body.requestId}` +
            `&responseTime=${body.responseTime}` +
            `&resultCode=${body.resultCode}` +
            `&transId=${body.transId}`
        );
    }

    /**
     * 4. Tạo URL thanh toán MoMo API v2
     */
    async createPaymentUrl(
        bookingId: number,
        amount: number,
        transactionRef: string,
        bookingCode?: string
    ) {
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error(`Số tiền thanh toán không hợp lệ: ${amount}`);
        }

        if (!transactionRef) {
            throw new Error('Thiếu mã tham chiếu giao dịch (transactionRef)');
        }

        const requestId = `REQ_${transactionRef}_${Date.now()}`;
        const orderId = transactionRef;
        const code = bookingCode || `BK_${bookingId}`;
        const orderInfo = `Thanh toán vé xem phim đơn hàng ${code}`;

        const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/success';
        const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo/ipn';
        const requestType = 'captureWallet';
        const extraData = '';

        // Chuỗi ký theo thứ tự quy định trong tài liệu MoMo API v2
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

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'User-Agent': 'SenemaCinema/1.0'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok) {
                const result = (await response.json()) as MoMoCreateResponse;
                if (result.resultCode === 0 && result.payUrl) {
                    return {
                        bookingId,
                        orderId: result.orderId,
                        requestId: result.requestId,
                        amount: result.amount,
                        payUrl: result.payUrl,
                        deeplink: result.deeplink,
                        qrCodeUrl: result.qrCodeUrl,
                        isMock: false
                    };
                }
            }
            
            // Nếu Sandbox MoMo phản hồi lỗi gateway hoặc bị chặn WAF, ghi log rõ
            console.warn(`⚠️ [MomoService] Gateway Sandbox HTTP ${response.status}. Kích hoạt URL sandbox mô phỏng.`);
        } catch (fetchError: any) {
            console.warn(`⚠️ [MomoService] Không thể kết nối tới MoMo endpoint: ${fetchError.message}. Kích hoạt URL sandbox mô phỏng.`);
        }

        // URL fallback mô phỏng dành cho môi trường dev/test khi MoMo Sandbox offline/WAF chặn
        const mockPayUrl = `https://test-payment.momo.vn/v2/gateway/pay?orderId=${orderId}&amount=${amount}`;
        const mockQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPayUrl)}`;

        return {
            bookingId,
            orderId,
            requestId,
            amount,
            payUrl: mockPayUrl,
            deeplink: `momo://app?action=payWithApp&orderId=${orderId}`,
            qrCodeUrl: mockQrCodeUrl,
            isMock: true
        };
    }

    /**
     * 5. Xác thực chữ ký IPN từ MoMo
     */
    verifyIpnSignature(body: MoMoIpnPayload): boolean {
        if (!body || typeof body !== 'object') {
            return false;
        }

        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            signature
        } = body;

        if (!signature || typeof signature !== 'string') {
            return false;
        }

        if (partnerCode !== this.partnerCode) {
            console.warn(`[MomoService] partnerCode không khớp: ${partnerCode} vs ${this.partnerCode}`);
            return false;
        }

        if (!orderId || !requestId || amount === undefined || amount === null) {
            return false;
        }

        const rawSignature = this.buildIpnRawSignature(body);
        const expectedSignature = this.createSignature(rawSignature);

        return this.compareSignature(signature, expectedSignature);
    }
}
