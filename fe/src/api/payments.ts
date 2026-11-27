import { API_URL } from '../config'

// Backend luôn trả { success, data, error } (xem be/src/utils/response.js)
interface ApiEnvelope<T> {
  success: boolean
  data: T | null
  error: { message: string; details?: unknown } | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null
  if (!res.ok || !body?.success || body.data == null) {
    throw new Error(body?.error?.message ?? `Server error (${res.status})`)
  }
  return body.data
}

export interface CreateSepayResult {
  transactionRef: string
  amount: number // số tiền SERVER tính, có thể khác số FE đang hiển thị
  discount: number
  voucher: string | null
  expiresAt: number
  checkoutUrl: string
  fields: Record<string, string | number>
}

export function createSepayPayment(input: {
  clientId: string
  showtimeId: number
  customer: { name: string; phone: string; email: string }
  voucher?: string | null
}) {
  return request<CreateSepayResult>('/payments/sepay/create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type PaymentState = 'PENDING' | 'PAID' | 'FAILED' | 'NEED_SUPPORT'

export interface PaymentStatus {
  transactionRef: string
  state: PaymentState
  amount: number
  bookingCode: string | null
}

export function getPaymentStatus(ref: string) {
  return request<PaymentStatus>(`/payments/status/${encodeURIComponent(ref)}`)
}

/**
 * Chuyển trình duyệt sang trang thanh toán SePay.
 * SePay yêu cầu POST form (không phải GET link), nên tạo <form> ẩn rồi submit.
 * Các field (kể cả signature) đã được BACKEND ký sẵn, FE không giữ secret key.
 */
export function redirectToCheckout({ checkoutUrl, fields }: Pick<CreateSepayResult, 'checkoutUrl' | 'fields'>) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = checkoutUrl
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = String(value)
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
