#!/usr/bin/env node
// scripts/resetAdmin.js — Xóa hết admin users và tạo lại từ đầu
// Run: node scripts/resetAdmin.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

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

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = process.env.ADMIN_EMAIL || "admin@bloodyroar.io";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin";

        // Delete ALL existing ADMIN users (clean slate)
        const deleted = await User.deleteMany({ role: "ADMIN" });
        console.log(`🗑️  Deleted ${deleted.deletedCount} old admin user(s)`);

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create fresh admin
        const admin = await User.create({
            email: adminEmail,
            password: hashedPassword,
            name: "Platform Admin",
            role: "ADMIN",
        });

        console.log("\n✅ Admin user created successfully!");
        console.log(`   Email:    ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   ID:       ${admin._id}`);
        console.log(`   Role:     ${admin.role}`);
        console.log("\n🔐 Login at: http://localhost:5173/admin/login");

        await mongoose.disconnect();
        console.log("✅ Done.");
    } catch (error) {
        console.error("❌ Reset failed:", error.message);
        process.exit(1);
    }
};

resetAdmin();
