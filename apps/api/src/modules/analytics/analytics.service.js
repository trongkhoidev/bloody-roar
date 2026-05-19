import analyticsRepository from "./analytics.repository.js";
import { ISSUE_STATUS } from "../../shared/constants/status.constants.js";

/**
 * AnalyticsService — business logic for platform statistics.
 * Depends on AnalyticsRepository, NOT on Mongoose directly.
 */
export class AnalyticsService {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Compute platform-wide statistics.
     * @returns {Promise<{ totalIssues, totalValue, totalDevs, completedIssues }>}
     */
    async getPlatformStats() {
        const { totalIssues, totalDevs, issues } = await this.repository.getPlatformRawStats();

        const totalValue = issues.reduce((acc, issue) => acc + (issue.bounty?.amount || 0), 0);
        const completedIssues = issues.filter((issue) => issue.status === ISSUE_STATUS.COMPLETED).length;

        return { totalIssues, totalValue, totalDevs, completedIssues };
    }
}

export default new AnalyticsService(analyticsRepository);
