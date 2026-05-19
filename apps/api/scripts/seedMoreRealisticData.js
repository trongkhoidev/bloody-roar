#!/usr/bin/env node
// scripts/seedMoreRealisticData.js — Adds more extremely professional, realistic data without deleting existing ones
// Run: node scripts/seedMoreRealisticData.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Define inline schemas to avoid ES module import path resolutions
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    name: { type: String, default: "Anonymous User" },
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

const issueSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    bounty: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'ETH' },
        isEscrowed: { type: Boolean, default: false }
    },
    escrowTxHash: { type: String },
    attachments: [{ type: String }],
    tags: [{ type: String }],
    prLink: { type: String },
    isPrMerged: { type: Boolean, default: false },
    githubRepoUrl: { type: String, required: true },
    status: { type: String, default: 'OPEN' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    assignedDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isEdited: { type: Boolean, default: false }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: { type: String, required: true },
    bidAmount: { type: Number },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
}, { timestamps: true });

// Avoid duplicate schema compilation in Mongoose
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);
const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

const seedMoreData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bloody-roar";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB at", mongoUri);

        // Fetch password from existing users or create a secure hash
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("password123", salt);

        console.log("🏢 Checking/Creating new highly realistic companies...");
        const newClientsData = [
            {
                email: "huggingface@huggingface.co",
                password: defaultPassword,
                name: "Hugging Face OS",
                role: "CLIENT",
                walletAddress: "0x111111940e2eb28930efb4cef49b2d1f2c9c1111",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=HuggingFace",
                bio: "The platform where the machine learning community collaborates. We sponsor WebGPU model pipelines and modular local tokenizers.",
                reputation: 940,
                jobsPosted: 6
            },
            {
                email: "dev@linear.app",
                password: defaultPassword,
                name: "Linear App Core",
                role: "CLIENT",
                walletAddress: "0x222222940e2eb28930efb4cef49b2d1f2c9c2222",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Linear",
                bio: "The issue tracker you don't hate. Sponsoring high-performance SQLite client-side synchronization and keybinding managers.",
                reputation: 890,
                jobsPosted: 4
            },
            {
                email: "openai@openai.com",
                password: defaultPassword,
                name: "OpenAI Core Team",
                role: "CLIENT",
                walletAddress: "0x333333940e2eb28930efb4cef49b2d1f2c9c3333",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=OpenAICore",
                bio: "Pushing the boundaries of artificial intelligence. We sponsor tasks for runtime token compression and low-latency API wrappers.",
                reputation: 960,
                jobsPosted: 7
            }
        ];

        const clients = [];
        for (const data of newClientsData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
                console.log(`- Created company: ${user.name}`);
            } else {
                console.log(`- Existed company: ${user.name}`);
            }
            clients.push(user);
        }

        console.log("💻 Checking/Creating new highly realistic developers...");
        const newDevsData = [
            {
                email: "marcus.chen@ml.io",
                password: defaultPassword,
                name: "Marcus Chen",
                role: "DEVELOPER",
                walletAddress: "0x444444aafc54149605fe91792d47a30452366b444",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
                bio: "ML compiler engineer. Ex-Nvidia. Passionate about WebGPU dynamic quantization and custom tensor pipelines.",
                skills: ["WebGPU", "WGSL", "WebAssembly", "TypeScript", "C++"],
                reputation: 910,
                jobsApplied: 16,
                jobsCompleted: 11,
                totalEarnings: 8.5
            },
            {
                email: "sofia.bianchi@sync.net",
                password: defaultPassword,
                name: "Sofia Bianchi",
                role: "DEVELOPER",
                walletAddress: "0x55555570c51812dc3a010c7d01b50e0d17dc7555",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
                bio: "Full-stack core engineer. Specialized in SQLite offline-first sync engines and local browser storage caching.",
                skills: ["SQLite", "IndexedDB", "React", "TypeScript", "WebSockets"],
                reputation: 880,
                jobsApplied: 12,
                jobsCompleted: 8,
                totalEarnings: 4.9
            },
            {
                email: "yuki.tanaka@wasm.org",
                password: defaultPassword,
                name: "Yuki Tanaka",
                role: "DEVELOPER",
                walletAddress: "0x666666d312e75294a2b97c02b2a6121a99bc3666",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
                bio: "WebAssembly and low-level graphics programmer. Building the future of client-side web rendering and audio batch buffers.",
                skills: ["WebAssembly", "Rust", "C++", "WebGL", "AudioWorklet"],
                reputation: 920,
                jobsApplied: 15,
                jobsCompleted: 10,
                totalEarnings: 9.2
            }
        ];

        const devs = [];
        for (const data of newDevsData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
                console.log(`- Created developer: ${user.name}`);
            } else {
                console.log(`- Existed developer: ${user.name}`);
            }
            devs.push(user);
        }

        console.log("🔥 Generating New Highly Technical Bounties...");
        const newIssuesData = [
            {
                clientId: clients[0]._id, // Hugging Face OS
                title: "Implement optimized dynamic WebGPU memory segment allocation for local quantized LLMs",
                description: `We are rolling out 4-bit Llama local inference pipelines inside web browsers, but are running into severe performance degradation due to WebGPU dynamic memory buffer re-allocations on each token generation step.

### Detailed Context:
- Allocating fresh WebGPU storage buffers inside the render-loop causes browser-wide garbage collection pauses (~45ms).
- Discarding context segments causes graphics thread stutter.

### Requirements:
1. Implement a custom GPU-based buffer pooling allocator in WGSL / TypeScript.
2. Recycle pre-allocated storage slots by mapping model attention weights to static slot IDs.
3. Deliver a robust dynamic token chunk allocator that performs zero new allocations on the active inference rendering frame.`,
                category: "ai",
                tags: ["Python", "TypeScript"],
                bounty: { amount: 3.20, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/huggingface/webgpu-llama",
                status: "OPEN"
            },
            {
                clientId: clients[1]._id, // Linear App
                title: "Fix concurrent SQLite transaction write locks during offline-first dynamic synchronization",
                description: `Our offline-first dynamic client database synchronizer triggers write lock exceptions (SQLITE_BUSY: database is locked) when users apply keybindings fast while dynamic background synchronizations are active.

### Analysis of the Bug:
- The transaction coordinator spawns concurrently on IndexedDB WebWorkers.
- A write lock in worker-A stalls worker-B's state flush, triggering transaction rollback.

### Expected Deliverables:
1. Introduce a strict, thread-safe asynchronous transaction queue using a write-ahead logging (WAL) mechanism.
2. Implement transaction batching (minimum 50ms windows) to pack concurrent client actions into unified SQLite writes.
3. Write automated test scripts that simulate 500 concurrent UI edits during background sync, verifying zero write-lock occurrences.`,
                category: "web",
                tags: ["React", "TypeScript", "Node"],
                bounty: { amount: 1.85, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/linear/sqlite-sync",
                status: "OPEN"
            },
            {
                clientId: clients[2]._id, // OpenAI Core Team
                title: "Optimize semantic parser pipeline for dynamic nested JSON streaming under extreme throughput rates",
                description: `Our nested JSON stream parser experiences memory bottlenecks when handling extreme streaming throughput rates (over 250MB/s per node).

### CPU Profiles:
- Native String decoding and bracket balancing checks account for 68% of thread cycles.
- Dynamic nested memory arrays grow unbounded during recursive chunk processing.

### Proposed Target:
- Parse and yield fully formed nested objects in chunks, utilizing zero-copy string views.
- Implement a custom look-ahead parser using SIMD registers to bypass bracket detection loops in JS.
- Compile direct WebAssembly utilities for parsing to offload the main JS engine entirely.`,
                category: "ai",
                tags: ["Python", "TypeScript"],
                bounty: { amount: 2.40, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/openai/stream-parser",
                status: "OPEN"
            },
            {
                clientId: clients[0]._id, // Hugging Face OS
                title: "Fix audio playback buffer underruns in cross-platform AudioWorklet pipeline",
                description: `When running model-generated speech models in real-time inside the browser, the AudioWorklet system experiences severe buffer underruns and audio clicks on low-end mobile devices.

### Root Cause:
- Sample rate conversion from model outputs (24kHz) to system device layouts (48kHz) runs synchronously inside the audio thread.
- Thread contention during main-loop garbage collection starves the playback buffer.

### Expectations:
- Offload the resampler completely to a WebAssembly module running in a separate background Worker.
- Implement a thread-safe ring-buffer using SharedArrayBuffer for sample streaming to the audio thread.
- The AudioWorklet node must only read samples from the ring-buffer without doing any calculations.`,
                category: "game",
                tags: ["Rust", "TypeScript"],
                bounty: { amount: 1.50, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/huggingface/audio-worklet-wasm",
                status: "OPEN"
            }
        ];

        const issues = [];
        for (const data of newIssuesData) {
            let issue = await Issue.findOne({ title: data.title });
            if (!issue) {
                issue = await Issue.create(data);
                console.log(`- Created bounty: ${issue.title}`);
            } else {
                console.log(`- Existed bounty: ${issue.title}`);
            }
            issues.push(issue);
        }

        console.log("📝 Generating Highly Realistic Developer Applications...");
        const newApps = [
            {
                issue: issues[0]._id, // WebGPU LLM
                developer: devs[0]._id, // Marcus Chen
                coverLetter: `Hi Hugging Face team. I'm Marcus Chen, an ex-Nvidia compiler engineer.

I have built custom WGSL shader buffer pools for localized tensor compilers. Allocating WebGPU storage buffers on-the-fly inside the render loop is indeed a major latency bottleneck due to WebGPU's strict safety checks on creation. 

I will write a custom slot-caching allocator using static WGSL bindings that recycles pre-allocated memory chunks dynamically, eliminating browser garbage collection sweeps. I can complete this optimization and deliver a functional demo inside your workspace in 3 days.`,
                bidAmount: 3.20,
                status: "PENDING"
            },
            {
                issue: issues[1]._id, // SQLite Sync
                developer: devs[1]._id, // Sofia Bianchi
                coverLetter: `Hello Linear team. I'm Sofia, a core systems developer.

IndexedDB SQLite write locks usually occur because the database transaction fails to yield quick enough under single-thread event loops. 

I will implement a thread-safe asynchronous write-ahead log (WAL) queue that serializes and batches multiple local edits into consolidated transactions. I'll also add a lightweight scheduler to prevent lock contention between UI actions and background synchronization workers. I've designed similar sync architectures before and can deliver this stable and tested within 48 hours.`,
                bidAmount: 1.85,
                status: "PENDING"
            },
            {
                issue: issues[3]._id, // Audio Worklet
                developer: devs[2]._id, // Yuki Tanaka
                coverLetter: `Hi Hugging Face team, I am an expert WebAssembly graphics and audio programmer.

Resampling audio chunks inside the high-priority AudioWorklet thread is a strict anti-pattern, as any JS garbage collection stalls will immediately trigger buffer underruns (audible pops/clicks). 

I will write a dedicated C++ WebAssembly resampler that compiles with Emscripten, runs asynchronously in a secondary Worker, and streams processed audio samples to the main AudioWorklet using SharedArrayBuffer with atomic memory locks. This guarantees perfectly smooth 48kHz playback even under 100% CPU loads.`,
                bidAmount: 1.50,
                status: "PENDING"
            }
        ];

        for (const appData of newApps) {
            const existed = await Application.findOne({ issue: appData.issue, developer: appData.developer });
            if (!existed) {
                await Application.create(appData);
                console.log(`- Created application for: ${devs.find(d => d._id.equals(appData.developer)).name}`);
            }
        }

        console.log("💬 Seeding Vibrant, High-Engagement Back-and-Forth Discussions...");
        const commentsData = [
            // Conversation on WebGPU Memory Allocation
            {
                issueId: issues[0]._id,
                userId: devs[2]._id, // Yuki Tanaka
                content: "Should we construct specialized WGSL shader bindings directly or compile models to WebAssembly pipelines? WebGPU standard buffers can be rigid for dynamic weights."
            },
            {
                issueId: issues[0]._id,
                userId: clients[0]._id, // Hugging Face OS
                content: "We strongly recommend writing custom WGSL bindings for the memory pool, Yuki. Performance is our highest priority here for 4-bit Llama quantizations, and WASM pipelines carry too much marshalling overhead."
            },
            {
                issueId: issues[0]._id,
                userId: devs[0]._id, // Marcus Chen
                content: "I completely agree with the Hugging Face team. Standard memory mapping has heavy binding validation. I can build a static buffer pool using dynamic slot IDs and cache hot layers directly on the GPU context. This avoids re-creating buffers completely during the active token generation loop."
            },
            {
                issueId: issues[0]._id,
                userId: clients[0]._id, // Hugging Face OS
                content: "That sounds precisely like what we need, Marcus! Caching hot layers directly on the GPU context would drastically reduce VRAM transfers. We've escrowed the 3.20 ETH bounty. Excited to see your implementation."
            },
            {
                issueId: issues[0]._id,
                userId: devs[2]._id, // Yuki Tanaka
                content: "Excellent points Marcus! If you handle the slot allocations, I can help check for potential race conditions when synchronizing frame steps on high-frequency device transitions."
            },

            // Conversation on SQLite Sync Locks
            {
                issueId: issues[1]._id,
                userId: devs[1]._id, // Sofia Bianchi
                content: "Are you running the IndexedDB SQLite instance in WAL (Write-Ahead Logging) mode, or is it utilizing standard rollback journal mappings? Standard rollback blocks all readers during a write."
            },
            {
                issueId: issues[1]._id,
                userId: clients[1]._id, // Linear App Core
                content: "Hi Sofia! We currently use standard rollback journal mappings inside our worker thread because WAL support had minor compatibility issues with older iOS Safari browsers. However, we're ready to transition to a WAL-compatible wrapper if it resolves the synchronization locks safely."
            },
            {
                issueId: issues[1]._id,
                userId: devs[1]._id, // Sofia Bianchi
                content: "Understood. The WAL mode is fully stable on modern browsers now. I will build an async transaction coordinator that dynamically queues concurrent writes during active sync windows, so Safari or Chrome will never throw SQLITE_BUSY exceptions."
            },
            {
                issueId: issues[1]._id,
                userId: clients[1]._id, // Linear App Core
                content: "That sounds fantastic, Sofia! That async transaction queue would definitely solve the conflict. Please proceed, the bounty is fully locked in escrow."
            },

            // Conversation on Audio Playback Buffer Underruns
            {
                issueId: issues[3]._id,
                userId: devs[2]._id, // Yuki Tanaka
                content: "Is the AudioWorklet node using a dynamic double-buffering queue currently, or is it directly calling the resampler? Also, what are the target buffer sizes?"
            },
            {
                issueId: issues[3]._id,
                userId: clients[0]._id, // Hugging Face OS
                content: "We are currently using direct synchronous resampling on the audio thread with a 512-frame buffer. This works on modern desktops but falls apart on mobile Safari when background GC kicks in."
            },
            {
                issueId: issues[3]._id,
                userId: devs[2]._id, // Yuki Tanaka
                content: "Yes, a 512-frame window on the audio thread is extremely prone to GC pauses. I will refactor the system to use a SharedArrayBuffer-backed ring-buffer with a 2048-frame look-ahead queue processed in a background WebWorker. This guarantees perfectly smooth playback under CPU stress."
            },
            {
                issueId: issues[3]._id,
                userId: clients[0]._id, // Hugging Face OS
                content: "Brilliant, Yuki! SharedArrayBuffer with a look-ahead ring-buffer is definitely the way to go. Looking forward to reviewing the PR."
            }
        ];

        console.log("- Seeding discussion comments...");
        for (const comm of commentsData) {
            const existed = await Comment.findOne({ issueId: comm.issueId, userId: comm.userId, content: comm.content });
            if (!existed) {
                await Comment.create(comm);
            }
        }

        console.log("\n⭐️ DYNAMIC MOCK DATA EXTENSION SEED COMPLETED SUCCESSFULLY! ⭐️");
        console.log("🚀 Old posts were NOT touched. Added new highly realistic developers, companies, posts, and deep chats!");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedMoreData();
