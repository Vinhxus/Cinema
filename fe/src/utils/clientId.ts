// Mã định danh cố định của TRÌNH DUYỆT này (khách vãng lai chưa có tài khoản).
// socket.id đổi mỗi lần reload, còn clientId nằm trong localStorage nên giữ nguyên
// -> server nhận ra "vẫn là người đó" và trả lại đúng các ghế đang giữ.
const KEY = 'senema.clientId'

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}

export function getClientId(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved
    const id = randomId()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    // localStorage bị chặn (chế độ riêng tư...) -> dùng id tạm cho phiên này
    return randomId()
  }
}
