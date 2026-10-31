import Logo from '../components/Logo'
import {Bell, User2} from 'lucide-react'

export default function Header() {
  return (
    <div className="sticky top-0 z-50 w-full h-20 bg-[#FFFFFF] flex border-b items-center justify-between gap-16 px-10">
        <div className="text-3xl flex gap-2 ml-4 ">
        <Logo/>
        <span>
            <span className = " text-[#ECC904] font-bold">
                SE
            </span>
            <span className = " text-[#DC2626] font-bold">
                NEMA
            </span>
        </span>
        
      </div>
      <div className="flex gap-6 justify-end w-200">
        <button className=""> SHOWTIME </button>
        <button> MOVIE </button>
        <button> CINEMAS & PRICES</button>
        <button> OFFERS </button>
      </div>
      <div className="flex gap-3 justify-end">
        <button className="px-2 pt-2 pb-2.5 justify-center border-r">
          <Bell/>
        </button>
        <div className="px-2 pt-2 pb-2.5 justify-center flex gap-2">
          <button>
            <User2/>
          </button>
          <span> Member </span>
        </div>
      </div>
    </div>
  )
}
