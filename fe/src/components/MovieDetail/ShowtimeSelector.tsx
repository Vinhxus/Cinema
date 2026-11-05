import { Calendar, Clapperboard, LocateFixed } from "lucide-react";
import Badge from "../MovieComponents/Badge";
import type { Availability, Cinema, ShowDate } from "../../data/movieDetail";

interface ShowtimeSelectorProps {
  dates: ShowDate[];
  cinemas: Cinema[];
  selectedDateId: string;
  selectedShowtimeId: string | null;
  onSelectDate: (dateId: string) => void;
  onSelectShowtime: (showtimeId: string) => void;
}

const AVAILABILITY_BADGE: Record<Availability, { label: string; className: string } | null> = {
  available: null,
  best: { label: "BEST", className: "border border-red-300 text-red-500" },
  few: { label: "FEW", className: "border border-amber-300 text-amber-600" },
};

export default function ShowtimeSelector({
  dates,
  cinemas,
  selectedDateId,
  selectedShowtimeId,
  onSelectDate,
  onSelectShowtime,
}: ShowtimeSelectorProps) {
  const hasShowtimes = cinemas.some((cinema) =>
    cinema.halls.some((hall) => hall.showtimes.length > 0),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-red-50 text-red-500">
            <Calendar className="h-3.5 w-3.5" />
          </span>
          <h2 className="font-['Outfit'] text-sm font-bold text-slate-900">Select Date &amp; Showtime</h2>
        </div>
        <div className="flex items-center gap-1.5 font-['Space_Grotesk'] text-[10px] font-semibold text-amber-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Updated every 30 seconds
        </div>
      </div>

      {/* Dải chọn ngày */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dates.map((date) => {
          const active = date.id === selectedDateId;
          return (
            <button
              key={date.id}
              type="button"
              onClick={() => onSelectDate(date.id)}
              aria-pressed={active}
              className={`flex min-w-[76px] shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition ${
                active
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-wide ${
                  active ? "text-red-600" : "text-slate-500"
                }`}
              >
                {date.weekDay}
              </span>
              <span
                className={`font-['Outfit'] text-lg font-bold leading-tight ${
                  active ? "text-red-600" : "text-slate-800"
                }`}
              >
                {date.day}
              </span>
              <span
                className={`font-['Space_Grotesk'] text-[9px] uppercase ${
                  active ? "text-red-500" : "text-slate-400"
                }`}
              >
                {date.month}
              </span>
              <span
                className={`mt-0.5 font-['Space_Grotesk'] text-[9px] font-medium ${
                  active ? "text-red-500" : "text-slate-400"
                }`}
              >
                {date.slots} slots
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách cụm rạp */}
      {cinemas.map((cinema) => (
        <article key={cinema.id} className="mt-3 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Clapperboard className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-['Outfit'] text-sm font-bold text-slate-900">
                  {cinema.name} <span className="text-amber-500">• {cinema.branch}</span>
                </h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-1 font-['Outfit'] text-[11px] text-slate-500">
                  <LocateFixed className="h-3 w-3 text-slate-400" />
                  {cinema.address} • {cinema.distance}
                </p>
              </div>
            </div>
            {cinema.perk && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-['Space_Grotesk'] text-[10px] font-semibold text-amber-700">
                {cinema.perk}
              </span>
            )}
          </div>

          {cinema.halls.map((hall) => (
            <div key={hall.id} className="mt-4">
              <div className="flex items-center gap-2 font-['Outfit'] text-[11px] font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {hall.format}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {hall.showtimes.map((showtime) => {
                  const active = showtime.id === selectedShowtimeId;
                  const badge = AVAILABILITY_BADGE[showtime.availability];

                  return (
                    <button
                      key={showtime.id}
                      type="button"
                      onClick={() => onSelectShowtime(showtime.id)}
                      aria-pressed={active}
                      className={`rounded-lg border px-3 py-2 text-left transition ${
                        active
                          ? "border-amber-500 bg-amber-50 ring-1 ring-amber-400"
                          : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-['Outfit'] text-sm font-bold text-slate-900">
                          {showtime.startTime}
                        </span>
                        {badge && <Badge className={badge.className}>{badge.label}</Badge>}
                      </div>
                      <p className="mt-0.5 font-['Space_Grotesk'] text-[9px] text-slate-400">
                        Ends {showtime.endTime}
                      </p>
                      <p className="font-['Space_Grotesk'] text-[9px] text-amber-600">
                        {showtime.hall} • {showtime.hallNote}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </article>
      ))}

      {!hasShowtimes && (
        <p className="py-10 text-center font-['Outfit'] text-sm text-slate-400">
          No showtimes available for this date.
        </p>
      )}
    </section>
  );
}
