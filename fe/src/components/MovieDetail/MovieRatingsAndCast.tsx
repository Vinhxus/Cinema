import { Star } from "lucide-react";
import Badge from "../MovieComponents/Badge";
import type { CastMember, MovieDetailData, MovieRatings } from "../../data/movieDetail";
import { AGE_LABEL } from "../../data/movieDetail";

interface MovieRatingsAndCastProps {
  movie: MovieDetailData;
  ratings: MovieRatings;
  cast: CastMember[];
}

export default function MovieRatingsAndCast({ movie, ratings, cast }: MovieRatingsAndCastProps) {
  return (
    <aside className="flex flex-col gap-4">
      {/* ---------- Audience & Critic Reception ---------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-['Outfit'] text-sm font-bold text-slate-900">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          Audience &amp; Critic Reception
        </h2>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-end gap-1">
              <span className="font-['Outfit'] text-4xl font-bold leading-none text-slate-900">
                {ratings.audienceScore.toFixed(1)}
              </span>
              <span className="font-['Outfit'] text-xs font-medium text-slate-400">/10</span>
            </div>
            <p className="mt-1 font-['Space_Grotesk'] text-[9px] uppercase tracking-wide text-slate-400">
              Verified Score
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <p className="font-['Space_Grotesk'] text-[9px] uppercase tracking-wide text-slate-400">
                To see
              </p>
              <p className="font-['Outfit'] text-sm font-bold text-slate-800">{ratings.toSee}</p>
            </div>
            <div>
              <p className="font-['Space_Grotesk'] text-[9px] uppercase tracking-wide text-slate-400">
                To save
              </p>
              <p className="font-['Outfit'] text-sm font-bold text-slate-800">{ratings.toSave}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {ratings.bars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-3 font-['Space_Grotesk'] text-[10px]">
              <span className="w-24 shrink-0 font-medium text-slate-500">{bar.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${bar.barClassName}`}
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-bold text-slate-700">{bar.value}</span>
            </div>
          ))}
        </div>

        {/* Cảnh báo độ tuổi */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <Badge className="mt-0.5 shrink-0 bg-red-600 text-white">{AGE_LABEL[movie.age]}</Badge>
          <p className="font-['Outfit'] text-[10px] leading-relaxed text-red-700">
            <span className="font-bold">Age Restriction Notice:</span> {movie.ageNotice}
          </p>
        </div>
      </section>

      {/* ---------- Main Cast & Crew ---------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-['Outfit'] text-sm font-bold text-slate-900">Main Cast &amp; Crew</h2>
          <button
            type="button"
            className="font-['Space_Grotesk'] text-[11px] font-semibold text-red-500 transition hover:text-red-600"
          >
            Full Credits
          </button>
        </div>

        <ul className="mt-3 flex flex-col gap-3">
          {cast.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${member.accent} font-['Space_Grotesk'] text-[11px] font-bold text-white`}
              >
                {member.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-['Outfit'] text-xs font-bold text-slate-900">
                  {member.name}
                </p>
                <p className="truncate font-['Outfit'] text-[10px] text-slate-400">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-700 to-slate-900 font-['Space_Grotesk'] text-[11px] font-bold text-white">
            DV
          </span>
          <div className="min-w-0">
            <p className="truncate font-['Outfit'] text-xs font-bold text-slate-900">
              {movie.director}
            </p>
            <p className="truncate font-['Outfit'] text-[10px] text-slate-400">Director</p>
          </div>
        </div>
      </section>
    </aside>
  );
}
