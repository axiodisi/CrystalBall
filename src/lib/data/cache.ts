type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 15 * 60 * 1000;

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options?: { ttlMs?: number; force?: boolean },
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  if (!options?.force) {
    const hit = store.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value as T;
    }
  }

  const value = await fn();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
