import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Copy,
  Trash2,
  X,
} from 'lucide-react';
import AdminLayout, { type AdminTabId } from '../components/admin/AdminLayout';
import {
  ApiError,
  moviesApi,
  roomsApi,
  showtimesApi,
  type Movie,
  type Room,
  type Showtime,
} from '../api/adminApi';
import { getTodayDateString, useAdminSession } from '../hooks/useAdminSession';

export interface ShowtimesProps {
  useSharedFooter?: boolean;
  activeTab?: AdminTabId;
  onNavigate?: (tab: AdminTabId) => void;
}

const TIMELINE_START_MIN = 8 * 60;
const TIMELINE_TOTAL_MIN = 16 * 60;
const TIME_LABELS = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '22:00',
  '24:00',
];

function addDaysToIso(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function calcBlockPosition(startTime: string, endTime: string) {
  const startMin = toMinutes(startTime);
  let endMin = toMinutes(endTime);
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }
  const clampedStart = Math.max(TIMELINE_START_MIN, startMin);
  const clampedEnd = Math.min(TIMELINE_START_MIN + TIMELINE_TOTAL_MIN, endMin);
  const leftPercent =
    ((clampedStart - TIMELINE_START_MIN) / TIMELINE_TOTAL_MIN) * 100;
  const widthPercent = Math.max(
    4,
    ((clampedEnd - clampedStart) / TIMELINE_TOTAL_MIN) * 100
  );
  return { leftPercent, widthPercent };
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
  useSharedFooter = false,
  activeTab = 'showtimes',
  onNavigate,
}: ShowtimesProps) {
  const {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    isDbConnected,
  } = useAdminSession(['ADMIN']);

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingShowtimeId, setEditingShowtimeId] = useState<number | null>(null);
  const [formMovieId, setFormMovieId] = useState<string>('');
  const [formRoomId, setFormRoomId] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(selectedDate);
  const [formStartTime, setFormStartTime] = useState<string>('14:00');
  const [formFormat, setFormFormat] = useState<string>('2D Vietnamese Subs');
  const [formPrice, setFormPrice] = useState<string>('110000');
  const [formStatus, setFormStatus] = useState<Showtime['Status']>('SCHEDULED');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [copyOpen, setCopyOpen] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState<string>(selectedDate);
  const [copyTargetDate, setCopyTargetDate] = useState<string>(() =>
    addDaysToIso(getTodayDateString(), 1)
  );
  const [copyRoomId, setCopyRoomId] = useState<string>('ALL');
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    moviesApi
      .list()
      .then((list) => {
        setMovies(list);
        if (list.length > 0 && !formMovieId) {
          setFormMovieId(String(list[0].MovieID));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCinemaId) return;
    roomsApi
      .list({ cinema_id: selectedCinemaId })
      .then((list) => {
        setRooms(list);
        setSelectedRoomId('ALL');
        if (list.length > 0) {
          setFormRoomId(String(list[0].RoomID));
        }
      })
      .catch(() => {});
  }, [selectedCinemaId]);

  const fetchShowtimes = async () => {
    if (!selectedCinemaId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await showtimesApi.list({
        cinema_id: selectedCinemaId,
        room_id: selectedRoomId !== 'ALL' ? Number(selectedRoomId) : undefined,
        date: selectedDate,
      });
      setShowtimes(list);
      setSelectedShowtimeId((prev) =>
        list.some((s) => s.ShowtimeID === prev) ? prev : list[0]?.ShowtimeID ?? null
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [selectedCinemaId, selectedRoomId, selectedDate]);

  const visibleRooms = useMemo(() => {
    if (selectedRoomId === 'ALL') return rooms;
    return rooms.filter((r) => String(r.RoomID) === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const selectedShowtime =
    showtimes.find((s) => s.ShowtimeID === selectedShowtimeId) ||
    showtimes[0] ||
    null;

  const openCreateModal = () => {
    setModalMode('create');
    setEditingShowtimeId(null);
    setFormMovieId(movies[0] ? String(movies[0].MovieID) : '');
    setFormRoomId(
      selectedRoomId !== 'ALL'
        ? selectedRoomId
        : rooms[0]
        ? String(rooms[0].RoomID)
        : ''
    );
    setFormDate(selectedDate);
    setFormStartTime('14:00');
    setFormFormat(rooms[0]?.RoomType || '2D Vietnamese Subs');
    setFormPrice('110000');
    setFormStatus('SCHEDULED');
    setFormError(null);
  };

  const openEditModal = (st: Showtime) => {
    setModalMode('edit');
    setEditingShowtimeId(st.ShowtimeID);
    setFormMovieId(String(st.MovieID));
    setFormRoomId(String(st.RoomID));
    setFormDate(st.ShowDate);
    setFormStartTime(st.StartTime.slice(0, 5));
    setFormFormat(st.Format);
    setFormPrice(String(st.BaseTicketPrice));
    setFormStatus(st.Status);
    setFormError(null);
  };

  const handleSaveShowtime = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFeedback(null);

    const payload = {
      movie_id: Number(formMovieId),
      room_id: Number(formRoomId),
      show_date: formDate,
      start_time: formStartTime,
      format: formFormat.trim(),
      base_ticket_price: Number(formPrice),
      status: formStatus,
    };

    try {
      if (modalMode === 'create') {
        const created = await showtimesApi.create(payload);
        setFeedback(
          `Created showtime #${created.ShowtimeID} (${created.StartTime.slice(0, 5)}–${created.EndTime.slice(0, 5)}).`
        );
        setSelectedDate(created.ShowDate);
        setSelectedShowtimeId(created.ShowtimeID);
      } else if (modalMode === 'edit' && editingShowtimeId) {
        const updated = await showtimesApi.update(editingShowtimeId, payload);
        setFeedback(`Updated showtime #${updated.ShowtimeID}.`);
      }
      setModalMode(null);
      await fetchShowtimes();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save showtime');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (st: Showtime) => {
    if (
      !window.confirm(
        `Delete showtime "${st.MovieTitle}" (${st.StartTime.slice(0, 5)} on ${st.ShowDate})?`
      )
    ) {
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      await showtimesApi.remove(st.ShowtimeID);
      setFeedback(`Deleted showtime #${st.ShowtimeID}.`);
      await fetchShowtimes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete showtime');
    }
  };

  const openCopyModal = () => {
    setCopySourceDate(selectedDate);
    setCopyTargetDate(addDaysToIso(selectedDate, 1));
    setCopyRoomId(selectedRoomId);
    setCopyError(null);
    setCopyOpen(true);
  };

  const handleCopySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCinemaId) return;
    setSubmitting(true);
    setCopyError(null);
    setFeedback(null);

    try {
      const result = await showtimesApi.copy({
        source_date: copySourceDate,
        target_date: copyTargetDate,
        cinema_id: selectedCinemaId,
        room_id: copyRoomId !== 'ALL' ? Number(copyRoomId) : undefined,
      });
      setCopyOpen(false);
      setSelectedDate(copyTargetDate);
      setFeedback(
        `Copied ${result.createdCount} showtime(s) to ${copyTargetDate}; skipped ${result.skippedCount} conflict(s).`
      );
      await fetchShowtimes();
    } catch (err) {
      setCopyError(err instanceof ApiError ? err.message : 'Failed to copy schedule');
    } finally {
      setSubmitting(false);
    }
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
            Showtime timeline
          </h1>
          <p className="mt-1 text-xs font-normal text-[#475569]">
            Schedule screenings by screen, manage timing and 15-minute cleaning buffers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={openCopyModal}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            <Copy className="h-3.5 w-3.5 text-[#475569]" />
            <span>Copy day</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#B91C1C]"
          >
            <Plus className="h-4 w-4" />
            <span>Add screening</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-semibold text-[#B91C1C]">
          {error}
        </div>
      )}

      {feedback && (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-xs font-semibold text-[#065F46]">
          {feedback}
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-9 items-center rounded-lg border border-[#E2E8F0] bg-white">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => setSelectedDate((d) => addDaysToIso(d, -1))}
              className="flex h-full w-9 items-center justify-center rounded-l-lg border-r border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              aria-label="Schedule date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="h-full px-3 text-xs font-medium text-[#0F172A] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Next day"
              onClick={() => setSelectedDate((d) => addDaysToIso(d, 1))}
              className="flex h-full w-9 items-center justify-center rounded-r-lg border-l border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative inline-flex items-center">
            <select
              aria-label="Filter by screen"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]"
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

        <span className="text-xs font-medium text-[#64748B]">
          {loading
            ? 'Loading schedule...'
            : `${showtimes.length} screenings · ${visibleRooms.length} screens`}
        </span>
      </div>

      <section className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgb(15,23,42,0.02)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] p-5">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Schedule for {selectedDate}
          </h2>

          <div className="flex items-center gap-5 text-[11px] font-semibold text-[#64748B]">
            <span className="text-[#059669]">CHECKIN_OPEN</span>
            <span className="text-[#D97706]">SCHEDULED</span>
            <span className="text-[#475569]">COMPLETED</span>
            <span className="text-[#DC2626]">Selected</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="relative min-w-[960px] select-none">
            <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex w-[140px] shrink-0 flex-col justify-end p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Screen
                </span>
              </div>
              <div className="relative h-11 flex-1">
                {TIME_LABELS.map((label, index) => {
                  const leftPos = (index / (TIME_LABELS.length - 1)) * 100;
                  return (
                    <div
                      key={label}
                      className="absolute bottom-2.5 -translate-x-1/2"
                      style={{ left: `${leftPos}%` }}
                    >
                      <span className="text-[10px] font-medium text-[#64748B]">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-0 flex">
                <div className="w-[140px] shrink-0" />
                <div className="relative flex-1">
                  {TIME_LABELS.map((label, index) => {
                    const leftPos = (index / (TIME_LABELS.length - 1)) * 100;
                    return (
                      <div
                        key={`grid-${label}`}
                        className="absolute top-0 bottom-0 border-l border-dashed border-[#E2E8F0]"
                        style={{ left: `${leftPos}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {visibleRooms.map((room) => {
                const roomBlocks = showtimes.filter(
                  (s) => s.RoomID === room.RoomID
                );
                return (
                  <div
                    key={room.RoomID}
                    className="flex border-b border-[#E2E8F0] transition-colors last:border-b-0 hover:bg-[#F8FAFC]/50"
                  >
                    <div className="z-10 flex w-[140px] shrink-0 flex-col justify-center border-r border-[#E2E8F0] bg-white p-4">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {room.RoomNumber}
                      </span>
                      <span className="mt-0.5 text-[10px] text-[#64748B]">
                        {room.Capacity} seats · {room.RoomType}
                      </span>
                    </div>
                    <div className="relative h-[88px] flex-1 py-3">
                      {roomBlocks.map((block) => {
                        const isSelected =
                          selectedShowtime?.ShowtimeID === block.ShowtimeID;
                        const { leftPercent, widthPercent } = calcBlockPosition(
                          block.StartTime,
                          block.EndTime
                        );

                        let blockStyles =
                          'bg-[#FFFBEB] border-[#FDE68A] hover:border-[#FCD34D]';
                        let titleStyles = 'text-[#0F172A]';
                        let subStyles = 'text-[#64748B]';

                        if (isSelected) {
                          blockStyles =
                            'bg-[#FEF2F2] border-[#DC2626] shadow-sm z-10';
                          titleStyles = 'text-[#DC2626]';
                          subStyles = 'text-[#DC2626]';
                        } else if (block.Status === 'CHECKIN_OPEN') {
                          blockStyles = 'bg-[#ECFDF5] border-[#A7F3D0]';
                          titleStyles = 'text-[#065F46]';
                          subStyles = 'text-[#059669]';
                        } else if (
                          block.Status === 'COMPLETED' ||
                          block.Status === 'CANCELED'
                        ) {
                          blockStyles = 'bg-[#F8FAFC] border-[#E2E8F0] opacity-75';
                          titleStyles = 'text-[#475569]';
                          subStyles = 'text-[#94A3B8]';
                        }

                        return (
                          <button
                            key={block.ShowtimeID}
                            type="button"
                            onClick={() => setSelectedShowtimeId(block.ShowtimeID)}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            className={`absolute top-3 bottom-3 flex cursor-pointer flex-col overflow-hidden rounded-md border p-2 text-left transition-all ${blockStyles}`}
                          >
                            <span className={`truncate text-[10px] font-bold ${titleStyles}`}>
                              {block.MovieTitle}
                            </span>
                            <span className={`mt-0.5 text-[9px] ${subStyles}`}>
                              {block.StartTime.slice(0, 5)}–{block.EndTime.slice(0, 5)}
                            </span>
                            <span
                              className={`mt-auto truncate text-[9px] font-semibold ${subStyles}`}
                            >
                              {block.Status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <DashboardCard className="flex flex-col lg:col-span-7">
          {selectedShowtime ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-extrabold text-[#0F172A]">
                  {selectedShowtime.MovieTitle}
                </h2>
                <span className="text-[11px] font-bold text-[#DC2626]">
                  #{selectedShowtime.ShowtimeID} · {selectedShowtime.Status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-6 border-b border-[#F1F5F9] pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    {selectedShowtime.RoomNumber} · {selectedShowtime.ShowDate}
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tight text-[#0F172A]">
                      {selectedShowtime.StartTime.slice(0, 5)}
                    </span>
                    <span className="text-sm font-bold text-[#64748B]">→</span>
                    <span className="text-2xl font-black tracking-tight text-[#0F172A]">
                      {selectedShowtime.EndTime.slice(0, 5)}
                    </span>
                  </div>
                  <span className="mt-1 text-[11px] font-medium text-[#64748B]">
                    {selectedShowtime.MovieDuration} min + 15m cleaning ·{' '}
                    {selectedShowtime.Format}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Base Ticket Price
                  </span>
                  <div className="mt-1 text-2xl font-black tracking-tight text-[#0F172A]">
                    {new Intl.NumberFormat('vi-VN').format(
                      Number(selectedShowtime.BaseTicketPrice)
                    )}{' '}
                    ₫
                  </div>
                  <span className="mt-1 text-[11px] font-medium text-[#64748B]">
                    Cinema: {selectedShowtime.CinemaName}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openEditModal(selectedShowtime)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#B91C1C]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit screening</span>
                </button>
                <button
                  type="button"
                  onClick={openCopyModal}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  <Copy className="h-3.5 w-3.5 text-[#475569]" />
                  <span>Copy day</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteShowtime(selectedShowtime)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete screening</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-xs text-[#94A3B8]">
              Select a screening block on the timeline or click "Add screening".
            </div>
          )}
        </DashboardCard>

        <DashboardCard className="flex flex-col lg:col-span-5">
          <h2 className="text-sm font-bold text-[#0F172A]">Scheduling rules</h2>
          <div className="mt-4 flex flex-col gap-3 text-xs leading-relaxed text-[#475569]">
            <p>
              <strong className="text-[#059669]">Auto buffer:</strong> End time is
              automatically calculated as{' '}
              <code className="rounded bg-[#F1F5F9] px-1 py-0.5">
                StartTime + Duration + 15 min
              </code>
              .
            </p>
            <p>
              <strong className="text-[#DC2626]">Overlap protection:</strong>{' '}
              Overlapping schedules in the same screen are rejected with HTTP 409.
            </p>
            <p>
              <strong className="text-[#D97706]">Paid ticket lock:</strong>{' '}
              Screenings with paid tickets cannot be edited or deleted (HTTP 400).
            </p>
          </div>
        </DashboardCard>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {modalMode === 'create' ? 'Add screening' : 'Edit screening'}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShowtime} className="mt-4 flex flex-col gap-3">
              {formError && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#B91C1C]">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Movie
                </label>
                <select
                  required
                  value={formMovieId}
                  onChange={(e) => setFormMovieId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                >
                  {movies.map((m) => (
                    <option key={m.MovieID} value={String(m.MovieID)}>
                      {m.Title} ({m.Duration}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Screen
                </label>
                <select
                  required
                  value={formRoomId}
                  onChange={(e) => setFormRoomId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                >
                  {rooms.map((r) => (
                    <option key={r.RoomID} value={String(r.RoomID)}>
                      {r.RoomNumber} ({r.RoomType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Show date
                  </label>
                  <input
                    required
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Start time
                  </label>
                  <input
                    required
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Base price (VND)
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    step={1000}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as Showtime['Status'])
                    }
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="CHECKIN_OPEN">CHECKIN_OPEN</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELED">CANCELED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Format
                </label>
                <input
                  value={formFormat}
                  onChange={(e) => setFormFormat(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold text-[#475569]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white hover:bg-[#B91C1C] disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save screening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {copyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Copy showtime schedule
              </h3>
              <button
                type="button"
                onClick={() => setCopyOpen(false)}
                className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCopySubmit} className="mt-4 flex flex-col gap-3">
              {copyError && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#B91C1C]">
                  {copyError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Source date
                  </label>
                  <input
                    required
                    type="date"
                    value={copySourceDate}
                    onChange={(e) => setCopySourceDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Target date
                  </label>
                  <input
                    required
                    type="date"
                    value={copyTargetDate}
                    onChange={(e) => setCopyTargetDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Screen scope
                </label>
                <select
                  value={copyRoomId}
                  onChange={(e) => setCopyRoomId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                >
                  <option value="ALL">All screens in cinema</option>
                  {rooms.map((r) => (
                    <option key={r.RoomID} value={String(r.RoomID)}>
                      {r.RoomNumber} only
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCopyOpen(false)}
                  className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold text-[#475569]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white hover:bg-[#B91C1C] disabled:opacity-60"
                >
                  {submitting ? 'Copying...' : 'Copy showtimes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
