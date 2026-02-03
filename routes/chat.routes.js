import express from "express";
import Message from "../models/message.model.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getContacts } from "../controllers/chat.controller.js";

const router = express.Router();

// @desc    Get Contacts (Devs)
router.get("/contacts", protect, getContacts);

// @desc    Get Chat History for an Issue
// @route   GET /api/chat/:issueId
// @access  Private
router.get("/:issueId", protect, async (req, res) => {
    try {
        const messages = await Message.find({ issue: req.params.issueId })
            .populate("sender", "name avatar")
            .sort({ createdAt: 1 }); // Oldest first

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
