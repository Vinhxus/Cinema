import {useNavigate} from "react-router-dom";

interface ContinueProps {
  disabled?: boolean
}

const Continue = ( { disabled = false } : ContinueProps) => {
  const navigate = useNavigate();
  const style = disabled
    ? 'bg-[#979EA6] cursor-not-allowed'
    : 'bg-red-500 cursor-pointer'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => navigate('/food')}
      className={`w-28 h-max px-2 py-1.5 rounded-[20px] inline-flex justify-center items-center gap-2.5
        overflow-hidden ${style}`}
    >
      <span className="justify-center text-white text-base font-extrabold font-['Space_Grotesk']"> Continue → </span>
    </button>
  )
}

export default Continue