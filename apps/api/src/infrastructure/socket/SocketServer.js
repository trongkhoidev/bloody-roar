import { Server } from "socket.io";
import { socketRegistry } from "../../shared/socket/SocketRegistry.js";
import { handleChatSocket } from "../../modules/chat/chat.socket.js";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants.js";
import logger from "../../shared/logger/logger.js";

/**
 * SocketServer — Centralised Socket.io setup and registry.
 * Dispatches events to modular handlers (Chat, Workspace, etc.).
 */
export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    // 1. Initialise the global registry for cross-module access
    socketRegistry.init(io);

    io.on("connection", (socket) => {
        logger.info({ socketId: socket.id }, "📡 New socket connection");

        // ── Middleware: Register User ───────────────────────────────────
        socket.on(SOCKET_EVENTS.REGISTER_USER, (userId) => {
            if (userId) {
                socketRegistry.register(userId, socket.id);
                logger.info({ userId, socketId: socket.id }, "📡 User registered");
            }
        });

        // ── Module Handlers ─────────────────────────────────────────────
        handleChatSocket(socket, io);
        
        // Future: handleWorkspaceSocket(socket, io);

        // ── Shared Handlers ─────────────────────────────────────────────
        socket.on(SOCKET_EVENTS.JOIN_ROOM, (data) => {
            let roomId;
            if (typeof data === "object" && data.issueId) {
                roomId = data.devId ? `${data.issueId}_${data.devId}` : data.issueId;
            } else {
                roomId = data;
            }
            socket.join(roomId);
            logger.debug({ roomId, socketId: socket.id }, "Joined room");
        });

        socket.on("disconnect", () => {
            socketRegistry.unregister(socket.id);
            logger.info({ socketId: socket.id }, "📡 Socket disconnected");
        });
    });

    return io;
};
