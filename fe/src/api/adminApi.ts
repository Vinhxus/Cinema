const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

const TOKEN_KEY = 'senema_admin_token';
const USER_KEY = 'senema_admin_user';
const CINEMA_KEY = 'senema_admin_cinema_id';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    details?: unknown;
  } | null;
}

export interface AuthUser {
  UserID: number;
  name: string;
  phone_number: string | null;
  mail: string;
  UserType: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  cine_points: number;
  tier: string;
}

export interface Cinema {
  CinemaID: number;
  Slug: string;
  CinemaName: string;
  Branch: string | null;
  Address: string;
  City: string;
  DistanceLabel: string | null;
  Perk: string | null;
  MapUrl: string | null;
}

export interface Movie {
  MovieID: number;
  Code: string;
  Title: string;
  Subtitle: string | null;
  Tagline: string | null;
  Description: string | null;
  Genre: string;
  Duration: number;
  ReleaseDate: string | null;
  AgeRating: 'P' | 'T13' | 'T16' | 'T18';
  AgeNotice: string | null;
  Language: string;
  Formats: string;
  ImdbScore: number;
  AudienceScore: number;
  PosterUrl: string | null;
  BackdropUrl: string | null;
  TrailerUrl: string | null;
  Director: string | null;
  Starring: string | null;
  Status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED' | 'DRAFT';
}

export interface Room {
  RoomID: number;
  CinemaID: number;
  CinemaName?: string;
  RoomNumber: string;
  RoomType: string;
  FormatDescription: string | null;
  HallNote: string | null;
  Capacity: number;
  Status: 'READY' | 'CLEANING' | 'MAINTENANCE';
}

export interface Seat {
  SeatID: number;
  RoomID: number;
  SeatTypeID: number;
  SeatRow: string;
  SeatNumber: number;
  SeatLabel: string;
  IsActive: number | boolean;
  TypeCode: 'standard' | 'vip' | 'couple';
  TypeName: string;
  BasePrice: number | string;
  Surcharge: number | string;
  SeatsPerUnit: number;
}

export interface PriceRule {
  SeatTypeID: number;
  TypeCode: 'standard' | 'vip' | 'couple';
  TypeName: string;
  BasePrice: number | string;
  Surcharge: number | string;
  SeatsPerUnit: number;
  EffectivePrice: number | string;
}

export interface Showtime {
  ShowtimeID: number;
  MovieID: number;
  RoomID: number;
  ShowDate: string;
  StartTime: string;
  EndTime: string;
  Format: string;
  BaseTicketPrice: number | string;
  Status: 'SCHEDULED' | 'CHECKIN_OPEN' | 'COMPLETED' | 'CANCELED';
  MovieCode?: string;
  MovieTitle?: string;
  MovieDuration?: number;
  RoomNumber?: string;
  CinemaID?: number;
  CinemaName?: string;
}

export interface DateSnapshot {
  date: string;
  revenue: number;
  ticketsSold: number;
  totalCapacity: number;
  occupancyRate: number;
  totalScreenings: number;
  completedScreenings: number;
  upcomingScreenings: number;
}

export interface AdminStatsResponse {
  range: { from: string; to: string };
  summary: {
    totalRevenue: number;
    totalTickets: number;
    today: DateSnapshot;
    yesterday: DateSnapshot;
  };
  daily: Array<{
    date: string;
    ticketCount: number;
    revenue: number;
  }>;
  attendanceByTimeSlot: Array<{
    slot: string;
    ticketCount: number;
  }>;
  upcomingScreenings: Array<{
    ShowtimeID: number;
    ShowDate: string;
    StartTime: string;
    EndTime: string;
    Status: string;
    MovieTitle: string;
    RoomID: number;
    RoomNumber: string;
    Capacity: number;
    SoldTickets: number;
  }>;
  operations: {
    totalRooms: number;
    readyRooms: number;
    attentionRooms: number;
    recentRefunds: Array<{
      RefundID: number;
      RefundReference: string;
      RefundAmount: number | string;
      Status: string;
      BookingCode: string;
      RequestedAt: string;
    }>;
  };
}

export interface StaffShowtime {
  ShowtimeID: number;
  ShowDate: string;
  StartTime: string;
  EndTime: string;
  Format: string;
  Status: string;
  MovieTitle: string;
  RoomID: number;
  RoomNumber: string;
  CinemaID: number;
  CinemaName: string;
  AdmittedCount: number;
  TotalTickets: number;
}

