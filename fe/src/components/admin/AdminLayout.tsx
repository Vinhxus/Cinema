import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Armchair,
  CalendarDays,
  ChevronDown,
  Clapperboard,
  LayoutGrid,
  LogOut,
  ScanLine,
  type LucideIcon,
} from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { clearStoredAuth, type AuthUser, type Cinema } from '../../api/adminApi';
import { ADMIN_ROUTES } from '../../pages/adminRoutes';

export type AdminTabId =
  | 'overview'
  | 'movies'
  | 'showtimes'
  | 'seating'
  | 'checkin'
  | 'settings';

export interface NavItemConfig {
  id: AdminTabId;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'movies', label: 'Movie management', icon: Clapperboard },
  { id: 'showtimes', label: 'Showtimes', icon: CalendarDays },
  { id: 'seating', label: 'Seating & pricing', icon: Armchair },
  { id: 'checkin', label: 'Ticket check-in', icon: ScanLine },
];

interface AdminLayoutProps {
  activeTab: AdminTabId;
  cinemas: Cinema[];
  selectedCinemaId?: number;
  onSelectCinema?: (cinemaId: number) => void;
  user: AuthUser | null;
  isDbConnected: boolean | null;
  useSharedFooter?: boolean;
  onNavigate?: (tab: AdminTabId) => void;
  children: ReactNode;
}

export default function AdminLayout({
  activeTab,
  cinemas,
  selectedCinemaId,
  onSelectCinema,
  user,
  isDbConnected,
  useSharedFooter = false,
  onNavigate,
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const selectedCinema =
    cinemas.find((c) => c.CinemaID === selectedCinemaId) || cinemas[0];

  const handleNavClick = (tabId: AdminTabId) => {
    const route = ADMIN_ROUTES[tabId];
    if (route) navigate(route);
    onNavigate?.(tabId);
  };

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/admin/login');
  };

  const visibleNavItems =
    user?.UserType === 'STAFF'
      ? PRIMARY_NAV_ITEMS.filter((item) => item.id === 'checkin')
      : PRIMARY_NAV_ITEMS;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col justify-between border-b border-[#E2E8F0] bg-white p-4 lg:w-[220px] lg:border-b-0 lg:border-r lg:px-4 lg:py-6">
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                MANAGED CINEMA
              </div>
              {cinemas.length > 0 && onSelectCinema ? (
                <div className="relative mt-1.5">
                  <select
                    aria-label="Select cinema"
                    value={selectedCinemaId ?? cinemas[0].CinemaID}
                    onChange={(e) => onSelectCinema(Number(e.target.value))}
                    className="w-full appearance-none rounded-md border border-[#E2E8F0] bg-white py-1.5 pr-7 pl-2 text-xs font-extrabold text-[#0F172A] focus:border-[#DC2626] focus:outline-none"
                  >
                    {cinemas.map((cinema) => (
                      <option key={cinema.CinemaID} value={cinema.CinemaID}>
                        {cinema.CinemaName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2 right-2 h-3.5 w-3.5 text-[#64748B]" />
                </div>
              ) : (
                <div className="mt-1 text-xs font-extrabold text-[#0F172A]">
                  {selectedCinema?.CinemaName || 'SENEMA System'}
                </div>
              )}
              <div className="mt-1 text-[11px] text-[#64748B]">
                {selectedCinema
                  ? `${selectedCinema.City}${selectedCinema.Branch ? ` · ${selectedCinema.Branch}` : ''}`
                  : 'Loading cinema...'}
              </div>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Admin sidebar navigation">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 ${
                      isActive
                        ? 'bg-[#FEF2F2] text-[#DC2626]'
                        : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#DC2626]'
                          : 'text-[#64748B] group-hover:text-[#0F172A]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}

              <div className="my-3 border-t border-[#F1F5F9]" />

              <button
                type="button"
                onClick={handleLogout}
                className="group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-xs font-semibold text-[#475569] transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              >
                <LogOut className="h-4 w-4 shrink-0 text-[#64748B] group-hover:text-[#DC2626]" />
                <span className="truncate">Sign out</span>
              </button>
            </nav>
          </div>

          <div className="mt-6 flex flex-col gap-2 lg:mt-0">
            {user && (
              <div className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5">
                <div className="truncate text-[11px] font-bold text-[#0F172A]">
                  {user.name}
                </div>
                <div className="text-[10px] font-semibold text-[#64748B]">
                  Role: {user.UserType}
                </div>
              </div>
            )}
            <div
              className={`rounded-xl border p-3.5 ${
                isDbConnected === false
                  ? 'border-[#FECACA] bg-[#FEF2F2]'
                  : 'border-[#E2E8F0]/60 bg-[#F0FDF4]/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isDbConnected === false ? 'bg-[#DC2626]' : 'bg-[#10B981]'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold ${
                    isDbConnected === false ? 'text-[#991B1B]' : 'text-[#065F46]'
                  }`}
                >
                  {isDbConnected === false
                    ? 'Database disconnected'
                    : 'All systems operational'}
                </span>
              </div>
              <div className="mt-1 text-[10px] font-medium text-[#64748B]">
                Live API connected
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {useSharedFooter ? (
        <Footer />
      ) : (
        <footer className="w-full border-t border-[#E2E8F0] bg-white px-6 py-3.5 text-[11px] font-medium text-[#64748B]">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 sm:flex-row">
            <span>SENEMA · Cinema dashboard</span>
            <span>{selectedCinema?.CinemaName || 'SENEMA'} · Live Operations</span>
          </div>
        </footer>
      )}
    </div>
  );
}
