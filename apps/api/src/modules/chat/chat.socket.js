import { socketRegistry } from "../../shared/socket/SocketRegistry.js";
import chatRepository from "./chat.repository.js";
import { scanContent } from "../../shared/utils/aiScanner.js";
import logger from "../../shared/logger/logger.js";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants.js";

/**
 * Handle all chat-related socket events.
 * Logic extracted from legacy sockets/chat.socket.js
 */
export const handleChatSocket = (socket, io) => {
    // 1. Send Message
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
        const scanResult = scanContent(data.content);
        const chatRoomId = data.chatRoomId || (data.devId ? `${data.issueId}_${data.devId}` : data.issueId);

        const messageData = {
            issue: data.issueId,
            chatRoomId,
            sender: data.senderId,
            content: data.content,
            type: data.type || "TEXT",
            attachments: data.attachments || [],
            isFlagged: scanResult.flagged,
            flagReason: scanResult.reason,
        };

        try {
            const newMessage = await chatRepository.createMessage(messageData);
            const populated = await chatRepository.findMessageById(newMessage._id);

            if (scanResult.flagged) {
                socket.emit("message_flagged", { ...populated.toObject(), isFlagged: true });
            } else {
                io.to(chatRoomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, populated);
            }
        } catch (err) {
            logger.error({ err }, "Socket send_message error");
        }
    });

    // 2. Typing indicator
    socket.on("typing", ({ issueId, devId, userId }) => {
        const roomId = devId ? `${issueId}_${devId}` : issueId;
        socket.to(roomId).emit("user_typing", { userId });
    });

    // 3. Delete Message
    socket.on("delete_message", async ({ issueId, devId, messageId }) => {
        try {
            await chatRepository.deleteMessage(messageId);
            const roomId = devId ? `${issueId}_${devId}` : issueId;
            io.to(roomId).emit("message_deleted", messageId);
        } catch (err) {
            logger.error({ err }, "Socket delete_message error");
        }
    });

    // 4. Workspace Upload (Legacy support for real-time)
    socket.on("workspace_upload", async ({ issueId, devId, workspaceData, senderId, senderName, senderAvatar }) => {
        const chatRoomId = devId ? `${issueId}_${devId}` : issueId;
        try {
            const msgContent = JSON.stringify(workspaceData);
            const newMessage = await chatRepository.createMessage({
                issue: issueId,
                chatRoomId,
                sender: senderId,
                content: msgContent,
                type: "WORKSPACE",
            });
            const populated = await chatRepository.findMessageById(newMessage._id);
            io.to(chatRoomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, populated);
        } catch (err) {
            logger.error({ err }, "Socket workspace_upload error");
        }
    });

    // 5. Code Sync / Collab
    socket.on("code_sync", ({ snippetId, issueId, newCode, language }) => {
        const scanResult = scanContent(newCode);
        if (scanResult.flagged) {
            socket.emit("code_flagged", { snippetId, reason: scanResult.reason });
            return;
        }
        socket.to(issueId).emit("code_update", { snippetId, code: newCode, language });
    });

    socket.on("code_snippet_save", async ({ issueId, finalCode, language, senderId }) => {
        try {
            const msg = await chatRepository.createMessage({
                issue: issueId,
                sender: senderId,
                content: finalCode,
                type: "CODE",
                metadata: { language },
            });
            const populated = await chatRepository.findMessageById(msg._id);
            io.to(issueId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, populated);
        } catch (err) {
            logger.error({ err }, "Socket code_snippet_save error");
        }
    });
};
