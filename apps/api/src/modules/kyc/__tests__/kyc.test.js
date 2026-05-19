import User from "../../../shared/models/user.model.js";
import { socketRegistry } from "../../../shared/socket/SocketRegistry.js";
import blockchain from "../../../shared/utils/blockchain.js";
import { createKycSession, handleKycWebhook } from "../kyc.controller.js";

// Mock helper
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
    return fn;
};

describe("eKYC Trust & Soulbound Token Handshake Integration", () => {
    let mockUser;
    const originalUserFindById = User.findById;
    const originalMintKycSbt = blockchain.mintKycSbt;
    const originalEmitToRoom = socketRegistry.emitToRoom;

    beforeEach(() => {
        mockUser = {
            _id: "507f1f77bcf86cd799439099",
            name: "Mock Dev",
            walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            kycStatus: "NONE",
            sbtTokenId: null,
            save: createMockFn(true)
        };

        User.findById = createMockFn(mockUser);
        global.mockUser = mockUser;
        blockchain.mintKycSbt = createMockFn({ success: true, txHash: "0xsbtmint123", tokenId: 456 });
        socketRegistry.emitToRoom = createMockFn(true);
    });

    afterAll(() => {
        User.findById = originalUserFindById;
        blockchain.mintKycSbt = originalMintKycSbt;
        socketRegistry.emitToRoom = originalEmitToRoom;
    });

    it("should successfully trigger on-chain SBT minting and update status when APPROVED webhook is received", async () => {
        // 1. Arrange: Create a mock Express request and response to create a session first
        let sessionData = null;
        const mockReqCreate = {
            user: { _id: "507f1f77bcf86cd799439099" },
            protocol: "http",
            get: () => "localhost:3000"
        };
        const mockResCreate = {
            status: (code) => {
                expect(code).toBe(201);
                return {
                    json: (data) => {
                        sessionData = data.data;
                    }
                };
            }
        };

        await createKycSession(mockReqCreate, mockResCreate);
        expect(sessionData).not.toBeNull();
        expect(sessionData.sessionId).toBeDefined();

        // 2. Act: Trigger Webhook for session approval
        const mockReqWebhook = {
            body: {
                event: "APPROVED",
                sessionId: sessionData.sessionId,
                walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            }
        };

        let resolvePromise;
        const finishedPromise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        const mockResWebhook = {
            status: (code) => {
                expect(code).toBe(200);
                return {
                    json: (data) => {
                        expect(data.success).toBe(true);
                        expect(data.data.sbtTokenId).toBe(456);
                        expect(data.data.txHash).toBe("0xsbtmint123");
                        resolvePromise();
                    }
                };
            }
        };

        handleKycWebhook(mockReqWebhook, mockResWebhook);
        await finishedPromise;



        // 3. Assert: Verify model status was successfully written and on-chain SBT was minted
        expect(mockUser.kycStatus).toBe("APPROVED");
        expect(mockUser.sbtTokenId).toBe(456);
        expect(mockUser.save.calls.length).toBe(1);

        // Verify WebSocket pairing broadcast
        expect(socketRegistry.emitToRoom.calls.length).toBe(1);
        expect(socketRegistry.emitToRoom.calls[0][0]).toBe(`ekyc_session_${sessionData.sessionId}`);
        expect(socketRegistry.emitToRoom.calls[0][1]).toBe("kyc_success");
    });
});
