import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import authRepository from "./auth.repository.js";
import { AppError, UnauthorizedError, ConflictError } from "../../shared/errors/errors.js";
import { PORT, JWT_SECRET, JWT_EXPIRES_IN } from "../../infrastructure/config/env.js";

/**
 * AuthService — business logic for authentication and user management.
 */
export class AuthService {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Generate JWT for a user.
     */
    generateToken(id) {
        return jwt.sign({ id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
    }

    /**
     * Web2 Registration
     */
    async register(data) {
        const { name, email, password, role, skills, githubUrl, linkedin } = data;

        const existing = await this.repository.findByEmail(email);
        if (existing) throw new ConflictError("User already exists with this email");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await this.repository.create({
            name,
            email,
            password: hashedPassword,
            role: role || "DEVELOPER",
            skills: skills || [],
            githubUrl,
            linkedin,
        });

        return {
            token: this.generateToken(user._id),
            user: this.sanitizeUser(user),
        };
    }

    /**
     * Web2 Login
     */
    async login(email, password) {
        const user = await this.repository.findByEmail(email, true);
        if (!user || !user.password) throw new UnauthorizedError("Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedError("Invalid credentials");

        return {
            token: this.generateToken(user._id),
            user: this.sanitizeUser(user),
        };
    }

    /**
     * Web3 Login / Register
     */
    async loginWithWeb3(walletAddress, signature, message) {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new UnauthorizedError("Invalid signature");
        }

        let user = await this.repository.findByWallet(walletAddress);

        if (!user) {
            user = await this.repository.create({
                walletAddress: walletAddress.toLowerCase(),
                role: "DEVELOPER",
            });
        }

        return {
            token: this.generateToken(user._id),
            user: this.sanitizeUser(user),
        };
    }

    /**
     * Link Wallet to existing account
     */
    async linkWallet(userId, walletAddress, signature, message) {
        // Handle unlink
        if (!walletAddress) {
            return this.repository.updateById(userId, { $unset: { walletAddress: 1 } });
        }

        // Verify signature
        const recovered = ethers.verifyMessage(message, signature);
        if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
            throw new UnauthorizedError("Signature verification failed");
        }

        // Check if wallet taken
        const existing = await this.repository.findByWallet(walletAddress);
        if (existing && existing._id.toString() !== userId.toString()) {
            throw new ConflictError("This wallet is already linked to another account");
        }

        return this.repository.updateById(userId, { walletAddress: walletAddress.toLowerCase() });
    }

    /**
     * Admin Login
     */
    async adminLogin(email, password) {
        const user = await this.repository.findByEmail(email, true);
        if (!user || user.role !== "ADMIN" || !user.password) {
            throw new UnauthorizedError("Invalid admin credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedError("Invalid admin credentials");

        return {
            token: this.generateToken(user._id),
            user: this.sanitizeUser(user),
        };
    }

    /**
     * Update Profile
     */
    async updateProfile(userId, data) {
        const user = await this.repository.findById(userId);
        if (!user) throw new AppError("User not found", 404);

        if (data.name) user.name = data.name;
        if (data.email) user.email = data.email;
        if (data.avatar) user.avatar = data.avatar;
        if (data.skills) user.skills = data.skills;
        if (data.bio) user.bio = data.bio;
        if (data.fingerprint !== undefined) user.fingerprint = data.fingerprint;

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(data.password, salt);
        }

        const updatedUser = await user.save();
        return {
            user: this.sanitizeUser(updatedUser),
            token: this.generateToken(updatedUser._id),
        };
    }

    /**
     * Helper to remove sensitive fields
     */
    sanitizeUser(user) {
        const obj = user.toObject ? user.toObject() : user;
        delete obj.password;
        return {
            id: obj._id,
            name: obj.name,
            email: obj.email,
            role: obj.role,
            avatar: obj.avatar,
            walletAddress: obj.walletAddress,
            fingerprint: obj.fingerprint,
            kycStatus: obj.kycStatus,
            sbtTokenId: obj.sbtTokenId,
        };
    }
}

export default new AuthService(authRepository);
