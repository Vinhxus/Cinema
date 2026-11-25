import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Download,
  ChevronDown,
  Banknote,
  Ticket,
  Users,
  Film,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import AdminLayout, {
  type AdminTabId,
  type NavItemConfig,
} from '../components/admin/AdminLayout';
import {
  ApiError,
  roomsApi,
  statsApi,
  type AdminStatsResponse,
  type Room,
} from '../api/adminApi';
import { getTodayDateString, useAdminSession } from '../hooks/useAdminSession';

export type { AdminTabId, NavItemConfig };

export interface KpiCardProps {
  title: string;
  value: string;
  subtext: string;
  subtextVariant: 'positive' | 'neutral';
  icon: LucideIcon;
}

export interface AdminDashboardProps {
  useSharedFooter?: boolean;
  activeTab?: AdminTabId;
  onNavigate?: (tab: AdminTabId) => void;
}

function addDaysToIso(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;
}

function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

function formatPercentChange(todayVal: number, yesterdayVal: number, suffix = 'vs. yesterday'): {
  text: string;
  variant: 'positive' | 'neutral';
} {
  if (yesterdayVal === 0 && todayVal === 0) {
    return { text: `No activity ${suffix}`, variant: 'neutral' };
  }
  if (yesterdayVal === 0) {
    return { text: `↑ 100% ${suffix}`, variant: 'positive' };
  }
  const diff = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
  const arrow = diff >= 0 ? '↑' : '↓';
  return {
    text: `${arrow} ${Math.abs(diff).toFixed(1)}% ${suffix}`,
    variant: diff >= 0 ? 'positive' : 'neutral',
  };
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
  useSharedFooter = false,
  activeTab = 'overview',
  onNavigate,
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    selectedCinema,
    isDbConnected,
  } = useAdminSession(['ADMIN']);

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCinemaId) return;
    let cancelled = false;
    roomsApi
      .list({ cinema_id: selectedCinemaId })
      .then((list) => {
        if (!cancelled) {
          setRooms(list);
          setSelectedRoomId('ALL');
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedCinemaId]);

  const loadStats = async () => {
    if (!selectedCinemaId) return;
    setLoading(true);
    setError(null);
    try {
      const from = addDaysToIso(selectedDate, -6);
      const data = await statsApi.getStats({
        from,
        to: selectedDate,
        cinema_id: selectedCinemaId,
        room_id: selectedRoomId !== 'ALL' ? Number(selectedRoomId) : undefined,
      });
      setStats(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedCinemaId, selectedDate, selectedRoomId]);

  const kpiMetrics = useMemo<KpiCardProps[]>(() => {
    const today = stats?.summary.today;
    const yesterday = stats?.summary.yesterday;
    const revDelta = formatPercentChange(
      today?.revenue || 0,
      yesterday?.revenue || 0
    );
    const ticketDelta = formatPercentChange(
      today?.ticketsSold || 0,
      yesterday?.ticketsSold || 0
    );
    const occDiff = (today?.occupancyRate || 0) - (yesterday?.occupancyRate || 0);

    return [
      {
        title: "Day's revenue",
        value: formatVnd(today?.revenue || 0),
        subtext: revDelta.text,
        subtextVariant: revDelta.variant,
        icon: Banknote,
      },
      {
        title: 'Tickets sold',
        value: `${today?.ticketsSold ?? 0} tickets`,
        subtext: ticketDelta.text,
        subtextVariant: ticketDelta.variant,
        icon: Ticket,
      },
      {
        title: 'Occupancy rate',
        value: `${(today?.occupancyRate ?? 0).toFixed(1)}%`,
        subtext: `${occDiff >= 0 ? '↑' : '↓'} ${Math.abs(occDiff).toFixed(1)} percentage points`,
        subtextVariant: occDiff >= 0 ? 'positive' : 'neutral',
        icon: Users,
      },
      {
        title: "Day's screenings",
        value: `${today?.totalScreenings ?? 0} screenings`,
        subtext: `${today?.completedScreenings ?? 0} completed · ${today?.upcomingScreenings ?? 0} upcoming`,
        subtextVariant: 'neutral',
        icon: Film,
      },
    ];
  }, [stats]);

  const maxDailyRevenue = useMemo(() => {
    const vals = stats?.daily.map((d) => d.revenue) || [0];
    return Math.max(1, ...vals);
  }, [stats]);

  const maxSlotTickets = useMemo(() => {
    const vals = stats?.attendanceByTimeSlot.map((s) => s.ticketCount) || [0];
    return Math.max(1, ...vals);
  }, [stats]);

  const peakSlot = useMemo(() => {
    if (!stats?.attendanceByTimeSlot.length) return null;
    return stats.attendanceByTimeSlot.reduce((best, cur) =>
      cur.ticketCount > best.ticketCount ? cur : best
    );
  }, [stats]);

  const handleExportCsv = () => {
    if (!stats) return;
    const rows = [
      ['Date', 'Tickets Sold', 'Revenue (VND)'],
      ...stats.daily.map((d) => [d.date, String(d.ticketCount), String(d.revenue)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `senema-stats-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      cinemas={cinemas}
      selectedCinemaId={selectedCinemaId}
      onSelectCinema={setSelectedCinemaId}
      user={user}
      isDbConnected={isDbConnected}
      useSharedFooter={useSharedFooter}
      onNavigate={onNavigate}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
            Operations overview
          </h1>
          <p className="mt-1 text-xs font-normal text-[#475569]">
            Track business performance and operations at{' '}
            {selectedCinema?.CinemaName || 'SENEMA'}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!stats}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0F172A] shadow-2xs transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-[#475569]" />
            <span>Export report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-semibold text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            aria-label="Select date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A] focus:border-[#DC2626] focus:outline-none"
          />

          <div className="relative inline-flex items-center">
            <select
              aria-label="Filter by screen"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A] transition-colors hover:border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
            >
              <option value="ALL">All screens</option>
              {rooms.map((room) => (
                <option key={room.RoomID} value={String(room.RoomID)}>
                  {room.RoomNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#64748B]">
          7-day range: {stats?.range.from || '—'} to {stats?.range.to || selectedDate} ·
          Total: <strong className="text-[#0F172A]">{formatVnd(stats?.summary.totalRevenue || 0)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((kpi) => (
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
                {stats ? `${formatShortDate(stats.range.from)}–${formatShortDate(stats.range.to)}` : '—'}
              </span>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Unit: million VND</span>
              <div className="flex items-center gap-1.5 font-medium text-[#475569]">
                <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                <span>Paid bookings revenue</span>
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
              {(stats?.daily || []).map((bar) => {
                const heightPx =
                  bar.revenue > 0
                    ? Math.max(12, Math.round((bar.revenue / maxDailyRevenue) * 136))
                    : 4;
                const isSelectedDay = bar.date === selectedDate;
                const millions = (bar.revenue / 1_000_000).toFixed(1).replace('.', ',');

                return (
                  <div key={bar.date} className="flex flex-col items-center">
                    <span className="mb-1.5 text-[10px] font-semibold text-[#64748B]">
                      {millions}
                    </span>
                    <div
                      title={`${bar.date}: ${formatVnd(bar.revenue)} (${bar.ticketCount} tickets)`}
                      style={{ height: `${heightPx}px` }}
                      className={`w-full rounded-t-sm transition-all ${
                        bar.revenue === 0
                          ? 'bg-[#E2E8F0]'
                          : isSelectedDay
                          ? 'bg-[#DC2626]'
                          : 'bg-[#F5B5A8]'
                      }`}
                    />
                    <span className="mt-2 text-[10px] font-medium text-[#64748B]">
                      {formatShortDate(bar.date)}
                    </span>
                  </div>
                );
              })}
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
                {stats?.summary.today.ticketsSold ?? 0}
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">
                {peakSlot && peakSlot.ticketCount > 0
                  ? `guests · peak at ${peakSlot.slot}`
                  : 'guests on selected day'}
              </span>
            </div>
          </div>

          <div className="relative mt-6 pt-4">
            {stats?.attendanceByTimeSlot.length ? (
              <div className="relative z-10 flex items-end justify-between gap-2.5">
                {stats.attendanceByTimeSlot.slice(0, 8).map((slot) => {
                  const heightPx =
                    slot.ticketCount > 0
                      ? Math.max(12, Math.round((slot.ticketCount / maxSlotTickets) * 128))
                      : 4;
                  const isPeak = peakSlot && slot.slot === peakSlot.slot && slot.ticketCount > 0;
                  return (
                    <div key={slot.slot} className="flex flex-1 flex-col items-center">
                      <span className="mb-1.5 text-[10px] font-semibold text-[#64748B]">
                        {slot.ticketCount}
                      </span>
                      <div
                        style={{ height: `${heightPx}px` }}
                        className={`w-full rounded-t-sm transition-all ${
                          slot.ticketCount === 0
                            ? 'bg-[#E2E8F0]'
                            : isPeak
                            ? 'bg-[#DC2626]'
                            : 'bg-[#F5B5A8]'
                        }`}
                      />
                      <span className="mt-2 text-[10px] font-medium text-[#64748B]">
                        {slot.slot}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-[#94A3B8]">
                No screenings scheduled on {selectedDate}
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <DashboardCard className="lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Screenings on {formatShortDate(selectedDate)}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/admin/showtimes')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              <span>View showtimes</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B]">
                  <th className="rounded-l-md py-2.5 pr-3 pl-3">Showtime</th>
                  <th className="px-3 py-2.5">Movie</th>
                  <th className="px-3 py-2.5">Screen</th>
                  <th className="px-3 py-2.5">Tickets sold</th>
                  <th className="rounded-r-md py-2.5 pr-3 pl-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {stats?.upcomingScreenings.length ? (
                  stats.upcomingScreenings.slice(0, 8).map((row) => (
                    <tr
                      key={row.ShowtimeID}
                      className="transition-colors hover:bg-[#F8FAFC]/80"
                    >
                      <td className="py-3.5 pr-3 pl-3 font-bold text-[#0F172A]">
                        {row.StartTime.slice(0, 5)}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-[#0F172A]">
                        {row.MovieTitle}
                      </td>
                      <td className="px-3 py-3.5 text-[#475569]">
                        {row.RoomNumber}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-[#475569]">
                        {row.SoldTickets}/{row.Capacity}
                      </td>
                      <td className="py-3.5 pr-3 pl-3">
                        <span
                          className={`inline-flex items-center font-semibold ${
                            row.Status === 'CHECKIN_OPEN'
                              ? 'text-[#059669]'
                              : row.Status === 'COMPLETED'
                              ? 'text-[#64748B]'
                              : 'text-[#D97706]'
                          }`}
                        >
                          {row.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-[#94A3B8]"
                    >
                      No screenings found for this filter.
                    </td>
                  </tr>
                )}
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
                Live cinema telemetry
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#059669]">
                {stats?.operations.readyRooms ?? 0}/
                {stats?.operations.totalRooms ?? 0} screens ready
              </span>
              {(stats?.operations.attentionRooms ?? 0) > 0 && (
                <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#D97706]">
                  {stats?.operations.attentionRooms} need attention
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-col divide-y divide-[#F1F5F9]">
              <div className="flex items-start gap-3 py-3 first:pt-0">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0F172A]">
                    Cinema rooms synchronized
                  </span>
                  <span className="mt-0.5 text-[11px] text-[#64748B]">
                    {stats?.operations.readyRooms ?? 0} screens in READY status
                  </span>
                </div>
              </div>

              {(stats?.operations.recentRefunds || []).map((rf) => (
                <div key={rf.RefundID} className="flex items-start gap-3 py-3 last:pb-0">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Refund {rf.RefundReference} ({rf.Status})
                    </span>
                    <span className="mt-0.5 text-[11px] text-[#64748B]">
                      Order {rf.BookingCode} · {formatVnd(Number(rf.RefundAmount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>
    </AdminLayout>
  );
}
