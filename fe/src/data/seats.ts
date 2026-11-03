import { SeatData } from '../components/seatComponents/Grid'

const normalRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const bookedIds = ['C05', 'C06', 'C07', 'C12', 'C13', 'C14']
const vipIds = ['C08', 'C09', 'C10']


const normalSeats: SeatData[] = normalRows.flatMap(row =>
  Array.from({ length: 14 }, (_, i): SeatData => {
    const id = `${row}${String(i + 1).padStart(2, '0')}`
    return {
      id,
      row,
      label: id,
      type: vipIds.includes(id) ? 'vip' : 'standard',
      isBooked: bookedIds.includes(id),
    }
  })
)

const coupleSeats: SeatData[] = [
  { id: 'J01', row: 'J', label: 'J01', type: 'couple', isBooked: false },
  { id: 'J02', row: 'J', label: 'J02', type: 'couple', isBooked: false },
]

export const seats = [...normalSeats, ...coupleSeats] //integrate normal and couple seats into one array