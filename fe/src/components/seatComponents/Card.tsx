import { useBooking } from '../../context/useBooking'

const Card = () => {
  const { movie } = useBooking()

  return (
    <div className="h-36 inline-flex justify-start items-center">
      <div className="w-20 h-28 bg-slate-200 rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md inline-flex flex-col justify-center items-start overflow-hidden">
        {movie?.poster && (
          <img
            className="h-full w-full object-cover"
            src={movie.poster}
            alt={movie.title}
          />
        )}
      </div>
    </div>
  )
}

export default Card