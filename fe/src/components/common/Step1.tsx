
const Step = () => {
  return (
    <div className="w-190 relative inline-flex justify-between items-center">
    <div className="w-180 h-0.5 left-0 absolute bg-slate-200" />
    <div className="px-2 rounded-lg flex justify-start items-center gap-2.5">
        <div className="w-9 h-9 relative bg-red-600 rounded-full flex justify-center items-center">
            <div className="w-9 h-9 left-0 top-0 absolute bg-white/0 rounded-full shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md shadow-[0px_0px_0px_4px_rgba(254,226,226,1.00)]" />
            <div className="text-center justify-center text-white text-sm font-bold font-['Outfit'] leading-5">1</div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-red-600 text-xs font-bold font-['Outfit'] leading-4">Step 1</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-900 text-sm font-bold font-['Outfit'] leading-4">Select seat(s)</div>
            </div>
        </div>
    </div>
    <div className="px-2 rounded-lg flex justify-start items-center gap-2.5">
        <div className="w-9 h-9 bg-slate-100 rounded-full outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center">
            <div className="text-center justify-center text-slate-400 text-sm font-semibold font-['Outfit'] leading-5">2</div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-xs font-medium font-['Outfit'] leading-4">Step2</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-sm font-medium font-['Outfit'] leading-4">Food</div>
            </div>
        </div>
    </div>
    <div className="px-2 rounded-lg flex justify-start items-center gap-2.5">
        <div className="w-9 h-9 bg-slate-100 rounded-full  outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center">
            <div className="text-center justify-center text-slate-400 text-sm font-semibold font-['Outfit'] leading-5">3</div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-xs font-medium font-['Outfit'] leading-4">Step3</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-sm font-medium font-['Outfit'] leading-4">Checkout</div>
            </div>
        </div>
    </div>
    <div className="px-2 rounded-lg flex justify-start items-center gap-2.5">
        <div className="w-9 h-9 bg-slate-100 rounded-full outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center">
            <div className="text-center justify-center text-slate-400 text-sm font-semibold font-['Outfit'] leading-5">4</div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-xs font-medium font-['Outfit'] leading-4">Step4</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-sm font-medium font-['Outfit'] leading-4">Pay</div>
            </div>
        </div>
    </div>
    <div className="px-2 rounded-lg flex justify-start items-center gap-2.5">
        <div className="w-9 h-9 bg-slate-100 rounded-full outline-1 outline-offset-[-1px] outline-slate-200 flex justify-center items-center">
            <div className="text-center justify-center text-slate-400 text-sm font-semibold font-['Outfit'] leading-5">5</div>
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-xs font-medium font-['Outfit'] leading-4">Step5</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start">
                <div className="justify-center text-slate-400 text-sm font-medium font-['Outfit'] leading-4">Detail</div>
            </div>
        </div>
    </div>
</div>
  )
}

export default Step