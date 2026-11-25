/**
 * Cache RAM đơn giản (Map + TTL) cho các truy vấn chỉ đọc.
 * Dự án chưa cài Redis nên chỉ dùng bộ nhớ của process Express:
 * dữ liệu tự hết hạn theo TTL, restart server là cache sạch.
 */
const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

export function setCached(key, value, ttlMs = 30_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Xoá cache theo tiền tố key (không truyền prefix => xoá toàn bộ). */
export function invalidateCache(prefix) {
  for (const key of [...store.keys()]) {
    if (!prefix || key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/** Trả cache nếu còn hạn, ngược lại gọi loader rồi lưu kết quả. */
export async function getOrSet(key, ttlMs, loader) {
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  const value = await loader();
  return setCached(key, value, ttlMs);
}
