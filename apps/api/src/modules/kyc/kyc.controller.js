import User from "../../shared/models/user.model.js";
import { socketRegistry } from "../../shared/socket/SocketRegistry.js";
import blockchain from "../../shared/utils/blockchain.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { AppError } from "../../shared/errors/errors.js";

// Session storage in memory
const kycSessions = new Map();

/**
 * eKYC Controller — manages session lifecycle, pairing, webhooks, and SBT triggers.
 */
export const createKycSession = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const sessionId = `kyc_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    kycSessions.set(sessionId, {
        userId: userId.toString(),
        status: "PENDING",
        createdAt: Date.now()
    });

    res.status(201).json(ApiResponse.created({
        sessionId,
        qrUrl: `${req.protocol}://${req.get("host")}/ekyc/session/${sessionId}`
    }, "KYC session created"));
});

export const handleKycWebhook = asyncHandler(async (req, res) => {
    const { event, sessionId, walletAddress } = req.body;

    if (!sessionId) {
        throw new AppError("Session ID is required", 400);
    }

    const session = kycSessions.get(sessionId);
    if (!session) {
        throw new AppError("Invalid or expired KYC session", 404);
    }

    if (event === "APPROVED") {
        const userId = session.userId;
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("Associated user not found", 404);
        }

        console.log(`👤 KYC Webhook: User ${user.name} approved. Processing on-chain Soulbound Token minting...`);
        
        // Update wallet address if provided during identity scan
        if (walletAddress && !user.walletAddress) {
            user.walletAddress = walletAddress;
        }

        const sbtTx = await blockchain.mintKycSbt(walletAddress || user.walletAddress || "0x0000000000000000000000000000000000000000");

        user.kycStatus = "APPROVED";
        user.sbtTokenId = sbtTx.tokenId;
        await user.save();

        session.status = "APPROVED";
        kycSessions.delete(sessionId); // Clean up session

        // Emit Socket event to pairing channel
        const roomName = `ekyc_session_${sessionId}`;
        console.log(`📡 KYC Webhook: Broadcasting 'kyc_success' to WebSocket room: ${roomName}`);
        socketRegistry.emitToRoom(roomName, "kyc_success", {
            status: "APPROVED",
            sbtTokenId: sbtTx.tokenId,
            txHash: sbtTx.txHash
        });

        return res.status(200).json(ApiResponse.ok({
            sbtTokenId: sbtTx.tokenId,
            txHash: sbtTx.txHash
        }, "KYC verified and SBT minted successfully"));
    }

    res.status(200).json(ApiResponse.ok(null, "Webhook processed"));
});

export const getKycSessionStatus = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = kycSessions.get(sessionId);
    if (!session) {
        throw new AppError("Session not found", 404);
    }
    res.status(200).json(ApiResponse.ok({ status: session.status }));
});
