import type { ReactNode } from 'react'
import { Heart, Check, X, Clock } from 'lucide-react'
import { Seat, type SeatType, type SeatStatus } from './Seat'
import { vnd } from '../../utils/currency'

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

interface SubFooterProps {
  /** Giá theo loại ghế của suất đang xem (lấy từ server). Thiếu loại nào thì ẩn loại đó. */
  prices?: Partial<Record<SeatType, number>>
}

export const SubFooter = ({ prices = {} }: SubFooterProps) => (
  <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-xl bg-white px-8 py-4 shadow-sm">
    {prices.standard != null && (
      <LegendItem title="Standard" desc={vnd(prices.standard)} seatLabel="A01" type="standard" />
    )}
    {prices.vip != null && <LegendItem title="Vip" desc={vnd(prices.vip)} seatLabel="A01" type="vip" />}
    {prices.couple != null && (
      <LegendItem
        icon={<Heart size={14} />}
        title="Sweetbox"
        desc={`${vnd(prices.couple)} / pair`}
        seatLabel="H01"
        type="couple"
      />
    )}

    <LegendItem icon={<Check size={14} />} title="Selected" desc="Your selection" seatLabel="A01" status="selected" />
    <LegendItem icon={<Clock size={14} />} title="Held" desc="Someone is holding" seatLabel="A01" status="held" />
    <LegendItem icon={<X size={14} />} title="Sold" desc="Unavailable" seatLabel="A01" status="unavailable" />
  </div>
)
