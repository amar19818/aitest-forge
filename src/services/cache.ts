/**
 * Cache Service for LiveTest.AI
 * Implements in-memory caching with localStorage fallback
 * Prevents multiple API requests and stores frequently accessed data
 */

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheItem>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Store data in cache with optional TTL
   */
  set(key: string, data: any, ttl?: number): void {
    const cacheItem: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, cacheItem);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Retrieve data from cache if valid
   */
  get(key: string): any | null {
    let cacheItem = this.cache.get(key);

    // If not in memory, try localStorage
    if (!cacheItem) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
          // Restore to memory cache
          if (cacheItem) {
            this.cache.set(key, cacheItem);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error);
      }
    }

    if (!cacheItem) {
      return null;
    }

    // Check if cache item has expired
    const now = Date.now();
    const isExpired = now - cacheItem.timestamp > cacheItem.ttl;

    if (isExpired) {
      this.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  /**
   * Check if key exists and is valid in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    
    // Clear from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Remove expired items from cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      const isExpired = now - item.timestamp > item.ttl;
      if (isExpired) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cache wrapper for API calls
   * Automatically caches the result of an API call
   */
  async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check if we have cached data
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // If fetch fails, try to return stale cache data
      const staleData = this.getStale(key);
      if (staleData !== null) {
        console.warn('Using stale cache data due to fetch failure:', error);
        return staleData;
      }
      throw error;
    }
  }

  /**
   * Get stale data (ignoring TTL)
   */
  private getStale(key: string): any | null {
    const cacheItem = this.cache.get(key);
    if (cacheItem) {
      return cacheItem.data;
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsedItem = JSON.parse(stored);
        return parsedItem?.data || null;
      }
    } catch (error) {
      console.warn('Failed to retrieve stale data from localStorage:', error);
    }

    return null;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Preload cache with initial data
   */
  preload(data: Record<string, any>, ttl?: number): void {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean up expired items every 5 minutes
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

// Cache keys constants for consistency
export const CACHE_KEYS = {
  USER_DASHBOARD: 'user_dashboard',
  USER_TESTS: 'user_tests',
  USER_EXAM_HISTORY: 'user_exam_history',
  TEST_DETAILS: (testId: string) => `test_details_${testId}`,
  LEADERBOARD_GLOBAL: 'leaderboard_global',
  LEADERBOARD_TEST: (testId: string) => `leaderboard_test_${testId}`,
  TEST_RESULTS: (submissionId: string) => `test_results_${submissionId}`,
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
};

export default cacheService;