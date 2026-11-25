import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  Search,
  ChevronDown,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import AdminLayout, { type AdminTabId } from '../components/admin/AdminLayout';
import {
  ApiError,
  staffApi,
  type StaffShowtime,
  type TicketDetail,
} from '../api/adminApi';
import { getTodayDateString, useAdminSession } from '../hooks/useAdminSession';

export interface TicketCheckInProps {
  useSharedFooter?: boolean;
  activeTab?: AdminTabId;
  onNavigate?: (tab: AdminTabId) => void;
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

function formatVnd(amount: number | string): string {
  return `${new Intl.NumberFormat('vi-VN').format(Number(amount || 0))} ₫`;
}

type CheckinResultState =
  | { kind: 'admitted'; ticket: TicketDetail }
  | { kind: 'already_used'; message: string; ticket?: TicketDetail }
  | { kind: 'error'; message: string; ticket?: TicketDetail }
  | null;

export default function TicketCheckIn({
  useSharedFooter = false,
  activeTab = 'checkin',
  onNavigate,
}: TicketCheckInProps) {
  const {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    isDbConnected,
  } = useAdminSession(['ADMIN', 'STAFF']);

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [showtimes, setShowtimes] = useState<StaffShowtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('ALL');
  const [recentCheckins, setRecentCheckins] = useState<TicketDetail[]>([]);
  const [counts, setCounts] = useState<{
    admittedCount: number;
    totalTickets: number;
  } | null>(null);

  const [qrOrTicketInput, setQrOrTicketInput] = useState('');
  const [manualLookupValue, setManualLookupValue] = useState('SN-2026-88492X');
  const [lookupResults, setLookupResults] = useState<TicketDetail[]>([]);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [checkinResult, setCheckinResult] = useState<CheckinResultState>(null);
  const [busy, setBusy] = useState(false);

  const loadShowtimes = async () => {
    if (!selectedCinemaId) return;
    try {
      const list = await staffApi.listShowtimes({
        cinema_id: selectedCinemaId,
        date: selectedDate,
      });
      setShowtimes(list);
      setSelectedShowtimeId('ALL');
    } catch {}
  };

  const loadRecentCheckins = async () => {
    if (!selectedCinemaId) return;
    try {
      const res = await staffApi.listCheckins({
        cinema_id: selectedCinemaId,
        showtime_id:
          selectedShowtimeId !== 'ALL' ? Number(selectedShowtimeId) : undefined,
        limit: 15,
      });
      setRecentCheckins(res.checkins);
      setCounts(res.counts);
    } catch {}
  };

  useEffect(() => {
    loadShowtimes();
  }, [selectedCinemaId, selectedDate]);

  useEffect(() => {
    loadRecentCheckins();
  }, [selectedCinemaId, selectedShowtimeId]);

  const executeCheckin = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const ticket = await staffApi.checkin({
        ...payload,
        cinema_id: selectedCinemaId,
        showtime_id:
          selectedShowtimeId !== 'ALL' ? Number(selectedShowtimeId) : undefined,
      });
      setCheckinResult({ kind: 'admitted', ticket });
      setLookupResults((prev) =>
        prev.map((t) => (t.TicketNo === ticket.TicketNo ? ticket : t))
      );
      await Promise.all([loadRecentCheckins(), loadShowtimes()]);
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details as
          | { code?: string; ticket?: TicketDetail }
          | undefined;
        if (err.status === 409 || details?.code === 'ALREADY_USED') {
          setCheckinResult({
            kind: 'already_used',
            message: err.message,
            ticket: details?.ticket,
          });
        } else {
          setCheckinResult({
            kind: 'error',
            message: err.message,
            ticket: details?.ticket,
          });
        }
      } else {
        setCheckinResult({ kind: 'error', message: 'Check-in request failed' });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleQrOrTicketSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const val = qrOrTicketInput.trim();
    if (!val) return;
    const looksLikeJwt = val.split('.').length === 3 && val.length > 30;
    await executeCheckin(looksLikeJwt ? { qr_token: val } : { ticket_no: val });
  };

  const handleManualLookup = async (e: FormEvent) => {
    e.preventDefault();
    const q = manualLookupValue.trim();
    if (!q) return;
    setBusy(true);
    setLookupSearched(true);
    try {
      const results = await staffApi.lookup({
        q,
        cinema_id: selectedCinemaId,
        showtime_id:
          selectedShowtimeId !== 'ALL' ? Number(selectedShowtimeId) : undefined,
      });
      setLookupResults(results);
    } catch (err) {
      setLookupResults([]);
      if (err instanceof ApiError) {
        setCheckinResult({ kind: 'error', message: err.message });
      }
    } finally {
      setBusy(false);
    }
  };

