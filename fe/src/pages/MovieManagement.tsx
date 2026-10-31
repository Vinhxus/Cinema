import { useState } from 'react';
import {
  LayoutGrid,
  Clapperboard,
  CalendarDays,
  Armchair,
  ScanLine,
  Settings,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { AdminTabId, NavItemConfig } from './AdminDashboard';

export interface MovieRecord {
  id: string;
  code: string;
  title: string;
  genre: string;
  duration: string;
  rating: string;
  ratingVariant: 'c13' | 'c18' | 'p';
  status: string;
  statusVariant: 'showing' | 'upcoming' | 'draft';
  showtimes: string;
}

export interface MovieManagementProps {
  managedCinemaName?: string;
  managedCinemaLocation?: string;
  useSharedFooter?: boolean;
  activeTab?: AdminTabId;
  onNavigate?: (tab: AdminTabId) => void;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'movies', label: 'Movie management', icon: Clapperboard },
  { id: 'showtimes', label: 'Showtimes', icon: CalendarDays },
  { id: 'seating', label: 'Seating & pricing', icon: Armchair },
  { id: 'checkin', label: 'Ticket check-in', icon: ScanLine },
];

const MOVIES_DATA: MovieRecord[] = [
  {
    id: 'm-1',
    code: 'PH001',
    title: 'Dune: Hành tinh cát 2',
    genre: 'Science fiction',
    duration: '166 min',
    rating: 'C13',
    ratingVariant: 'c13',
    status: 'Now showing',
    statusVariant: 'showing',
    showtimes: '3 shows',
  },
  {
    id: 'm-2',
    code: 'PH002',
    title: 'Mai',
    genre: 'Drama · Romance',
    duration: '131 min',
    rating: 'C18',
    ratingVariant: 'c18',
    status: 'Now showing',
    statusVariant: 'showing',
    showtimes: '5 shows',
  },
  {
    id: 'm-3',
    code: 'PH003',
    title: 'Lật mặt 7: Một điều ước',
    genre: 'Family · Drama',
    duration: '138 min',
    rating: 'C13',
    ratingVariant: 'c13',
    status: 'Now showing',
    statusVariant: 'showing',
    showtimes: '4 shows',
  },
  {
    id: 'm-4',
    code: 'PH004',
    title: 'Đào, phở và piano',
    genre: 'History · Drama',
    duration: '100 min',
    rating: 'C13',
    ratingVariant: 'c13',
    status: 'Now showing',
    statusVariant: 'showing',
    showtimes: '4 shows',
  },
  {
    id: 'm-5',
    code: 'PH005',
    title: 'Kung Fu Panda 4',
    genre: 'Animation · Adventure',
    duration: '94 min',
    rating: 'P',
    ratingVariant: 'p',
    status: 'Upcoming',
    statusVariant: 'upcoming',
    showtimes: '—',
  },
  {
    id: 'm-6',
    code: 'PH006',
    title: 'Những mảnh ghép cảm xúc 2',
    genre: 'Animation · Family',
    duration: '96 min',
    rating: 'P',
    ratingVariant: 'p',
    status: 'Draft',
    statusVariant: 'draft',
    showtimes: '—',
  },
];

