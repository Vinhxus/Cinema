import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, Plus, Save, X } from 'lucide-react';
import AdminLayout, { type AdminTabId } from '../components/admin/AdminLayout';
import {
  ApiError,
  priceRulesApi,
  roomsApi,
  type PriceRule,
  type Room,
  type Seat,
} from '../api/adminApi';
import { useAdminSession } from '../hooks/useAdminSession';

export interface SeatingProps {
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

export default function SeatingAndPricing({
  useSharedFooter = false,
  activeTab = 'seating',
  onNavigate,
}: SeatingProps) {
  const {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    isDbConnected,
  } = useAdminSession(['ADMIN']);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [draftSeats, setDraftSeats] = useState<Seat[]>([]);
  const [selectedSeatLabel, setSelectedSeatLabel] = useState<string>('');
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [dirty, setDirty] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [addRowOpen, setAddRowOpen] = useState(false);
  const [newRowLetter, setNewRowLetter] = useState('J');
  const [newRowCount, setNewRowCount] = useState('12');
  const [newRowType, setNewRowType] = useState<'standard' | 'vip' | 'couple'>('standard');

  const [editingRule, setEditingRule] = useState<PriceRule | null>(null);
  const [ruleBasePrice, setRuleBasePrice] = useState('');
  const [ruleSurcharge, setRuleSurcharge] = useState('');
  const [ruleName, setRuleName] = useState('');

  const [surchargeOpen, setSurchargeOpen] = useState(false);
  const [surchargeDelta, setSurchargeDelta] = useState('20000');
  const [surchargeDateFrom, setSurchargeDateFrom] = useState('');
  const [surchargeDateTo, setSurchargeDateTo] = useState('');
  const [surchargeTimeFrom, setSurchargeTimeFrom] = useState('17:00');
  const [surchargeWeekendOnly, setSurchargeWeekendOnly] = useState(true);

  const loadPriceRules = async () => {
    try {
      const rules = await priceRulesApi.list();
      setPriceRules(rules);
    } catch {}
  };

  useEffect(() => {
    loadPriceRules();
  }, []);

  useEffect(() => {
    if (!selectedCinemaId) return;
    roomsApi
      .list({ cinema_id: selectedCinemaId })
      .then((list) => {
        setRooms(list);
        setSelectedRoomId(list[0]?.RoomID ?? null);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load rooms');
      });
  }, [selectedCinemaId]);

  const loadLayout = async (roomId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await roomsApi.getLayout(roomId);
      setCurrentRoom(data.room);
      setDraftSeats(data.seats);
      setDirty(false);
      setSelectedSeatLabel(data.seats[0]?.SeatLabel || '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load room layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoomId) {
      loadLayout(selectedRoomId);
    }
  }, [selectedRoomId]);

