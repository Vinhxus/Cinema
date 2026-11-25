import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dune from "../../assets/dune.png";
import { useBooking } from "../../context/useBooking";
import Badge from "../MovieComponents/Badge";
import type { AgeRating } from "../MovieComponents/MovieCard";
import { fetchMovies, type MovieSummary } from "../../services/discoveryApi";

const SPOTLIGHT_LIMIT = 4;

const AGE_STYLE: Record<AgeRating, string> = {
  P: "bg-emerald-600 text-white",
  C13: "bg-amber-500 text-white",
  C16: "bg-orange-500 text-white",
  C18: "bg-red-600 text-white",
};

function splitFormats(formats: string): string[] {
  return formats
    .split("•")
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function formatBadgeClass(format: string): string {
  if (/imax/i.test(format)) {
    return "bg-amber-500/25 rounded outline outline-1 outline-offset-[-1px] outline-amber-400/40 text-amber-300";
  }
  return "bg-white/20 rounded backdrop-blur-[6px] text-white";
}

const Spot = () => {
  const navigate = useNavigate();
  const { selectMovie } = useBooking();

  const [spotlights, setSpotlights] = useState<MovieSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Banner lấy 4 phim đang chiếu thật từ API.
  useEffect(() => {
    let cancelled = false;

    fetchMovies({ status: "now" })
      .then((data) => {
        if (cancelled) return;
        const featured = data.items.slice(0, SPOTLIGHT_LIMIT);
        setSpotlights(featured);
        setSelectedId(featured[0]?.id ?? null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Không tải được phim nổi bật.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(
    () => spotlights.find((movie) => movie.id === selectedId) ?? spotlights[0] ?? null,
    [spotlights, selectedId]
  );

  function handleBookNow() {
    if (!featured) return;
    selectMovie(featured);
    navigate(`/movie/${featured.id}`);
  }

  function handlePreview(movie: MovieSummary) {
    setSelectedId(movie.id);
    selectMovie(movie);
  }

  const backgroundUrl = featured?.backdrop || featured?.poster || dune;

  return (
    <div
      className="w-full self-stretch px-10 pb-32 flex flex-col justify-end items-start h-200 mt-10 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.96), rgba(2,6,23,0.35) 55%, rgba(2,6,23,0.75)), url(${backgroundUrl})`,
      }}
    >
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="pb-4 flex flex-col justify-start items-start">
          <div className="px-3.5 py-1.5 bg-slate-900/80 rounded-full outline outline-amber-500/30 backdrop-blur-[6px] inline-flex justify-start items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span className="text-amber-400 text-xs font-semibold font-['Space_Grotesk'] leading-4 tracking-wide">
              NOW SHOWING · SENEMA
            </span>
            <span className="text-slate-300 text-[10px] font-bold font-['Space_Grotesk'] leading-4 tracking-wide">
              {featured
                ? `· ${featured.genre} · ${featured.formats}`
                : loading
                  ? "· Đang tải phim đang chiếu"
                  : "· Chưa có suất chiếu hôm nay"}
            </span>
          </div>
        </div>
      </div>

      {featured ? (
        <div className="self-stretch inline-flex justify-between items-end gap-6">
          <div className="max-w-[672px] inline-flex flex-col justify-start items-start gap-3">
            {/* Badge tuổi + định dạng + điểm + thời lượng */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={AGE_STYLE[featured.age]}>{featured.age}</Badge>
              {splitFormats(featured.formats).map((format) => (
                <Badge key={format} className={formatBadgeClass(format)}>
                  {format}
                </Badge>
              ))}
              <span className="inline-flex items-center gap-1">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-white text-xs font-bold font-['Space_Grotesk']">
                  {featured.rating.toFixed(1)}
                </span>
                <span className="text-slate-300 text-[10px] font-medium font-['Space_Grotesk']">
                  /10
                </span>
              </span>
              <span className="text-slate-200 text-xs font-medium font-['Space_Grotesk']">
                • {featured.duration} min
              </span>
            </div>

            <h1 className="text-white text-5xl font-bold font-['Outfit'] uppercase leading-[56px] shadow-[0_25px_25px_rgba(0,0,0,0.15)]">
              {featured.title}
            </h1>

            {featured.tagline && (
              <p className="text-slate-300 text-sm italic font-['Outfit']">
                &ldquo;{featured.tagline}&rdquo;
              </p>
            )}

            {featured.description && (
              <p className="max-w-[576px] line-clamp-3 text-slate-200 text-base font-normal font-['Outfit'] leading-6">
                {featured.description}
              </p>
            )}

            <div className="self-stretch pt-2 inline-flex justify-start items-center gap-4 flex-wrap content-center">
              <button
                type="button"
                onClick={handleBookNow}
                className="cursor-pointer px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 rounded-xl flex justify-start items-center gap-2 text-white text-sm font-bold font-['Space_Grotesk'] uppercase leading-4 tracking-wide shadow-[0_10px_15px_-3px_rgba(220,38,38,0.30)] transition hover:brightness-110"
              >
                BOOK NOW
              </button>

              <button
                type="button"
                disabled={!featured.trailerUrl}
                onClick={() => {
                  if (!featured.trailerUrl) return;
                  window.open(featured.trailerUrl, "_blank", "noopener,noreferrer");
                }}
                className="px-5 py-3.5 bg-white/20 rounded-xl outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] flex justify-start items-center gap-2 text-white text-sm font-semibold font-['Space_Grotesk'] leading-4 tracking-tight transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-amber-400">▶</span>
                Watch HD Trailer
              </button>
            </div>
          </div>

          {/* IN THE SPOTLIGHT */}
          <div className="p-3 bg-slate-900/80 rounded-2xl outline outline-1 outline-offset-[-1px] outline-amber-500/20 backdrop-blur-md inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch px-1 inline-flex justify-start items-center gap-1.5">
              <span className="w-2 h-2.5 bg-red-500" />
              <span className="text-amber-400 text-[10px] font-semibold font-['Space_Grotesk'] uppercase leading-4 tracking-wide">
                IN THE SPOTLIGHT
              </span>
            </div>

            <div className="self-stretch inline-flex justify-start items-center gap-2.5">
              {spotlights.map((movie) => {
                const active = movie.id === featured.id;
                return (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => handlePreview(movie)}
                    title={movie.title}
                    className={`cursor-pointer w-24 h-16 relative rounded-lg overflow-hidden transition ${
                      active
                        ? "shadow-[0px_0px_0px_2px_rgba(251,191,36,1)]"
                        : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={movie.poster || dune}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-slate-950/40" />
                    <span className="absolute inset-x-1.5 bottom-1 truncate text-left text-white text-[10px] font-semibold font-['Space_Grotesk']">
                      {movie.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[672px] flex flex-col gap-2">
          <p className="text-white text-3xl font-bold font-['Outfit'] uppercase">
            {loading ? "Đang tải phim nổi bật…" : "Chưa có phim đang chiếu"}
          </p>
          <p className="text-slate-300 text-sm font-['Outfit']">
            {error ?? "Dữ liệu sẽ hiển thị ngay khi API sẵn sàng."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Spot;
