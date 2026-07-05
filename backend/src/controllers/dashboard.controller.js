import { getDashboardSummary } from '../services/dashboard.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * @description Get dashboard summary
 * @route GET /api/v1/dashboard/summary
 * @access Private
 */
export const getSummary = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary();
  success(res, summary);
});
