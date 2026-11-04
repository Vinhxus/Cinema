import type { AdminTabId } from './AdminDashboard';

export const ADMIN_ROUTES: Partial<Record<AdminTabId, string>> = {
  overview: '/admin/dashboard',
  movies: '/admin/movies',
  showtimes: '/admin/showtimes',
  seating: '/admin/seating',
  checkin: '/admin/check-in',
};

