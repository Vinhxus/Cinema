import type { AgeRating, Movie } from "../components/MovieComponents/MovieCard";
import type { Availability } from "../data/movieDetail";

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

/* ---------------------------- Cụm rạp & lịch chiếu ---------------------------- */

/** 1 cụm rạp BE trả về — GET /api/cinemas đã map sẵn sang camelCase. */
export interface RawCinema {
  cinemaId: number;
  slug: string;
  name: string;
  branch: string | null;
  address: string;
  city: string | null;
  distance: string | null;
  perk: string | null;
  mapUrl?: string | null;
  roomCount: string | number;
  readyRoomCount: string | number;
  readyCapacity: string | number;
}

/** Cụm rạp đã chuẩn hoá cho dropdown "Cinemas". */
export interface CinemaSummary {
  cinemaId: number;
  slug: string;
  name: string;
  /** Nhãn hiển thị dropdown: "SENEMA Nguyễn Du (Standard 2D) · 1.2km away". */
  label: string;
  branch: string;
  address: string;
  city: string;
  distance: string;
  perk: string;
  roomCount: number;
  readyRoomCount: number;
  readyCapacity: number;
}

export interface CinemaListResult {
  items: CinemaSummary[];
  total: number;
}

/** 1 suất chiếu đã được BE tính sẵn số ghế trống + nhãn tồn kho. */
export interface ShowtimeItem {
  showtimeId: number;
  startTime: string;
  endTime: string;
  format: string;
  roomType: string;
  hall: string;
  hallNote: string;
  price: number;
  capacity: number;
  availableSeats: number;
  availability: Availability;
  seatsLeft: string;
  isClosed: boolean;
  isSoldOut: boolean;
  isBookable: boolean;
}

export interface ShowtimeFormatGroup {
  format: string;
  roomType: string;
  showtimes: ShowtimeItem[];
}

export interface ShowtimeCinemaGroup {
  cinemaId: number;
  slug: string;
  name: string;
  branch: string;
  address: string;
  city: string;
  distance: string;
  perk: string;
  formatCount: number;
  showtimeCount: number;
  openCount: number;
  formats: ShowtimeFormatGroup[];
}

/** 1 ngày có suất chiếu thật (nhãn thứ/ngày/tháng do BE tính theo giờ VN). */
export interface ShowtimeDate {
  date: string;
  weekDay: string;
  fullName: string;
  day: string;
  month: string;
  slots: number;
  total: number;
}

export interface ShowtimeTotals {
  cinemas: number;
  showtimes: number;
  open: number;
  soldOut: number;
  closed: number;
}

export interface MovieShowtimesResult {
  movieId: number;
  date: string;
  today: string;
  window: { from: string; to: string; days: number };
  thresholds: { lowSeatThreshold: number; salesCutoffMinutes: number };
  availableDates: ShowtimeDate[];
  cinemas: ShowtimeCinemaGroup[];
  totals: ShowtimeTotals;
}

export interface FetchShowtimesParams {
  movieId: number;
  date?: string;
  cinemaId?: number;
  format?: string;
  days?: number;
}

function mapCinema(row: RawCinema): CinemaSummary {
  const name = row.name ?? "";
  const branch = row.branch ?? "";
  const distance = row.distance ?? "";
  const label = [branch ? `${name} (${branch})` : name, distance]
    .filter(Boolean)
    .join(" · ");

  return {
    cinemaId: toNumber(row.cinemaId),
    slug: row.slug ?? "",
    name,
    label,
    branch,
    address: row.address ?? "",
    city: row.city ?? "",
    distance,
    perk: row.perk ?? "",
    roomCount: toNumber(row.roomCount),
    readyRoomCount: toNumber(row.readyRoomCount),
    readyCapacity: toNumber(row.readyCapacity),
  };
}

/** POSTER: danh sách cụm rạp kèm số phòng chiếu (dùng cho dropdown lọc rạp). */
export async function fetchCinemas(): Promise<CinemaListResult> {
  const data = await request<{ items?: RawCinema[]; total?: number }>("/api/cinemas");
  const items = (data.items ?? []).map(mapCinema);

  return { items, total: data.total ?? items.length };
}

function mapShowtimeItem(item: ShowtimeItem): ShowtimeItem {
  return {
    ...item,
    showtimeId: toNumber(item.showtimeId),
    price: toNumber(item.price),
    capacity: toNumber(item.capacity),
    availableSeats: toNumber(item.availableSeats),
    format: item.format ?? "2D",
    roomType: item.roomType ?? "",
    hallNote: item.hallNote ?? "",
    isClosed: Boolean(item.isClosed),
    isSoldOut: Boolean(item.isSoldOut),
    isBookable: Boolean(item.isBookable),
  };
}

function mapShowtimes(data: MovieShowtimesResult): MovieShowtimesResult {
  return {
    ...data,
    availableDates: data.availableDates ?? [],
    cinemas: (data.cinemas ?? []).map((cinema) => ({
      ...cinema,
      cinemaId: toNumber(cinema.cinemaId),
      formatCount: toNumber(cinema.formatCount),
      showtimeCount: toNumber(cinema.showtimeCount),
      openCount: toNumber(cinema.openCount),
      formats: (cinema.formats ?? []).map((format) => ({
        ...format,
        showtimes: (format.showtimes ?? []).map(mapShowtimeItem),
      })),
    })),
    totals:
      data.totals ?? { cinemas: 0, showtimes: 0, open: 0, soldOut: 0, closed: 0 },
  };
}

/**
 * Lịch chiếu thật của 1 phim: dải ngày có suất + lịch gom Cụm rạp -> Định dạng -> Suất.
 * BE tự ẩn suất đã bắt đầu và chặn bán vé trong 15 phút sát giờ.
 */
export async function fetchMovieShowtimes({
  movieId,
  date,
  cinemaId,
  format,
  days,
}: FetchShowtimesParams): Promise<MovieShowtimesResult> {
  const query = new URLSearchParams({ movieId: String(movieId) });
  if (date) query.set("date", date);
  if (cinemaId) query.set("cinemaId", String(cinemaId));
  if (format) query.set("format", format);
  if (days) query.set("days", String(days));

  const data = await request<MovieShowtimesResult>(`/api/showtimes?${query.toString()}`);
  return mapShowtimes(data);
}