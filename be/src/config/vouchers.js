// Danh sách mã giảm giá — NGUỒN SỰ THẬT nằm ở backend.
// FE chỉ gửi TÊN mã, server tự tra số tiền giảm -> người dùng không sửa được số tiền.
// (Sau này muốn quản lý trên trang admin thì chuyển sang 1 bảng `vouchers` trong DB.)
export const VOUCHERS = {
  CINEVIP10: 25000,
  VINHDEPTRAI: 100000,
};

/**
 * Tính số tiền được giảm.
 * - Mã không tồn tại -> trả null (service sẽ báo lỗi)
 * - Không giảm quá mức để số tiền còn lại < minAmount
 *   (cổng thanh toán không nhận đơn 0đ, nên luôn chừa lại tối thiểu minAmount)
 */
export function computeVoucherDiscount(code, total, minAmount) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (!normalized) return { code: null, discount: 0 };
  if (!(normalized in VOUCHERS)) return null;
  const discount = Math.max(0, Math.min(VOUCHERS[normalized], total - minAmount));
  return { code: normalized, discount };
}
