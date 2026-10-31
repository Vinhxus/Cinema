import dune from '../../assets/dune.png'

const Spot = () => {
  return (
    <div className="w-full self-stretch px-10 pb-32 flex flex-col justify-end items-start h-200 mt-10 bg-center"
    style={{ backgroundImage: `url(${dune})` }}>
    <div className="self-stretch flex flex-col justify-start items-start">
        <div className="pb-4 flex flex-col justify-start items-start">
            <div className="px-3.5 py-1.5 relative bg-slate-900/80 rounded-full outline outline-amber-500/30 backdrop-blur-[6px] inline-flex justify-start items-center gap-2">
                <div className="w-[460.98px] h-7 left-0 top-0 absolute bg-white/0 rounded-full shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg" />
                <div className="w-2 h-2 relative flex justify-start items-start">
                    <div className="w-2 h-2 left-0 top-0 absolute opacity-75 bg-amber-400 rounded-full" />
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                </div>
                <div className="flex justify-start items-center gap-1">
                    <div className="inline-flex flex-col justify-start items-start">
                        <div className="w-2.5 h-2.5 bg-amber-400" />
                    </div>
                    <div className="justify-center text-amber-400 text-xs font-semibold font-['Space_Grotesk'] leading-4 tracking-wide">CGV Landmark 81</div>
                </div>
                <div className="inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-slate-300 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">· 6 IMAX Laser screenings this afternoon &amp; evening</div>
                </div>
            </div>
        </div>
    </div>
    <div className="self-stretch inline-flex justify-between items-end">
        <div className="max-w-[672px] inline-flex flex-col justify-start items-start gap-3">
            <div className="self-stretch h-12 relative">
                <div className="px-2.5 py-0.5 left-0 top-[3px] absolute bg-red-600 rounded shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-white text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">C18</div>
                </div>
                <div className="px-2.5 py-0.5 left-[48.47px] top-[2px] absolute bg-amber-500/25 rounded outline outline-1 outline-offset-[-1px] outline-amber-400/40 inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-amber-300 text-[10px] font-semibold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">IMAX WITH LASER</div>
                </div>
                <div className="px-2.5 py-0.5 left-[175.30px] top-[3px] absolute bg-white/20 rounded backdrop-blur-[6px] inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-white text-[10px] font-semibold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">DOLBY ATMOS</div>
                </div>
                <div className="pl-1 left-[281.08px] top-[4px] absolute inline-flex justify-start items-center gap-1">
                    <div className="inline-flex flex-col justify-start items-start">
                        <div className="w-3.5 h-3 bg-amber-400" />
                    </div>
                    <div className="inline-flex flex-col justify-start items-start">
                        <div className="justify-center text-white text-xs font-bold font-['Space_Grotesk'] leading-4 tracking-wide">8.9</div>
                    </div>
                    <div className="inline-flex flex-col justify-start items-start">
                        <div className="justify-center text-slate-300 text-[10px] font-medium font-['Space_Grotesk'] leading-4 tracking-wide">/10 (RT 94%)</div>
                    </div>
                </div>
                <div className="left-[408.33px] top-[5px] absolute inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-slate-400 text-[10px] font-bold font-['Outfit'] leading-4 tracking-wide">•</div>
                </div>
                <div className="left-[422.64px] top-[4px] absolute inline-flex flex-col justify-start items-start">
                    <div className="justify-center text-slate-200 text-xs font-medium font-['Space_Grotesk'] leading-4 tracking-wide">166 min</div>
                </div>
            </div>
            <div className="self-stretch shadow-[0px_25px_25px_0px_rgba(0,0,0,0.15)] flex flex-col justify-start items-start">
                <div className="justify-center text-white text-5xl font-bold font-['Outfit'] uppercase leading-[56px]">DUNE: PART TWO</div>
            </div>
            <div className="w-[576px] max-w-[576px] flex flex-col justify-start items-start overflow-hidden">
                <div className="justify-center text-slate-200 text-base font-normal font-['Outfit'] leading-6">Paul Atreides joins Chani and the Fremen to avenge those who destroyed his<br/>family, torn between love and the fate of the universe.</div>
            </div>
            <div className="self-stretch pt-2 inline-flex justify-start items-center gap-4 flex-wrap content-center">
                <div className="px-6 py-3.5 relative bg-gradient-to-r from-red-600 to-amber-600 rounded-xl flex justify-start items-center gap-2">
                    <div className="w-36 h-11 left-0 top-0 absolute bg-white/0 rounded-xl shadow-[0px_4px_6px_-4px_rgba(220,38,38,0.30)] shadow-[0px_10px_15px_-3px_rgba(220,38,38,0.30)]" />
                    <div className="inline-flex flex-col justify-start items-start">
                        <div className="w-3.5 h-3 bg-white" />
                    </div>
                    <div className="justify-center text-white text-sm font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">BOOK NOW</div>
                </div>
                <div className="px-5 py-3.5 bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] flex justify-start items-center gap-2">
                    <div className="inline-flex flex-col justify-start items-center">
                        <div className="w-3.5 h-3.5 bg-amber-400" />
                    </div>
                    <div className="text-center justify-center text-white text-sm font-semibold font-['Space_Grotesk'] leading-4 tracking-tight">Watch HD Trailer</div>
                </div>
                <div className="px-3.5 py-3.5 bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] inline-flex flex-col justify-center items-center">
                    <div className="inline-flex justify-center items-start">
                        <div className="w-2.5 h-3.5 bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-3 relative bg-slate-900/80 rounded-2xl outline outline-1 outline-offset-[-1px] outline-amber-500/20 backdrop-blur-md inline-flex flex-col justify-start items-start gap-2">
            <div className="w-96 h-28 left-0 top-0 absolute bg-white/0 rounded-2xl shadow-2xl" />
            <div className="self-stretch px-1 inline-flex justify-start items-center gap-1.5">
                <div className="inline-flex flex-col justify-start items-start">
                    <div className="w-2 h-2.5 bg-red-500" />
                </div>
                <div className="justify-center text-amber-400 text-[10px] font-semibold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">IN THE SPOTLIGHT</div>
            </div>
            <div className="self-stretch inline-flex justify-start items-center gap-2.5">
                <div className="w-24 h-16 relative bg-white/0 rounded-lg shadow-[0px_0px_0px_2px_rgba(251,191,36,1.00)] inline-flex flex-col justify-center items-start overflow-hidden">
                    <img className="self-stretch flex-1 relative" src="https://placehold.co/96x64" />
                    <div className="w-24 h-16 left-0 top-0 absolute bg-slate-950/30" />
                    <div className="w-20 left-[6px] top-[47.50px] absolute flex flex-col justify-start items-start">
                        <div className="self-stretch h-3 relative overflow-hidden">
                            <div className="w-10 left-0 top-[-1px] absolute justify-center text-white text-[10px] font-semibold font-['Space_Grotesk'] leading-3 tracking-wide">Dune 2</div>
                        </div>
                    </div>
                </div>
                <div className="w-24 h-16 relative opacity-60 rounded-lg inline-flex flex-col justify-center items-start overflow-hidden">
                    <img className="self-stretch flex-1 relative" src="https://placehold.co/96x64" />
                    <div className="w-24 h-16 left-0 top-0 absolute bg-slate-950/40" />
                    <div className="w-20 left-[6px] top-[47.50px] absolute flex flex-col justify-start items-start">
                        <div className="self-stretch h-3 relative overflow-hidden">
                            <div className="w-20 left-0 top-[-1px] absolute justify-center text-white text-[10px] font-semibold font-['Space_Grotesk'] leading-3 tracking-wide">Godzilla x Kong</div>
                        </div>
                    </div>
                </div>
                <div className="w-24 h-16 relative opacity-60 rounded-lg inline-flex flex-col justify-center items-start overflow-hidden">
                    <img className="self-stretch flex-1 relative" src="https://placehold.co/96x64" />
                    <div className="w-24 h-16 left-0 top-0 absolute bg-slate-950/40" />
                    <div className="w-20 left-[6px] top-[47.50px] absolute flex flex-col justify-start items-start">
                        <div className="self-stretch h-3 relative overflow-hidden">
                            <div className="w-11 left-0 top-[-1px] absolute justify-center text-white text-[10px] font-semibold font-['Space_Grotesk'] leading-3 tracking-wide">Exhuma</div>
                        </div>
                    </div>
                </div>
                <div className="w-24 h-16 relative opacity-60 rounded-lg inline-flex flex-col justify-center items-start overflow-hidden">
                    <img className="self-stretch flex-1 relative" src="https://placehold.co/96x64" />
                    <div className="w-24 h-16 left-0 top-0 absolute bg-slate-950/40" />
                    <div className="w-20 left-[6px] top-[47.50px] absolute flex flex-col justify-start items-start">
                        <div className="self-stretch h-3 relative overflow-hidden">
                            <div className="w-11 left-0 top-[-1px] absolute justify-center text-white text-[10px] font-semibold font-['Space_Grotesk'] leading-3 tracking-wide">Panda 4</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export default Spot