function SidebarNavItem({
  item,
  isActive,
  onSelect,
}: {
  item: NavItemConfig;
  isActive: boolean;
  onSelect: (id: AdminTabId) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 ${
        isActive
          ? 'bg-[#FEF2F2] text-[#DC2626]'
          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          isActive ? 'text-[#DC2626]' : 'text-[#64748B] group-hover:text-[#0F172A]'
        }`}
      />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export default function MovieManagement({
  managedCinemaName = 'SENEMA Nguyễn Du',
  managedCinemaLocation = 'Ho Chi Minh City · 4 screens',
  useSharedFooter = false,
  activeTab = 'movies',
  onNavigate,
}: MovieManagementProps) {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('m-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All statuses');
  const [genreFilter, setGenreFilter] = useState<string>('Genre');

  const selectedMovie = MOVIES_DATA.find((m) => m.id === selectedMovieId) || MOVIES_DATA[0];

  const handleNavClick = (tabId: AdminTabId) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col justify-between border-b border-[#E2E8F0] bg-white p-4 lg:w-[210px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                MANAGED CINEMA
              </div>
              <div className="mt-1 text-xs font-extrabold text-[#0F172A]">
                {managedCinemaName}
              </div>
              <div className="mt-0.5 text-[11px] text-[#64748B]">
                {managedCinemaLocation}
              </div>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Admin sidebar navigation">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeTab}
                  onSelect={handleNavClick}
                />
              ))}

              <div className="my-3 border-t border-[#F1F5F9]" />

              <SidebarNavItem
                item={{ id: 'settings', label: 'System settings', icon: Settings }}
                isActive={activeTab === 'settings'}
                onSelect={handleNavClick}
              />
            </nav>
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0]/60 bg-[#F0FDF4]/60 p-3.5 lg:mt-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#065F46]">
                All systems operational
              </span>
            </div>
            <div className="mt-1 text-[10px] font-medium text-[#64748B]">
              Synced at 17:25
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Movie management
              </h1>
              <p className="mt-1 text-xs font-normal text-[#475569]">
                Manage movie content, ratings and release status.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 active:scale-[0.99] sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add movie</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
              <span className="text-2xl font-black tracking-tight text-[#DC2626]">12</span>
              <span className="text-xs font-medium text-[#64748B]">Total movies</span>
            </div>
            <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
              <span className="text-2xl font-black tracking-tight text-[#DC2626]">04</span>
              <span className="text-xs font-medium text-[#64748B]">Now showing</span>
            </div>
            <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
              <span className="text-2xl font-black tracking-tight text-[#DC2626]">02</span>
              <span className="text-xs font-medium text-[#64748B]">Upcoming</span>
            </div>
            <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
              <span className="text-2xl font-black tracking-tight text-[#DC2626]">06</span>
              <span className="text-xs font-medium text-[#64748B]">Ended / Draft</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <section className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgb(15,23,42,0.02)] xl:col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">Movie list</h2>
                <span className="text-xs font-medium text-[#64748B]">6 / 12 movies</span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by movie title or ID..."
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs text-[#0F172A] placeholder-[#94A3B8] transition-colors focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                  />
                  <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                </div>

                <div className="relative inline-flex items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-8 pl-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                  >
                    <option value="All statuses">All statuses</option>
                    <option value="Now showing">Now showing</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
                </div>

                <div className="relative inline-flex items-center">
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-8 pl-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                  >
                    <option value="Genre">Genre</option>
                    <option value="Science fiction">Science fiction</option>
                    <option value="Drama">Drama</option>
                    <option value="Animation">Animation</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      <th className="py-2.5 pr-3 pl-3">Movie title / Genre</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-2 text-center">Rating</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Showtimes</th>
                      <th className="py-2.5 pr-3 pl-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {MOVIES_DATA.map((movie) => {
                      const isSelected = movie.id === selectedMovieId;
                      return (
                        <tr
                          key={movie.id}
                          onClick={() => setSelectedMovieId(movie.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#FEF2F2]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td className="py-3.5 pr-3 pl-3">
                            <div className="font-bold text-[#0F172A]">{movie.title}</div>
                            <div className="mt-0.5 text-[11px] text-[#64748B]">
                              {movie.code} · {movie.genre}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#475569]">{movie.duration}</td>
                          <td className="py-3.5 px-2 text-center">
                            <span
                              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                movie.ratingVariant === 'c18'
                                  ? 'border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                                  : movie.ratingVariant === 'c13'
                                  ? 'border border-[#E2E8F0] bg-white text-[#475569]'
                                  : 'border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]'
                              }`}
                            >
                              {movie.rating}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`font-semibold ${
                                movie.statusVariant === 'showing'
                                  ? 'text-[#059669]'
                                  : movie.statusVariant === 'upcoming'
                                  ? 'text-[#D97706]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {movie.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[#475569]">{movie.showtimes}</td>
                          <td className="py-3.5 pr-3 pl-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="rounded p-1 text-[#DC2626] transition-colors hover:bg-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4 sm:flex-row">
                <span className="text-[11px] text-[#64748B]">Showing 1–6 of 12 movies</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border border-[#DC2626] bg-[#DC2626] text-xs font-bold text-white"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            <section className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgb(15,23,42,0.02)] xl:col-span-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">Selected movie</h2>
                <span className="text-xs font-semibold text-[#059669]">
                  {selectedMovie.status}
                </span>
              </div>

              <div className="relative mt-4 aspect-4/5 w-full overflow-hidden rounded-xl bg-[#0F172A]">
                <img
                  src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                  alt={selectedMovie.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {selectedMovie.rating}
                  </span>
                  <span className="rounded bg-[#D97706] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    2D
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {selectedMovie.title}
                </h3>
                <div className="mt-0.5 text-[11px] text-[#64748B]">
                  {selectedMovie.code} · Released 01/03/2024
                </div>

                <div className="my-3 flex items-center justify-between border-y border-[#F1F5F9] py-2.5 text-xs font-semibold">
                  <span className="uppercase text-[#0F172A]">{selectedMovie.duration}</span>
                  <span className="uppercase text-[#DC2626]">Vietnamese Subs</span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#475569]">
                  <div>Language: English</div>
                  <div>Format: 2D · IMAX</div>
                  <div>3 shows today · 2 screens</div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="flex h-9.5 w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] active:scale-[0.99]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit movie</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('showtimes')}
                    className="flex h-9.5 w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 active:scale-[0.99]"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>View showtimes</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {useSharedFooter ? (
        <Footer />
      ) : (
        <footer className="w-full border-t border-[#E2E8F0] bg-white px-6 py-3.5 text-[11px] font-medium text-[#64748B]">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 sm:flex-row">
            <span>SENEMA · Cinema dashboard</span>
            <span>Tuesday, 13/10/2026 · Afternoon shift 14:00–22:00</span>
          </div>
        </footer>
      )}
    </div>
  );
}