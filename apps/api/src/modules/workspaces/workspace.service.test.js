import { WorkspaceService } from "./workspace.service.js";
import dockerService from "../../shared/utils/dockerService.js";
import blockchain from "../../shared/utils/blockchain.js";
import Issue from "../../shared/models/issue.model.js";
import Audit from "../../shared/models/audit.model.js";
import { PaymentStatus, IssueStatus } from "@bloody-roar/shared-types";

// Standard mock helper that works universally under any JS engine
const createMockFn = (defaultReturnValue) => {
    let resolvedValue = defaultReturnValue;
    const fn = async (...args) => {
        fn.calls.push(args);
        return resolvedValue;
    };
    fn.calls = [];
    fn.mockResolvedValue = (val) => {
        resolvedValue = val;
        return fn;
    };
    fn.mockReset = () => {
        fn.calls = [];
        resolvedValue = defaultReturnValue;
    };
    return fn;
};

describe("WorkspaceService - Phase 4 Sandbox & Automated Verification", () => {
    let workspaceService;
    let mockRepository;
    let mockWorkspace;
    let mockIssue;

    // Save original implementations
    const originalDockerExecute = dockerService.execute;
    const originalTriggerOracleRelease = blockchain.triggerOracleRelease;
    const originalIssueFindById = Issue.findById;
    const originalAuditCreate = Audit.create;

    beforeEach(() => {
        mockWorkspace = {
            workspaceId: "ws-test-123",
            issue: "507f1f77bcf86cd799439011",
            uploadedBy: "507f1f77bcf86cd799439022",
            files: [
                { path: "src/index.js", content: "console.log('hello');", size: 21, language: "javascript" }
            ],
            paymentStatus: "NONE",
            save: createMockFn(true)
        };

        mockIssue = {
            _id: "507f1f77bcf86cd799439011",
            clientId: "507f1f77bcf86cd799439033", // Client ID
            status: "ONGOING",
            save: createMockFn(true)
        };

        mockRepository = {
            findById: createMockFn(mockWorkspace),
            findByIdWithPopulated: createMockFn(mockWorkspace)
        };

        workspaceService = new WorkspaceService(mockRepository);

        // Manual stubbing using custom universal mocks
        dockerService.execute = createMockFn(null);
        blockchain.triggerOracleRelease = createMockFn(null);
        Issue.findById = createMockFn(mockIssue);
        Audit.create = createMockFn(true);
    });

    afterAll(() => {
        // Restore original implementations
        dockerService.execute = originalDockerExecute;
        blockchain.triggerOracleRelease = originalTriggerOracleRelease;
        Issue.findById = originalIssueFindById;
        Audit.create = originalAuditCreate;
    });

    describe("runCommand", () => {
        it("should execute command inside Docker sandbox container", async () => {
            dockerService.execute.mockResolvedValue({
                output: "test passed",
                error: "",
                exitCode: 0
            });

            const result = await workspaceService.runCommand(
                "507f1f77bcf86cd799439022",
                "ws-test-123",
                "npm test"
            );

            expect(dockerService.execute.calls.length).toBe(1);
            expect(dockerService.execute.calls[0][0]).toBe("ws-test-123");
            expect(dockerService.execute.calls[0][1]).toBe("npm test");
            expect(result.exitCode).toBe(0);
            expect(result.output).toBe("test passed");
        });
    });

    describe("getFileContent with Asymmetric Visibility", () => {
        it("should return full content for the developer", async () => {
            const devUserId = "507f1f77bcf86cd799439022"; // Solver/Developer
            const result = await workspaceService.getFileContent(devUserId, "ws-test-123", "src/index.js");

            expect(result.content).toBe("console.log('hello');");
        });

        it("should hide content (enable Asymmetric Visibility) for the client before verification", async () => {
            const clientUserId = "507f1f77bcf86cd799439033"; // Client
            const result = await workspaceService.getFileContent(clientUserId, "ws-test-123", "src/index.js");

            expect(result.content).toContain("[ASYMMETRIC VISIBILITY ENABLED]");
            expect(result.content).not.toContain("console.log('hello');");
        });

        it("should return full content to client after verification has completed", async () => {
            const clientUserId = "507f1f77bcf86cd799439033"; // Client
            
            // Set payment status as released
            mockWorkspace.paymentStatus = "RELEASED";
            mockIssue.status = "COMPLETED";

            const result = await workspaceService.getFileContent(clientUserId, "ws-test-123", "src/index.js");

            expect(result.content).toBe("console.log('hello');");
        });
    });

    describe("verifyWorkspace & Oracle Relayer", () => {
        it("should return failure if sandbox tests fail", async () => {
            dockerService.execute.mockResolvedValue({
                output: "failed to compile",
                error: "SyntaxError",
                exitCode: 1
            });

            const result = await workspaceService.verifyWorkspace("ws-test-123");

            expect(result.success).toBe(false);
            expect(result.error).toBe("SyntaxError");
            expect(mockWorkspace.paymentStatus).toBe("NONE");
        });

        it("should release escrow funds and complete issue if tests pass inside sandbox", async () => {
            dockerService.execute.mockResolvedValue({
                output: "all 15 tests passed",
                error: "",
                exitCode: 0
            });

            blockchain.triggerOracleRelease.mockResolvedValue({
                success: true,
                txHash: "0xblockchainhash123"
            });

            const result = await workspaceService.verifyWorkspace("ws-test-123");

            expect(result.success).toBe(true);
            expect(result.txHash).toBe("0xblockchainhash123");
            expect(mockWorkspace.paymentStatus).toBe(PaymentStatus.RELEASED);
            expect(mockIssue.status).toBe(IssueStatus.COMPLETED);
            expect(blockchain.triggerOracleRelease.calls.length).toBe(1);
            expect(blockchain.triggerOracleRelease.calls[0][0]).toBe("507f1f77bcf86cd799439011");
        });
    });
});
