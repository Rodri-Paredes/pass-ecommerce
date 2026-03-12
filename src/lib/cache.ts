const PREFIX = 'outsiders_';

export class CacheManager {
  static set(key: string, data: unknown, ttlMinutes: number = 60) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      };
      localStorage.setItem(PREFIX + key, JSON.stringify(item));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(PREFIX + key);
      if (!cached) return null;

      const item = JSON.parse(cached);
      if (Date.now() - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.data as T;
    } catch {
      return null;
    }
  }

  static remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  }

  /** Remove all outsiders_ keys from localStorage */
  static clearAll() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  }
}
