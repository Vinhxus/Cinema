import { useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Clapperboard,
  CalendarDays,
  Armchair,
  ScanLine,
  Settings,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Copy,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { AdminTabId, NavItemConfig } from './AdminDashboard';

export interface ShowtimesProps {
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

interface ScreeningBlock {
  id: string;
  title: string;
  timeRange: string;
  subtitle: string;
  status: 'completed' | 'scheduled' | 'selected';
  leftPercent: number;
  widthPercent: number;
}

interface ScreenRow {
  id: string;
  name: string;
  seats: number;
  format: string;
  blocks: ScreeningBlock[];
}

const TIMELINE_DATA: ScreenRow[] = [
  {
    id: 's1',
    name: 'Screen 01',
    seats: 104,
    format: '2D',
    blocks: [
      { id: 'b1-1', title: 'Dune: Hành tinh cát 2', timeRange: '10:30-13:16', subtitle: 'Completed', status: 'completed', leftPercent: 3.57, widthPercent: 19.76 },
      { id: 'b1-2', title: 'Mai', timeRange: '13:36-15:47', subtitle: 'Completed', status: 'completed', leftPercent: 25.71, widthPercent: 15.59 },
      { id: 'b1-3', title: 'Dune: Hành tinh cát 2', timeRange: '17:45-20:31', subtitle: '82/104 tickets', status: 'selected', leftPercent: 55.35, widthPercent: 19.76 },
      { id: 'b1-4', title: 'Mai', timeRange: '20:51-23:02', subtitle: '45/104 tickets', status: 'scheduled', leftPercent: 77.50, widthPercent: 15.59 },
    ],
  },
  {
    id: 's2',
    name: 'Screen 02',
    seats: 96,
    format: '2D',
    blocks: [
      { id: 'b2-1', title: 'Mai', timeRange: '11:00-13:11', subtitle: 'Completed', status: 'completed', leftPercent: 7.14, widthPercent: 15.59 },
      { id: 'b2-2', title: 'Lật mặt 7', timeRange: '14:00-16:18', subtitle: 'Completed', status: 'completed', leftPercent: 28.57, widthPercent: 16.42 },
      { id: 'b2-3', title: 'Mai', timeRange: '18:00-20:11', subtitle: '76/96 tickets', status: 'scheduled', leftPercent: 57.14, widthPercent: 15.59 },
      { id: 'b2-4', title: 'Lật mặt 7', timeRange: '20:36-22:54', subtitle: '32/96 tickets', status: 'scheduled', leftPercent: 75.71, widthPercent: 16.42 },
    ],
  },
  {
    id: 's3',
    name: 'Screen 03',
    seats: 88,
    format: '2D',
    blocks: [
      { id: 'b3-1', title: 'Lật mặt 7', timeRange: '10:00-12:18', subtitle: 'Completed', status: 'completed', leftPercent: 0, widthPercent: 16.42 },
      { id: 'b3-2', title: 'Dune: Hành tinh cát 2', timeRange: '13:00-15:46', subtitle: 'Completed', status: 'completed', leftPercent: 21.42, widthPercent: 19.76 },
      { id: 'b3-3', title: 'Lật mặt 7', timeRange: '18:30-20:48', subtitle: '64/88 tickets', status: 'scheduled', leftPercent: 60.71, widthPercent: 16.42 },
      { id: 'b3-4', title: 'Mai', timeRange: '21:09-23:20', subtitle: '26/88 tickets', status: 'scheduled', leftPercent: 79.64, widthPercent: 15.59 },
    ],
  },
  {
    id: 's4',
    name: 'Screen 04',
    seats: 80,
    format: '2D',
    blocks: [
      { id: 'b4-1', title: 'Đào, phở và piano', timeRange: '11:30-13:10', subtitle: 'Completed', status: 'completed', leftPercent: 10.71, widthPercent: 11.90 },
      { id: 'b4-2', title: 'Đào, phở và piano', timeRange: '15:00-16:40', subtitle: 'Completed', status: 'completed', leftPercent: 35.71, widthPercent: 11.90 },
      { id: 'b4-3', title: 'Đào, phở và piano', timeRange: '19:00-20:40', subtitle: '42/80 tickets', status: 'scheduled', leftPercent: 64.28, widthPercent: 11.90 },
      { id: 'b4-4', title: 'Đào, phở và piano', timeRange: '21:00-22:40', subtitle: '18/80 tickets', status: 'scheduled', leftPercent: 78.57, widthPercent: 11.90 },
    ],
  },
];

const TIME_LABELS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];
const CURRENT_TIME_PERCENT = 52.97;

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

export default function Showtimes({
  managedCinemaName = 'SENEMA Nguyễn Du',
  managedCinemaLocation = 'Ho Chi Minh City · 4 screens',
  useSharedFooter = false,
  activeTab = 'showtimes',
  onNavigate,
}: ShowtimesProps) {
  const [selectedScreen, setSelectedScreen] = useState<string>('All screens');
  const [viewMode, setViewMode] = useState<'Daily' | 'Weekly'>('Daily');

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
                Showtime timeline
              </h1>
              <p className="mt-1 text-xs font-normal text-[#475569]">
                Schedule screenings by screen, manage timing and breaks.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 active:scale-[0.99] sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add screening</span>
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white h-9">
                <button className="flex h-full w-9 items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] border-r border-[#E2E8F0] rounded-l-lg transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex h-full items-center gap-2 px-3 text-xs font-medium text-[#0F172A]">
                  <span>Tuesday, 13/10/2026</span>
                  <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                </div>
                <button className="flex h-full w-9 items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] border-l border-[#E2E8F0] rounded-r-lg transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="relative inline-flex items-center">
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20"
                >
                  <option value="All screens">All screens</option>
                  <option value="Screen 01">Screen 01</option>
                  <option value="Screen 02">Screen 02</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <button
                onClick={() => setViewMode('Daily')}
                className={`transition-colors ${viewMode === 'Daily' ? 'text-[#DC2626]' : 'text-[#475569] hover:text-[#0F172A]'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('Weekly')}
                className={`transition-colors ${viewMode === 'Weekly' ? 'text-[#DC2626]' : 'text-[#475569] hover:text-[#0F172A]'}`}
              >
                Weekly
              </button>
            </div>
          </div>

          <section className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgb(15,23,42,0.02)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-bold text-[#0F172A]">Today's schedule</h2>
              
              <div className="flex items-center gap-5 text-[11px] font-semibold text-[#64748B]">
                <div className="flex items-center gap-1.5"><span className="text-[#0F172A]">Completed</span></div>
                <div className="flex items-center gap-1.5"><span className="text-[#D97706]">Scheduled</span></div>
                <div className="flex items-center gap-1.5"><span className="text-[#DC2626]">Selected</span></div>
                <span className="ml-2 font-normal">Minimum break: 20 min · Drag screenings to reschedule</span>
              </div>

              <span className="text-xs font-medium text-[#64748B]">16 screenings · 4 screens · No conflicts</span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[1000px] relative select-none">
                
                <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="w-[120px] shrink-0 p-3 flex flex-col justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Screen</span>
                  </div>
                  <div className="relative flex-1 h-12">
                    {TIME_LABELS.map((label, index) => {
                      const leftPos = (index / (TIME_LABELS.length - 1)) * 100;
                      return (
                        <div key={label} className="absolute bottom-3 -translate-x-1/2 flex flex-col items-center gap-1" style={{ left: `${leftPos}%` }}>
                          <span className="text-[10px] font-medium text-[#64748B]">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex pointer-events-none">
                    <div className="w-[120px] shrink-0"></div>
                    <div className="relative flex-1">
                      {TIME_LABELS.map((label, index) => {
                        const leftPos = (index / (TIME_LABELS.length - 1)) * 100;
                        return <div key={`grid-${label}`} className="absolute top-0 bottom-0 border-l border-dashed border-[#E2E8F0]" style={{ left: `${leftPos}%` }} />;
                      })}
                    </div>
                  </div>

                  <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `calc(120px + ${CURRENT_TIME_PERCENT}% - 24px)` }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      17:25
                    </div>
                    <div className="absolute top-1 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#DC2626]" />
                  </div>

                  {TIMELINE_DATA.map((row) => (
                    <div key={row.id} className="flex border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]/50 transition-colors">
                      <div className="w-[120px] shrink-0 p-4 border-r border-[#E2E8F0] bg-white z-10 flex flex-col justify-center">
                        <span className="text-xs font-bold text-[#0F172A]">{row.name}</span>
                        <span className="text-[10px] text-[#64748B] mt-0.5">{row.seats} seats · {row.format}</span>
                      </div>
                      <div className="relative flex-1 h-[88px] py-3">
                        {row.blocks.map((block) => {
                          const isCompleted = block.status === 'completed';
                          const isSelected = block.status === 'selected';
                          
                          let blockStyles = '';
                          let textStyles = '';
                          let subTextStyles = '';

                          if (isSelected) {
                            blockStyles = 'bg-[#FEF2F2] border-[#DC2626] shadow-sm z-10 scale-[1.02]';
                            textStyles = 'text-[#DC2626]';
                            subTextStyles = 'text-[#DC2626]';
                          } else if (isCompleted) {
                            blockStyles = 'bg-[#F8FAFC] border-[#E2E8F0] opacity-80';
                            textStyles = 'text-[#475569]';
                            subTextStyles = 'text-[#94A3B8]';
                          } else {
                            blockStyles = 'bg-[#FFFBEB] border-[#FDE68A] hover:border-[#FCD34D] cursor-pointer';
                            textStyles = 'text-[#0F172A]';
                            subTextStyles = 'text-[#64748B]';
                          }

                          return (
                            <div
                              key={block.id}
                              className={`absolute h-full rounded-md border p-2 flex flex-col overflow-hidden transition-all ${blockStyles}`}
                              style={{ left: `${block.leftPercent}%`, width: `${block.widthPercent}%` }}
                            >
                              <span className={`text-[10px] font-bold truncate ${textStyles}`}>{block.title}</span>
                              <span className={`text-[9px] mt-0.5 ${subTextStyles}`}>{block.timeRange}</span>
                              <span className={`text-[9px] mt-auto font-medium truncate ${subTextStyles}`}>{block.subtitle}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            <DashboardCard className="lg:col-span-7 flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-extrabold text-[#0F172A]">Dune: Hành tinh cát 2</h2>
                <span className="text-[11px] font-medium text-[#64748B]">Selected screening</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-6 border-b border-[#F1F5F9] pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Screen 01 · 13/10/2026</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black tracking-tight text-[#0F172A]">17:45</span>
                    <span className="text-sm font-bold text-[#64748B]">→</span>
                    <span className="text-2xl font-black tracking-tight text-[#0F172A]">20:31</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] mt-1">166 min · 2D · Vietnamese subs · C13</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Sold / Capacity</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black tracking-tight text-[#0F172A]">82</span>
                    <span className="text-base font-bold text-[#475569]">/ 104 tickets</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#059669] mt-1">78.8% occupancy</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] active:scale-[0.99]">
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit screening</span>
                </button>
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] shadow-sm transition-all hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 active:scale-[0.99]">
                  <Copy className="h-3.5 w-3.5 text-[#475569]" />
                  <span>Duplicate</span>
                </button>
                <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] shadow-sm transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FCA5A5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/20 active:scale-[0.99]">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Cancel screening</span>
                </button>
              </div>
            </DashboardCard>

            <DashboardCard className="lg:col-span-5 flex flex-col">
              <h2 className="text-sm font-bold text-[#0F172A]">Schedule check</h2>
              
              <div className="mt-5 flex flex-col gap-4">
                <span className="text-[11px] font-bold text-[#059669]">No conflicts</span>
                <p className="text-xs font-medium text-[#475569] leading-relaxed">
                  The next screening starts at 20:51, allowing 20 minutes for cleaning and setup.
                </p>
                <p className="text-xs font-medium text-[#D97706] leading-relaxed">
                  Changes to screenings with sold tickets require confirmation.
                </p>
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