export interface TicketDetail {
  TicketNo: string;
  BookingID: number;
  ShowtimeID: number;
  SeatID: number;
  Barcode: string;
  Price: number | string;
  SeatRow: string;
  SeatNumber: number;
  SeatLabel: string;
  SeatType: string;
  CinemaID: number;
  RoomNumber: string;
  Gate: string;
  Date: string;
  Time: string;
  status: 'VALID' | 'USED' | 'CANCELED' | 'REFUNDED';
  checkin_time: string | null;
  checkin_staff_id: number | null;
  BookingCode: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  Format: string;
  StartTime: string;
  EndTime: string;
  MovieTitle: string;
  CinemaName: string;
  CheckinStaffName: string | null;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredCinemaId(): number | null {
  const raw = localStorage.getItem(CINEMA_KEY);
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function setStoredCinemaId(cinemaId: number): void {
  localStorage.setItem(CINEMA_KEY, String(cinemaId));
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) {
      search.set(k, String(v));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !payload || !payload.success) {
    const message =
      payload?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload?.error?.details);
  }

  return payload.data as T;
}

export const authApi = {
  login(identifier: string, password: string) {
    return apiRequest<{ token: string; role: string; user: AuthUser }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }
    );
  },
};

export const healthApi = {
  check() {
    return apiRequest<{ status: string; database: string; timestamp: string }>(
      '/health'
    );
  },
};

export const cinemasApi = {
  list(params?: { search?: string; city?: string }) {
    return apiRequest<Cinema[]>(`/admin/cinemas${buildQuery(params)}`);
  },
};

export const moviesApi = {
  list(params?: { search?: string; status?: string; genre?: string }) {
    return apiRequest<Movie[]>(`/admin/movies${buildQuery(params)}`);
  },
  create(data: Record<string, unknown>) {
    return apiRequest<Movie>('/admin/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Record<string, unknown>) {
    return apiRequest<Movie>(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  remove(id: number) {
    return apiRequest<{ deletedId: number }>(`/admin/movies/${id}`, {
      method: 'DELETE',
    });
  },
};

export const roomsApi = {
  list(params?: { cinema_id?: number; status?: string }) {
    return apiRequest<Room[]>(`/admin/rooms${buildQuery(params)}`);
  },
  getLayout(roomId: number) {
    return apiRequest<{ room: Room; seats: Seat[] }>(
      `/admin/rooms/${roomId}/layout`
    );
  },
  updateLayout(
    roomId: number,
    data: { replaceAll?: boolean; seats: Array<Record<string, unknown>> }
  ) {
    return apiRequest<{ room: Room; seats: Seat[] }>(
      `/admin/rooms/${roomId}/layout`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
};

export const priceRulesApi = {
  list() {
    return apiRequest<PriceRule[]>('/admin/price-rules');
  },
  update(id: number, data: Record<string, unknown>) {
    return apiRequest<PriceRule>(`/admin/price-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  applyShowtimeSurcharge(data: Record<string, unknown>) {
    return apiRequest<{ updatedShowtimes: number }>(
      '/admin/price-rules/showtimes',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
};

export const showtimesApi = {
  list(params?: {
    cinema_id?: number;
    room_id?: number;
    movie_id?: number;
    date?: string;
    status?: string;
  }) {
    return apiRequest<Showtime[]>(`/admin/showtimes${buildQuery(params)}`);
  },
  create(data: Record<string, unknown>) {
    return apiRequest<Showtime>('/admin/showtimes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: number, data: Record<string, unknown>) {
    return apiRequest<Showtime>(`/admin/showtimes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  remove(id: number) {
    return apiRequest<{ deletedId: number }>(`/admin/showtimes/${id}`, {
      method: 'DELETE',
    });
  },
  copy(data: {
    source_date: string;
    target_date: string;
    cinema_id: number;
    room_id?: number;
  }) {
    return apiRequest<{
      createdCount: number;
      skippedCount: number;
      created: Showtime[];
      skipped: Array<{
        sourceShowtimeId: number;
        roomNumber: string;
        movieTitle: string;
        startTime: string;
        reason: string;
      }>;
    }>('/admin/showtimes/copy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const statsApi = {
  getStats(params?: {
    from?: string;
    to?: string;
    cinema_id?: number;
    room_id?: number;
  }) {
    return apiRequest<AdminStatsResponse>(`/admin/stats${buildQuery(params)}`);
  },
};

export const staffApi = {
  listCinemas() {
    return apiRequest<Cinema[]>('/staff/cinemas');
  },
  listShowtimes(params?: { cinema_id?: number; date?: string }) {
    return apiRequest<StaffShowtime[]>(`/staff/showtimes${buildQuery(params)}`);
  },
  listCheckins(params?: {
    cinema_id?: number;
    showtime_id?: number;
    limit?: number;
  }) {
    return apiRequest<{
      checkins: TicketDetail[];
      counts: { admittedCount: number; totalTickets: number } | null;
    }>(`/staff/checkins${buildQuery(params)}`);
  },
  lookup(params: { q: string; cinema_id?: number; showtime_id?: number }) {
    return apiRequest<TicketDetail[]>(`/staff/lookup${buildQuery(params)}`);
  },
  checkin(data: Record<string, unknown>) {
    return apiRequest<TicketDetail>('/staff/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
