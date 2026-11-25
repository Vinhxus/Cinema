import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, User2 } from "lucide-react";
import Logo from "./Logo";
import { useBooking } from "../../context/useBooking";
import type { AgeRating } from "../MovieComponents/MovieCard";
import { searchMovies, type MovieSummary } from "../../services/discoveryApi";

const MIN_KEYWORD_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

const AGE_STYLE: Record<AgeRating, string> = {
  P: "bg-emerald-600 text-white",
  C13: "bg-amber-500 text-white",
  C16: "bg-orange-500 text-white",
  C18: "bg-red-600 text-white",
};

export default function Header() {
  const navigate = useNavigate();
  const { selectMovie } = useBooking();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms: chỉ gọi API khi người dùng ngừng gõ.
  useEffect(() => {
    const query = keyword.trim();

    if (query.length < MIN_KEYWORD_LENGTH) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = window.setTimeout(() => {
      searchMovies(query)
        .then((movies) => {
          if (cancelled) return;
          setResults(movies);
          setSearchError(null);
          setOpen(true);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setResults([]);
          setSearchError(err instanceof Error ? err.message : "Không tìm kiếm được phim.");
          setOpen(true);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [keyword]);

  // Click ra ngoài thì đóng dropdown.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function resetSearch() {
    setKeyword("");
    setResults([]);
    setSearchError(null);
    setOpen(false);
  }

  function handlePick(movie: MovieSummary) {
    selectMovie(movie);
    resetSearch();
    navigate("/movie");
  }

  return (
    <div className="sticky top-0 z-50 w-full h-20 bg-[#FFFFFF] flex border-b items-center justify-between gap-6 px-10">
      <Link to="/" className="text-3xl flex items-center gap-2 ml-4 shrink-0">
        <Logo />
        <span>
          <span className="text-[#ECC904] font-bold">SE</span>
          <span className="text-[#DC2626] font-bold">NEMA</span>
        </span>
      </Link>

      <div className="flex gap-6 justify-center flex-1">
        <button className="cursor-pointer"> SHOWTIME </button>
        <button className="cursor-pointer"> MOVIE </button>
        <button className="cursor-pointer"> CINEMAS &amp; PRICES</button>
        <button className="cursor-pointer"> OFFERS </button>
      </div>

      <div className="flex gap-3 justify-end items-center">
        {/* Tìm kiếm nhanh */}
        <div ref={searchBoxRef} className="relative w-64">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-amber-400 focus-within:bg-white">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onFocus={() => {
                if (results.length > 0 || searchError) setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
              placeholder="Tìm phim nhanh..."
              aria-label="Tìm phim nhanh"
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searching ? (
              <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            ) : keyword ? (
              <button
                type="button"
                onClick={resetSearch}
                aria-label="Xoá từ khoá"
                className="shrink-0 cursor-pointer text-base leading-none text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            ) : null}
          </div>

          {open && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {searching && results.length === 0 && (
                <p className="px-3 py-4 text-xs text-slate-500">Đang tìm phim…</p>
              )}

              {!searching && searchError && (
                <p className="px-3 py-4 text-xs text-red-500">{searchError}</p>
              )}

              {!searching && !searchError && results.length === 0 && (
                <p className="px-3 py-4 text-xs text-slate-500">
                  Không tìm thấy phim phù hợp với &ldquo;{keyword.trim()}&rdquo;.
                </p>
              )}

              {results.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handlePick(movie)}
                  className="flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-b-0 hover:bg-amber-50"
                >
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-slate-200">
                    {movie.poster && (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900">{movie.title}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {movie.subtitle || movie.genre}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                      {movie.status === "COMING_SOON" ? "Sắp chiếu" : "Đang chiếu"} ·{" "}
                      {movie.genre}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${AGE_STYLE[movie.age]}`}
                  >
                    {movie.age}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="cursor-pointer px-2 pt-2 pb-2.5 justify-center border-r">
          <Bell />
        </button>
        <Link to="/admin/login" className="px-2 pt-2 pb-2.5 justify-center flex gap-2">
          <button className="cursor-pointer">
            <User2 />
          </button>
          <span> Member </span>
        </Link>
      </div>
    </div>
  );
}
