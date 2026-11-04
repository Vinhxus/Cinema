import {Speaker, Video} from 'lucide-react'

export const UpNote = () => {
  return (
    <div className="self-stretch inline-flex justify-between items-center gap-10">
    <div className="flex justify-start items-center gap-1">
        <div className="inline-flex flex-col justify-start items-start">
            <Speaker/>
        </div>
        <div className="justify-center text-black text-base font-normal font-['Nimbus_Sans'] uppercase leading-6 tracking-wide">IMAX LEFT SPEAKER</div>
    </div>
    <div className="px-3 py-1 rounded-full inline-flex flex-col justify-start items-start">
        <div className="justify-center text-black text-base font-bold font-['Nimbus_Sans'] uppercase leading-6 tracking-widest">OPTIMAL VIEWING DISTANCE: ROWS E-H</div>
    </div>
    <div className="flex justify-start items-center gap-1">
        <div className="justify-center text-black text-base font-normal font-['Nimbus_Sans'] uppercase leading-6 tracking-wide">IMAX RIGHT SPEAKER</div>
        <div className="inline-flex flex-col justify-start items-start">
            <Speaker/>
        </div>
    </div>
</div>
  )
}

export const BotNote = () => {
  return (
    <div className="inline-flex justify-start items-center gap-2">
        <div className="inline-flex flex-col justify-start items-start">
            <Video/>
        </div>
        <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center text-black text-base font-bold font-['Nimbus_Sans'] uppercase leading-6 tracking-widest">CURVED SCREEN • IMAX LASER CURVE</div>
        </div>
    </div>
  )
}
