import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/useBooking";
import {
  fetchCinemas,
  fetchMovieShowtimes,
  fetchMovies,
  type CinemaSummary,
  type MovieSummary,
  type ShowtimeDate,
} from "../../services/discoveryApi";

/** value của option "Tất cả cụm rạp". */
const ALL_CINEMAS = 0;

const LABEL_ROW = "self-stretch inline-flex justify-start items-center gap-1.5";
const LABEL_TEXT =
  "w-40 justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide";
const SELECT_WRAPPER =
  "self-stretch h-12 pl-3 pr-8 py-2 relative bg-slate-50 rounded-xl outline outline-slate-200 flex justify-center items-center";
const SELECT_INPUT =
  "w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-normal font-['Outfit'] leading-5 text-slate-800 outline-none disabled:cursor-not-allowed disabled:text-slate-400";
const CHEVRON = "pointer-events-none absolute right-3 h-4 w-4 text-slate-500";
const MUTED_TEXT =
  "px-3 text-center text-slate-500 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide";

/**
 * Thanh chọn nhanh dưới Spotlight: Phim / Cụm rạp / Ngày chiếu đều lấy từ MySQL.
 * Bấm "WHAT’S ON TONIGHT?" => lưu phim vào BookingContext rồi mở trang chi tiết.
 */
