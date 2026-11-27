import { SePayPgClient } from 'sepay-pg-node';
import { SEPAY } from '../config/env.js';
import AppError from '../utils/AppError.js';

// Tạo client "lười": chỉ khởi tạo khi thật sự cần.
// Nhờ vậy server vẫn chạy được khi .env chưa có key SePay (ví dụ bạn cùng nhóm chỉ test MoMo).
let client = null;

function getClient() {
  if (!SEPAY.MERCHANT_ID || !SEPAY.SECRET_KEY) {
    throw new AppError('SEPAY_MERCHANT_ID / SEPAY_SECRET_KEY are not set in be/.env', 500);
  }
  if (!client) {
    client = new SePayPgClient({
      env: SEPAY.ENV, // 'sandbox' -> pay-sandbox.sepay.vn, 'production' -> pay.sepay.vn
      merchant_id: SEPAY.MERCHANT_ID,
      secret_key: SEPAY.SECRET_KEY,
    });
  }
  return client;
}

/**
 * Tạo dữ liệu cho form POST sang trang thanh toán của SePay.
 * SDK tự thêm merchant, operation và chữ ký HMAC-SHA256 (signature) -> FE chỉ việc submit.
 */
export function buildCheckout({ invoiceNumber, amount, description, returnUrl }) {
  const sepay = getClient();
  const fields = sepay.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER', // khách quét VietQR bằng app ngân hàng
    order_invoice_number: invoiceNumber,
    order_amount: amount,
    currency: 'VND',
    order_description: description,
    // 3 URL này CHỈ để đưa khách quay về web. Không dùng chúng để xác nhận đã trả tiền:
    // ai cũng gõ tay được ?payment=success. Nguồn sự thật là IPN.
    success_url: `${returnUrl}&result=success`,
    error_url: `${returnUrl}&result=error`,
    cancel_url: `${returnUrl}&result=cancel`,
  });
  return { checkoutUrl: sepay.checkout.initCheckoutUrl(), fields };
}

/**
 * Hỏi SePay trạng thái 1 đơn theo order_invoice_number (mã CINE... của mình).
 * Dùng khi IPN không về (tunnel đổi URL, server tắt lúc SePay gọi...).
 * Trả về object đơn của SePay ({ order_status, order_amount, ... }) hoặc null nếu không thấy.
 * order_status: CAPTURED = đã thanh toán, CANCELLED = đã hủy, AUTHENTICATION_NOT_NEEDED = đang chờ.
 */
export async function findSepayOrder(invoiceNumber) {
  const sepay = getClient();

  // Cách 1: API chi tiết đơn (SDK truyền order_invoice_number vào đường dẫn)
  try {
    const res = await sepay.order.retrieve(invoiceNumber);
    const order = res.data?.data;
    if (order?.order_invoice_number === invoiceNumber) return order;
  } catch {
    // một số phiên bản API chỉ nhận order_id nội bộ của SePay -> thử cách 2
  }

  // Cách 2: tìm trong danh sách đơn theo từ khóa
  const res = await sepay.order.all({ q: invoiceNumber, per_page: 10 });
  const list = Array.isArray(res.data?.data) ? res.data.data : [];
  return list.find((o) => o.order_invoice_number === invoiceNumber) ?? null;
}
