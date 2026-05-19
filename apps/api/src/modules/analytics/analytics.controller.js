import analyticsService from "./analytics.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * AnalyticsController — thin HTTP layer. Only parses request / formats response.
 */
export const getPlatformStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getPlatformStats();
    res.status(200).json(ApiResponse.ok(stats, "Platform stats fetched"));
});
