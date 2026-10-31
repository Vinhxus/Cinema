import { useState, type ReactNode } from 'react';
import {
  LayoutGrid,
  Clapperboard,
  CalendarDays,
  Armchair,
  ScanLine,
  Settings,
  ChevronDown,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { AdminTabId, NavItemConfig } from './AdminDashboard';

export interface SeatingProps {
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

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEAT_COLS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const COUPLE_SEATS = ['I01-02', 'I03-04', 'I05-06', 'I07-08'];

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

export default function SeatingAndPricing({
  managedCinemaName = 'SENEMA Nguyễn Du',
  managedCinemaLocation = 'Ho Chi Minh City · 4 screens',
  useSharedFooter = false,
  activeTab = 'seating',
  onNavigate,
}: SeatingProps) {
  const [selectedSeat, setSelectedSeat] = useState('E06');

  const handleNavClick = (tabId: AdminTabId) => {
    if (onNavigate) {
      onNavigate(tabId);
    }
  };

  const getSeatType = (row: string) => {
    if (row === 'E' || row === 'F' || row === 'G' || row === 'H') return 'vip';
    return 'standard';
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
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">Seating & price matrix</h1>
              <p className="mt-1 text-xs font-normal text-[#475569]">Configure seating by screen and set prices for each seat type.</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C]">
              <span>Save configuration</span>
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative inline-flex items-center">
                <select className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]">
                  <option>Screen 01 · 2D</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
              <div className="relative inline-flex items-center">
                <select className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]">
                  <option>2026 standard pricing</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>Active · Since 01/10/2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* SEAT MAP */}
            <DashboardCard className="lg:col-span-8 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-8">
                <h2 className="text-sm font-bold text-[#0F172A]">Screen 01 seating</h2>
                <span className="text-[11px] font-medium text-[#64748B]">104 seats · 9 rows</span>
              </div>

              <div className="text-[10px] font-bold text-[#94A3B8] tracking-widest uppercase mb-6">Screen</div>

              {/* Col Headers */}
              <div className="flex gap-1.5 mb-2">
                <div className="w-4"></div>
                {SEAT_COLS.map((col, i) => (
                  <div key={col} className={`w-8 text-center text-[10px] font-bold text-[#94A3B8] ${i === 6 ? 'ml-6' : ''}`}>{col}</div>
                ))}
                <div className="w-4"></div>
              </div>

              {/* Regular Rows */}
              <div className="flex flex-col gap-1.5 mb-6">
                {SEAT_ROWS.map((row) => (
                  <div key={row} className="flex gap-1.5 items-center">
                    <div className="w-4 text-[10px] font-bold text-[#94A3B8] text-right">{row}</div>
                    
                    {SEAT_COLS.map((col, i) => {
                      const seatId = `${row}${col}`;
                      const type = getSeatType(row);
                      const isSelected = seatId === selectedSeat;
                      
                      let baseClass = "w-8 h-8 rounded border flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors";
                      if (isSelected) {
                        baseClass += " border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#DC2626]";
                      } else if (type === 'vip') {
                        baseClass += " border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] hover:border-[#FCD34D]";
                      } else {
                        baseClass += " border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]";
                      }

                      return (
                        <div 
                          key={seatId} 
                          onClick={() => setSelectedSeat(seatId)}
                          className={`${baseClass} ${i === 6 ? 'ml-6' : ''}`}
                        >
                          {seatId}
                        </div>
                      );
                    })}
                    
                    <div className="w-4 text-[10px] font-bold text-[#94A3B8] text-left">{row}</div>
                  </div>
                ))}
              </div>

              {/* Couple Row */}
              <div className="flex gap-1.5 items-center mb-10">
                <div className="w-4 text-[10px] font-bold text-[#94A3B8] text-right">I</div>
                <div className="w-[calc((2rem*6)+(0.375rem*5))] flex justify-end gap-1.5">
                  <div className="w-[4.375rem] h-8 rounded border border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center text-[9px] font-bold">I01-02</div>
                  <div className="w-[4.375rem] h-8 rounded border border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center text-[9px] font-bold">I03-04</div>
                </div>
                <div className="w-6"></div>
                <div className="w-[calc((2rem*6)+(0.375rem*5))] flex justify-start gap-1.5">
                  <div className="w-[4.375rem] h-8 rounded border border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center text-[9px] font-bold">I05-06</div>
                  <div className="w-[4.375rem] h-8 rounded border border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777] flex items-center justify-center text-[9px] font-bold">I07-08</div>
                </div>
                <div className="w-4 text-[10px] font-bold text-[#94A3B8] text-left">I</div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-[11px] font-medium text-[#64748B]">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[#E2E8F0] bg-white"></div>Standard seats</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[#FDE68A] bg-[#FFFBEB]"></div>VIP seats</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-[#FBCFE8] bg-[#FDF2F8]"></div>Couple seats</div>
                <div className="flex items-center gap-2 ml-4"><div className="w-4 h-4 rounded border border-[#DC2626] bg-[#FEF2F2]"></div><span className="text-[#DC2626]">Selected</span></div>
              </div>
              <div className="text-[10px] text-[#94A3B8] mt-3">Select a seat to change its type or block it. The aisle is between columns 06 and 07.</div>
            </DashboardCard>

            {/* SEAT CONFIG PANEL */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <DashboardCard className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">Seat type settings</h2>
                  <span className="text-[11px] font-medium text-[#64748B]">Screen 01</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-[#E2E8F0]"></div>
                      <div className="flex flex-col"><span className="text-xs font-bold text-[#0F172A]">Standard seats</span><span className="text-[10px] text-[#64748B]">48 seats · Rows A–D</span></div>
                    </div>
                    <button className="text-[11px] font-semibold text-[#DC2626] hover:underline">Edit</button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB]">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-[#FCD34D] bg-[#FEF3C7]"></div>
                      <div className="flex flex-col"><span className="text-xs font-bold text-[#B45309]">VIP seats</span><span className="text-[10px] text-[#D97706]">48 seats · Rows E–H</span></div>
                    </div>
                    <button className="text-[11px] font-semibold text-[#DC2626] hover:underline">Edit</button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-[#FBCFE8] bg-[#FDF2F8]">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-[#F9A8D4] bg-[#FCE7F3]"></div>
                      <div className="flex flex-col"><span className="text-xs font-bold text-[#BE185D]">Couple seats</span><span className="text-[10px] text-[#DB2777]">4 pairs / 8 seats · Row I</span></div>
                    </div>
                    <button className="text-[11px] font-semibold text-[#DC2626] hover:underline">Edit</button>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#F1F5F9]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0F172A]">Seat {selectedSeat}</h3>
                    <span className="text-[11px] font-bold text-[#DC2626]">Selected</span>
                  </div>
                  
                  <div className="relative inline-flex items-center w-full mb-4">
                    <select className="h-9 w-full appearance-none rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A]">
                      <option>Seat type: VIP</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#0F172A]">Allow ticket sales</span>
                    <span className="text-[#059669] font-bold">Enabled</span>
                  </div>
                  
                  <div className="mt-4 text-[10px] text-[#94A3B8] leading-relaxed">
                    Seating changes apply only to screenings with no tickets sold. Screenings already on sale keep their current configuration.
                  </div>

                  <button className="mt-5 w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]">
                    <Plus className="h-3.5 w-3.5" /> Add seat row
                  </button>
                </div>
              </DashboardCard>
            </div>
          </div>

          <DashboardCard>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#0F172A]">Price matrix by seat type</h2>
              <span className="text-[11px] font-medium text-[#64748B]">2D · Prices include VAT</span>
            </div>
            
            <div className="flex items-center justify-between mb-4 text-[11px] text-[#64748B]">
              <span>Mon–Thu: weekdays · Fri–Sun & holidays: weekends · Based on screening start time</span>
              <button className="font-semibold text-[#DC2626] hover:underline">Edit pricing</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold text-[#64748B]">
                    <th className="py-2.5 px-4 font-bold text-[#0F172A]">Seat type / Unit</th>
                    <th className="py-2.5 px-4">Mon–Thu · Before 17:00</th>
                    <th className="py-2.5 px-4">Mon–Thu · From 17:00</th>
                    <th className="py-2.5 px-4">Fri–Sun & holidays · Before 17:00</th>
                    <th className="py-2.5 px-4">Fri–Sun & holidays · From 17:00</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium text-[#0F172A]">
                  <tr className="hover:bg-[#F8FAFC]/50">
                    <td className="py-3.5 px-4 font-bold">Standard / 1 ticket</td>
                    <td className="py-3.5 px-4">70.000 ₫</td>
                    <td className="py-3.5 px-4">90.000 ₫</td>
                    <td className="py-3.5 px-4">90.000 ₫</td>
                    <td className="py-3.5 px-4">110.000 ₫</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/50">
                    <td className="py-3.5 px-4 font-bold">VIP / 1 ticket</td>
                    <td className="py-3.5 px-4">90.000 ₫</td>
                    <td className="py-3.5 px-4">110.000 ₫</td>
                    <td className="py-3.5 px-4">110.000 ₫</td>
                    <td className="py-3.5 px-4">130.000 ₫</td>
                  </tr>
                  <tr className="hover:bg-[#F8FAFC]/50">
                    <td className="py-3.5 px-4 font-bold">Couple / 1 pair (2 tickets)</td>
                    <td className="py-3.5 px-4">180.000 ₫</td>
                    <td className="py-3.5 px-4">220.000 ₫</td>
                    <td className="py-3.5 px-4">220.000 ₫</td>
                    <td className="py-3.5 px-4">260.000 ₫</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 inline-block rounded border border-[#FEF08A] bg-[#FEF9C3] px-3 py-1.5 text-[11px] font-medium text-[#A16207]">
              Example: Dune: Hành tinh cát 2 · 17:45, Tuesday 13/10 → VIP E06: 110,000 ₫ / ticket. Couple seats are sold in pairs only.
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