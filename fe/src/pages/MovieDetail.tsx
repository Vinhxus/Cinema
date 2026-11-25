import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import MovieHero from "../components/MovieDetail/MovieHero";
import ShowtimeSelector from "../components/MovieDetail/ShowtimeSelector";
import MovieRatingsAndCast from "../components/MovieDetail/MovieRatingsAndCast";
import BottomBookingBar from "../components/MovieDetail/BottomBookingBar";
import type { BookingSelection } from "../components/MovieDetail/BottomBookingBar";
import { RATINGS, TICKET_PRICE } from "../data/movieDetail";
import type { Cinema, MovieDetailData, ShowDate } from "../data/movieDetail";
import { useBooking } from "../context/useBooking";
import type { ShowtimeInfo } from "../context/Booking";
import {
  fetchMovieDetail,
  fetchMovieShowtimes,
  mapShowtimesToView,
  toBookingMovie,
} from "../services/discoveryApi";
import type { MovieShowtimesView } from "../services/discoveryApi";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showtimeSectionRef = useRef<HTMLDivElement>(null);

  const {
    movie: bookingMovie,
    showtime: bookingShowtime,
    selectMovie,
    selectShowtime,
  } = useBooking();

  const routeMovieId = Number(id);
  const movieId =
    Number.isInteger(routeMovieId) && routeMovieId > 0 ? routeMovieId : bookingMovie?.id ?? null;

  // Trang chủ đẩy sang kèm ?date=YYYY-MM-DD&cinemaId=<CinemaID> từ widget lịch chiếu rút gọn
  const queryDate = searchParams.get("date") ?? "";
  const queryCinemaId = Number(searchParams.get("cinemaId")) || 0;

  const [detail, setDetail] = useState<MovieDetailData | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [detailNonce, setDetailNonce] = useState(0);

  const [showtimes, setShowtimes] = useState<MovieShowtimesView | null>(null);
  const [selectedDateISO, setSelectedDateISO] = useState(queryDate);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const [showtimeError, setShowtimeError] = useState("");
  const [showtimeNonce, setShowtimeNonce] = useState(0);

  // selectMovie đổi identity mỗi lần context render => giữ trong ref để effect chỉ chạy theo movieId
  const selectMovieRef = useRef(selectMovie);
  useEffect(() => {
    selectMovieRef.current = selectMovie;
  }, [selectMovie]);

  // 1. Chi tiết phim: GET /api/movies/:id
  useEffect(() => {
    if (!movieId) {
      setDetail(null);
      setIsLoadingDetail(false);
      return;
    }

    let active = true;
    setIsLoadingDetail(true);
    setDetailError("");

    fetchMovieDetail(movieId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
        // Đồng bộ BookingContext để trang chọn ghế / thanh toán luôn có phim đang xem
        selectMovieRef.current(toBookingMovie(data));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setDetail(null);
        setDetailError(err instanceof Error ? err.message : "Không tải được thông tin phim.");
      })
      .finally(() => {
        if (active) setIsLoadingDetail(false);
      });

    return () => {
      active = false;
    };
  }, [movieId, detailNonce]);

  // 2. Lịch chiếu thật: GET /api/showtimes?movieId=&date=&cinemaId=
  useEffect(() => {
    if (!movieId) {
      setShowtimes(null);
      setIsLoadingShowtimes(false);
      return;
    }

    let active = true;
    setIsLoadingShowtimes(true);

    fetchMovieShowtimes({
      movieId,
      date: selectedDateISO || undefined,
      cinemaId: queryCinemaId || undefined,
    })
      .then((result) => {
        if (!active) return;
        const view = mapShowtimesToView(result);
        setShowtimes(view);
        setShowtimeError("");
        setSelectedShowtimeId(null);
        // Ngày đang chọn không còn suất nào -> nhảy về ngày đầu tiên BE trả về
        setSelectedDateISO((current) =>
          current && view.dates.some((date) => date.id === current)
            ? current
            : view.dates[0]?.id ?? "",
        );
      })
      .catch((err: unknown) => {
        if (!active) return;
        setShowtimes(null);
        setSelectedShowtimeId(null);
        setShowtimeError(err instanceof Error ? err.message : "Không tải được lịch chiếu.");
      })
      .finally(() => {
        if (active) setIsLoadingShowtimes(false);
      });

    return () => {
      active = false;
    };
  }, [movieId, selectedDateISO, queryCinemaId, showtimeNonce]);

  const dates = useMemo<ShowDate[]>(() => showtimes?.dates ?? [], [showtimes]);
  const cinemas = useMemo<Cinema[]>(() => showtimes?.cinemas ?? [], [showtimes]);
  const totals = showtimes?.totals ?? null;

  const selected = useMemo(() => {
    if (!selectedShowtimeId) return null;

    for (const cinema of cinemas) {
      for (const hall of cinema.halls) {
        const showtime = hall.showtimes.find((item) => item.id === selectedShowtimeId);
        if (showtime) return { cinema, showtime };
      }
    }

    return null;
  }, [cinemas, selectedShowtimeId]);

  const selectedDate = dates.find((date) => date.id === selectedDateISO) ?? null;

  const selection: BookingSelection | null =
    selected && selectedDate
      ? {
          dateLabel: `${selectedDate.fullName}, ${selectedDate.day} ${selectedDate.month}`,
          time: selected.showtime.startTime,
          cinemaName: selected.cinema.name,
          hallName: selected.showtime.hall,
          seatsLeft: selected.showtime.seatsLeft,
        }
      : null;

  const handleSelectDate = (dateId: string) => {
    setSelectedDateISO(dateId);
    setSelectedShowtimeId(null);
  };

  const handleChangeShowtime = () => {
    showtimeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBookNow = () => {
    if (!selected || !selectedDate) return;

    const info: ShowtimeInfo = {
      id: selected.showtime.id,
      showtimeId: selected.showtime.showtimeId ?? Number(selected.showtime.id),
      time: selected.showtime.startTime,
      date: `${selectedDate.fullName}, ${selectedDate.day} ${selectedDate.month}`,
      dateISO: selectedDate.id,
      cinemaName: selected.cinema.name,
      hallName: selected.showtime.hall,
      price: selected.showtime.price,
    };

    // selectShowtime luôn xóa ghế đã chọn, nên chỉ gọi khi thật sự đổi suất
    const isSameShowtime =
      bookingShowtime?.id === info.id && bookingShowtime?.dateISO === info.dateISO;
    if (!isSameShowtime) selectShowtime(info);

    navigate("/select-seat");
  };

  // Không xác định được phim -> về trang chủ
  if (!movieId) return <Navigate to="/" replace />;
  if (!detail) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-slate-50">
        <Header />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24">
          {isLoadingDetail ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              <p className="font-['Outfit'] text-sm text-slate-500">Đang tải thông tin phim…</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <p className="font-['Outfit'] text-sm font-bold text-slate-800">
                Không mở được trang phim
              </p>
              <p className="max-w-md text-center font-['Outfit'] text-xs text-slate-500">
                {detailError}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailNonce((value) => value + 1)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 font-['Space_Grotesk'] text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Thử lại
                </button>
                <Link
                  to="/"
                  className="rounded-lg border border-slate-300 px-4 py-2 font-['Space_Grotesk'] text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Về trang chủ
                </Link>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 pb-24">
      <Header />

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-1.5 px-6 py-2.5 font-['Outfit'] text-[11px] text-slate-500">
          <Link to="/" className="transition hover:text-slate-900">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <Link to="/" className="transition hover:text-slate-900">
            Now Showing
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="truncate font-semibold text-slate-800">{detail.title}</span>
        </div>
      </nav>

      <MovieHero movie={detail} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div ref={showtimeSectionRef} className="scroll-mt-4 lg:col-span-2">
            {/* Đang lọc theo cụm rạp người dùng chọn ở trang chủ */}
            {queryCinemaId > 0 && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                <p className="font-['Outfit'] text-[11px] text-amber-800">
                  Đang chỉ hiện lịch chiếu của cụm rạp bạn chọn ở trang chủ.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/movie/${detail.id}${selectedDateISO ? `?date=${selectedDateISO}` : ""}`,
                    )
                  }
                  className="font-['Space_Grotesk'] text-[11px] font-semibold text-amber-700 underline transition hover:text-amber-900"
                >
                  Xem tất cả cụm rạp
                </button>
              </div>
            )}

            {totals && (
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>{totals.cinemas} cụm rạp</span>
                <span className="text-slate-600">{totals.showtimes} suất chiếu</span>
                <span className="text-emerald-600">{totals.open} đang mở bán</span>
                <span>{totals.soldOut} hết vé</span>
                <span>{totals.closed} đã đóng</span>
              </div>
            )}

            {showtimeError && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
                <p className="font-['Outfit'] text-[11px] text-red-700">{showtimeError}</p>
                <button
                  type="button"
                  onClick={() => setShowtimeNonce((value) => value + 1)}
                  className="flex items-center gap-1.5 font-['Space_Grotesk'] text-[11px] font-semibold text-red-700 underline transition hover:text-red-900"
                >
                  <RefreshCw className="h-3 w-3" />
                  Tải lại lịch chiếu
                </button>
              </div>
            )}

            <ShowtimeSelector
              dates={dates}
              cinemas={cinemas}
              selectedDateId={selectedDateISO}
              selectedShowtimeId={selectedShowtimeId}
              isLoading={isLoadingShowtimes}
              onSelectDate={handleSelectDate}
              onSelectShowtime={setSelectedShowtimeId}
            />
          </div>

          <MovieRatingsAndCast
            movie={detail}
            ratings={{ ...RATINGS, audienceScore: detail.audienceScore }}
            cast={detail.cast}
          />
        </div>
      </main>

      <Footer />

      <BottomBookingBar
        movie={detail}
        selection={selection}
        price={selected ? selected.showtime.price : TICKET_PRICE}
        onChangeShowtime={handleChangeShowtime}
        onBookNow={handleBookNow}
      />
    </div>
  );
}