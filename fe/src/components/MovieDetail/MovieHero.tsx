import { useState } from "react";
import {
  Bookmark,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Share2,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import Badge from "../MovieComponents/Badge";
import type { MovieDetailData } from "../../data/movieDetail";
import { AGE_LABEL } from "../../data/movieDetail";

interface MovieHeroProps {
  movie: MovieDetailData;
}

function formatChipClassName(format: string): string {
  if (format.includes("IMAX")) return "border-amber-400/40 bg-amber-500/15 text-amber-300";
  if (format.includes("4DX")) return "border-sky-400/40 bg-sky-500/15 text-sky-300";
  return "border-white/20 bg-white/10 text-slate-200";
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-slate-950">
      {/* Backdrop mờ phía sau */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />

      <div className="relative mx-auto grid w-full max-w-7xl items-stretch gap-6 px-6 py-8 lg:grid-cols-[250px_1fr_1.1fr]">
        {/* ---------- Poster ---------- */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl lg:aspect-auto">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-linear-to-b from-slate-950/80 to-transparent p-3">
            <Badge className="bg-red-600 text-white">{AGE_LABEL[movie.age]}</Badge>
            <Badge className="bg-white/15 text-white backdrop-blur">IMAX LASER</Badge>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-slate-950 via-slate-950/70 to-transparent px-3 pb-2.5 pt-8">
            <span className="flex items-center gap-1.5 font-['Space_Grotesk'] text-[10px] font-semibold text-white">
              <Volume2 className="h-3 w-3 text-amber-400" />
              Dolby Atmos
            </span>
            <span className="rounded border border-amber-400/50 bg-amber-500/15 px-1.5 py-0.5 font-['Space_Grotesk'] text-[9px] font-bold text-amber-300">
              IMAX
            </span>
          </div>
        </div>

        {/* ---------- Thông tin phim ---------- */}
        <div className="flex flex-col justify-center gap-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-red-600 text-white">{AGE_LABEL[movie.age]}</Badge>
            <Badge className="bg-white/15 text-white backdrop-blur">{movie.genre}</Badge>
            <span className="font-['Outfit'] text-[11px] text-slate-400">{movie.releaseDate}</span>
          </div>

          <h1 className="font-['Outfit'] text-4xl font-bold uppercase leading-[1.05] text-white sm:text-5xl">
            {movie.titlePrefix} <span className="text-amber-400">{movie.titleAccent}</span>
          </h1>

          <p className="font-['Outfit'] text-sm italic text-slate-300">&ldquo;{movie.tagline}&rdquo;</p>

          <p className="max-w-xl font-['Outfit'] text-sm leading-relaxed text-slate-300">
            {movie.synopsis}
          </p>

          <dl className="flex flex-col gap-2 font-['Outfit'] text-xs">
            <div className="flex items-start gap-3">
              <dt className="w-16 shrink-0 text-slate-400">Director:</dt>
              <dd className="text-slate-100">{movie.director}</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt className="w-16 shrink-0 text-slate-400">Starring:</dt>
              <dd className="text-slate-100">{movie.starring}</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt className="w-16 shrink-0 text-slate-400">Format:</dt>
              <dd className="flex flex-wrap items-center gap-1.5">
                {movie.formats.map((format) => (
                  <span
                    key={format}
                    className={`rounded border px-1.5 py-0.5 font-['Space_Grotesk'] text-[10px] font-semibold uppercase tracking-wide ${formatChipClassName(format)}`}
                  >
                    {format}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setWishlisted((current) => !current)}
              aria-pressed={wishlisted}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 font-['Space_Grotesk'] text-xs font-semibold transition ${
                wishlisted
                  ? "border-amber-400 bg-amber-500/20 text-amber-300"
                  : "border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${wishlisted ? "fill-amber-400 text-amber-400" : ""}`} />
              {wishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-['Space_Grotesk'] text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* ---------- Khung trailer ---------- */}
        <div className="flex w-full flex-col self-center rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={movie.backdrop}
              alt={`${movie.title} trailer`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/45" />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
              <Badge className="bg-red-600 text-white">{movie.trailer.label}</Badge>
              <Badge className="bg-black/60 text-slate-200 backdrop-blur">
                {movie.trailer.quality} • {movie.trailer.duration}
              </Badge>
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying((current) => !current)}
              aria-label={isPlaying ? "Pause trailer" : "Play trailer"}
              className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-slate-950" />
              ) : (
                <Play className="ml-0.5 h-6 w-6 fill-slate-950" />
              )}
            </button>

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-linear-to-t from-slate-950 via-slate-950/70 to-transparent px-3 pb-2.5 pt-8">
              <div className="relative h-1 w-full rounded-full bg-white/30">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-400"
                  style={{ width: isPlaying ? "62%" : "48%" }}
                />
                <span
                  className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-400"
                  style={{ left: isPlaying ? "62%" : "48%" }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-slate-200">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Replay" className="hover:text-white">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Back 10 seconds" className="hover:text-white">
                    <SkipBack className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Forward 10 seconds" className="hover:text-white">
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-['Space_Grotesk'] text-[10px] text-slate-300">
                    {movie.trailer.currentTime} / {movie.trailer.totalTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded border border-white/20 px-1.5 py-0.5 font-['Space_Grotesk'] text-[9px] font-semibold text-slate-200">
                    {movie.trailer.resolution}
                  </span>
                  <button type="button" aria-label="Volume" className="hover:text-white">
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Fullscreen" className="hover:text-white">
                    <Maximize className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
