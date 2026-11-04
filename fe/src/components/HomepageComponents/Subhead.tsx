import { ChevronDown } from 'lucide-react';

const Subhead = () => {
  return (
    <div className="mt-10 flex gap-3 px-4 py-4 border mx-20 rounded-2xl justify-center items-center bg-white">
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
            <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                <div className="inline-flex flex-col justify-start items-start">
                    <div className="w-3 h-2.5 bg-red-600" />
                </div>
                <div className="w-40 justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">Select film</div>
            </div>
            <div className="self-stretch relative flex flex-col justify-start items-start">
                <div className="self-stretch h-12 pl-3 pr-8 py-2 relative bg-slate-50 rounded-xl outline outline-slate-200 inline-flex justify-center items-center">
                    <div className="flex-1 inline-flex justify-between items-center">
                        <div className="self-stretch justify-center text-slate-800 text-sm font-normal font-['Outfit'] leading-5">Dune: Part Two (IMAX)</div>
                        <ChevronDown/>
                    </div>
                </div>
            </div>
        </div>
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
            <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                <div className="inline-flex flex-col justify-start items-start">
                    <div className="w-3 h-2.5 bg-orange-600" />
                </div>
                <div className="w-40 justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">Cinemas</div>
            </div>
            <div className="self-stretch relative flex flex-col justify-start items-start">
                <div className="self-stretch h-12 pl-3 pr-8 py-2 relative bg-slate-50 rounded-xl outline outline-slate-200 inline-flex justify-center items-center">
                    <div className="flex-1 inline-flex justify-between items-center">
                        <div className="self-stretch justify-center text-slate-800 text-sm font-normal font-['Outfit'] leading-5">CGV Landmark 81 (nearest · 1.8km)</div>
                        <ChevronDown/>
                    </div>
                </div>
            </div>
        </div>
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
            <div className="self-stretch inline-flex justify-start items-center gap-1.5">
                <div className="inline-flex flex-col justify-start items-start">
                    <div className="w-3 h-2.5 bg-orange-600" />
                </div>
                <div className="w-40 justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">ShowTime</div>
            </div>
            <div className="self-stretch relative flex flex-col justify-start items-start">
                <div className="self-stretch h-12 p-1 bg-slate-100 rounded-xl outline outline-slate-200/80 inline-flex justfy-start items-start gap-1">
                <div className="px-2 py-1 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-red-100 inline-flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-red-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">Thursday</div>
                    </div>
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-700 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">24/10</div>
                    </div>
                </div>
                <div className="px-2 py-1 rounded-lg inline-flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">Friday</div>
                    </div>
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-500 text-[10px] font-normal font-['Outfit'] leading-4">25/10</div>
                    </div>
                </div>
                <div className="px-4 py-1 rounded-lg inline-flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">Saturday</div>
                    </div>
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-500 text-[10px] font-normal font-['Outfit'] leading-4">26/10</div>
                    </div>
                </div>
                <div className="px-3.5 py-1 rounded-lg inline-flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">Sunday</div>
                    </div>
                    <div className="flex flex-col justify-start items-center">
                        <div className="text-center justify-center text-slate-500 text-[10px] font-normal font-['Outfit'] leading-4">27/10</div>
                    </div>
                </div>
            </div>
            
            </div>
        </div>
        <div className=" mt-5 h-12 px-3 relative bg-linear-to-r from-red-600 via-amber-600 to-amber-500 rounded-xl flex flex-1 justify-center items-center gap-1.5">
            <div className="inline-flex flex-col justify-center items-center">
                <div className="text-center justify-center text-white text-xs font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">WHAT’S ON TONIGHT?</div>
            </div>
        </div>
    </div>
  )
}

export default Subhead