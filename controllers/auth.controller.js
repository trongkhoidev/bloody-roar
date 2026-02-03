import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || "1d",
	});
};

// @desc    Register a new user (Web2)
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, role, skills, githubUrl, linkedin } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please provide name, email and password" });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "DEVELOPER",
            skills: skills || [],
            githubUrl,
            linkedin
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Login with Email/Password (Web2)
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Check user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Login/Register using Web3 Wallet (Signature Verification)
// @route   POST /api/auth/web3-login
export const loginWithWeb3 = async (req, res) => {
	try {
		const { walletAddress, signature, message } = req.body;

		if (!walletAddress || !signature || !message) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		// Verify Signer
		const recoveredAddress = ethers.verifyMessage(message, signature);

		if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
			return res.status(401).json({ message: "Invalid signature" });
		}

		// Check if user exists
		let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

		// If not, Register new user
		if (!user) {
			user = await User.create({
				walletAddress: walletAddress.toLowerCase(),
                role: "DEVELOPER" // Default role
			});
		}

		const token = generateToken(user._id);

		res.status(200).json({
			success: true,
			token,
			user: {
				id: user._id,
				walletAddress: user.walletAddress,
				role: user.role,
				name: user.name,
			},
		});
	} catch (error) {
		console.error("Web3 Auth Error:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

// @desc    Update User Profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            if (req.body.skills) user.skills = req.body.skills;
            if (req.body.bio) user.bio = req.body.bio;

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    avatar: updatedUser.avatar,
                    walletAddress: updatedUser.walletAddress,
                    token: generateToken(updatedUser._id),
                },
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
