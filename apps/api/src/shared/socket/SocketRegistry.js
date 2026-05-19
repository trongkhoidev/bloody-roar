import logger from "../logger/logger.js";

/**
 * SocketRegistry — single source of truth for all active socket connections.
 * Provides a neutral way for any service to push real-time data to a user.
 */
class SocketRegistry {
    constructor() {
        this.io = null;
        this.userSocketMap = new Map(); // userId -> socketId
    }

    /**
     * Initialise with Socket.io server instance.
     */
    init(io) {
        this.io = io;
        logger.info("📡 SocketRegistry initialised");
    }

    /**
     * Register a user connection.
     */
    register(userId, socketId) {
        this.userSocketMap.set(userId.toString(), socketId);
    }

    /**
     * Unregister a user connection.
     */
    unregister(socketId) {
        for (const [userId, id] of this.userSocketMap.entries()) {
            if (id === socketId) {
                this.userSocketMap.delete(userId);
                return;
            }
        }
    }

    /**
     * Get socket ID for a user.
     */
    getSocketId(userId) {
        return this.userSocketMap.get(userId.toString());
    }

    /**
     * Emit an event to a specific user.
     */
    emitToUser(userId, event, payload) {
        if (!this.io) return;
        const socketId = this.getSocketId(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, payload);
        }
    }

    /**
     * Emit an event to a room (e.g. issue or chatroom).
     */
    emitToRoom(roomId, event, payload) {
        if (!this.io) return;
        this.io.to(roomId).emit(event, payload);
    }
}

export const socketRegistry = new SocketRegistry();
