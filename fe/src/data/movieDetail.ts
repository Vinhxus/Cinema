import duneArtwork from "../assets/dune.png";
import type { AgeRating } from "../components/MovieComponents/MovieCard";

/* ---------- Types ---------- */
export type Availability = "available" | "best" | "few";

export interface Showtime {
  id: string;
  startTime: string;
  endTime: string;
  hall: string;
  hallNote: string;
  seatsLeft: string;
  availability: Availability;
  price: number;
}

export interface CinemaHall {
  id: string;
  format: string;
  showtimes: Showtime[];
}

export interface Cinema {
  id: string;
  name: string;
  branch: string;
  address: string;
  distance: string;
  perk?: string;
  halls: CinemaHall[];
}

export interface ShowDate {
  id: string;
  weekDay: string;
  fullName: string;
  day: string;
  month: string;
  slots: number;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: string;
}

export interface CriticBar {
  label: string;
  value: string;
  percent: number;
  barClassName: string;
}

export interface MovieRatings {
  audienceScore: number;
  toSee: string;
  toSave: string;
  bars: CriticBar[];
}

export interface MovieTrailer {
  label: string;
  quality: string;
  duration: string;
  currentTime: string;
  totalTime: string;
  resolution: string;
}

export interface MovieDetailData {
  id: string;
  title: string;
  titlePrefix: string;
  titleAccent: string;
  subtitle: string;
  age: AgeRating;
  genre: string;
  releaseDate: string;
  imdbScore: number;
  duration: string;
  tagline: string;
  synopsis: string;
  director: string;
  starring: string;
  formats: string[];
  poster: string;
  backdrop: string;
  trailer: MovieTrailer;
  ageNotice: string;
}

/* ---------- Shared constants ---------- */
export const AGE_LABEL: Record<AgeRating, string> = {
  P: "P",
  C13: "T13",
  C16: "T16",
  C18: "T18",
};

export const TICKET_PRICE = 140000;

export function formatVnd(value: number): string {
  return `${new Intl.NumberFormat("en-US").format(value)} VND`;
}

/* ---------- Mock data ---------- */
export const MOVIE_DETAIL: MovieDetailData = {
  id: "dune-part-two",
  title: "Dune: Part Two",
  titlePrefix: "DUNE:",
  titleAccent: "PART TWO",
  subtitle: "Dune: Part Two (IMAX Laser)",
  age: "C18",
  genre: "Sci-Fi | Epic Action",
  releaseDate: "Released March 2024",
  imdbScore: 8.9,
  duration: "166 min",
  tagline: "Long live the fighters.",
  synopsis:
    "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
  director: "Denis Villeneuve",
  starring: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler",
  formats: ["IMAX with Laser", "4DX", "Dolby Atmos 2D"],
  poster: duneArtwork,
  backdrop: duneArtwork,
  trailer: {
    label: "OFFICIAL TRAILER",
    quality: "4K ULTRA HD",
    duration: "02:34",
    currentTime: "01:05",
    totalTime: "02:14",
    resolution: "1080p 60fps",
  },
  ageNotice:
    "This film is rated for audiences aged 18 and above. Please present official government ID/Citizen ID upon ticket inspection.",
};

export const SHOW_DATES: ShowDate[] = [
  { id: "d-24", weekDay: "TODAY", fullName: "Thursday", day: "24", month: "OCT", slots: 124 },
  { id: "d-25", weekDay: "FRI", fullName: "Friday", day: "25", month: "OCT", slots: 25 },
  { id: "d-26", weekDay: "SAT", fullName: "Saturday", day: "26", month: "OCT", slots: 26 },
  { id: "d-27", weekDay: "SUN", fullName: "Sunday", day: "27", month: "OCT", slots: 27 },
  { id: "d-28", weekDay: "MON", fullName: "Monday", day: "28", month: "OCT", slots: 28 },
  { id: "d-29", weekDay: "TUE", fullName: "Tuesday", day: "29", month: "OCT", slots: 29 },
];

export const CINEMAS: Cinema[] = [
  {
    id: "cgv-landmark-81",
    name: "CGV Landmark 81",
    branch: "IMAX Laser",
    address: "Dinh Bo Linh, Binh Thanh, HCMC",
    distance: "1.8km away",
    perk: "Next-Gen Laser Projector",
    halls: [
      {
        id: "cgv-imax-laser-2d",
        format: "IMAX Laser 2D • Original Audio with Vietnamese Subtitles",
        showtimes: [
          {
            id: "cgv-1400",
            startTime: "14:00",
            endTime: "16:46",
            hall: "Hall 03",
            hallNote: "IMAX laser",
            seatsLeft: "2 pairs left",
            availability: "few",
            price: 140000,
          },
          {
            id: "cgv-1730",
            startTime: "17:30",
            endTime: "20:16",
            hall: "Hall 02",
            hallNote: "IMAX laser",
            seatsLeft: "12 pairs left",
            availability: "available",
            price: 140000,
          },
          {
            id: "cgv-2015",
            startTime: "20:15",
            endTime: "23:01",
            hall: "Hall 01",
            hallNote: "4K laser",
            seatsLeft: "1/4 VIP seats left",
            availability: "best",
            price: 140000,
          },
          {
            id: "cgv-2245",
            startTime: "22:45",
            endTime: "01:31",
            hall: "Hall 01",
            hallNote: "4K laser",
            seatsLeft: "8 pairs left",
            availability: "available",
            price: 140000,
          },
        ],
      },
    ],
  },
  {
    id: "cineverse-premium-lounge",
    name: "CineVerse Premium Lounge",
    branch: "Gold Class",
    address: "Dong Khoi, D1",
    distance: "3.2km away",
    perk: "Includes Welcome Drink",
    halls: [
      {
        id: "cineverse-dolby-atmos-3d",
        format: "3D Dolby Atmos VIP Suites • Free Lounge Access",
        showtimes: [
          {
            id: "cv-1845",
            startTime: "18:45",
            endTime: "21:33",
            hall: "Gold Suite",
            hallNote: "Butler service",
            seatsLeft: "4 pairs left",
            availability: "available",
            price: 190000,
          },
          {
            id: "cv-2115",
            startTime: "21:15",
            endTime: "00:03",
            hall: "Gold Suite",
            hallNote: "Butler service",
            seatsLeft: "12 pairs left",
            availability: "available",
            price: 190000,
          },
        ],
      },
    ],
  },
];

export const RATINGS: MovieRatings = {
  audienceScore: 8.9,
  toSee: "3.5K",
  toSave: "12.4K",
  bars: [
    { label: "Rotten Tomatoes", value: "N/A", percent: 100, barClassName: "bg-red-600" },
    { label: "Metacritic", value: "7.9", percent: 62, barClassName: "bg-amber-500" },
    { label: "CineScore", value: "A+", percent: 88, barClassName: "bg-emerald-500" },
  ],
};

export const CAST: CastMember[] = [
  {
    id: "cast-chalamet",
    name: "Timothée Chalamet",
    role: "Paul Atreides",
    initials: "TC",
    accent: "from-teal-500 to-slate-700",
  },
  {
    id: "cast-zendaya",
    name: "Zendaya",
    role: "Chani",
    initials: "ZD",
    accent: "from-amber-400 to-orange-600",
  },
  {
    id: "cast-butler",
    name: "Austin Butler",
    role: "Feyd-Rautha",
    initials: "AB",
    accent: "from-rose-500 to-red-700",
  },
  {
    id: "cast-pugh",
    name: "Florence Pugh",
    role: "Princess Irulan",
    initials: "FP",
    accent: "from-sky-500 to-indigo-600",
  },
];
