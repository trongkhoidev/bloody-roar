import express from "express";
import githubWebhookService from "./github-webhook.service.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";

const router = express.Router();

/**
 * @route POST /api/webhooks/github
 * This route needs the raw body for signature verification.
 */
router.post(
    "/github",
    express.raw({ type: "application/json" }),
    asyncHandler(async (req, res) => {
        const signature = req.headers["x-hub-signature-256"];
        const event = req.headers["x-github-event"];
        const rawBody = req.body; // express.raw makes req.body a Buffer

        if (!githubWebhookService.verifySignature(rawBody, signature)) {
            return res.status(401).json({ message: "Invalid signature" });
        }

        // Parse for downstream
        const payload = JSON.parse(rawBody.toString());
        await githubWebhookService.handleEvent(event, payload);

        res.status(200).json({ success: true });
    })
);

export default router;
