import React from 'react'

const Card = () => {
  return (
    <div className="h-36 inline-flex justify-start items-center">
      <div className="w-20 h-28 bg-white/0 rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md inline-flex flex-col justify-center items-start overflow-hidden">
        <img className="self-stretch h-36 relative" src="https://placehold.co/80x140" />
      </div>
    </div>
  )
}

export default Card