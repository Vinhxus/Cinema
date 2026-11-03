import {useNavigate} from "react-router-dom";

const Continue = () => {
  const navigate = useNavigate();
  return (
    <button 
      className="w-28 h-max px-2 py-1.5 bg-red-500 rounded-[20px] inline-flex justify-center items-center gap-2.5 overflow-hidden cursor-pointer"
      onClick={() => navigate("/food")}
      >
        <span className="justify-center text-white text-base font-extrabold font-['Space_Grotesk']"> Continue → </span>
    </button>
  )
}

export default Continue