const Subhead = () => {
  const navigate = useNavigate();
  const { movie: bookedMovie, selectMovie } = useBooking();

  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [cinemas, setCinemas] = useState<CinemaSummary[]>([]);
  const [dates, setDates] = useState<ShowtimeDate[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(
    bookedMovie?.id ?? null
  );
  const [selectedCinemaId, setSelectedCinemaId] = useState<number>(ALL_CINEMAS);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [error, setError] = useState("");

  // 1. Phim đang chiếu (GET /api/movies?status=now) + cụm rạp (GET /api/cinemas)
  useEffect(() => {
    let active = true;
    setLoadingMovies(true);

    Promise.all([fetchMovies({ status: "now" }), fetchCinemas()])
      .then(([movieResult, cinemaResult]) => {
        if (!active) return;

        setMovies(movieResult.items);
        setCinemas(cinemaResult.items);
        setError("");
        setSelectedMovieId((current) => {
          if (current && movieResult.items.some((item) => item.id === current)) {
            return current;
          }
          return movieResult.items[0]?.id ?? null;
        });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu phim/rạp.");
      })
      .finally(() => {
        if (active) setLoadingMovies(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Dải ngày có suất chiếu thật của phim đang chọn (GET /api/showtimes?movieId=)
  useEffect(() => {
    if (!selectedMovieId) {
      setDates([]);
      setSelectedDate("");
      return;
    }

    let active = true;
    setLoadingDates(true);

    fetchMovieShowtimes({ movieId: selectedMovieId })
      .then((result) => {
        if (!active) return;

        setDates(result.availableDates);
        setSelectedDate((current) =>
          result.availableDates.some((item) => item.date === current)
            ? current
            : result.availableDates[0]?.date ?? ""
        );
      })
      .catch((err: unknown) => {
        if (!active) return;

        setDates([]);
        setSelectedDate("");
        setError(err instanceof Error ? err.message : "Không tải được lịch chiếu.");
      })
      .finally(() => {
        if (active) setLoadingDates(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMovieId]);

  /** Lưu phim vào BookingContext rồi sang trang chi tiết kèm ngày/rạp đã chọn. */
  const handleSubmit = () => {
    const movie = movies.find((item) => item.id === selectedMovieId);
    if (!movie) return;

    selectMovie(movie);

    const params = new URLSearchParams();
    if (selectedDate) params.set("date", selectedDate);
    if (selectedCinemaId !== ALL_CINEMAS) {
      params.set("cinemaId", String(selectedCinemaId));
    }

    const query = params.toString();
    const detailPath = `/movie/${selectedMovieId}`;
    navigate(query ? `${detailPath}?${query}` : detailPath);
  };

  return (
    <>
      {error && (
        <p className="mx-20 mt-2 text-[11px] font-medium text-red-600">{error}</p>
      )}

      <div className="mt-10 flex gap-3 px-4 py-4 border mx-20 rounded-2xl justify-center items-center bg-white">
        {/* SELECT FILM */}
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
          <div className={LABEL_ROW}>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="w-3 h-2.5 bg-red-600" />
            </div>
            <div className={LABEL_TEXT}>Select film</div>
          </div>
          <div className="self-stretch relative flex flex-col justify-start items-start">
            <div className={SELECT_WRAPPER}>
              <select
                aria-label="Chọn phim"
                value={selectedMovieId ?? ""}
                onChange={(event) =>
                  setSelectedMovieId(Number(event.target.value) || null)
                }
                disabled={loadingMovies || movies.length === 0}
                className={SELECT_INPUT}
              >
                {loadingMovies ? (
                  <option value="">Đang tải phim…</option>
                ) : movies.length === 0 ? (
                  <option value="">Chưa có phim đang chiếu</option>
                ) : (
                  movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>
        </div>

        {/* CINEMAS */}
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
          <div className={LABEL_ROW}>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="w-3 h-2.5 bg-orange-600" />
            </div>
            <div className={LABEL_TEXT}>Cinemas</div>
          </div>
          <div className="self-stretch relative flex flex-col justify-start items-start">
            <div className={SELECT_WRAPPER}>
              <select
                aria-label="Chọn cụm rạp"
                value={selectedCinemaId}
                onChange={(event) =>
                  setSelectedCinemaId(Number(event.target.value) || ALL_CINEMAS)
                }
                disabled={cinemas.length === 0}
                className={SELECT_INPUT}
              >
                <option value={ALL_CINEMAS}>Tất cả cụm rạp</option>
                {cinemas.map((cinema) => (
                  <option key={cinema.cinemaId} value={cinema.cinemaId}>
                    {cinema.label || cinema.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={CHEVRON} />
            </div>
          </div>
        </div>

        {/* SHOWTIME: dải ngày thật từ DB */}
        <div className="self-stretch inline-flex flex-col justify-start items-start gap-1 w-1/4">
          <div className={LABEL_ROW}>
            <div className="inline-flex flex-col justify-start items-start">
              <div className="w-3 h-2.5 bg-orange-600" />
            </div>
            <div className={LABEL_TEXT}>ShowTime</div>
          </div>
          <div className="self-stretch relative flex flex-col justify-start items-start">
            <div className="self-stretch h-12 p-1 bg-slate-100 rounded-xl outline outline-slate-200/80 inline-flex justify-start items-center gap-1 overflow-x-auto">
              {loadingDates && <span className={MUTED_TEXT}>Đang tải…</span>}
              {!loadingDates && dates.length === 0 && (
                <span className={MUTED_TEXT}>Chưa có suất chiếu</span>
              )}
              {!loadingDates &&
                dates.map((item) => {
                  const isActive = item.date === selectedDate;

                  return (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      aria-pressed={isActive}
                      title={`${item.fullName} · ${item.total} suất chiếu`}
                      className={
                        isActive
                          ? "shrink-0 px-2 py-1 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-red-100 inline-flex flex-col justify-center items-center"
                          : "shrink-0 px-2 py-1 rounded-lg inline-flex flex-col justify-center items-center hover:bg-white/60"
                      }
                    >
                      <span
                        className={
                          isActive
                            ? "text-center justify-center text-red-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide"
                            : "text-center justify-center text-slate-600 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide"
                        }
                      >
                        {item.weekDay}
                      </span>
                      <span
                        className={
                          isActive
                            ? "text-center justify-center text-slate-700 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide"
                            : "text-center justify-center text-slate-500 text-[10px] font-normal font-['Outfit'] leading-4"
                        }
                      >
                        {item.day}/{item.date.slice(5, 7)}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedMovieId}
          className="mt-5 h-12 px-3 relative bg-linear-to-r from-red-600 via-amber-600 to-amber-500 rounded-xl flex flex-1 justify-center items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex flex-col justify-center items-center">
            <span className="text-center justify-center text-white text-xs font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">
              WHAT’S ON TONIGHT?
            </span>
          </span>
        </button>
      </div>
    </>
  );
};

export default Subhead;