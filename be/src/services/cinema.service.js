import * as cinemaRepository from '../repositories/cinema.repository.js';
import { getOrSet } from '../utils/cache.js';

const CINEMA_TTL_MS = 60_000; // danh sách rạp ít thay đổi: 60 giây

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapCinema(row) {
  return {
    cinemaId: row.CinemaID,
    slug: row.Slug,
    name: row.CinemaName,
    branch: row.Branch ?? '',
    address: row.Address,
    city: row.City ?? '',
    distance: row.DistanceLabel ?? '',
    perk: row.Perk ?? '',
    mapUrl: row.MapUrl ?? '',
    roomCount: toNumber(row.RoomCount),
    readyRoomCount: toNumber(row.ReadyRoomCount),
    readyCapacity: toNumber(row.ReadyCapacity),
  };
}

/** Danh sách cụm rạp cho thanh chọn nhanh + bộ lọc lịch chiếu. */
export async function listCinemas() {
  return getOrSet('cinemas:list', CINEMA_TTL_MS, async () => {
    const rows = await cinemaRepository.findCinemas();
    const items = rows.map(mapCinema);

    return { items, total: items.length };
  });
}