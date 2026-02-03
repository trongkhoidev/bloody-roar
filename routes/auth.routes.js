import express from "express";
import { loginWithWeb3, getMe, register, login, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/web3-login", loginWithWeb3);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;