import { ReactNode } from 'react'
import { Heart, Check, X } from 'lucide-react'
import { Seat, SeatType, SeatStatus } from './Seat'

interface LegendItemProps {
  title: string
  desc: string
  seatLabel: string
  type?: SeatType
  status?: SeatStatus
  icon?: ReactNode
}

const LegendItem = ({
  title,
  desc,
  seatLabel,
  type = 'standard',
  status = 'available',
  icon,
}: LegendItemProps) => (
  <div className="flex items-center gap-3">
    {icon && (
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm">
        {icon}
      </span>
    )}

    <div className="flex flex-col leading-tight">
      <span className="text-sm font-bold">{title}</span>
      <span className="text-sm">{desc}</span>
    </div>

    {/* pointer-events-none: ghế trong chú thích chỉ để xem, không bấm được */}
    <div className="pointer-events-none">
      <Seat type={type} status={status}>
        {seatLabel}
      </Seat>
    </div>
  </div>
)

export const SubFooter = () => (
  <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-xl bg-white px-8 py-4 shadow-sm">
    <LegendItem
      title="Standard"
      desc="110,000 VND"
      seatLabel="A01"
      type="standard"
    />

    <LegendItem
      title="Vip"
      desc="130,000 VND"
      seatLabel="A01"
      type="vip"
    />

    <LegendItem
      icon={<Heart size={14} />}
      title="Sweetbox"
      desc="280,000 VND / pair"
      seatLabel="J01"
      type="couple"
    />

    <LegendItem
      icon={<Check size={14} />}
      title="Selected"
      desc="Your selection"
      seatLabel="A01"
      status="selected"
    />

    <LegendItem
      icon={<X size={14} />}
      title="Sold / Reserved"
      desc="Unavailable"
      seatLabel="A01"
      status="unavailable"
    />
  </div>
)