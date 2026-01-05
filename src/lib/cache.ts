interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleMemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create a global instance for user role caching
export const userRoleCache = new SimpleMemoryCache(10 * 60 * 1000); // 10 minutes TTL

// Interface for user role cache data
interface UserRoleData {
  role: "ADMIN" | "EDITOR" | "VIEWER";
  userId: string;
}

// Utility functions for user role caching
export const getUserRoleFromCache = (email: string): UserRoleData | null => {
  return userRoleCache.get<UserRoleData>(`user:role:${email}`);
};

export const setUserRoleInCache = (email: string, role: "ADMIN" | "EDITOR" | "VIEWER", userId: string) => {
  userRoleCache.set(`user:role:${email}`, { role, userId });
};

export const invalidateUserRoleCache = (email: string) => {
  userRoleCache.delete(`user:role:${email}`);
};

// Periodic cleanup (run every 15 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    userRoleCache.cleanup();
  }, 15 * 60 * 1000);
}