import { Server } from "socket.io";
import Message from "../models/message.model.js";
import { scanContent } from "../utils/aiScanner.js";

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:5173",
			methods: ["GET", "POST"],
		},
	});

	const recentMessages = new Map(); // Track recent messages to prevent duplicates

	io.on("connection", (socket) => {
		console.log(`User Connected: ${socket.id}`);

		socket.on("join_room", (data) => {
			socket.join(data);
			console.log(`User with ID: ${socket.id} joined room: ${data}`);
		});

		socket.on("send_message", async (data) => {
            // data: { issueId, senderId, content, type, senderName, senderAvatar, attachments }
            
            // ✅ Debouncing: Prevent duplicate sends
            const messageKey = `${data.senderId}-${data.content}-${JSON.stringify(data.attachments || [])}`;
            const now = Date.now();
            
            if (recentMessages.has(messageKey)) {
                const lastSent = recentMessages.get(messageKey);
                if (now - lastSent < 2000) { // 2 second window
                    console.log("🚫 Duplicate message blocked:", messageKey);
                    return;
                }
            }
            
            recentMessages.set(messageKey, now);
            
            // Clean up old entries (older than 5 seconds)
            for (const [key, timestamp] of recentMessages.entries()) {
                if (now - timestamp > 5000) {
                    recentMessages.delete(key);
                }
            }
            
            // 1. Scan Content with AI Guard
            const scanResult = scanContent(data.content);
            
            const messageData = {
                issue: data.issueId,
                sender: data.senderId,
                content: data.content,
                type: data.type || "TEXT",
                attachments: data.attachments || [], // ✅ Save attachments
                isFlagged: scanResult.flagged,
                flagReason: scanResult.reason
            };

            // 2. Save to DB
            try {
                const newMessage = await Message.create(messageData);
                
                // ✅ Populate sender for complete data
                const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatar');
                
                console.log("💾 Message saved:", {
                    id: newMessage._id,
                    hasAttachments: (data.attachments || []).length > 0,
                    attachments: data.attachments
                });
                
                // 3. Emit
                if (scanResult.flagged) {
                    // Send warning: Only emit to sender that it was flagged
                    socket.emit("message_flagged", {
                         _id: newMessage._id,
                         issue: newMessage.issue,
                         sender: populatedMessage.sender || { _id: data.senderId, name: data.senderName, avatar: data.senderAvatar },
                         content: newMessage.content,
                         type: newMessage.type,
                         attachments: newMessage.attachments,
                         isFlagged: newMessage.isFlagged,
                         flagReason: newMessage.flagReason,
                         createdAt: newMessage.createdAt
                    });
                } else {
                    // ✅ Send to entire room (including sender)
                    const messageToEmit = {
                        _id: newMessage._id,
                        issue: newMessage.issue,
                        sender: populatedMessage.sender || { _id: data.senderId, name: data.senderName, avatar: data.senderAvatar },
                        content: newMessage.content,
                        type: newMessage.type,
                        attachments: newMessage.attachments, // ✅ Include attachments
                        createdAt: newMessage.createdAt
                    };
                    
                    console.log("📤 Emitting to room:", data.issueId, messageToEmit);
                    io.in(data.issueId).emit("receive_message", messageToEmit);
                }

            } catch (error) {
                console.error("Socket Message Error:", error);
            }
		});

        socket.on("typing", ({ issueId, userId }) => {
            socket.to(issueId).emit("user_typing", { userId });
        });

        socket.on("delete_message", async ({ issueId, messageId }) => {
            try {
                await Message.findByIdAndDelete(messageId);
                io.in(issueId).emit("message_deleted", messageId);
            } catch (error) {
                console.error("Delete Message Error:", error);
            }
        });

        // ✅ Code Editor Events
        socket.on("code_snippet_create", ({ issueId, language, initialCode, createdBy }) => {
            const snippetId = `snippet-${Date.now()}`;
            
            socket.to(issueId).emit("code_snippet_created", {
                snippetId,
                language,
                code: initialCode,
                createdBy
            });
        });

        socket.on("code_sync", async ({ snippetId, issueId, newCode, language }) => {
            // Debounce check (backend-side)
            const codeKey = `${socket.id}-${snippetId}`;
            const now = Date.now();
            
            if (!global.recentCodeUpdates) global.recentCodeUpdates = new Map();
            
            if (global.recentCodeUpdates.has(codeKey)) {
                const lastSync = global.recentCodeUpdates.get(codeKey);
                if (now - lastSync < 500) return; // Ignore rapid updates
            }
            
            global.recentCodeUpdates.set(codeKey, now);
            
            // Cleanup old entries
            for (const [key, timestamp] of global.recentCodeUpdates.entries()) {
                if (now - timestamp > 5000) {
                    global.recentCodeUpdates.delete(key);
                }
            }
            
            // AI Guard scan
            const scanResult = scanContent(newCode);
            
            if (scanResult.flagged) {
                socket.emit("code_flagged", {
                    snippetId,
                    reason: scanResult.reason
                });
                return;
            }
            
            // Broadcast to room (excluding sender)
            socket.to(issueId).emit("code_update", {
                snippetId,
                code: newCode,
                language
            });
        });

        socket.on("code_snippet_save", async ({ snippetId, issueId, finalCode, language, senderId, senderName, senderAvatar }) => {
            try {
                const messageData = {
                    issue: issueId,
                    sender: senderId,
                    content: finalCode,
                    type: "CODE",
                    metadata: { language, snippetId }
                };
                
                const savedMessage = await Message.create(messageData);
                const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name avatar');
                
                io.in(issueId).emit("receive_message", {
                    _id: savedMessage._id,
                    issue: savedMessage.issue,
                    sender: populatedMessage.sender || { _id: senderId, name: senderName, avatar: senderAvatar },
                    content: savedMessage.content,
                    type: "CODE",
                    metadata: savedMessage.metadata,
                    createdAt: savedMessage.createdAt
                });
            } catch (error) {
                console.error("Code Save Error:", error);
            }
        });

        // ✅ Workspace Events
        socket.on("workspace_upload", ({ issueId, workspaceData }) => {
            // Broadcast workspace creation to all users in the room
            socket.to(issueId).emit("workspace_created", {
                workspaceId: workspaceData.workspaceId,
                name: workspaceData.name,
                fileCount: workspaceData.fileCount,
                totalSize: workspaceData.totalSize,
                fileTree: workspaceData.fileTree,
                createdBy: workspaceData.uploadedBy
            });
        });

        socket.on("file_open", ({ issueId, workspaceId, filePath, userId }) => {
            // Broadcast file open to other users
            socket.to(issueId).emit("file_opened", {
                workspaceId,
                filePath,
                userId
            });
        });

        socket.on("file_edit", ({ issueId, workspaceId, filePath, content, userId }) => {
            // Broadcast file edits (full content for Phase 1)
            socket.to(issueId).emit("file_updated", {
                workspaceId,
                filePath,
                content,
                userId
            });
        });

        socket.on("file_save", async ({ issueId, workspaceId, filePath, content }) => {
            // File save is handled via REST API, just broadcast confirmation
            io.in(issueId).emit("file_saved", {
                workspaceId,
                filePath,
                success: true
            });
        });

		socket.on("disconnect", () => {
			console.log("User Disconnected", socket.id);
		});
	});
    
    return io;
};
