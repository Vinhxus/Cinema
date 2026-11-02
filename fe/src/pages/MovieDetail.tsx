import { useMemo, useState } from "react";
import {
  Home, Bookmark, Share2, Play, Pause, Volume2, Settings, Maximize,
  CalendarDays, Info, Star, BarChart3, Armchair, Sun, ArrowRight, Ticket, Clock,
} from "lucide-react";
import "./MovieDetailPage.css";
import Header from "../components/common/Header";
import { useNavigate } from "react-router-dom";

/* ---------- Types & data ---------- */
type Badge = "BEST" | "FEW";
type Showtime = {
  id: string;
  time: string;
  endsAt: string;
  info: string;
  seatTone: "ok" | "low";
  badge?: Badge;
  dimmed?: boolean;
};
type Hall = {
  id: string;
  name: string;
  address: string;
  tag: string;
  tagVariant: "amber" | "outline";
  icon: "star" | "seat";
  formatLabel: string;
  formatDot: "red" | "amber";
  showtimes: Showtime[];
  bookingLabel: string; // dùng cho thanh đặt vé
  formatShort: string;
};

const DATES = [
  { id: "d24", dow: "TODAY", day: "24", month: "Oct (Thu)" },
  { id: "d25", dow: "FRI", day: "25", month: "Oct" },
  { id: "d26", dow: "SAT", day: "26", month: "Oct" },
  { id: "d27", dow: "SUN", day: "27", month: "Oct" },
  { id: "d28", dow: "MON", day: "28", month: "Oct" },
  { id: "d29", dow: "TUE", day: "29", month: "Oct" },
];

const HALLS: Hall[] = [
  {
    id: "cgv",
    name: "CGV Landmark 81 • IMAX Laser",
    address: "Floor B1, Vinhomes Central Park, Binh Thanh Dist (1.8km away)",
    tag: "Next-Gen Laser Projector",
    tagVariant: "amber",
    icon: "star",
    formatLabel: "IMAX Laser 2D • Original Audio with Vietnamese Subtitles",
    formatDot: "red",
    bookingLabel: "CGV Landmark 81 (Hall 01)",
    formatShort: "IMAX 2D",
    showtimes: [
      { id: "s1", time: "20:15", endsAt: "23:01", info: "Hall 01 • 14 VIP seats left", seatTone: "ok", badge: "BEST" },
      { id: "s2", time: "17:30", endsAt: "20:16", info: "Hall 01 • 28 seats left", seatTone: "ok" },
      { id: "s3", time: "22:45", endsAt: "01:31", info: "Hall 01 • 45 seats left", seatTone: "ok" },
      { id: "s4", time: "14:00", endsAt: "16:46", info: "Hall 01 • 4 seats left", seatTone: "low", badge: "FEW", dimmed: true },
    ],
  },
  {
    id: "cineverse",
    name: "CineVerse Premier Lounge • Gold Class",
    address: "Dong Khoi Center, Dist 1 • Premium Recliner & Butler Service",
    tag: "Includes Welcome Drink",
    tagVariant: "outline",
    icon: "seat",
    formatLabel: "2D Dolby Atmos VIP Suites • Free Lounge Access",
    formatDot: "amber",
    bookingLabel: "CineVerse Premier Lounge",
    formatShort: "GOLD 2D",
    showtimes: [
      { id: "s5", time: "18:45", endsAt: "21:31", info: "Gold Suite • 8 pairs left", seatTone: "ok" },
      { id: "s6", time: "21:15", endsAt: "00:01", info: "Gold Suite • 12 pairs left", seatTone: "ok" },
    ],
  },
];

const CAST = [
  { initials: "TC", name: "Timothée Chalamet", role: "Paul Atreides", tone: "slate" },
  { initials: "ZD", name: "Zendaya", role: "Chani", tone: "amber" },
  { initials: "AB", name: "Austin Butler", role: "Feyd-Rautha", tone: "red" },
  { initials: "FP", name: "Florence Pugh", role: "Princess Irulan", tone: "indigo" },
];

const SCORES = [
  { label: "Rotten Tom.", value: "94%", pct: 94, color: "#dc2626" },
  { label: "Metacritic", value: "79", pct: 79, color: "#f59e0b" },
  { label: "CineScore", value: "A+", pct: 98, color: "#10b981" },
];

function Breadcrumb() {
  return (
    <div className="md-breadcrumb">
      <a href="/"><Home size={13} /> Home</a>
      <span>/</span>
      <a href="#">Now Showing</a>
      <span>/</span>
      <strong>Dune: Part Two (IMAX Laser)</strong>
    </div>
  );
}

