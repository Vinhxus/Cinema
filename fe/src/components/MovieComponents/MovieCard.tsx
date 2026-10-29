import Badge from "./Badge";

export type AgeRating = "P" | "C13" | "C16" | "C18";

export interface Movie {
  id: number;
  title: string;
  subtitle: string;
  age: AgeRating;
  tags: string[];
  genre: string;
  formats: string;
  rating: number;
  poster: string;
}

const AGE_STYLE: Record<AgeRating, string> = {
  P: "bg-emerald-600 text-white",
  C13: "bg-amber-500 text-white",
  C16: "bg-orange-500 text-white",
  C18: "bg-red-600 text-white",
};

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ">
      {/* Poster */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-linear-to-b from-slate-800 to-slate-950">
        {movie.poster && (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}

        {/* Badges góc trên trái */}
        <div className="absolute left-2 top-2 flex items-center gap-1">
          <Badge className={AGE_STYLE[movie.age]}>{movie.age}</Badge>
          {movie.tags.map((tag) => (
            <Badge
              key={tag}
              className={
                tag.startsWith("IMAX")
                  ? "bg-amber-500 text-white"
                  : "bg-black/60 text-white backdrop-blur"
              }
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Rating góc dưới phải */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-bold text-slate-800 shadow">
          <span className="text-amber-500">★</span>
          {movie.rating.toFixed(1)}
        </div>
      </div>

      {/* Thông tin */}
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-[15px] font-bold leading-tight text-slate-900">
          {movie.title}
        </h3>
        <p className="truncate text-xs text-slate-400">{movie.subtitle}</p>

        <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate text-slate-500">{movie.genre}</span>
          <span className="shrink-0 font-semibold text-amber-500">
            {movie.formats}
          </span>
        </div>
      </div>
    </article>
  );
}