#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }]
}, { timestamps: true });

const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);

const updateTags = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bloody-roar";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB at", mongoUri);

        const issues = await Issue.find({});
        console.log(`🔍 Found ${issues.length} issues in the database.`);

        for (const issue of issues) {
            const tagsSet = new Set(issue.tags || []);
            const categoryLower = (issue.category || "").toLowerCase();
            const titleLower = (issue.title || "").toLowerCase();

            // Dynamic logic based on category and title keywords
            if (categoryLower === "web") {
                tagsSet.add("React");
                tagsSet.add("TypeScript");
                if (titleLower.includes("node") || titleLower.includes("back") || titleLower.includes("express")) {
                    tagsSet.add("Node");
                }
            } else if (categoryLower === "blockchain") {
                tagsSet.add("Solidity");
                tagsSet.add("Rust");
                tagsSet.add("TypeScript");
            } else if (categoryLower === "ai") {
                tagsSet.add("Python");
                tagsSet.add("TypeScript");
            } else if (categoryLower === "mobile") {
                tagsSet.add("React");
                tagsSet.add("TypeScript");
            } else if (categoryLower === "game") {
                tagsSet.add("Rust");
                tagsSet.add("TypeScript");
            }

            // Fallback default tags
            if (tagsSet.size === 0) {
                tagsSet.add("TypeScript");
                tagsSet.add("React");
            }

            issue.tags = Array.from(tagsSet);
            await issue.save();
            console.log(`⚡️ Updated issue "${issue.title}" with tags: [${issue.tags.join(", ")}]`);
        }

        console.log("\n🎉 ALL ISSUES SUCCESSFULLY POPULATED WITH MODERN SKILL TAGS!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Update failed:", err);
        process.exit(1);
    }
};

updateTags();
