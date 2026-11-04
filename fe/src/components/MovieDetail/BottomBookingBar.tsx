import { ChevronRight, Ticket } from "lucide-react";
import Badge from "../MovieComponents/Badge";
import type { MovieDetailData } from "../../data/movieDetail";
import { AGE_LABEL, formatVnd } from "../../data/movieDetail";

export interface BookingSelection {
  dateLabel: string;
  time: string;
  cinemaName: string;
  hallName: string;
  seatsLeft: string;
}

interface BottomBookingBarProps {
  movie: MovieDetailData;
  selection: BookingSelection | null;
  price: number;
  onChangeShowtime: () => void;
  onBookNow: () => void;
}

export default function BottomBookingBar({
  movie,
  selection,
  price,
  onChangeShowtime,
  onBookNow,
}: BottomBookingBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        {/* Thông tin phim + suất đã chọn */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-11 w-11 shrink-0 rounded-md border border-white/10 object-cover"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wide text-white">
                {movie.title}
              </p>
              <Badge className="bg-red-600 text-white">{AGE_LABEL[movie.age]}</Badge>
              <Badge className="bg-amber-500/20 text-amber-300">{movie.formats[0]}</Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1 truncate font-['Outfit'] text-[11px] text-slate-400">
              <Ticket className="h-3 w-3 shrink-0 text-slate-500" />
              {selection
                ? `${selection.time} (${selection.dateLabel}) · ${selection.cinemaName} (${selection.hallName}) · ${selection.seatsLeft}`
                : "Select a date & showtime to continue"}
            </p>
          </div>
        </div>

        {/* Giá vé + hành động */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-['Space_Grotesk'] text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Ticket from
            </p>
            <p className="font-['Outfit'] text-sm font-bold text-white">
              {formatVnd(price)}{" "}
              <span className="font-['Outfit'] text-[10px] font-normal text-slate-400">/seat</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onChangeShowtime}
            className="font-['Space_Grotesk'] text-xs font-medium text-slate-300 transition hover:text-white"
          >
            Change Showtime
          </button>

          <button
            type="button"
            onClick={onBookNow}
            disabled={!selection}
            className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-red-600 to-amber-500 px-5 py-2.5 font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-red-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Book Now
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
