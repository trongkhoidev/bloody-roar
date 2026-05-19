import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { AnalyticsService } from "../analytics.service.js";
import { ISSUE_STATUS } from "../../../shared/constants/status.constants.js";

/**
 * Unit tests for AnalyticsService.
 * The repository is mocked — no real DB needed.
 */
describe("AnalyticsService.getPlatformStats", () => {
    const mockRepository = {
        getPlatformRawStats: jest.fn(),
    };

    const service = new AnalyticsService(mockRepository);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should aggregate totalValue correctly", async () => {
        // Arrange
        mockRepository.getPlatformRawStats.mockResolvedValue({
            totalIssues: 3,
            totalDevs: 5,
            issues: [
                { bounty: { amount: 100 }, status: ISSUE_STATUS.OPEN },
                { bounty: { amount: 200 }, status: ISSUE_STATUS.COMPLETED },
                { bounty: { amount: 50 }, status: ISSUE_STATUS.ONGOING },
            ],
        });

        // Act
        const result = await service.getPlatformStats();

        // Assert
        expect(result.totalValue).toBe(350);
        expect(result.completedIssues).toBe(1);
        expect(result.totalDevs).toBe(5);
        expect(result.totalIssues).toBe(3);
    });

    it("should return zero totalValue when all bounties are missing", async () => {
        // Arrange
        mockRepository.getPlatformRawStats.mockResolvedValue({
            totalIssues: 2,
            totalDevs: 1,
            issues: [
                { status: ISSUE_STATUS.OPEN },        // no bounty
                { bounty: null, status: ISSUE_STATUS.COMPLETED },
            ],
        });

        // Act
        const result = await service.getPlatformStats();

        // Assert
        expect(result.totalValue).toBe(0);
        expect(result.completedIssues).toBe(1);
    });

    it("should return zero completedIssues when none are completed", async () => {
        // Arrange
        mockRepository.getPlatformRawStats.mockResolvedValue({
            totalIssues: 1,
            totalDevs: 0,
            issues: [{ bounty: { amount: 500 }, status: ISSUE_STATUS.ONGOING }],
        });

        // Act
        const result = await service.getPlatformStats();

        // Assert
        expect(result.completedIssues).toBe(0);
    });
});
