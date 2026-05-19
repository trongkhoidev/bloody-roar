import express from "express";
import {
    getEscrowStatus,
    recordDeposit,
    recordRelease,
    raiseDispute,
    resolveDispute,
    getDisputeDossier,
} from "./escrow.controller.js";
import { protect } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:issueId", getEscrowStatus);
router.get("/:issueId/dispute-dossier", getDisputeDossier);
router.post("/deposit", recordDeposit);
router.post("/release", recordRelease);
router.post("/dispute", raiseDispute);
router.post("/resolve", resolveDispute);

export default router;
