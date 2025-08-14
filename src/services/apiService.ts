/**
 * API Service with caching support
 * Wraps common API calls with intelligent caching
 */

import api from './api';
import cacheService, { CACHE_KEYS } from './cache';

class ApiService {
  // Cache TTL configurations (in milliseconds)
  private readonly cacheTTL = {
    short: 2 * 60 * 1000,    // 2 minutes
    medium: 5 * 60 * 1000,   // 5 minutes
    long: 15 * 60 * 1000,    // 15 minutes
    veryLong: 60 * 60 * 1000, // 1 hour
  };

  /**
   * Get user dashboard data with caching
   */
  async getUserDashboard() {
    return cacheService.getCachedOrFetch(
      CACHE_KEYS.USER_DASHBOARD,
      () => api.get('/users/dashboard').then(res => res.data),
      this.cacheTTL.medium
    );
  }

  /**
   * Get user's tests (for teachers) with caching
   */
  async getUserTests() {
    return cacheService.getCachedOrFetch(
      CACHE_KEYS.USER_TESTS,
      () => api.get('/tests/my-tests').then(res => res.data),
      this.cacheTTL.short // Tests update frequently
    );
  }

  /**
   * Get user's exam history (for students) with caching
   */
  async getUserExamHistory(page = 1, limit = 20) {
    const cacheKey = `${CACHE_KEYS.USER_EXAM_HISTORY}_${page}_${limit}`;
    return cacheService.getCachedOrFetch(
      cacheKey,
      () => api.get(`/users/exam-history?page=${page}&limit=${limit}`).then(res => res.data),
      this.cacheTTL.medium
    );
  }

  /**
   * Get test details with caching
   */
  async getTestDetails(testId: string) {
    return cacheService.getCachedOrFetch(
      CACHE_KEYS.TEST_DETAILS(testId),
      () => api.get(`/tests/${testId}`).then(res => res.data),
      this.cacheTTL.long // Test details change rarely
    );
  }

  /**
   * Get global leaderboard with caching
   */
  async getGlobalLeaderboard(limit = 50) {
    const cacheKey = `${CACHE_KEYS.LEADERBOARD_GLOBAL}_${limit}`;
    return cacheService.getCachedOrFetch(
      cacheKey,
      () => api.get(`/leaderboard/global?limit=${limit}`).then(res => res.data),
      this.cacheTTL.medium
    );
  }

  /**
   * Get test leaderboard with caching
   */
  async getTestLeaderboard(testId: string, limit = 50) {
    const cacheKey = `${CACHE_KEYS.LEADERBOARD_TEST(testId)}_${limit}`;
    return cacheService.getCachedOrFetch(
      cacheKey,
      () => api.get(`/leaderboard/test/${testId}?limit=${limit}`).then(res => res.data),
      this.cacheTTL.medium
    );
  }

  /**
   * Get test results with caching
   */
  async getTestResults(submissionId: string) {
    return cacheService.getCachedOrFetch(
      CACHE_KEYS.TEST_RESULTS(submissionId),
      () => api.get(`/submissions/${submissionId}/results`).then(res => res.data),
      this.cacheTTL.veryLong // Results never change
    );
  }

  /**
   * Join test (no caching needed)
   */
  async joinTest(accessCode: string) {
    const response = await api.post('/tests/join', { accessCode });
    return response.data;
  }

  /**
   * Start test (no caching needed)
   */
  async startTest(testId: string) {
    const response = await api.post('/submissions/start', { testId });
    // Invalidate related caches
    this.invalidateUserCaches();
    return response.data;
  }

  /**
   * Save answer (no caching needed)
   */
  async saveAnswer(submissionId: string, questionId: string, answer: any) {
    const response = await api.post('/submissions/answer', {
      submissionId,
      questionId,
      ...answer
    });
    return response.data;
  }

  /**
   * Submit test (no caching needed)
   */
  async submitTest(submissionId: string) {
    const response = await api.post('/submissions/submit', { submissionId });
    // Invalidate related caches
    this.invalidateUserCaches();
    return response.data;
  }

  /**
   * Create test (no caching needed)
   */
  async createTest(testData: any) {
    const response = await api.post('/tests/generate', testData);
    // Invalidate teacher's test cache
    cacheService.delete(CACHE_KEYS.USER_TESTS);
    cacheService.delete(CACHE_KEYS.USER_DASHBOARD);
    return response.data;
  }

  /**
   * Publish test (no caching needed)
   */
  async publishTest(testId: string) {
    const response = await api.patch(`/tests/${testId}/publish`);
    // Invalidate related caches
    cacheService.delete(CACHE_KEYS.USER_TESTS);
    cacheService.delete(CACHE_KEYS.TEST_DETAILS(testId));
    return response.data;
  }

  /**
   * Upload files (no caching needed)
   */
  async uploadFiles(formData: FormData) {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get shareable link (with short-term caching)
   */
  async getShareableLink(testId: string) {
    const cacheKey = `shareable_link_${testId}`;
    return cacheService.getCachedOrFetch(
      cacheKey,
      () => api.get(`/tests/${testId}/share`).then(res => res.data),
      this.cacheTTL.short
    );
  }

  /**
   * Invalidate user-specific caches
   */
  private invalidateUserCaches() {
    cacheService.delete(CACHE_KEYS.USER_DASHBOARD);
    cacheService.delete(CACHE_KEYS.USER_TESTS);
    cacheService.invalidatePattern(CACHE_KEYS.USER_EXAM_HISTORY);
    cacheService.invalidatePattern('leaderboard');
  }

  /**
   * Invalidate all caches (use on logout)
   */
  public clearAllCaches() {
    cacheService.clear();
  }

  /**
   * Preload essential data for better UX
   */
  async preloadUserData() {
    try {
      // Preload dashboard data
      await this.getUserDashboard();
      
      // Preload user-specific data based on role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'teacher') {
        await this.getUserTests();
      } else if (user.role === 'student') {
        await this.getUserExamHistory(1, 5); // Preload first 5 items
      }
    } catch (error) {
      console.warn('Failed to preload user data:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return cacheService.getStats();
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;