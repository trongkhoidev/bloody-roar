import express from "express";
import { getChatHistory, getContacts } from "./chat.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

/**
 * All chat routes are private.
 */
router.use(protect);

router.get("/contacts", getContacts);
router.get("/:issueId", getChatHistory);
router.get("/room/:issueId/:devId", getChatHistory);

export default router;
