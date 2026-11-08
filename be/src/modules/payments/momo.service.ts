import crypto from 'crypto';

export interface MomoCreatePaymentParams {
    orderId: string;
    amount: number;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
    extraData?: string;
}

export interface MomoConfig {
    partnerCode: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
}

export interface MomoPaymentResponse {
    partnerCode: string;
    orderId: string;
    requestId: string;
    amount: number;
    responseTime: number;
    message: string;
    resultCode: number;
    payUrl?: string;
    deeplink?: string;
    qrCodeUrl?: string;
}

export class MomoService {
    constructor(private config: MomoConfig) { }

    private generateSignature(rawSignature: string): string {
        return crypto
            .createHmac('sha256', this.config.secretKey) // Lưu ý: Cổng test MoMo hiện tại hỗ trợ chuẩn SHA256
            .update(rawSignature)
            .digest('hex');
    }

    async createPaymentUrl(params: MomoCreatePaymentParams): Promise<MomoPaymentResponse> {
        const { orderId, amount, orderInfo, redirectUrl, ipnUrl, extraData = '' } = params;
        const requestId = `${orderId}_${Date.now()}`;
        const requestType = 'captureWallet';

        // Thứ tự tham số chuẩn bảng chữ cái A-Z
        const rawSignature = `accessKey=${this.config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto
            .createHmac('sha256', this.config.secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode: this.config.partnerCode,
            partnerName: 'Test Cinema',
            storeId: 'MomoTestStore',
            requestId,
            amount: Number(amount),
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            extraData,
            requestType,
            signature,
        };

        const response = await fetch(this.config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        return (await response.json()) as MomoPaymentResponse;
    }
}