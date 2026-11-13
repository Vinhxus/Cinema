import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import MovieHero from "../components/MovieDetail/MovieHero";
import ShowtimeSelector from "../components/MovieDetail/ShowtimeSelector";
import MovieRatingsAndCast from "../components/MovieDetail/MovieRatingsAndCast";
import BottomBookingBar from "../components/MovieDetail/BottomBookingBar";
import type { BookingSelection } from "../components/MovieDetail/BottomBookingBar";
import { CINEMAS, RATINGS, SHOW_DATES, TICKET_PRICE, getMovieDetail } from "../data/movieDetail";
import { useBooking } from "../context/useBooking";
import type { ShowtimeInfo } from "../context/Booking";

function findShowtimeById(showtimeId: string | null) {
  if (!showtimeId) return null;

  for (const cinema of CINEMAS) {
    for (const hall of cinema.halls) {
      const showtime = hall.showtimes.find((item) => item.id === showtimeId);
      if (showtime) return { cinema, hall, showtime };
    }
  }

  return null;
}

export default function MovieDetail() {
  const [selectedDateId, setSelectedDateId] = useState<string>(SHOW_DATES[0].id);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const showtimeSectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Phim đã được MovieCard đưa vào context khi người dùng bấm vào card
  const { movie: bookingMovie, showtime: bookingShowtime, selectShowtime } = useBooking();

  // Toàn bộ nội dung trang được dựng từ phim đang lưu trong BookingContext
  const detail = useMemo(() => (bookingMovie ? getMovieDetail(bookingMovie) : null), [bookingMovie]);

  const selectedDate = SHOW_DATES.find((date) => date.id === selectedDateId) ?? SHOW_DATES[0];

  const selectedShowtime = findShowtimeById(selectedShowtimeId);

  const selection: BookingSelection | null = selectedShowtime
    ? {
        dateLabel: selectedDate.fullName,
        time: selectedShowtime.showtime.startTime,
        cinemaName: selectedShowtime.cinema.name,
        hallName: selectedShowtime.showtime.hall,
        seatsLeft: selectedShowtime.showtime.seatsLeft,
      }
    : null;

  const handleSelectDate = (dateId: string) => {
    setSelectedDateId(dateId);
    setSelectedShowtimeId(null);
  };

  const handleChangeShowtime = () => {
    showtimeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBookNow = () => {
    if (!selection || !selectedShowtime) return;

    const info: ShowtimeInfo = {
      id: selectedShowtime.showtime.id,
      time: selectedShowtime.showtime.startTime,
      date: `${selectedDate.fullName}, ${selectedDate.day} ${selectedDate.month}`,
      cinemaName: selectedShowtime.cinema.name,
      hallName: selectedShowtime.showtime.hall,
      price: selectedShowtime.showtime.price,
    };

    // selectShowtime luôn xóa ghế đã chọn, nên chỉ gọi khi thật sự đổi suất.
    // Nhờ vậy quay lại từ trang chọn ghế rồi bấm Book Now vẫn giữ ghế cũ.
    const isSameShowtime =
      bookingShowtime?.id === info.id && bookingShowtime?.date === info.date;
    if (!isSameShowtime) selectShowtime(info);

    navigate("/select-seat");
  };

  // Vào thẳng /movie mà chưa chọn phim nào -> về trang chủ
  if (!detail) return <Navigate to="/" replace />;

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
          <span className="font-semibold text-slate-800">{detail.subtitle}</span>
        </div>
      </nav>

      <MovieHero movie={detail} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div ref={showtimeSectionRef} className="lg:col-span-2">
            <ShowtimeSelector
              dates={SHOW_DATES}
              cinemas={CINEMAS}
              selectedDateId={selectedDateId}
              selectedShowtimeId={selectedShowtimeId}
              onSelectDate={handleSelectDate}
              onSelectShowtime={setSelectedShowtimeId}
            />
          </div>

          <MovieRatingsAndCast
            movie={detail}
            ratings={{ ...RATINGS, audienceScore: detail.imdbScore }}
            cast={detail.cast}
          />
        </div>
      </main>

      <Footer />

      <BottomBookingBar
        movie={detail}
        selection={selection}
        price={selectedShowtime ? selectedShowtime.showtime.price : TICKET_PRICE}
        onChangeShowtime={handleChangeShowtime}
        onBookNow={handleBookNow}
      />
    </div>
  );
}