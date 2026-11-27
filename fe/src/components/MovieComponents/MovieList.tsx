import { useEffect, useState } from "react";
import { MovieCard, type Movie } from "./MovieCard";
import { fetchMovies } from "../../services/discoveryApi";

/* ---------- Types ---------- */
type TabKey = "now" | "upcoming";

const ALL_GENRES = "All Genres";
const SKELETON_COUNT = 10;

const TAB_LABEL: Record<TabKey, string> = {
  now: "Now showing",
  upcoming: "Upcoming",
};

export default function MovieList() {
  const [tab, setTab] = useState<TabKey>("now");
  const [genre, setGenre] = useState<string>(ALL_GENRES);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([ALL_GENRES]);
  const [counts, setCounts] = useState({ nowShowing: 0, comingSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tải danh sách phim thật từ API mỗi khi đổi tab hoặc thể loại.
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchMovies({ status: tab, genre: genre === ALL_GENRES ? undefined : genre })
      .then((data) => {
        if (cancelled) return;
        setMovies(data.items);
        setGenres([ALL_GENRES, ...data.genres]);
        setCounts(data.counts);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMovies([]);
        setError(err instanceof Error ? err.message : "Couldn't load the movie list.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, genre]);

  const tabs = [
    { key: "now" as TabKey, label: TAB_LABEL.now, count: counts.nowShowing },
    { key: "upcoming" as TabKey, label: TAB_LABEL.upcoming, count: counts.comingSoon },
  ];

  return (
    <div className="w-full max-w-7xl px-10 py-6 sm:px-6 ml-20">
      {/* Eyebrow */}
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Discovery
      </div>

      {/* Tabs + nguồn dữ liệu */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-6">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex cursor-pointer items-center gap-2 pb-2 text-xl font-bold transition-colors ${
                  active ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-slate-200 text-slate-600" : "bg-red-100 text-red-500"
                  }`}
                >
                  {t.count}
                </span>
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">
          <span className="text-amber-500">⟳</span>
          Source: <b className="text-slate-700">SENEMA API</b>
        </div>
      </div>

      {/* Bộ lọc thể loại (lấy từ dữ liệu thật) */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {genres.map((g) => {
          const active = genre === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-600"
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* GRID danh sách phim */}
      {loading ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div
              key={index}
              className="aspect-3/4 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <p className="mt-1 text-xs text-red-500">
            Make sure the backend is running at http://localhost:5000, then reload the page.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {movies.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-400">
              No movies in this genre yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}
