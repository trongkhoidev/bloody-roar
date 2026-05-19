#!/usr/bin/env node
// scripts/seedAdmin.js — Creates the initial admin user in the database
// Run: node scripts/seedAdmin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Inline user schema to avoid model conflicts
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    name: { type: String, default: "Admin" },
    role: { type: String, enum: ["CLIENT", "DEVELOPER", "BOTH", "ADMIN"], default: "DEVELOPER" },
    walletAddress: { type: String, unique: true, sparse: true, lowercase: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    reputation: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    jobsApplied: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = process.env.ADMIN_EMAIL || "admin@bloodyroar.io";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`⚠️  Admin user already exists: ${adminEmail}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Upgrade to ADMIN role if needed
            if (existingAdmin.role !== "ADMIN") {
                await User.findByIdAndUpdate(existingAdmin._id, { role: "ADMIN" });
                console.log("✅  Upgraded to ADMIN role.");
            }

            await mongoose.disconnect();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const admin = await User.create({
            email: adminEmail,
            password: hashedPassword,
            name: "Platform Admin",
            role: "ADMIN",
        });

        console.log("✅ Admin user created successfully!");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   Role: ${admin.role}`);
        console.log("\n⚠️  Remember to change the password in .env after first login!");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Seed failed:", error.message);
        process.exit(1);
    }
};

seedAdmin();
