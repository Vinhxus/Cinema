import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  cinemasApi,
  clearStoredAuth,
  getStoredCinemaId,
  getStoredToken,
  getStoredUser,
  healthApi,
  setStoredCinemaId,
  staffApi,
  type AuthUser,
  type Cinema,
} from '../api/adminApi';

export function getTodayDateString(): string {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

export function useAdminSession(allowedRoles: Array<'ADMIN' | 'STAFF'> = ['ADMIN']) {
  const navigate = useNavigate();
  const [user] = useState<AuthUser | null>(() => getStoredUser());
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaIdState] = useState<number | undefined>(() => {
    const saved = getStoredCinemaId();
    return saved ?? undefined;
  });
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const setSelectedCinemaId = (id: number) => {
    setSelectedCinemaIdState(id);
    setStoredCinemaId(id);
  };

  useEffect(() => {
    const token = getStoredToken();
    const currentUser = getStoredUser();

    if (!token || !currentUser || !allowedRoles.includes(currentUser.UserType as 'ADMIN' | 'STAFF')) {
      clearStoredAuth();
      navigate('/admin/login', { replace: true });
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const [cinemaList, healthRes] = await Promise.all([
          currentUser?.UserType === 'ADMIN'
            ? cinemasApi.list()
            : staffApi.listCinemas(),
          healthApi.check().catch(() => null),
        ]);

        if (cancelled) return;

        setIsDbConnected(Boolean(healthRes?.database === 'CONNECTED'));
        setCinemas(cinemaList);

        if (cinemaList.length > 0) {
          const savedId = getStoredCinemaId();
          const validSaved = cinemaList.find((c) => c.CinemaID === savedId);
          const nextId = validSaved ? validSaved.CinemaID : cinemaList[0].CinemaID;
          setSelectedCinemaIdState(nextId);
          setStoredCinemaId(nextId);
        }
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearStoredAuth();
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const selectedCinema =
    cinemas.find((c) => c.CinemaID === selectedCinemaId) || cinemas[0] || null;

  return {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    selectedCinema,
    isDbConnected,
    loadingSession,
  };
}
