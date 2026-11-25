import * as movieRepository from '../repositories/movie.repository.js';
import { getOrSet } from '../utils/cache.js';

const LIST_TTL_MS = 30_000; // danh sách phim: 30 giây
const STATS_TTL_MS = 60_000; // số lượng + thể loại: 60 giây

const STATUS_FILTER = {
  now: 'NOW_SHOWING',
  upcoming: 'COMING_SOON',
  all: null,
};

async function getDiscoveryStats() {
  return getOrSet('movies:stats', STATS_TTL_MS, async () => {
    const [statusRows, genres] = await Promise.all([
      movieRepository.countVisibleMoviesByStatus(),
      movieRepository.findVisibleGenres(),
    ]);

    const counts = { nowShowing: 0, comingSoon: 0 };
    for (const row of statusRows) {
      const total = Number(row.Total) || 0;
      if (row.Status === 'NOW_SHOWING') counts.nowShowing = total;
      if (row.Status === 'COMING_SOON') counts.comingSoon = total;
    }

    return { counts, genres };
  });
}

export async function listMovies({ status = 'all', genre } = {}) {
  const normalizedStatus = status || 'all';
  const normalizedGenre = genre?.trim() || null;
  const dbStatus = STATUS_FILTER[normalizedStatus] ?? null;
  const cacheKey = `movies:list:${normalizedStatus}:${
    normalizedGenre ? normalizedGenre.toLowerCase() : '*'
  }`;

  return getOrSet(cacheKey, LIST_TTL_MS, async () => {
    const [items, stats] = await Promise.all([
      movieRepository.findMovies({ status: dbStatus, genre: normalizedGenre }),
      getDiscoveryStats(),
    ]);

    return {
      items,
      total: items.length,
      filters: { status: normalizedStatus, genre: normalizedGenre },
      counts: stats.counts,
      genres: stats.genres,
    };
  });
}

export async function searchMovies(keyword) {
  const normalizedKeyword = (keyword || '').trim();
  if (!normalizedKeyword) {
    return { items: [], total: 0, query: '' };
  }

  const items = await movieRepository.searchMovies(normalizedKeyword, 8);
  return { items, total: items.length, query: normalizedKeyword };
}
