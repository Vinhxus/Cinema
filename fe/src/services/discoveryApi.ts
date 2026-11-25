import type { AgeRating, Movie } from "../components/MovieComponents/MovieCard";

/** URL gốc của Backend Express (có thể override bằng VITE_API_BASE_URL). */
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/+$/, "");

/* ------------------------------- Kiểu dữ liệu ------------------------------- */

export type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED" | "DRAFT";

/** Dòng thô trả về từ MySQL (tên cột PascalCase). */
export interface RawMovie {
  MovieID: number;
  Code?: string;
  Title: string;
  Subtitle: string | null;
  Tagline: string | null;
  Description: string | null;
  Genre: string;
  Duration: number;
  ReleaseDate?: string | null;
  AgeRating: string;
  AgeNotice?: string | null;
  Language?: string | null;
  Formats: string | null;
  ImdbScore: string | number | null;
  AudienceScore?: string | number | null;
  PosterUrl: string | null;
  BackdropUrl: string | null;
  TrailerUrl?: string | null;
  Director?: string | null;
  Starring?: string | null;
  Status: MovieStatus;
}

/** Movie của UI + vài trường phụ dùng cho banner Spotlight. */
export interface MovieSummary extends Movie {
  duration: number;
  description: string;
  tagline: string;
  backdrop: string;
  trailerUrl: string;
  status: MovieStatus;
}

export interface MovieCounts {
  nowShowing: number;
  comingSoon: number;
}

export interface MovieListResult {
  items: MovieSummary[];
  total: number;
  filters: { status: string; genre: string | null };
  counts: MovieCounts;
  genres: string[];
}

export interface FetchMoviesParams {
  status?: "now" | "upcoming" | "all";
  genre?: string;
}

interface ApiErrorPayload {
  message?: string;
  details?: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

interface RawMovieListPayload {
  items?: RawMovie[];
  total?: number;
  filters?: { status: string; genre: string | null };
  counts?: MovieCounts;
  genres?: string[];
}

interface RawMovieSearchPayload {
  items?: RawMovie[];
  total?: number;
  query?: string;
}

/* ------------------------------ Hàm map dữ liệu ----------------------------- */

/** MySQL lưu T13/T16/T18 nhưng UI dùng C13/C16/C18 (badge của MovieCard). */
const AGE_RATING_MAP: Record<string, AgeRating> = {
  P: "P",
  T13: "C13",
  T16: "C16",
  T18: "C18",
  C13: "C13",
  C16: "C16",
  C18: "C18",
};

export function mapAgeRating(raw: string | null | undefined): AgeRating {
  const key = (raw ?? "").trim().toUpperCase();
  return AGE_RATING_MAP[key] ?? "P";
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Map 1 dòng MySQL -> object mà MovieCard/MovieHero đang dùng. */
export function mapMovie(row: RawMovie): MovieSummary {
  const formats = (row.Formats ?? "").trim() || "2D";
  const formatTokens = formats
    .split("•")
    .map((token) => token.trim())
    .filter(Boolean);

  const tags = formatTokens
    .filter((token) => /imax|4dx|screenx/i.test(token))
    .slice(0, 2)
    .map((token) => token.toUpperCase());

  return {
    id: row.MovieID,
    title: row.Title,
    subtitle: row.Subtitle ?? row.Tagline ?? "",
    age: mapAgeRating(row.AgeRating),
    tags,
    genre: row.Genre,
    formats,
    rating: toNumber(row.ImdbScore),
    poster: row.PosterUrl ?? "",
    duration: toNumber(row.Duration),
    description: row.Description ?? "",
    tagline: row.Tagline ?? "",
    backdrop: row.BackdropUrl || row.PosterUrl || "",
    trailerUrl: row.TrailerUrl ?? "",
    status: row.Status,
  };
}

/* --------------------------------- Gọi API --------------------------------- */

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Không kết nối được máy chủ API. Hãy chạy Backend tại cổng 5000.");
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const details = payload?.error?.details;
    const firstDetail = Array.isArray(details)
      ? (details as Array<{ message?: string }>).find((item) => item?.message)?.message
      : undefined;

    throw new Error(
      firstDetail ??
        payload?.error?.message ??
        `Yêu cầu thất bại (HTTP ${response.status}).`
    );
  }

  return payload.data as T;
}

/** Danh sách phim theo tab + thể loại (kèm counts và genres). */
export async function fetchMovies({
  status = "all",
  genre,
}: FetchMoviesParams = {}): Promise<MovieListResult> {
  const query = new URLSearchParams({ status });
  if (genre) query.set("genre", genre);

  const data = await request<RawMovieListPayload>(`/api/movies?${query.toString()}`);

  return {
    items: (data.items ?? []).map(mapMovie),
    total: data.total ?? data.items?.length ?? 0,
    filters: data.filters ?? { status, genre: genre ?? null },
    counts: data.counts ?? { nowShowing: 0, comingSoon: 0 },
    genres: data.genres ?? [],
  };
}

/** Tìm kiếm nhanh theo tên phim (BE giới hạn tối đa 8 kết quả). */
export async function searchMovies(keyword: string): Promise<MovieSummary[]> {
  const query = keyword.trim();
  if (!query) return [];

  const data = await request<RawMovieSearchPayload>(
    `/api/movies/search?q=${encodeURIComponent(query)}`
  );

  return (data.items ?? []).map(mapMovie);
}