  const seatsByRow = useMemo(() => {
    const map = new Map<string, Seat[]>();
    for (const seat of draftSeats) {
      const list = map.get(seat.SeatRow) || [];
      list.push(seat);
      map.set(seat.SeatRow, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, seats]) => ({
        row,
        seats: [...seats].sort((a, b) => a.SeatNumber - b.SeatNumber),
      }));
  }, [draftSeats]);

  const seatCounts = useMemo(() => {
    const standard = draftSeats.filter((s) => s.TypeCode === 'standard').length;
    const vip = draftSeats.filter((s) => s.TypeCode === 'vip').length;
    const couple = draftSeats.filter((s) => s.TypeCode === 'couple').length;
    const broken = draftSeats.filter((s) => !s.IsActive).length;
    return { standard, vip, couple, broken };
  }, [draftSeats]);

  const selectedSeat =
    draftSeats.find((s) => s.SeatLabel === selectedSeatLabel) || null;

  const updateSelectedSeatType = (typeCode: 'standard' | 'vip' | 'couple') => {
    if (!selectedSeat) return;
    const rule = priceRules.find((r) => r.TypeCode === typeCode);
    setDraftSeats((prev) =>
      prev.map((s) =>
        s.SeatLabel === selectedSeat.SeatLabel
          ? {
              ...s,
              TypeCode: typeCode,
              SeatTypeID: rule?.SeatTypeID ?? s.SeatTypeID,
              TypeName: rule?.TypeName ?? typeCode,
            }
          : s
      )
    );
    setDirty(true);
  };

  const toggleSelectedSeatActive = () => {
    if (!selectedSeat) return;
    setDraftSeats((prev) =>
      prev.map((s) =>
        s.SeatLabel === selectedSeat.SeatLabel
          ? { ...s, IsActive: !Boolean(s.IsActive) }
          : s
      )
    );
    setDirty(true);
  };

  const handleAddRow = (e: FormEvent) => {
    e.preventDefault();
    const rowKey = newRowLetter.trim().toUpperCase();
    const count = Math.max(1, Math.min(20, Number(newRowCount) || 1));
    if (!rowKey) return;

    const rule =
      priceRules.find((r) => r.TypeCode === newRowType) || priceRules[0];

    const newSeats: Seat[] = [];
    for (let i = 1; i <= count; i += 1) {
      const seatNum = newRowType === 'couple' ? i * 2 - 1 : i;
      const label =
        newRowType === 'couple'
          ? `${rowKey}${String(seatNum).padStart(2, '0')}-${String(seatNum + 1).padStart(2, '0')}`
          : `${rowKey}${String(seatNum).padStart(2, '0')}`;
      if (draftSeats.some((s) => s.SeatLabel === label)) continue;
      newSeats.push({
        SeatID: 0,
        RoomID: selectedRoomId || 0,
        SeatTypeID: rule?.SeatTypeID || 1,
        SeatRow: rowKey,
        SeatNumber: seatNum,
        SeatLabel: label,
        IsActive: true,
        TypeCode: newRowType,
        TypeName: rule?.TypeName || newRowType,
        BasePrice: rule?.BasePrice || 110000,
        Surcharge: rule?.Surcharge || 0,
        SeatsPerUnit: newRowType === 'couple' ? 2 : 1,
      });
    }

    if (newSeats.length > 0) {
      setDraftSeats((prev) => [...prev, ...newSeats]);
      setSelectedSeatLabel(newSeats[0].SeatLabel);
      setDirty(true);
    }
    setAddRowOpen(false);
  };

  const handleSaveLayout = async () => {
    if (!selectedRoomId) return;
    setSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const payload = {
        replaceAll: true,
        seats: draftSeats.map((s) => ({
          seatRow: s.SeatRow,
          seatNumber: s.SeatNumber,
          seatLabel: s.SeatLabel,
          typeCode: s.TypeCode,
          isActive: Boolean(s.IsActive),
        })),
      };
      const updated = await roomsApi.updateLayout(selectedRoomId, payload);
      setCurrentRoom(updated.room);
      setDraftSeats(updated.seats);
      setDirty(false);
      setFeedback(
        `Saved layout for ${updated.room.RoomNumber} (${updated.room.Capacity} active seats).`
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const openEditRule = (rule: PriceRule) => {
    setEditingRule(rule);
    setRuleName(rule.TypeName);
    setRuleBasePrice(String(rule.BasePrice));
    setRuleSurcharge(String(rule.Surcharge));
  };

  const handleSaveRule = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      await priceRulesApi.update(editingRule.SeatTypeID, {
        typeName: ruleName.trim(),
        basePrice: Number(ruleBasePrice),
        surcharge: Number(ruleSurcharge),
      });
      setEditingRule(null);
      await loadPriceRules();
      if (selectedRoomId) await loadLayout(selectedRoomId);
      setFeedback('Updated seat type price rule.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update price rule');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyShowtimeSurcharge = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCinemaId) return;
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await priceRulesApi.applyShowtimeSurcharge({
        cinema_id: selectedCinemaId,
        room_id: selectedRoomId || undefined,
        date_from: surchargeDateFrom || undefined,
        date_to: surchargeDateTo || undefined,
        start_time_from: surchargeTimeFrom || undefined,
        weekend_only: surchargeWeekendOnly,
        surcharge_delta: Number(surchargeDelta),
      });
      setSurchargeOpen(false);
      setFeedback(
        `Updated base ticket price for ${res.updatedShowtimes} unpaid showtime(s).`
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to update showtime prices'
      );
    } finally {
      setSaving(false);
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
            Seating & price matrix
          </h1>
          <p className="mt-1 text-xs font-normal text-[#475569]">
            Configure seating layout by screen and manage seat type pricing rules.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveLayout}
          disabled={saving || !selectedRoomId}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#B91C1C] disabled:opacity-60 sm:self-auto"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Saving...' : dirty ? 'Save configuration *' : 'Save configuration'}</span>
        </button>
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
          <div className="relative inline-flex items-center">
            <select
              aria-label="Select room"
              value={selectedRoomId ?? ''}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs font-medium text-[#0F172A]"
            >
              {rooms.map((r) => (
                <option key={r.RoomID} value={r.RoomID}>
                  {r.RoomNumber} · {r.RoomType}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span>
            {currentRoom
              ? `${currentRoom.Status} · ${currentRoom.Capacity} active seats`
              : 'Loading...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <DashboardCard className="flex flex-col items-center lg:col-span-8">
          <div className="mb-6 flex w-full items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">
              {currentRoom?.RoomNumber || 'Screen'} seating
            </h2>
            <span className="text-[11px] font-medium text-[#64748B]">
              {loading
                ? 'Loading...'
                : `${draftSeats.length} seats · ${seatsByRow.length} rows`}
            </span>
          </div>

          <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
            Screen
          </div>

          <div className="mb-8 flex max-w-full flex-col gap-1.5 overflow-x-auto pb-2">
            {seatsByRow.map(({ row, seats }) => (
              <div key={row} className="flex items-center gap-1.5">
                <div className="w-5 text-right text-[10px] font-bold text-[#94A3B8]">
                  {row}
                </div>

                {seats.map((seat) => {
                  const isSelected = seat.SeatLabel === selectedSeatLabel;
                  const isBroken = !seat.IsActive;
                  const isCouple = seat.TypeCode === 'couple';

                  let seatClass =
                    'h-8 rounded border flex items-center justify-center text-[9px] font-bold cursor-pointer transition-colors ';
                  seatClass += isCouple ? 'w-[4.25rem] ' : 'w-8 ';

                  if (isSelected) {
                    seatClass +=
                      'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] ring-1 ring-[#DC2626]';
                  } else if (isBroken) {
                    seatClass +=
                      'border-[#CBD5E1] bg-[#F1F5F9] text-[#94A3B8] line-through';
                  } else if (seat.TypeCode === 'vip') {
                    seatClass +=
                      'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] hover:border-[#FCD34D]';
                  } else if (isCouple) {
                    seatClass +=
                      'border-[#FBCFE8] bg-[#FDF2F8] text-[#DB2777] hover:border-[#F9A8D4]';
                  } else {
                    seatClass +=
                      'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]';
                  }

                  return (
                    <button
                      key={seat.SeatLabel}
                      type="button"
                      onClick={() => setSelectedSeatLabel(seat.SeatLabel)}
                      className={seatClass}
                    >
                      {seat.SeatLabel}
                    </button>
                  );
                })}

                <div className="w-5 text-left text-[10px] font-bold text-[#94A3B8]">
                  {row}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-medium text-[#64748B]">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-[#E2E8F0] bg-white" />
              Standard
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-[#FDE68A] bg-[#FFFBEB]" />
              VIP
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-[#FBCFE8] bg-[#FDF2F8]" />
              Couple
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-[#CBD5E1] bg-[#F1F5F9]" />
              Broken / Disabled
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-[#DC2626] bg-[#FEF2F2]" />
              <span className="text-[#DC2626]">Selected</span>
            </div>
          </div>
        </DashboardCard>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <DashboardCard className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Seat summary
              </h2>
              <span className="text-[11px] font-medium text-[#64748B]">
                {currentRoom?.RoomNumber}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3">
                <span className="font-bold text-[#0F172A]">Standard seats</span>
                <span className="font-semibold text-[#475569]">
                  {seatCounts.standard}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
                <span className="font-bold text-[#B45309]">VIP seats</span>
                <span className="font-semibold text-[#D97706]">
                  {seatCounts.vip}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#FBCFE8] bg-[#FDF2F8] p-3">
                <span className="font-bold text-[#BE185D]">Couple seats</span>
                <span className="font-semibold text-[#DB2777]">
                  {seatCounts.couple}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <span className="font-bold text-[#64748B]">Broken / disabled</span>
                <span className="font-semibold text-[#64748B]">
                  {seatCounts.broken}
                </span>
              </div>
            </div>

            {selectedSeat && (
              <div className="mt-6 border-t border-[#F1F5F9] pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Seat {selectedSeat.SeatLabel}
                  </h3>
                  <span className="text-[11px] font-bold text-[#DC2626]">
                    Selected
                  </span>
                </div>

                <label className="mb-1 block text-[11px] font-bold text-[#475569]">
                  Seat type
                </label>
                <select
                  value={selectedSeat.TypeCode}
                  onChange={(e) =>
                    updateSelectedSeatType(
                      e.target.value as 'standard' | 'vip' | 'couple'
                    )
                  }
                  className="mb-4 h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A]"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="couple">Couple</option>
                </select>

                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#0F172A]">Ticket sales status</span>
                  <button
                    type="button"
                    onClick={toggleSelectedSeatActive}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                      selectedSeat.IsActive
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {selectedSeat.IsActive ? 'Enabled (Active)' : 'Disabled (Broken)'}
                  </button>
                </div>

                <p className="mt-4 text-[10px] leading-relaxed text-[#94A3B8]">
                  Layout saves are blocked if this room has active/upcoming showtimes with
                  sold or held tickets.
                </p>

                <button
                  type="button"
                  onClick={() => setAddRowOpen(true)}
                  className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add seat row
                </button>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      <DashboardCard>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">
            Price rules by seat type
          </h2>
          <button
            type="button"
            onClick={() => setSurchargeOpen(true)}
            className="text-xs font-semibold text-[#DC2626] hover:underline"
          >
            Adjust showtime surcharge
          </button>
        </div>

        <p className="mb-4 text-[11px] text-[#64748B]">
          Base prices & seat-type surcharges stored in{' '}
          <code className="rounded bg-[#F1F5F9] px-1">seat_types</code>.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold uppercase text-[#64748B]">
                <th className="px-4 py-2.5">Type Code</th>
                <th className="px-4 py-2.5">Display Name</th>
                <th className="px-4 py-2.5">Base Price</th>
                <th className="px-4 py-2.5">Surcharge</th>
                <th className="px-4 py-2.5">Effective Price</th>
                <th className="px-4 py-2.5">Unit Seats</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium text-[#0F172A]">
              {priceRules.map((rule) => (
                <tr key={rule.SeatTypeID} className="hover:bg-[#F8FAFC]/50">
                  <td className="px-4 py-3.5 font-bold uppercase">
                    {rule.TypeCode}
                  </td>
                  <td className="px-4 py-3.5">{rule.TypeName}</td>
                  <td className="px-4 py-3.5">{formatVnd(rule.BasePrice)}</td>
                  <td className="px-4 py-3.5">{formatVnd(rule.Surcharge)}</td>
                  <td className="px-4 py-3.5 font-bold text-[#DC2626]">
                    {formatVnd(rule.EffectivePrice)}
                  </td>
                  <td className="px-4 py-3.5">{rule.SeatsPerUnit}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => openEditRule(rule)}
                      className="text-xs font-semibold text-[#DC2626] hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {addRowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Add seat row
              </h3>
              <button
                type="button"
                onClick={() => setAddRowOpen(false)}
                className="rounded p-1 text-[#64748B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddRow} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold">Row letter</label>
                <input
                  required
                  maxLength={4}
                  value={newRowLetter}
                  onChange={(e) => setNewRowLetter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">
                  Number of seats
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  max={20}
                  value={newRowCount}
                  onChange={(e) => setNewRowCount(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">Seat type</label>
                <select
                  value={newRowType}
                  onChange={(e) =>
                    setNewRowType(
                      e.target.value as 'standard' | 'vip' | 'couple'
                    )
                  }
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="couple">Couple</option>
                </select>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddRowOpen(false)}
                  className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white"
                >
                  Add row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Edit {editingRule.TypeCode.toUpperCase()} price rule
              </h3>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="rounded p-1 text-[#64748B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRule} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold">Display Name</label>
                <input
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">
                  Base Price (VND)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={ruleBasePrice}
                  onChange={(e) => setRuleBasePrice(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold">
                  Surcharge (VND)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={ruleSurcharge}
                  onChange={(e) => setRuleSurcharge(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white"
                >
                  {saving ? 'Saving...' : 'Save rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {surchargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Apply showtime surcharge
              </h3>
              <button
                type="button"
                onClick={() => setSurchargeOpen(false)}
                className="rounded p-1 text-[#64748B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleApplyShowtimeSurcharge}
              className="mt-4 flex flex-col gap-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold">Date from</label>
                  <input
                    type="date"
                    value={surchargeDateFrom}
                    onChange={(e) => setSurchargeDateFrom(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold">Date to</label>
                  <input
                    type="date"
                    value={surchargeDateTo}
                    onChange={(e) => setSurchargeDateTo(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold">
                    From start time
                  </label>
                  <input
                    type="time"
                    value={surchargeTimeFrom}
                    onChange={(e) => setSurchargeTimeFrom(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold">
                    Surcharge delta (VND)
                  </label>
                  <input
                    required
                    type="number"
                    step={1000}
                    value={surchargeDelta}
                    onChange={(e) => setSurchargeDelta(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={surchargeWeekendOnly}
                  onChange={(e) => setSurchargeWeekendOnly(e.target.checked)}
                />
                <span>Apply to weekend screenings only (Fri–Sun)</span>
              </label>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSurchargeOpen(false)}
                  className="h-9 rounded-lg border border-[#E2E8F0] px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white"
                >
                  {saving ? 'Applying...' : 'Apply surcharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
