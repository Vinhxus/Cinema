import { useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Clapperboard,
  CalendarDays,
  Armchair,
  ScanLine,
  Settings,
  Search,
  ChevronDown,
  History,
  Camera,
  Pause,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { AdminTabId, NavItemConfig } from './AdminDashboard';

export interface TicketCheckInProps {
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

const RECENT_CHECKINS = [
  { time: '17:25:08', ticketId: 'SN-261013-002481', customer: 'Trần Anh Thư', seat: '01 / E06', result: 'Admitted', status: 'success', staff: 'Nguyễn Minh' },
  { time: '17:24:42', ticketId: 'SN-261013-002479', customer: 'Lê Hoàng Nam', seat: '01 / E05', result: 'Admitted', status: 'success', staff: 'Nguyễn Minh' },
  { time: '17:24:16', ticketId: 'SN-261013-002472', customer: 'Phạm Minh Anh', seat: '01 / D08', result: 'Admitted', status: 'success', staff: 'Nguyễn Minh' },
  { time: '17:23:55', ticketId: 'SN-261013-002451', customer: 'Nguyễn Đức Huy', seat: '01 / C04', result: 'Already used', status: 'warning', staff: 'Nguyễn Minh' },
  { time: '17:23:21', ticketId: 'SN-261013-002468', customer: 'Vũ Thanh Hà', seat: '01 / F07', result: 'Admitted', status: 'success', staff: 'Nguyễn Minh' },
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

export default function TicketCheckIn({
  managedCinemaName = 'SENEMA Nguyễn Du',
  managedCinemaLocation = 'Ho Chi Minh City · 4 screens',
  useSharedFooter = false,
  activeTab = 'checkin',
  onNavigate,
}: TicketCheckInProps) {
  const [selectedGate, setSelectedGate] = useState('Gate 01 · Screen 01');
  const [selectedMovie, setSelectedMovie] = useState('17:45 · Dune: Hành tinh cát 2');
  const [manualLookupValue, setManualLookupValue] = useState('SN-261013-002481');

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
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">MANAGED CINEMA</div>
              <div className="mt-1 text-xs font-extrabold text-[#0F172A]">{managedCinemaName}</div>
              <div className="mt-0.5 text-[11px] text-[#64748B]">{managedCinemaLocation}</div>
            </div>

            <nav className="flex flex-col gap-1" aria-label="Admin sidebar navigation">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <SidebarNavItem key={item.id} item={item} isActive={item.id === activeTab} onSelect={handleNavClick} />
              ))}
              <div className="my-3 border-t border-[#F1F5F9]" />
              <SidebarNavItem item={{ id: 'settings', label: 'System settings', icon: Settings }} isActive={activeTab === 'settings'} onSelect={handleNavClick} />
            </nav>
          </div>

          <div className="mt-6 rounded-xl border border-[#E2E8F0]/60 bg-[#F0FDF4]/60 p-3.5 lg:mt-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span className="text-[11px] font-bold text-[#065F46]">All systems operational</span>
            </div>
            <div className="mt-1 text-[10px] font-medium text-[#64748B]">Synced at 17:25</div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Ticket check-in & lookup</h1>
              <p className="mt-1 text-xs font-normal text-[#475569]">Validate tickets, confirm admission and track check-ins.</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0F172A] shadow-2xs transition-colors hover:bg-[#F8FAFC]">
              <History className="h-3.5 w-3.5 text-[#475569]" />
              <span>Check-in history</span>
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative inline-flex items-center">
                <select value={selectedGate} onChange={(e) => setSelectedGate(e.target.value)} className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]">
                  <option value="Gate 01 · Screen 01">Gate 01 · Screen 01</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
              <div className="relative inline-flex items-center">
                <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)} className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]">
                  <option value="17:45 · Dune: Hành tinh cát 2">17:45 · Dune: Hành tinh cát 2</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-[#059669]">Check-in open</span>
              <span className="text-[#0F172A] font-bold">36 / 82 guests admitted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardCard className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#0F172A]">Scan QR code</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#64748B]" />
                  <span>Camera connected</span>
                </div>
              </div>

              <div className="relative aspect-video w-full rounded-xl bg-[#0F172A] overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute top-3 left-3 text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">Cam 01 · Entrance</div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold text-[#10B981]"><span className="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>LIVE</div>
                
                {/* QR Scanner Reticle Overlay */}
                <div className="relative w-48 h-48 border border-white/20 flex items-center justify-center">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#DC2626]"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#DC2626]"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#DC2626]"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#DC2626]"></div>
                  <div className="absolute inset-y-1/2 left-0 right-0 border-t border-[#DC2626]/40"></div>
                  
                  {/* Mock QR Code Pattern inside reticle */}
                  <div className="w-24 h-24 bg-white rounded-sm p-1 grid grid-cols-2 grid-rows-2 gap-0.5">
                     <div className="border-[3px] border-black rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black"></div></div>
                     <div className="border-[3px] border-black rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black"></div></div>
                     <div className="border-[3px] border-black rounded-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-black"></div></div>
                     <div className="border-t-[3px] border-l-[3px] border-black rounded-tl-sm relative"><div className="absolute bottom-0 right-0 w-2 h-2 bg-black"></div></div>
                  </div>
                </div>

                <div className="absolute bottom-4 text-[10px] text-[#94A3B8]">Center the ticket's QR code in the frame</div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex h-8 items-center gap-1.5 rounded border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC]">
                  <Camera className="h-3.5 w-3.5" /> Switch camera
                </button>
                <button className="flex h-8 items-center gap-1.5 rounded border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC]">
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
                <button className="flex h-8 items-center gap-1.5 rounded border border-[#E2E8F0] bg-white px-3 text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC]">
                  <Volume2 className="h-3.5 w-3.5" /> Sound on
                </button>
              </div>

              <div className="mt-6 text-[11px] text-[#64748B] border-t border-[#F1F5F9] pt-4">
                Only tickets for the correct screen and screening are accepted. Used tickets trigger a warning and cannot be admitted again.
              </div>
            </DashboardCard>

            <div className="flex flex-col gap-6">
              <DashboardCard className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">Manual lookup</h2>
                  <span className="text-[11px] font-medium text-[#64748B]">Ticket ID / order ID / phone</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                    <input type="text" value={manualLookupValue} onChange={(e) => setManualLookupValue(e.target.value)} className="h-9 w-full rounded-lg border border-[#E2E8F0] pl-9 pr-3 text-xs font-medium text-[#0F172A]" />
                  </div>
                  <button className="h-9 rounded-lg bg-[#EA580C] px-4 text-xs font-bold text-white hover:bg-[#C2410C]">
                    Search
                  </button>
                </div>
              </DashboardCard>

              {/* Valid Ticket Result Card */}
              <DashboardCard className="flex flex-col border-[#BBF7D0] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
                <div className="flex items-start gap-3 bg-[#F0FDF4] p-3 -mt-6 -mx-6 mb-5 border-b border-[#BBF7D0]">
                  <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#065F46]">Valid ticket · Admitted</span>
                    <span className="text-[10px] font-medium text-[#059669]">Confirmed at 17:25:08 by Nguyễn Minh</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#0F172A]">Dune: Hành tinh cát 2</h3>
                <div className="text-xs text-[#64748B] mt-0.5">13/10/2026 · 17:45–20:31 · 2D · Vietnamese subs</div>

                <div className="grid grid-cols-3 gap-4 mt-5 mb-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Screen</span>
                    <span className="text-xl font-black text-[#0F172A]">01</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">VIP Seat</span>
                    <span className="text-xl font-black text-[#DC2626]">E06</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Ticket Price</span>
                    <span className="text-base font-bold text-[#0F172A] mt-1">110.000 ₫</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t border-[#F1F5F9] pt-4 text-[10px] text-[#64748B]">
                  <div>Ticket ID: SN-261013-002481 · Order: SN-261013-089</div>
                  <div>Customer: Trần Anh Thư · 090 **** 68</div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <button className="h-9 rounded-lg bg-[#EA580C] px-4 text-xs font-bold text-white hover:bg-[#C2410C]">
                    Scan next ticket
                  </button>
                  <button className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]">
                    View order
                  </button>
                </div>
              </DashboardCard>
            </div>
          </div>

          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#0F172A]">Recent check-ins</h2>
              <span className="text-[11px] font-medium text-[#64748B]">Latest 5 check-ins · Auto-updated</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Screen / Seat</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium">
                  {RECENT_CHECKINS.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="py-3 px-3 text-[#0F172A] font-bold">{row.time}</td>
                      <td className="py-3 px-3 text-[#475569]">{row.ticketId}</td>
                      <td className="py-3 px-3 text-[#0F172A]">{row.customer}</td>
                      <td className="py-3 px-3 text-[#475569]">{row.seat}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 ${row.status === 'success' ? 'text-[#059669]' : 'text-[#D97706]'}`}>
                          {row.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {row.result}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#475569]">{row.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>

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