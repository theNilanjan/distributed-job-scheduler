import { http } from './http';

const unwrap = (request) => request.then((res) => res.data.data);

/**
 * The dashboard API provides a single, efficient endpoint for fetching all data
 * required for the main dashboard and analytics pages.
 */
export const dashboardApi = {
  /**
   * Fetches a comprehensive summary of system-wide metrics.
   * This includes counts for all major entities, job status distributions,
   * worker utilization, and reliability metrics.
   * @returns {Promise<object>} A promise that resolves to the summary data.
   */
  summary: () => unwrap(http.get('/dashboard/summary'))
};

