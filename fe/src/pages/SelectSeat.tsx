import Screen from "../components/seatComponents/Screan"
import Step from "../components/common/Step1"
import Continue from "../components/seatComponents/Continue"
import Header from "../components/common/Header"
import Content from "../components/seatComponents/Content"
import Card from "../components/seatComponents/Card"
import {UpNote, BotNote} from "../components/seatComponents/Note"
import {Grid} from '../components/seatComponents/Grid'
import { seats } from "../data/seats" 
import { SubFooter } from "../components/seatComponents/SubFooter"
import { useBooking } from "../context/useBooking"


const SelectSeat = () => {
  const { selectedIds, selectedSeats, seatsTotal, toggleSeat } = useBooking()
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 ">
        <Header/>
        <div className="px-10 py-5 border-4 border-[#B56100] w-306 bg-[#F5F7FC] gap-2 flex flex-col items-center justify-start">
            <Step/>
            <div className="flex gap-5 justify-around items-center w-full">
                <Card/>
                <Content selectedSeats={selectedSeats} totalPrice={seatsTotal} />
                <Continue/>
            </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-5 w-max">
            <UpNote/>
            <Screen/>
            <BotNote/>
        </div>
        <Grid seats={seats} selected={selectedIds} onToggle={toggleSeat} />     
        <SubFooter/>  
    </div>
  )
}

export default SelectSeat