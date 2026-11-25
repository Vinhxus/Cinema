import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Calendar,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout, { type AdminTabId } from '../components/admin/AdminLayout';
import { ApiError, moviesApi, type Movie } from '../api/adminApi';
import { useAdminSession } from '../hooks/useAdminSession';

export interface MovieManagementProps {
  useSharedFooter?: boolean;
  activeTab?: AdminTabId;
  onNavigate?: (tab: AdminTabId) => void;
}

interface MovieFormState {
  code: string;
  title: string;
  subtitle: string;
  genre: string;
  duration: string;
  releaseDate: string;
  ageRating: 'P' | 'T13' | 'T16' | 'T18';
  language: string;
  formats: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED' | 'DRAFT';
  posterUrl: string;
  director: string;
  starring: string;
  description: string;
}

const EMPTY_FORM: MovieFormState = {
  code: '',
  title: '',
  subtitle: '',
  genre: 'Action',
  duration: '120',
  releaseDate: '',
  ageRating: 'P',
  language: 'English with Vietnamese Subtitles',
  formats: '2D',
  status: 'NOW_SHOWING',
  posterUrl: '',
  director: '',
  starring: '',
  description: '',
};

const PAGE_SIZE = 6;

export default function MovieManagement({
  useSharedFooter = false,
  activeTab = 'movies',
  onNavigate,
}: MovieManagementProps) {
  const navigate = useNavigate();
  const {
    user,
    cinemas,
    selectedCinemaId,
    setSelectedCinemaId,
    isDbConnected,
  } = useAdminSession(['ADMIN']);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MovieFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await moviesApi.list({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        genre: genreFilter !== 'ALL' ? genreFilter : undefined,
      });
      setMovies(list);
      setSelectedMovieId((prev) =>
        list.some((m) => m.MovieID === prev) ? prev : list[0]?.MovieID ?? null
      );
      setPage(1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, genreFilter]);

  const counts = useMemo(() => {
    return {
      total: movies.length,
      showing: movies.filter((m) => m.Status === 'NOW_SHOWING').length,
      upcoming: movies.filter((m) => m.Status === 'COMING_SOON').length,
      endedOrDraft: movies.filter(
        (m) => m.Status === 'ENDED' || m.Status === 'DRAFT'
      ).length,
    };
  }, [movies]);

  const totalPages = Math.max(1, Math.ceil(movies.length / PAGE_SIZE));
  const paginatedMovies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return movies.slice(start, start + PAGE_SIZE);
  }, [movies, page]);

  const selectedMovie =
    movies.find((m) => m.MovieID === selectedMovieId) || movies[0] || null;

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const openEditModal = (movie: Movie) => {
    setModalMode('edit');
    setEditingId(movie.MovieID);
    setForm({
      code: movie.Code,
      title: movie.Title,
      subtitle: movie.Subtitle || '',
      genre: movie.Genre,
      duration: String(movie.Duration),
      releaseDate: movie.ReleaseDate ? String(movie.ReleaseDate).slice(0, 10) : '',
      ageRating: movie.AgeRating,
      language: movie.Language || 'English with Vietnamese Subtitles',
      formats: movie.Formats || '2D',
      status: movie.Status,
      posterUrl: movie.PosterUrl || '',
      director: movie.Director || '',
      starring: movie.Starring || '',
      description: movie.Description || '',
    });
    setFormError(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFeedback(null);

    const payload: Record<string, unknown> = {
      code: form.code.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      genre: form.genre.trim(),
      duration: Number(form.duration),
      releaseDate: form.releaseDate || null,
      ageRating: form.ageRating,
      language: form.language.trim() || 'English with Vietnamese Subtitles',
      formats: form.formats.trim() || '2D',
      status: form.status,
      posterUrl: form.posterUrl.trim() || null,
      director: form.director.trim() || null,
      starring: form.starring.trim() || null,
      description: form.description.trim() || null,
    };

    try {
      if (modalMode === 'create') {
        const created = await moviesApi.create(payload);
        setFeedback(`Created movie "${created.Title}".`);
        setSelectedMovieId(created.MovieID);
      } else if (modalMode === 'edit' && editingId) {
        const updated = await moviesApi.update(editingId, payload);
        setFeedback(`Updated movie "${updated.Title}".`);
      }
      setModalMode(null);
      await fetchMovies();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to save movie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (movie: Movie) => {
    if (!window.confirm(`Delete movie "${movie.Title}" (${movie.Code})?`)) {
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      await moviesApi.remove(movie.MovieID);
      setFeedback(`Deleted movie "${movie.Title}".`);
      await fetchMovies();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete movie');
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
            Movie management
          </h1>
          <p className="mt-1 text-xs font-normal text-[#475569]">
            Manage movie catalog, ratings, and release status.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg bg-[#DC2626] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#B91C1C] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add movie</span>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
          <span className="text-2xl font-black tracking-tight text-[#DC2626]">
            {String(counts.total).padStart(2, '0')}
          </span>
          <span className="text-xs font-medium text-[#64748B]">Matching movies</span>
        </div>
        <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
          <span className="text-2xl font-black tracking-tight text-[#DC2626]">
            {String(counts.showing).padStart(2, '0')}
          </span>
          <span className="text-xs font-medium text-[#64748B]">Now showing</span>
        </div>
        <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
          <span className="text-2xl font-black tracking-tight text-[#DC2626]">
            {String(counts.upcoming).padStart(2, '0')}
          </span>
          <span className="text-xs font-medium text-[#64748B]">Coming soon</span>
        </div>
        <div className="flex items-baseline gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-4">
          <span className="text-2xl font-black tracking-tight text-[#DC2626]">
            {String(counts.endedOrDraft).padStart(2, '0')}
          </span>
          <span className="text-xs font-medium text-[#64748B]">Ended / Draft</span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <section className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 xl:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F172A]">Movie list</h2>
            <span className="text-xs font-medium text-[#64748B]">
              {loading ? 'Loading...' : `${movies.length} movies`}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by movie title or code..."
                className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white pr-9 pl-3 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#DC2626] focus:outline-none"
              />
              <Search className="pointer-events-none absolute top-2.5 right-3 h-4 w-4 text-[#94A3B8]" />
            </div>

            <div className="relative inline-flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-8 pl-3 text-xs font-medium text-[#0F172A]"
              >
                <option value="ALL">All statuses</option>
                <option value="NOW_SHOWING">NOW_SHOWING</option>
                <option value="COMING_SOON">COMING_SOON</option>
                <option value="ENDED">ENDED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
            </div>

            <div className="relative inline-flex items-center">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="h-9 appearance-none rounded-lg border border-[#E2E8F0] bg-white pr-8 pl-3 text-xs font-medium text-[#0F172A]"
              >
                <option value="ALL">All genres</option>
                <option value="Action">Action</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Psychological">Psychological</option>
                <option value="Horror">Horror</option>
                <option value="Animation">Animation</option>
                <option value="Drama">Drama</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#64748B]" />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 pr-3 pl-3">Movie title / Genre</th>
                  <th className="px-3 py-2.5">Duration</th>
                  <th className="px-2 py-2.5 text-center">Rating</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="py-2.5 pr-3 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {paginatedMovies.length ? (
                  paginatedMovies.map((movie) => {
                    const isSelected = selectedMovie?.MovieID === movie.MovieID;
                    return (
                      <tr
                        key={movie.MovieID}
                        onClick={() => setSelectedMovieId(movie.MovieID)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FEF2F2]' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-3.5 pr-3 pl-3">
                          <div className="font-bold text-[#0F172A]">{movie.Title}</div>
                          <div className="mt-0.5 text-[11px] text-[#64748B]">
                            {movie.Code} · {movie.Genre}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-[#475569]">
                          {movie.Duration} min
                        </td>
                        <td className="px-2 py-3.5 text-center">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              movie.AgeRating === 'T18'
                                ? 'border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]'
                                : movie.AgeRating === 'P'
                                ? 'border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]'
                                : 'border border-[#E2E8F0] bg-white text-[#475569]'
                            }`}
                          >
                            {movie.AgeRating}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`font-semibold ${
                              movie.Status === 'NOW_SHOWING'
                                ? 'text-[#059669]'
                                : movie.Status === 'COMING_SOON'
                                ? 'text-[#D97706]'
                                : 'text-[#64748B]'
                            }`}
                          >
                            {movie.Status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 pl-2 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              aria-label={`Edit ${movie.Title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(movie);
                              }}
                              className="rounded p-1 text-[#475569] hover:bg-white hover:text-[#0F172A]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${movie.Title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(movie);
                              }}
                              className="rounded p-1 text-[#DC2626] hover:bg-white"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs text-[#94A3B8]"
                    >
                      No movies match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[#F1F5F9] pt-4 sm:flex-row">
            <span className="text-[11px] text-[#64748B]">
              Page {page} of {totalPages} ({movies.length} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded border text-xs font-bold ${
                    p === page
                      ? 'border-[#DC2626] bg-[#DC2626] text-white'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 xl:col-span-4">
          {selectedMovie ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A]">Selected movie</h2>
                <span className="text-xs font-semibold text-[#059669]">
                  {selectedMovie.Status}
                </span>
              </div>

              <div className="relative mt-4 aspect-4/5 w-full overflow-hidden rounded-xl bg-[#0F172A]">
                <img
                  src={
                    selectedMovie.PosterUrl ||
                    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={selectedMovie.Title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {selectedMovie.AgeRating}
                  </span>
                  <span className="rounded bg-[#D97706] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {selectedMovie.Formats}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {selectedMovie.Title}
                </h3>
                <div className="mt-0.5 text-[11px] text-[#64748B]">
                  {selectedMovie.Code} · Released{' '}
                  {selectedMovie.ReleaseDate
                    ? String(selectedMovie.ReleaseDate).slice(0, 10)
                    : 'TBD'}
                </div>

                <div className="my-3 flex items-center justify-between border-y border-[#F1F5F9] py-2.5 text-xs font-semibold">
                  <span className="uppercase text-[#0F172A]">
                    {selectedMovie.Duration} MIN
                  </span>
                  <span className="uppercase text-[#DC2626]">
                    IMDb {selectedMovie.ImdbScore ?? 0}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-[#475569]">
                  <div>Language: {selectedMovie.Language}</div>
                  <div>Director: {selectedMovie.Director || 'N/A'}</div>
                  <div>Cast: {selectedMovie.Starring || 'N/A'}</div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedMovie)}
                    className="flex h-9.5 w-full items-center justify-center gap-2 rounded-lg bg-[#DC2626] text-xs font-bold text-white shadow-sm hover:bg-[#B91C1C]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit movie</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/showtimes')}
                    className="flex h-9.5 w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>View showtimes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMovie)}
                    className="flex h-9.5 w-full items-center justify-center gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete movie</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              Select a movie to inspect details.
            </div>
          )}
        </section>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {modalMode === 'create' ? 'Add new movie' : 'Edit movie'}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-3">
              {formError && (
                <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#B91C1C]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Code *
                  </label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="PH012"
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Duration (min) *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Genre *
                  </label>
                  <input
                    required
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={form.releaseDate}
                    onChange={(e) =>
                      setForm({ ...form, releaseDate: e.target.value })
                    }
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Age Rating
                  </label>
                  <select
                    value={form.ageRating}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ageRating: e.target.value as MovieFormState['ageRating'],
                      })
                    }
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  >
                    <option value="P">P</option>
                    <option value="T13">T13</option>
                    <option value="T16">T16</option>
                    <option value="T18">T18</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as MovieFormState['status'],
                      })
                    }
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  >
                    <option value="NOW_SHOWING">NOW_SHOWING</option>
                    <option value="COMING_SOON">COMING_SOON</option>
                    <option value="ENDED">ENDED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Formats
                  </label>
                  <input
                    value={form.formats}
                    onChange={(e) => setForm({ ...form, formats: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                    Director
                  </label>
                  <input
                    value={form.director}
                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Poster URL
                </label>
                <input
                  value={form.posterUrl}
                  onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  placeholder="/assets/dune.png"
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-[#0F172A]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#E2E8F0] p-2.5 text-xs"
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
                  {submitting ? 'Saving...' : 'Save movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
