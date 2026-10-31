import React from 'react'

const Content = () => {
  return (
    <div className="w-[860px] inline-flex justify-between items-center">
    <div className="w-34 inline-flex flex-col justify-start items-start">
        <div className="self-stretch h-6 justify-center text-black text-xl font-bold font-['Space_Grotesk'] leading-6">DUNE: PART 2</div>
        <div className="self-stretch h-5 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">2D</div>
        <div className="w-9 h-4 px-2 py-0.5 bg-red-600 rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col justify-start items-start">
            <div className="self-stretch h-3 justify-center text-white text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">C18</div>
        </div>
    </div>
    <div className="w-[700px] flex justify-start items-start">
        <div className="w-96 h-20 inline-flex flex-col justify-center items-start gap-1 overflow-hidden">
            <div className="w-[725px] h-7 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">Cinema: Hung Vuong plaza</div>
            <div className="w-[725px] h-7 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">Showtime: 16:10, 11/10/2026</div>
        </div>
        <div className="w-96 inline-flex flex-col justify-start items-start gap-1 overflow-hidden">
            <div className="w-64 h-7 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">Room: Cinema 1</div>
            <div className="w-56 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">Seat: G11, G12 (standard)</div>
            <div className="w-72 h-7 justify-center text-black text-base font-normal font-['Space_Grotesk'] leading-6">Price: 220.000 vnđ</div>
        </div>
    </div>
</div>
  )
}

export default Content