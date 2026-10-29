import { useMemo, useState } from "react";
import {Movie, MovieCard} from "./MovieCard";

/* ---------- Types ---------- */
type TabKey = "now" | "upcoming";

interface TabItem {
  key: TabKey;
  label: string;
  count: number;
}

/* ---------- Mock data ---------- */
const NOW_SHOWING_COUNT = 18;

const UPCOMING: Movie[] = [
  { id: 1, title: "Dune: Hành Tinh Cát 2", subtitle: "Dune: Part Two", age: "C18", tags: ["IMAX"], genre: "Khoa học viễn tưởng", formats: "2D • IMAX", rating: 8.9, poster: "" },
  { id: 2, title: "Godzilla x Kong", subtitle: "The New Empire", age: "C13", tags: ["4DX"], genre: "Hành động, Quái thú", formats: "3D • 4DX", rating: 8.4, poster: "" },
  { id: 3, title: "Exhuma: Quật Mộ Trùng Ma", subtitle: "Pamyo (2024)", age: "C18", tags: ["2D"], genre: "Kinh dị, Huyền bí", formats: "2D Lồng tiếng", rating: 8.7, poster: "" },
  { id: 4, title: "Kung Fu Panda 4", subtitle: "DreamWorks Animation", age: "P", tags: ["3D"], genre: "Hoạt hình, Hài hước", formats: "2D • 3D", rating: 8.2, poster: "" },
  { id: 5, title: "Mai (Phim Trấn Thành)", subtitle: "A Film by Tran Thanh", age: "C18", tags: ["2D"], genre: "Tâm lý, Tình cảm", formats: "2D Kỹ thuật số", rating: 8.1, poster: "" },
  { id: 6, title: "Oppenheimer (Tái chiếu)", subtitle: "Christopher Nolan Film", age: "C18", tags: ["IMAX 70MM"], genre: "Tiểu sử, Lịch sử", formats: "IMAX GT Laser", rating: 9.1, poster: "" },
  { id: 7, title: "Thám Tử Lừng Danh Conan", subtitle: "Ngôi Sao 5 Cánh 1 Triệu Đô", age: "P", tags: ["2D"], genre: "Anime, Trinh thám", formats: "2D • 4DX", rating: 8.8, poster: "" },
  { id: 8, title: "Furiosa: Câu Chuyện Mad Max", subtitle: "A Mad Max Saga", age: "C18", tags: ["IMAX"], genre: "Hành động, Hậu tận thế", formats: "IMAX • ScreenX", rating: 8.5, poster: "" },
  { id: 9, title: "Deadpool & Wolverine", subtitle: "Marvel Studios", age: "C18", tags: ["2D"], genre: "Hành động, Siêu anh hùng", formats: "3D • 4DX", rating: 8.8, poster: "" },
  { id: 10, title: "Những Mảnh Ghép Cảm Xúc 2", subtitle: "Disney Pixar Inside Out 2", age: "P", tags: ["2D"], genre: "Hoạt hình, Gia đình", formats: "2D Lồng tiếng", rating: 8.9, poster: "" },
];

const GENRES: string[] = [
  "Tất cả thể loại",
  "Hành động",
  "Khoa học viễn tưởng",
  "Kinh dị / Huyền bí",
  "Hoạt hình / Anime",
  "Tâm lý - Tình cảm",
  "Định dạng IMAX 3D",
];

export default function MovieList() {
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [genre, setGenre] = useState<string>(GENRES[0]);

  const movies = useMemo<Movie[]>(() => {
    if (genre === GENRES[0]) return UPCOMING;
    const keyword = genre.split(/[/-]/)[0].trim().toLowerCase();
    return UPCOMING.filter((m) => m.genre.toLowerCase().includes(keyword));
  }, [genre]);

  const tabs: TabItem[] = [
    { key: "now", label: "Phim đang chiếu", count: NOW_SHOWING_COUNT },
    { key: "upcoming", label: "Phim sắp chiếu", count: UPCOMING.length + 2 },
  ];

  return (
    <div className="w-full max-w-7xl px-10 py-6 sm:px-6 ml-20">
      {/* Eyebrow */}
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Discovery
      </div>

      {/* Tabs + thời gian cập nhật */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-6">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-2 pb-2 text-xl font-bold transition-colors ${
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
          Cập nhật lịch chiếu:{" "}
          <b className="text-slate-700">15 phút trước</b>
        </div>
      </div>

      {/* Bộ lọc thể loại */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {GENRES.map((g) => {
          const active = genre === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
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
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {movies.length === 0 && (
        <p className="py-16 text-center text-sm text-slate-400">
          Chưa có phim nào thuộc thể loại này.
        </p>
      )}
    </div>
  );
}