import chatService from "./chat.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * ChatController — handles HTTP history and contact requests.
 */
export const getChatHistory = asyncHandler(async (req, res) => {
    const { issueId, devId } = req.params;
    const history = await chatService.getChatHistory(issueId, devId);
    res.status(200).json(ApiResponse.ok(history, "Chat history fetched"));
});

export const getContacts = asyncHandler(async (req, res) => {
    const contacts = await chatService.getContacts(req.user);
    res.status(200).json(ApiResponse.ok(contacts, "Contacts fetched"));
});
