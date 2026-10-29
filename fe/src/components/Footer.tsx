import Logo from './Logo'
import Badge from './MovieComponents/Badge';
import type { AgeRating } from './MovieComponents/MovieCard';

const AGE_STYLE: Record<AgeRating, string> = {
  P: "bg-emerald-600 text-white",
  C13: "bg-amber-500 text-white",
  C16: "bg-orange-500 text-white",
  C18: "bg-red-600 text-white",
};

function Footer() {
  return (
    <div className = "flex flex-col border">
        <div className='flex gap-10 px-12 py-5 items-center justify-center'> 
            <div className = "flex flex-col gap-4 w-1/3">
                <div className = "flex gap-2 items-center justify-start"> 
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
                <div className='text-start'> A system of cinema booking created by HCMUT dedicated students. </div>
                <div className = "flex items-center gap-2"> 
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 10.5V2.33333H2.33333V0H8.16667V4.66667H10.5V10.5H5.83333V8.16667H4.66667V10.5H0V10.5M1.16667 9.33333H2.33333V8.16667H1.16667V9.33333V9.33333M1.16667 7H2.33333V5.83333H1.16667V7V7M1.16667 4.66667H2.33333V3.5H1.16667V4.66667V4.66667M3.5 7H4.66667V5.83333H3.5V7V7M3.5 4.66667H4.66667V3.5H3.5V4.66667V4.66667M3.5 2.33333H4.66667V1.16667H3.5V2.33333V2.33333M5.83333 7H7V5.83333H5.83333V7V7M5.83333 4.66667H7V3.5H5.83333V4.66667V4.66667M5.83333 2.33333H7V1.16667H5.83333V2.33333V2.33333M8.16667 9.33333H9.33333V8.16667H8.16667V9.33333V9.33333M8.16667 7H9.33333V5.83333H8.16667V7V7" fill="#D97706"/>
                    </svg>
                    HCMC
                </div>
            </div>
            <div className = "flex flex-col gap-4 w-1/3">
                <div className = "flex gap-2 items-center justify-start font-bold text-2xl"> 
                    Customer Service
                </div>
                <div className = "flex gap-2 flex-col items-start"> 
                    <span>
                        Hotline: 
                        <span className="text-red-600 px-1"> 
                            1900 8888 
                        </span>
                        (1.000VND/ minute) 
                    </span>
                    <span> Email: senema@gmail.com </span>
                    <span> Questions  & Answers </span>
                    <span> Terms &  Policy </span>
                </div>
            </div>
            <div className = "flex flex-col gap-4 flex-1">
                <div className = "flex gap-2 items-center justify-start font-bold text-2xl"> 
                    Age Rating
                </div>
                <div className = "flex flex-col items-start gap-2"> 
                    <div> 
                        <Badge className={AGE_STYLE['P']}> 
                            P
                        </Badge>
                        <span> For all audiences </span>
                    </div>
                    <div> 
                        <Badge className={AGE_STYLE['C13']}> 
                            C13
                        </Badge>
                        <span> Restricted to 13+ </span>
                    </div>
                    <div> 
                        <Badge className={AGE_STYLE['C16']}> 
                            C16
                        </Badge>
                        <span> Restricted to 16+ </span>
                    </div>
                    <div> 
                        <Badge className={AGE_STYLE['C18']}> 
                            C18
                        </Badge>
                        <span> Restricted to 18+ </span>
                    </div>
    
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer