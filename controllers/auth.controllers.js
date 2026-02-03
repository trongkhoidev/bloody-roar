import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";
import crypto from "crypto"; 

import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser){
            const error = new Error('user already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser= await User.create([{
            name,
            email,
            password: hashedPassword
        }], { session });

        const token = jwt.sign({userId: newUser[0]._id.toString()}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: newUser[0],
                token
            }
        });

        const walletSalt = process.env.WALLET_SALT || "your-default-salt";
        const walletSeed = crypto
            .createHash("sha256")
            .update(email + walletSalt)
            .digest("hex");
        const privateKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(walletSeed));

        // create wallet
        const wallet = new ethers.Wallet(privateKey);

        if(!user.walletAddress) {
        user.walletAddress = wallet.address;
        await user.save();
        }

        console.log("Wallet address:", wallet.address);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({userId: user._id.toString()}, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                user,
                token
            }
        })
    } catch(error){
        next(error);
    }
}

export const signOut = async (req, res, next) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'User signed out successfully'
        })
    } catch(error){
        next(error);
    }
}
