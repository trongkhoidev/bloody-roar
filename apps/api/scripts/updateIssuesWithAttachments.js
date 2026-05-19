// scripts/updateIssuesWithAttachments.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    attachments: [{ type: String }],
}, { timestamps: true });

const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);

const updateData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bloody-roar";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // 1. Update WebGPU issue
        const webgpuIssue = await Issue.findOne({ title: /WebGPU memory segment allocation/i });
        if (webgpuIssue) {
            webgpuIssue.attachments = ["/uploads/webgpu_oom_error.png"];
            await webgpuIssue.save();
            console.log("✅ Updated WebGPU OOM issue with screenshot attachment!");
        } else {
            console.log("❌ WebGPU OOM issue not found");
        }

        // 2. Update SQLite issue
        const sqliteIssue = await Issue.findOne({ title: /SQLite transaction write locks/i });
        if (sqliteIssue) {
            sqliteIssue.attachments = ["/uploads/sqlite_write_lock.png"];
            await sqliteIssue.save();
            console.log("✅ Updated SQLite transaction lock issue with screenshot attachment!");
        } else {
            console.log("❌ SQLite transaction lock issue not found");
        }

        // 3. Update AudioWorklet issue
        const audioIssue = await Issue.findOne({ title: /audio playback buffer underruns/i });
        if (audioIssue) {
            audioIssue.attachments = ["/uploads/wasm_buffer_underrun.png"];
            await audioIssue.save();
            console.log("✅ Updated AudioWorklet issue with wasm screenshot attachment!");
        } else {
            console.log("❌ AudioWorklet issue not found");
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (e) {
        console.error("Failed to update issues:", e);
    }
};

updateData();