  const activeShowtimeObj = showtimes.find(
    (s) => String(s.ShowtimeID) === selectedShowtimeId
  );

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
            Ticket check-in & lookup
          </h1>
          <p className="mt-1 text-xs font-normal text-[#475569]">
            Validate QR JWT tokens or look up bookings by code, ticket ID, or phone.
          </p>
        </div>
        <button
          type="button"
          onClick={loadRecentCheckins}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#475569]" />
          <span>Refresh log</span>
        </button>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            aria-label="Showtime date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A]"
          />

          <div className="relative inline-flex items-center">
            <select
              aria-label="Filter by showtime"
              value={selectedShowtimeId}
              onChange={(e) => setSelectedShowtimeId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]"
            >
              <option value="ALL">All showtimes (Cinema-wide)</option>
              {showtimes.map((st) => (
                <option key={st.ShowtimeID} value={String(st.ShowtimeID)}>
                  {st.StartTime.slice(0, 5)} · {st.RoomNumber} · {st.MovieTitle}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-[#059669]">Check-in active</span>
          {activeShowtimeObj ? (
            <span className="font-bold text-[#0F172A]">
              {counts?.admittedCount ?? activeShowtimeObj.AdmittedCount} /{' '}
              {counts?.totalTickets ?? activeShowtimeObj.TotalTickets} tickets admitted
            </span>
          ) : (
            <span className="font-bold text-[#0F172A]">
              {recentCheckins.length} recent admissions
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">
              Scan QR / Ticket Check-in
            </h2>
            <span className="text-[11px] font-medium text-[#64748B]">
              JWT signature verified
            </span>
          </div>

          <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[#0F172A]">
            <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
              Gate Scanner · Ready
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              LIVE
            </div>
            <QrCode className="h-20 w-20 text-white/80" />
            <div className="mt-3 text-[11px] text-[#94A3B8]">
              Paste scanned QR JWT token or Ticket ID below
            </div>
          </div>

          <form onSubmit={handleQrOrTicketSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={qrOrTicketInput}
              onChange={(e) => setQrOrTicketInput(e.target.value)}
              placeholder="Paste QR JWT token or TicketNo (e.g. SN-2026-F12)..."
              className="h-9 flex-1 rounded-lg border border-[#E2E8F0] px-3 text-xs text-[#0F172A]"
            />
            <button
              type="submit"
              disabled={busy || !qrOrTicketInput.trim()}
              className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white hover:bg-[#B91C1C] disabled:opacity-50"
            >
              Admit
            </button>
          </form>

          <p className="mt-4 border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B]">
            Used tickets trigger a duplicate check-in warning (HTTP 409) and cannot
            be admitted twice.
          </p>
        </DashboardCard>

        <div className="flex flex-col gap-6">
          <DashboardCard className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A]">Manual lookup</h2>
              <span className="text-[11px] font-medium text-[#64748B]">
                Ticket ID / Booking Code / Phone
              </span>
            </div>
            <form onSubmit={handleManualLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={manualLookupValue}
                  onChange={(e) => setManualLookupValue(e.target.value)}
                  placeholder="SN-2026-88492X or 0912345678..."
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] pr-3 pl-9 text-xs font-medium text-[#0F172A]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-9 rounded-lg bg-[#EA580C] px-4 text-xs font-bold text-white hover:bg-[#C2410C] disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {lookupSearched && (
              <div className="mt-4 flex flex-col gap-2">
                {lookupResults.length === 0 ? (
                  <div className="text-xs text-[#94A3B8]">
                    No matching tickets found.
                  </div>
                ) : (
                  lookupResults.map((t) => (
                    <div
                      key={t.TicketNo}
                      className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#0F172A]">
                          {t.TicketNo} · Seat {t.SeatLabel} ({t.RoomNumber})
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {t.MovieTitle} · {t.customer_name} ({t.customer_phone}) ·{' '}
                          <strong>{t.status}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => executeCheckin({ ticket_no: t.TicketNo })}
                        className={`h-8 rounded-md px-3 text-[11px] font-bold text-white ${
                          t.status === 'VALID'
                            ? 'bg-[#10B981] hover:bg-[#059669]'
                            : 'bg-[#64748B] hover:bg-[#475569]'
                        }`}
                      >
                        {t.status === 'VALID' ? 'Admit' : t.status}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </DashboardCard>

          {checkinResult && (
            <DashboardCard
              className={`relative flex flex-col overflow-hidden ${
                checkinResult.kind === 'admitted'
                  ? 'border-[#BBF7D0]'
                  : checkinResult.kind === 'already_used'
                  ? 'border-[#FDE68A]'
                  : 'border-[#FECACA]'
              }`}
            >
              <div
                className={`absolute top-0 left-0 h-full w-1 ${
                  checkinResult.kind === 'admitted'
                    ? 'bg-[#10B981]'
                    : checkinResult.kind === 'already_used'
                    ? 'bg-[#D97706]'
                    : 'bg-[#DC2626]'
                }`}
              />
              <div
                className={`-mx-6 -mt-6 mb-5 flex items-start gap-3 border-b p-3 ${
                  checkinResult.kind === 'admitted'
                    ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                    : checkinResult.kind === 'already_used'
                    ? 'border-[#FDE68A] bg-[#FFFBEB]'
                    : 'border-[#FECACA] bg-[#FEF2F2]'
                }`}
              >
                {checkinResult.kind === 'admitted' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#10B981]" />
                ) : checkinResult.kind === 'already_used' ? (
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-[#D97706]" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 text-[#DC2626]" />
                )}
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold ${
                      checkinResult.kind === 'admitted'
                        ? 'text-[#065F46]'
                        : checkinResult.kind === 'already_used'
                        ? 'text-[#92400E]'
                        : 'text-[#991B1B]'
                    }`}
                  >
                    {checkinResult.kind === 'admitted'
                      ? 'Valid ticket · Admitted'
                      : checkinResult.kind === 'already_used'
                      ? 'Warning · Ticket already used'
                      : 'Check-in rejected'}
                  </span>
                  <span className="text-[11px] font-medium text-[#475569]">
                    {checkinResult.kind === 'admitted'
                      ? `Admitted by ${checkinResult.ticket.CheckinStaffName || user?.name}`
                      : checkinResult.message}
                  </span>
                </div>
              </div>

              {checkinResult.ticket && (
                <>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    {checkinResult.ticket.MovieTitle}
                  </h3>
                  <div className="mt-0.5 text-xs text-[#64748B]">
                    {checkinResult.ticket.Date} ·{' '}
                    {checkinResult.ticket.StartTime.slice(0, 5)}–
                    {checkinResult.ticket.EndTime.slice(0, 5)} ·{' '}
                    {checkinResult.ticket.CinemaName}
                  </div>

                  <div className="my-5 grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        Screen
                      </span>
                      <span className="text-base font-black text-[#0F172A]">
                        {checkinResult.ticket.RoomNumber}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {checkinResult.ticket.SeatType} Seat
                      </span>
                      <span className="text-xl font-black text-[#DC2626]">
                        {checkinResult.ticket.SeatLabel}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        Ticket Price
                      </span>
                      <span className="mt-1 text-base font-bold text-[#0F172A]">
                        {formatVnd(checkinResult.ticket.Price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t border-[#F1F5F9] pt-4 text-[11px] text-[#64748B]">
                    <div>
                      Ticket: {checkinResult.ticket.TicketNo} · Order:{' '}
                      {checkinResult.ticket.BookingCode}
                    </div>
                    <div>
                      Customer: {checkinResult.ticket.customer_name} ·{' '}
                      {checkinResult.ticket.customer_phone}
                    </div>
                  </div>
                </>
              )}
            </DashboardCard>
          )}
        </div>
      </div>

      <DashboardCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Recent check-ins</h2>
          <span className="text-[11px] font-medium text-[#64748B]">
            Live database check-in records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="px-3 py-2.5">Check-in Time</th>
                <th className="px-3 py-2.5">Ticket ID</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Screen / Seat</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium">
              {recentCheckins.length ? (
                recentCheckins.map((row) => (
                  <tr
                    key={row.TicketNo}
                    className="transition-colors hover:bg-[#F8FAFC]/50"
                  >
                    <td className="px-3 py-3 font-bold text-[#0F172A]">
                      {row.checkin_time
                        ? new Date(row.checkin_time).toLocaleTimeString('vi-VN')
                        : '—'}
                    </td>
                    <td className="px-3 py-3 text-[#475569]">{row.TicketNo}</td>
                    <td className="px-3 py-3 text-[#0F172A]">
                      {row.customer_name}
                    </td>
                    <td className="px-3 py-3 text-[#475569]">
                      {row.RoomNumber} / {row.SeatLabel}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 text-[#059669]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Admitted
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#475569]">
                      {row.CheckinStaffName || 'Staff'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-xs text-[#94A3B8]"
                  >
                    No check-in records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </AdminLayout>
  );
}
