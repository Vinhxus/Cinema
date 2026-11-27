import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle, LifeBuoy } from 'lucide-react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { getPaymentStatus, type PaymentStatus } from '../api/payments'
import { useBooking } from '../context/useBooking'
import { vnd } from '../utils/currency'

const POLL_MS = 3000
const MAX_WAIT_MS = 5 * 60 * 1000 // hỏi tối đa 5 phút rồi thôi

/**
 * SePay đưa khách về /payment/result?ref=...&result=success|error|cancel
 * KHÔNG tin tham số result trên URL (ai cũng sửa được). Trang này hỏi backend,
 * và backend chỉ báo PAID khi đã nhận IPN hợp lệ từ SePay.
 */
export default function PaymentResult() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { reset } = useBooking()
  const ref = params.get('ref') ?? ''
  const cancelled = params.get('result') === 'cancel'

  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!ref) {
      setError('Missing transaction reference')
      return
    }
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const startedAt = Date.now()

    const poll = async () => {
      try {
        const s = await getPaymentStatus(ref)
        if (stopped) return
        setStatus(s)
        setError(null)
        if (s.state !== 'PENDING') return // xong: PAID / FAILED / NEED_SUPPORT
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : 'Could not check the payment status')
      }
      // Khách bấm hủy ở SePay thì không cần đợi lâu
      if (cancelled || Date.now() - startedAt > MAX_WAIT_MS) {
        setTimedOut(true)
        return
      }
      timer = setTimeout(poll, POLL_MS)
    }

    poll()
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [ref, cancelled])

  // Thanh toán xong: xóa giỏ hàng trong context (chỉ 1 lần) rồi tự chuyển sang trang vé sau 3 giây
  const didReset = useRef(false)
  const bookingCode = status?.state === 'PAID' ? status.bookingCode : null
  useEffect(() => {
    if (!bookingCode) return
    if (!didReset.current) {
      didReset.current = true
      reset()
    }
    const t = setTimeout(() => navigate(`/bookings/${bookingCode}`, { replace: true }), 3000)
    return () => clearTimeout(t)
  }, [bookingCode, reset, navigate])

  const state = status?.state
  let view: { icon: ReactNode; title: string; desc: string }
  if (state === 'PAID') {
    view = {
      icon: <CheckCircle2 className="w-14 h-14 text-emerald-600" />,
      title: 'Payment successful!',
      desc: `Your booking code is ${status?.bookingCode}. Opening your tickets…`,
    }
  } else if (state === 'NEED_SUPPORT') {
    view = {
      icon: <LifeBuoy className="w-14 h-14 text-amber-600" />,
      title: 'Payment received, but tickets could not be issued',
      desc: `Your seat hold expired before the payment arrived. Please contact support with reference ${ref} for a refund.`,
    }
  } else if (state === 'FAILED' || (timedOut && state === 'PENDING' && cancelled)) {
    view = {
      icon: <XCircle className="w-14 h-14 text-rose-600" />,
      title: cancelled ? 'You cancelled the payment' : 'Payment failed',
      desc: 'If your seats are still on hold, you can go back and try again.',
    }
  } else if (timedOut) {
    view = {
      icon: <LifeBuoy className="w-14 h-14 text-amber-600" />,
      title: 'No confirmation yet',
      desc: `If you have already transferred the money, this page will update once the bank confirms. Reference: ${ref}.`,
    }
  } else {
    view = {
      icon: <Loader2 className="w-14 h-14 text-amber-500 animate-spin" />,
      title: 'Confirming your payment…',
      desc: 'Please keep this page open. This usually takes a few seconds after your transfer.',
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pay-font-primary pay-text-primary">
      <div className="w-full border-b border-gray-100">
        <Header />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="pay-card border border-gray-300 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="flex justify-center">{view.icon}</div>
          <h1 className="text-lg font-bold">{view.title}</h1>
          <p className="text-sm pay-text-secondary">{view.desc}</p>
          {status && (
            <p className="text-xs pay-text-secondary font-mono">
              {ref} · {vnd(status.amount)}
            </p>
          )}
          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex gap-2 justify-center pt-2">
            {bookingCode && (
              <button
                type="button"
                onClick={() => navigate(`/bookings/${bookingCode}`, { replace: true })}
                className="px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold cursor-pointer"
              >
                View tickets
              </button>
            )}
            {state === 'NEED_SUPPORT' && (
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer"
              >
                View booking history
              </button>
            )}
            {state === 'FAILED' || cancelled ? (
              <button
                type="button"
                onClick={() => navigate('/select-seat')}
                className="px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold cursor-pointer"
              >
                Back to booking
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold cursor-pointer"
            >
              Back to home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
