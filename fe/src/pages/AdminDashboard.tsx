import { useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Clapperboard,
  CalendarDays,
  Armchair,
  ScanLine,
  Settings,
  Download,
  Calendar,
  ChevronDown,
  Banknote,
  Ticket,
  Users,
  Film,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

export interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  subtextVariant: 'positive' | 'neutral';
  icon: LucideIcon;
}

export interface ChartBarData {
  label: string;
  value: number;
  displayValue: string;
  heightClass: string;
  colorClass: string;
}

export interface ScreeningRowData {
  id: string;
  showtime: string;
  movie: string;
  screen: string;
  ticketsSold: string;
  status: string;
  statusVariant: 'success' | 'warning';
}

export interface OperationEventData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColorClass: string;
}

export interface AdminDashboardProps {
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

const KPI_METRICS: KpiCardProps[] = [
  {
    title: "Today's revenue",
    value: '102.600.000 ₫',
    subtext: '↑ 12.8% vs. yesterday',
    subtextVariant: 'positive',
    icon: Banknote,
  },
  {
    title: 'Tickets sold',
    value: '1,008 tickets',
    subtext: '↑ 8.2% vs. yesterday',
    subtextVariant: 'positive',
    icon: Ticket,
  },
  {
    title: 'Occupancy rate',
    value: '68.5%',
    subtext: '↑ 5.1 percentage points',
    subtextVariant: 'positive',
    icon: Users,
  },
  {
    title: "Today's screenings",
    value: '16 screenings',
    subtext: '8 completed · 8 upcoming',
    subtextVariant: 'neutral',
    icon: Film,
  },
];

const REVENUE_BARS: ChartBarData[] = [
  { label: '07/10', value: 9.2, displayValue: '9,2', heightClass: 'h-[42px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '08/10', value: 12.0, displayValue: '12,0', heightClass: 'h-[56px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '09/10', value: 14.8, displayValue: '14,8', heightClass: 'h-[72px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '10/10', value: 19.2, displayValue: '19,2', heightClass: 'h-[94px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '11/10', value: 20.4, displayValue: '20,4', heightClass: 'h-[104px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '12/10', value: 21.8, displayValue: '21,8', heightClass: 'h-[116px]', colorClass: 'bg-[#DC2626]' },
  { label: '13/10', value: 25.2, displayValue: '25,2', heightClass: 'h-[136px]', colorClass: 'bg-[#DC2626]' },
];

const ATTENDANCE_BARS: ChartBarData[] = [
  { label: '10:00', value: 92, displayValue: '92', heightClass: 'h-[36px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '12:00', value: 148, displayValue: '148', heightClass: 'h-[62px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '14:00', value: 204, displayValue: '204', heightClass: 'h-[94px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '18:00', value: 252, displayValue: '252', heightClass: 'h-[128px]', colorClass: 'bg-[#DC2626]' },
  { label: '20:00', value: 192, displayValue: '192', heightClass: 'h-[86px]', colorClass: 'bg-[#F5B5A8]' },
  { label: '22:00', value: 120, displayValue: '120', heightClass: 'h-[48px]', colorClass: 'bg-[#F5B5A8]' },
];

const UPCOMING_SCREENINGS: ScreeningRowData[] = [
  {
    id: 'scr-1',
    showtime: '17:45',
    movie: 'Dune: Hành tinh cát 2',
    screen: 'Screen 01',
    ticketsSold: '82/104',
    status: 'Check-in open',
    statusVariant: 'success',
  },
  {
    id: 'scr-2',
    showtime: '18:00',
    movie: 'Mai',
    screen: 'Screen 02',
    ticketsSold: '76/96',
    status: 'Upcoming',
    statusVariant: 'warning',
  },
  {
    id: 'scr-3',
    showtime: '18:30',
    movie: 'Lật mặt 7: Một điều ước',
    screen: 'Screen 03',
    ticketsSold: '64/88',
    status: 'Upcoming',
    statusVariant: 'warning',
  },
  {
    id: 'scr-4',
    showtime: '19:00',
    movie: 'Đào, phở và piano',
    screen: 'Screen 04',
    ticketsSold: '42/80',
    status: 'Upcoming',
    statusVariant: 'warning',
  },
];

const OPERATION_EVENTS: OperationEventData[] = [
  {
    id: 'op-1',
    title: 'Screen 01 handover',
    description: 'Cleaning completed · 17:20',
    icon: CheckCircle2,
    iconColorClass: 'text-[#10B981]',
  },
  {
    id: 'op-2',
    title: '2 refund requests',
    description: 'Orders SN-261013-042 and -067',
    icon: AlertCircle,
    iconColorClass: 'text-[#D97706]',
  },
  {
    id: 'op-3',
    title: 'Scanner at gate 02',
    description: 'Connected · battery 86%',
    icon: ScanLine,
    iconColorClass: 'text-[#475569]',
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

function KpiCard({ title, value, subtext, subtextVariant, icon: Icon }: KpiCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#64748B]">{title}</span>
        <Icon className="h-4 w-4 shrink-0 text-[#DC2626]" />
      </div>
      <div className="my-2.5 text-2xl font-extrabold tracking-tight text-[#0F172A]">
        {value}
      </div>
      <div
        className={`text-[11px] font-semibold ${
          subtextVariant === 'positive' ? 'text-[#059669]' : 'text-[#64748B]'
        }`}
      >
        {subtext}
      </div>
    </div>
  );
}

function DashboardCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgb(15,23,42,0.02)] ${className}`}
    >
      {children}
    </section>
  );
}

export default function AdminDashboard({
  managedCinemaName = 'SENEMA Nguyễn Du',
  managedCinemaLocation = 'Ho Chi Minh City · 4 screens',
  useSharedFooter = false,
  activeTab = 'overview',
  onNavigate,
}: AdminDashboardProps) {
  const [selectedScreen, setSelectedScreen] = useState<string>('All screens');

  const handleSelectNav = (id: AdminTabId) => {
    if (onNavigate) {
      onNavigate(id);
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
                  onSelect={handleSelectNav}
                />
              ))}

              <div className="my-3 border-t border-[#F1F5F9]" />

              <SidebarNavItem
                item={{ id: 'settings', label: 'System settings', icon: Settings }}
                isActive={activeTab === 'settings'}
                onSelect={handleSelectNav}
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
                Operations overview
              </h1>
              <p className="mt-1 text-xs font-normal text-[#475569]">
                Track business performance and operations at {managedCinemaName}.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0F172A] shadow-2xs transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 active:scale-[0.99] sm:self-auto"
            >
              <Download className="h-3.5 w-3.5 text-[#475569]" />
              <span>Export report</span>
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-6 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20"
              >
                <span>Today, 13/10/2026</span>
                <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
              </button>

              <div className="relative inline-flex items-center">
                <select
                  aria-label="Filter by screen"
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20"
                >
                  <option value="All screens">All screens</option>
                  <option value="Screen 01">Screen 01</option>
                  <option value="Screen 02">Screen 02</option>
                  <option value="Screen 03">Screen 03</option>
                  <option value="Screen 04">Screen 04</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#64748B]" />
              <span>Data updates every 5 minutes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {KPI_METRICS.map((kpi) => (
              <KpiCard key={kpi.title} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <DashboardCard className="flex flex-col justify-between lg:col-span-7">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Revenue over the last 7 days
                  </h2>
                  <span className="text-[11px] font-medium text-[#64748B]">
                    07–13/10/2026
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Unit: million VND</span>
                  <div className="flex items-center gap-1.5 font-medium text-[#475569]">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                    <span>Ticket revenue</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 pt-4">
                <div className="pointer-events-none absolute inset-x-0 top-4 bottom-6 flex flex-col justify-between">
                  <div className="w-full border-b border-dashed border-[#F1F5F9]" />
                  <div className="w-full border-b border-dashed border-[#F1F5F9]" />
                  <div className="w-full border-b border-dashed border-[#F1F5F9]" />
                  <div className="w-full border-b border-[#E2E8F0]" />
                </div>

                <div className="relative z-10 grid grid-cols-7 items-end gap-2.5 sm:gap-4">
                  {REVENUE_BARS.map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center">
                      <span className="mb-1.5 text-[10px] font-semibold text-[#64748B]">
                        {bar.displayValue}
                      </span>
                      <div
                        className={`w-full rounded-t-sm transition-opacity hover:opacity-90 ${bar.heightClass} ${bar.colorClass}`}
                      />
                      <span className="mt-2 text-[10px] font-medium text-[#64748B]">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className="flex flex-col justify-between lg:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Attendance by time slot
                  </h2>
                  <span className="text-[11px] font-medium text-[#64748B]">
                    Based on tickets sold
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-[#0F172A]">
                    1,008
                  </span>
                  <span className="text-[11px] font-medium text-[#64748B]">
                    guests · peak at 18:00
                  </span>
                </div>
              </div>

              <div className="relative mt-6 pt-4">
                <div className="relative z-10 grid grid-cols-6 items-end gap-2.5 sm:gap-3">
                  {ATTENDANCE_BARS.map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center">
                      <span className="mb-1.5 text-[10px] font-semibold text-[#64748B]">
                        {bar.displayValue}
                      </span>
                      <div
                        className={`w-full rounded-t-sm transition-opacity hover:opacity-90 ${bar.heightClass} ${bar.colorClass}`}
                      />
                      <span className="mt-2 text-[10px] font-medium text-[#64748B]">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <DashboardCard className="lg:col-span-7">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Upcoming screenings
                </h2>
                <button
                  type="button"
                  onClick={() => handleSelectNav('showtimes')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] transition-colors hover:text-[#0F172A] focus-visible:outline-none focus-visible:underline"
                >
                  <span>View showtimes</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                      <th className="py-2.5 pr-3 pl-3 rounded-l-md">Showtime</th>
                      <th className="py-2.5 px-3">Movie</th>
                      <th className="py-2.5 px-3">Screen</th>
                      <th className="py-2.5 px-3">Tickets sold</th>
                      <th className="py-2.5 pr-3 pl-3 rounded-r-md">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {UPCOMING_SCREENINGS.map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-[#F8FAFC]/80"
                      >
                        <td className="py-3.5 pr-3 pl-3 font-bold text-[#0F172A]">
                          {row.showtime}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-[#0F172A]">
                          {row.movie}
                        </td>
                        <td className="py-3.5 px-3 text-[#475569]">
                          {row.screen}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-[#475569]">
                          {row.ticketsSold}
                        </td>
                        <td className="py-3.5 pr-3 pl-3">
                          <span
                            className={`inline-flex items-center font-semibold ${
                              row.statusVariant === 'success'
                                ? 'text-[#059669]'
                                : 'text-[#D97706]'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

            <DashboardCard className="flex flex-col justify-between lg:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Operations status
                  </h2>
                  <span className="text-[11px] font-medium text-[#64748B]">
                    Afternoon shift
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#059669]">
                    4/4 screens ready
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#D97706]">
                    2 need attention
                  </span>
                </div>

                <div className="mt-5 flex flex-col divide-y divide-[#F1F5F9]">
                  {OPERATION_EVENTS.map((event) => {
                    const EventIcon = event.icon;
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <EventIcon
                          className={`mt-0.5 h-4 w-4 shrink-0 ${event.iconColorClass}`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {event.title}
                          </span>
                          <span className="mt-0.5 text-[11px] text-[#64748B]">
                            {event.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DashboardCard>
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