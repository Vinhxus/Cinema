interface ContinueProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

const Continue = ({ onClick, disabled = false, loading = false }: ContinueProps) => {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className="w-28 h-max px-2 py-1.5 bg-red-500 rounded-[20px] inline-flex justify-center items-center gap-2.5 overflow-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
    >
      <span className="justify-center text-white text-base font-extrabold font-['Space_Grotesk']">
        {loading ? 'Checking…' : 'Continue →'}
      </span>
    </button>
  )
}

export default Continue
