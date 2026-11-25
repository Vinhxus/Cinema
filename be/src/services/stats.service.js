import * as statsRepository from '../repositories/stats.repository.js';
import { addDays } from './showtime.service.js';
import { AppError } from '../utils/AppError.js';

function getTodayUtc7() {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function buildDateRange(from, to) {
  const dates = [];
  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard < 90) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return dates;
}

export async function getStats(query) {
  const to = query.to || getTodayUtc7();
  const from = query.from || addDays(to, -6);
  const cinemaId = query.cinema_id ?? query.cinemaId;
  const roomId = query.room_id ?? query.roomId;

  if (from > to) {
    throw new AppError('from date cannot be after to date', 400);
  }

  const prevDate = addDays(to, -1);

  const [
    revenueRows,
    ticketRows,
    todaySnapshot,
    yesterdaySnapshot,
    attendanceByTimeSlot,
    upcomingScreenings,
    operations,
  ] = await Promise.all([
    statsRepository.getDailyRevenue({ from, to, cinemaId, roomId }),
    statsRepository.getDailyTicketCount({ from, to, cinemaId, roomId }),
    statsRepository.getDateSnapshot({ date: to, cinemaId, roomId }),
    statsRepository.getDateSnapshot({ date: prevDate, cinemaId, roomId }),
    statsRepository.getAttendanceByTimeSlot({ date: to, cinemaId, roomId }),
    statsRepository.getScreeningsForDate({ date: to, cinemaId, roomId }),
    statsRepository.getOperationsSummary({ cinemaId }),
  ]);

  const revenueMap = new Map(
    revenueRows.map((r) => [r.date, Number(r.revenue || 0)])
  );
  const ticketMap = new Map(
    ticketRows.map((r) => [r.date, Number(r.ticketCount || 0)])
  );

  const daily = buildDateRange(from, to).map((date) => ({
    date,
    ticketCount: ticketMap.get(date) || 0,
    revenue: revenueMap.get(date) || 0,
  }));

  const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
  const totalTickets = daily.reduce((sum, d) => sum + d.ticketCount, 0);

  return {
    range: { from, to },
    summary: {
      totalRevenue,
      totalTickets,
      today: todaySnapshot,
      yesterday: yesterdaySnapshot,
    },
    daily,
    attendanceByTimeSlot,
    upcomingScreenings,
    operations,
  };
}
