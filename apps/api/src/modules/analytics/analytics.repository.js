import User from "../../shared/models/user.model.js";
import Issue from "../../shared/models/issue.model.js";
import { USER_ROLES } from "../../shared/constants/roles.constants.js";
import { ISSUE_STATUS } from "../../shared/constants/status.constants.js";

/**
 * AnalyticsRepository — all DB queries for analytics module.
 * Centralised here so the service stays free of Mongoose boilerplate.
 */
export class AnalyticsRepository {
    /**
     * Fetch the raw data needed for platform-wide stats in parallel.
     * @returns {{ totalIssues: number, totalDevs: number, issues: Array }}
     */
    async getPlatformRawStats() {
        const [totalIssues, totalDevs, issues] = await Promise.all([
            Issue.countDocuments(),
            User.countDocuments({ role: USER_ROLES.DEVELOPER }),
            // Only fetch fields needed for computation — avoids pulling full docs
            Issue.find({}, "bounty.amount status").lean(),
        ]);

        return { totalIssues, totalDevs, issues };
    }
}

export default new AnalyticsRepository();
