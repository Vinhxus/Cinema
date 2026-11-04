import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { Bell, History, User2 } from 'lucide-react'

// TODO: đổi cho khớp route "Booking History" của bạn phụ trách.
const BOOKING_HISTORY_PATH = '/booking-history'

export default function Header() {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-50 w-full h-20 bg-[#FFFFFF] flex border-b items-center justify-between gap-16 px-10">
      <Link to="/" className="text-3xl flex items-center gap-2 ml-4">
        <Logo />
        <span>
          <span className=" text-[#ECC904] font-bold">SE</span>
          <span className=" text-[#DC2626] font-bold">NEMA</span>
        </span>
      </Link>
      <div className="flex gap-6 justify-between w-200">
        <button className=""> SHOWTIME </button>
        <button> MOVIE </button>
        <button> CINEMAS & PRICES</button>
        <button> OFFERS </button>
      </div>
      <div className="flex gap-3 justify-end items-center">
        <button
          type="button"
          onClick={() => navigate(BOOKING_HISTORY_PATH)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-700 transition hover:border-amber-400 hover:text-amber-600"
        >
          <History className="h-4 w-4 text-amber-500" />
          Booking History
        </button>
        <button className="px-2 pt-2 pb-2.5 justify-center border-r">
          <Bell />
        </button>
        <Link to="/admin/login" className="px-2 pt-2 pb-2.5 justify-center flex gap-2">
          <button>
            <User2 />
          </button>
          <span> Member </span>
        </Link>
      </div>
    </div>
  )
}
