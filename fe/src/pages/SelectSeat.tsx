import Screen from "../components/seatComponents/Screan"
import Step from "../components/common/Step1"
import Continue from "../components/seatComponents/Continue"
import Header from "../components/common/Header"
import Content from "../components/seatComponents/Content"
import Card from "../components/seatComponents/Card"
import {UpNote, BotNote} from "../components/seatComponents/Note"
import {SeatData, Grid} from '../components/seatComponents/Grid'
import { SubFooter } from "../components/seatComponents/SubFooter"

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

const seats = [...normalSeats, ...coupleSeats]

const SelectSeat = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 ">
        <Header/>
        <div className="px-10 py-5 border-4 border-[#B56100] w-306 bg-[#F5F7FC] gap-2 flex flex-col items-center justify-start">
            <Step/>
            <div className="flex gap-5 justify-around items-center w-full">
                <Card/>
                <Content/>
                <Continue/>
            </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-5 w-max">
            <UpNote/>
            <Screen/>
            <BotNote/>
        </div>
        <Grid seats={seats}/>      
        <SubFooter/>  
    </div>
  )
}

export default SelectSeat