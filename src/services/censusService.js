import { api } from './apiClient';

/**
 * Frontend Census Service
 * Communicates with GET /api/census endpoints via Vite proxy and backend API.
 */
export const censusService = {
  /**
   * Fetch paginated census records with optional search and filters.
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=20]
   * @param {string} [options.district]
   * @param {string} [options.tehsil]
   * @param {string} [options.village]
   * @param {string} [options.gender]
   * @param {string} [options.socialCategory]
   * @param {string} [options.search]
   */
  async getRecords(options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.district) params.append('district', options.district);
    if (options.tehsil) params.append('tehsil', options.tehsil);
    if (options.village) params.append('village', options.village);
    if (options.gender) params.append('gender', options.gender);
    if (options.socialCategory) params.append('socialCategory', options.socialCategory);
    if (options.search) params.append('search', options.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/census?${queryString}` : '/census';
    return api.get(endpoint);
  },

  /**
   * Fetch single census person by person ID.
   * @param {string} personId
   */
  async getPersonById(personId) {
    if (!personId) return { ok: false, error: 'Person ID is required' };
    return api.get(`/census/${encodeURIComponent(personId)}`);
  },

  /**
   * Fetch aggregate statistics and demographic summary.
   */
  async getStats() {
    return api.get('/census/stats/summary');
  }
};
