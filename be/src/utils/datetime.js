/**
 * Tiện ích thời gian cho lịch chiếu.
 * Mọi suất chiếu trong DB được hiểu là giờ Việt Nam (UTC+7) nên khi so sánh
 * với "bây giờ" ta ghép ngày + giờ kèm offset +07:00 để ra mốc epoch tuyệt đối,
 * tránh lệch múi giờ của máy chủ.
 */
const VN_OFFSET_MINUTES = 7 * 60;
const VN_OFFSET_LABEL = '+07:00';

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Kiểm tra chuỗi YYYY-MM-DD có thật (loại 2026-02-31...). */
export function isIsoDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD. */
export function getVnDateISO(now = new Date()) {
  const vnNow = new Date(now.getTime() + VN_OFFSET_MINUTES * 60_000);
  return vnNow.toISOString().slice(0, 10);
}

/** Cộng/trừ ngày trên chuỗi YYYY-MM-DD. */
export function addDaysISO(dateISO, days) {
  const base = new Date(`${dateISO}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/** epoch ms của 1 suất chiếu (ngày + giờ VN). */
export function toShowtimeEpochMs(dateISO, time) {
  const normalized = String(time ?? '00:00').slice(0, 5);
  const parsed = Date.parse(`${dateISO}T${normalized}:00${VN_OFFSET_LABEL}`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Nhãn hiển thị cho dải ngày: TODAY/THU, Thursday, 25, NOV... */
export function describeDate(dateISO, todayISO) {
  const parsed = new Date(`${dateISO}T00:00:00Z`);
  const weekday = parsed.getUTCDay();

  return {
    date: dateISO,
    weekDay: dateISO === todayISO ? 'TODAY' : WEEKDAY_SHORT[weekday],
    fullName: WEEKDAY_FULL[weekday],
    day: String(parsed.getUTCDate()).padStart(2, '0'),
    month: MONTH_SHORT[parsed.getUTCMonth()],
  };
}