function Hero() {
  return (
    <section className="md-hero">
      <div className="md-glow md-glow-red" />
      <div className="md-glow md-glow-amber" />
      <div className="md-hero-inner">
        {/* Poster */}
        <div className="md-poster">
          <div className="md-poster-top">
            <span className="md-age md-age-sm">T18</span>
            <span className="md-imax-badge">IMAX LASER</span>
          </div>
          <div className="md-poster-center">
            <div className="md-poster-icon"><Sun size={30} color="#fff" /></div>
            <div className="md-poster-kicker">FRANK HERBERT'S</div>
            <div className="md-poster-title">DUNE: PART TWO</div>
            <div className="md-poster-sub">A DENIS VILLENEUVE FILM</div>
          </div>
          <div className="md-poster-meta"><Clock size={10} color="#fbbf24" /> 166 Mins • English Audio</div>
        </div>

        {/* Metadata */}
        <div className="md-meta">
          <div>
            <div className="md-meta-badges">
              <span className="md-age">T18</span>
              <span className="md-genre">Sci-Fi • Epic Action</span>
              <span className="md-release">Released March 2024</span>
            </div>
            <div className="md-title-row">
              <h1>DUNE: PART TWO</h1>
              <div className="md-imdb">
                <b>IMDb</b>
                <span><strong>8.6</strong><em>/10</em></span>
                <small>(480k)</small>
              </div>
            </div>
            <p className="md-tagline">"Long live the fighters."</p>
            <p className="md-synopsis">
              Paul Atreides unites with Chani and the Fremen while seeking revenge against the
              conspirators who destroyed his family. Facing a choice between the love of his life
              and the fate of the known universe, he…
            </p>
            <dl className="md-credits">
              <div><dt>Director:</dt><dd><strong>Denis Villeneuve</strong></dd></div>
              <div><dt>Starring:</dt><dd>Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler</dd></div>
              <div>
                <dt>Format:</dt>
                <dd className="md-formats">
                  <span className="is-gold">IMAX with Laser</span><span>4DX</span><span>Dolby Atmos 2D</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className="md-hero-actions">
            <button className="md-ghost-btn"><Bookmark size={12} /> Add to Wishlist</button>
            <button className="md-ghost-btn"><Share2 size={11} /> Share</button>
          </div>
        </div>

        {/* Trailer */}
        <div className="md-trailer">
          <div className="md-trailer-bg" />
          <div className="md-trailer-shade" />
          <div className="md-trailer-badges">
            <span className="md-live"><Play size={6} fill="#fff" /> OFFICIAL TRAILER</span>
            <span className="md-quality">4K ULTRA HD • 02:44</span>
          </div>
          <button className="md-play" aria-label="Play trailer"><Play size={17} fill="#fff" color="#fff" /></button>
          <div className="md-controls">
            <div className="md-progress"><span style={{ width: "40%" }} /></div>
            <div className="md-controls-row">
              <div className="md-controls-left">
                <Pause size={11} /><Volume2 size={13} />
                <span className="md-time">01:05 / 02:44</span>
              </div>
              <div className="md-controls-left">
                <span className="md-res">2160p 60fps</span>
                <Settings size={12} /><Maximize size={11} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DatePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="md-card">
      <div className="md-card-head">
        <h2><CalendarDays size={14} color="#dc2626" /> Select Date &amp; Showtime</h2>
        <span className="md-live-note"><Info size={12} color="#f59e0b" /> Updated live every 30 seconds</span>
      </div>
      <div className="md-dates" role="tablist">
        {DATES.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={value === d.id}
            className={`md-date ${value === d.id ? "is-active" : ""}`}
            onClick={() => onChange(d.id)}
          >
            <span className="md-date-dow">{d.dow}</span>
            <span className="md-date-day">{d.day}</span>
            <span className="md-date-month">{d.month}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HallCard({
  hall, selectedId, onSelect,
}: { hall: Hall; selectedId: string; onSelect: (hall: Hall, st: Showtime) => void }) {
  return (
    <div className="md-card">
      <div className="md-hall-head">
        <div className="md-hall-title">
          <div className={`md-hall-icon ${hall.icon === "star" ? "is-amber" : "is-red"}`}>
            {hall.icon === "star" ? <Star size={14} color="#d97706" fill="#d97706" /> : <Armchair size={16} color="#dc2626" />}
          </div>
          <div>
            <h3>{hall.name}</h3>
            <p>{hall.address}</p>
          </div>
        </div>
        <span className={`md-tag ${hall.tagVariant === "amber" ? "is-solid" : "is-outline"}`}>{hall.tag}</span>
      </div>

      <div className="md-format">
        <span className={`md-format-dot ${hall.formatDot}`} />
        <span>{hall.formatLabel}</span>
      </div>

      <div className="md-showtimes">
        {hall.showtimes.map((st) => {
          const active = st.id === selectedId;
          return (
            <button
              key={st.id}
              className={`md-showtime ${active ? "is-active" : ""} ${st.dimmed ? "is-dimmed" : ""}`}
              onClick={() => onSelect(hall, st)}
              aria-pressed={active}
            >
              <div className="md-showtime-top">
                <span className="md-showtime-time">{st.time}</span>
                {st.badge && <span className={`md-chip ${st.badge === "BEST" ? "best" : "few"}`}>{st.badge}</span>}
              </div>
              <span className="md-showtime-end">Ends {st.endsAt}</span>
              <span className={`md-showtime-seats ${st.seatTone}`}>{st.info}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Reception() {
  return (
    <div className="md-card">
      <h3 className="md-aside-title"><BarChart3 size={12} color="#f59e0b" /> Audience &amp; Critic Reception</h3>
      <div className="md-reception">
        <div className="md-score">
          <div className="md-score-num"><strong>8.9</strong><em>/10</em></div>
          <div className="md-stars">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={12} color="#f59e0b" fill={i < 4 ? "#f59e0b" : "none"} />
            ))}
          </div>
          <small>14,250 Verified Votes</small>
        </div>
        <div className="md-bars">
          {SCORES.map((s) => (
            <div className="md-bar-row" key={s.label}>
              <span className="md-bar-label">{s.label}</span>
              <div className="md-bar-track"><span style={{ width: `${s.pct}%`, background: s.color }} /></div>
              <b>{s.value}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="md-notice">
        <span className="md-age md-age-xs">T18</span>
        <p>
          <strong>Age Restriction Notice:</strong> This film is rated for audiences aged 18 and
          above. Please present official government ID/Citizen ID upon ticket inspection.
        </p>
      </div>
    </div>
  );
}

function Cast() {
  return (
    <div className="md-card">
      <div className="md-card-head">
        <h3 className="md-aside-title">Main Cast &amp; Crew</h3>
        <a className="md-link" href="#">Full Credits</a>
      </div>
      <div className="md-cast">
        {CAST.map((c) => (
          <div className="md-cast-item" key={c.initials}>
            <span className={`md-avatar ${c.tone}`}>{c.initials}</span>
            <div><b>{c.name}</b><small>{c.role}</small></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingBar({ hall, showtime, dateLabel }: { hall: Hall; showtime: Showtime; dateLabel: string }) {
    const navigate = useNavigate();
  return (
    <div className="md-booking">
      <div className="md-booking-left">
        <div className="md-booking-info">
          <span className="md-booking-icon"><Ticket size={16} color="#f87171" /></span>
          <div>
            <div className="md-booking-row">
              <b className="md-booking-movie">DUNE: PART TWO</b>
              <span className="md-age md-age-xs">T18</span>
              <span className="md-booking-format">{hall.formatShort}</span>
            </div>
            <div className="md-booking-row sub">
              <span className="gold">{showtime.time} ({dateLabel})</span>
              <i>•</i><span>{hall.bookingLabel}</span><i>•</i>
              <span className="green">{showtime.info.split("• ")[1]}</span>
            </div>
          </div>
        </div>
        <span className="md-divider" />
        <div className="md-price">
          <small>TICKET FROM</small>
          <div><b>140,000 VND</b> <em>/ seat</em></div>
        </div>
      </div>
      <div className="md-booking-right">
        <button className="md-underline-btn">Change Showtime</button>
        <button 
            className="md-cta"
            onClick={() => navigate("/select-seat")}
        >
            BOOK NOW <ArrowRight size={11} /></button>
      </div>
    </div>
  );
}

export default function MovieDetailPage() {
  const [dateId, setDateId] = useState(DATES[0].id);
  const [selection, setSelection] = useState<{ hall: Hall; showtime: Showtime }>({
    hall: HALLS[0],
    showtime: HALLS[0].showtimes[0],
  });

  const dateLabel = useMemo(() => {
    const d = DATES.find((x) => x.id === dateId)!;
    return d.dow === "TODAY" ? "Tonight" : `${d.dow} ${d.day}`;
  }, [dateId]);

  return (
    <div className="md-page">
      <div className="md-canvas">
        <Header />
        <Breadcrumb />
        <Hero />
        <main className="md-body">
          <div className="md-col-main">
            <DatePicker value={dateId} onChange={setDateId} />
            {HALLS.map((h) => (
              <HallCard
                key={h.id}
                hall={h}
                selectedId={selection.showtime.id}
                onSelect={(hall, showtime) => setSelection({ hall, showtime })}
              />
            ))}
          </div>
          <aside className="md-col-aside">
            <Reception />
            <Cast />
          </aside>
        </main>
        <BookingBar hall={selection.hall} showtime={selection.showtime} dateLabel={dateLabel} />
      </div>
    </div>
  );
}