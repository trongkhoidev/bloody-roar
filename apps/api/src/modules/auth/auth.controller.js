import authService from "./auth.service.js";
import authRepository from "./auth.repository.js";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

/**
 * AuthController — handles HTTP requests for authentication and user management.
 */
export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(ApiResponse.created(result, "Registration successful"));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(ApiResponse.ok(result, "Login successful"));
});

export const loginWithWeb3 = asyncHandler(async (req, res) => {
    const { walletAddress, signature, message } = req.body;
    const result = await authService.loginWithWeb3(walletAddress, signature, message);
    res.status(200).json(ApiResponse.ok(result, "Web3 login successful"));
});

export const linkWallet = asyncHandler(async (req, res) => {
    const { walletAddress, signature, message } = req.body;
    const user = await authService.linkWallet(req.user._id, walletAddress, signature, message);
    res.status(200).json(ApiResponse.ok({ walletAddress: user.walletAddress }, "Wallet linked successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
    const user = await authRepository.findById(req.user._id);
    res.status(200).json(ApiResponse.ok(user, "User profile fetched"));
});

export const updateProfile = asyncHandler(async (req, res) => {
    const result = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json(ApiResponse.ok(result, "Profile updated successfully"));
});

export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.adminLogin(email, password);
    res.status(200).json(ApiResponse.ok(result, "Admin login successful"));
});
