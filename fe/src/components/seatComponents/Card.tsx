import { useState } from 'react'

interface CardProps {
  poster?: string | null
  title?: string
}

const Card = ({ poster, title }: CardProps) => {
  // Ảnh lỗi (đường dẫn trong DB không tồn tại) -> ẩn, chỉ còn khung xám
  const [broken, setBroken] = useState(false)

  return (
    <div className="h-36 inline-flex justify-start items-center">
      <div className="w-20 h-28 bg-slate-200 rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md inline-flex flex-col justify-center items-start overflow-hidden">
        {poster && !broken && (
          <img
            className="h-full w-full object-cover"
            src={poster}
            alt={title ?? ''}
            onError={() => setBroken(true)}
          />
        )}
      </div>
    </div>
  )
}

export default Card
