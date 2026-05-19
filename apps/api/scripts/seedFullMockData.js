#!/usr/bin/env node
// scripts/seedFullMockData.js — Populates MongoDB with extremely professional, realistic data
// Run: node scripts/seedFullMockData.js

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

const User = mongoose.model("User", userSchema);
const Issue = mongoose.model("Issue", issueSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Application = mongoose.model("Application", applicationSchema);

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bloody-roar";
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB at", mongoUri);

        // 1. Clean existing collections except main admin if it exists
        console.log("🧹 Cleaning old data...");
        await Comment.deleteMany({});
        await Application.deleteMany({});
        await Issue.deleteMany({});
        await User.deleteMany({ role: { $ne: "ADMIN" } });

        // Password hash
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("password123", salt);

        // 2. Create Clients & Companies
        console.log("🏢 Creating Corporate Clients...");
        const clients = await User.create([
            {
                email: "dev@vercel.com",
                password: defaultPassword,
                name: "Vercel Labs",
                role: "CLIENT",
                walletAddress: "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Vercel",
                bio: "Creators of Next.js and frontend infrastructure platform. We post bounties to fix open source core library issues.",
                reputation: 920,
                jobsPosted: 8
            },
            {
                email: "engineering@supabase.io",
                password: defaultPassword,
                name: "Supabase Core",
                role: "CLIENT",
                walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Supabase",
                bio: "The Open Source Firebase Alternative. Seeking experts to address advanced PostgreSQL extension drivers and security filters.",
                reputation: 780,
                jobsPosted: 5
            },
            {
                email: "smartcontracts@ethereum.org",
                password: defaultPassword,
                name: "Ethereum Foundation",
                role: "CLIENT",
                walletAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ethereum",
                bio: "Supporting developers building the decentralized future. We sponsor critical auditing and gas optimization issues in Solidity.",
                reputation: 990,
                jobsPosted: 12
            },
            {
                email: "copilot-integrations@microsoft.com",
                password: defaultPassword,
                name: "Copilot Integration Devs",
                role: "CLIENT",
                walletAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
                avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Copilot",
                bio: "Fostering AI agent tooling. Sponsoring Web3 integrations and local LLM semantic router speed improvements.",
                reputation: 640,
                jobsPosted: 4
            }
        ]);

        // 3. Create Developer Specialists
        console.log("💻 Creating Developer Specialists...");
        const devs = await User.create([
            {
                email: "alex.rivera@gmail.com",
                password: defaultPassword,
                name: "Alex Rivera",
                role: "DEVELOPER",
                walletAddress: "0x15d34aafc54149605fe91792d47a30452366b5c7",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
                bio: "Senior React & React Native architect. Ex-Meta. Specialized in low-level rendering optimizations and component engineering.",
                skills: ["React", "React Native", "Next.js", "TypeScript", "Tailwind CSS"],
                reputation: 850,
                jobsApplied: 14,
                jobsCompleted: 9,
                totalEarnings: 4.85
            },
            {
                email: "elena.rostova@dev.io",
                password: defaultPassword,
                name: "Elena Rostova",
                role: "DEVELOPER",
                walletAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
                bio: "EVM Smart Contract security expert and assembly developer. Gas-golf champion and open-source protocol auditor.",
                skills: ["Solidity", "Vyper", "Hardhat", "Ethers.js", "Web3.js", "DeFi"],
                reputation: 980,
                jobsApplied: 9,
                jobsCompleted: 7,
                totalEarnings: 12.35
            },
            {
                email: "kaito.sato@code.net",
                password: defaultPassword,
                name: "Kaito Sato",
                role: "DEVELOPER",
                walletAddress: "0x250627d312e75294a2b97c02b2a6121a99bc3230",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaito",
                bio: "AI Systems engineer. Specializes in custom local embeddings pipelines, ONNX optimization, and agent orchestration.",
                skills: ["Python", "PyTorch", "ONNX", "FastAPI", "VectorDB", "LangChain"],
                reputation: 710,
                jobsApplied: 11,
                jobsCompleted: 6,
                totalEarnings: 3.10
            },
            {
                email: "sarah.jenkins@web.com",
                password: defaultPassword,
                name: "Sarah Jenkins",
                role: "DEVELOPER",
                walletAddress: "0x976ea74026e726554db657fa54763abd0c3a0aa9",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                bio: "Full Stack NodeJS and mobile game performance specialist. Native Android module integrator.",
                skills: ["NodeJS", "Express", "Android Studio", "Kotlin", "C++", "Cocos2d"],
                reputation: 690,
                jobsApplied: 8,
                jobsCompleted: 4,
                totalEarnings: 2.40
            }
        ]);

        // 4. Create Detailed, Professional Bounties
        console.log("🔥 Generating Technical Bounties...");
        const issuesData = [
            // WEB Bounties
            {
                clientId: clients[0]._id, // Vercel
                title: "Fix Next.js 15 Streaming Component Hydration mismatch with CSS-in-JS variables",
                description: `We are experiencing severe hydration mismatch issues under Next.js 15 App Router when streaming nested async layouts with custom dynamic CSS-in-JS tokens. 

### Reproduction Steps:
1. Enable experimental.serverActions and streaming.
2. Render a deep layout chain where dynamic styled-components variables are updated inside client components.
3. Observe raw unstyled DOM flashes followed by the Hydration Error: "Text content did not match server-rendered HTML".

### Expected Output:
Dynamic variables must be injected into the static style sheet head before hydration. We need a robust custom transformer hook or a safe compiler resolver that intercepts styled injections on streamed chunks without stalling the stream itself.`,
                category: "web",
                bounty: { amount: 0.95, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/vercel/next.js",
                status: "OPEN"
            },
            {
                clientId: clients[1]._id, // Supabase
                title: "Optimize realtime WebSocket message serialization bottleneck in high throughput channels",
                description: `Our current NodeJS websocket listener stalls when processing more than 15,000 active concurrent channel subscriptions. The CPU profiler points directly to our JSON serialization loop.

### Profiler Data:
- JSON.stringify() is occupying 74.3% of the execution stack.
- Garbage collector sweeps are triggered every 1.2s due to high heap allocation of temporary buffer strings.

### Goal:
Rewrite the realtime protocol pipeline to utilize Protocol Buffers (protobuf) or raw binary buffers with minimal allocations. Propose a drop-in replacement that compiles directly on Node/V8 and is fully backwards-compatible with our existing JS client.`,
                category: "web",
                bounty: { amount: 1.45, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/supabase/realtime",
                status: "OPEN"
            },

            // BLOCKCHAIN Bounties
            {
                clientId: clients[2]._id, // Ethereum Fdn
                title: "Optimize Gas consumption in Multi-Sig Dual-Deposit Escrow Contract",
                description: `We are preparing our dual-deposit escrow smart contract for a wide roll-out, but gas fees for depositFunds and releaseFunds operations are running high (~154,200 gas per claim).

### Target Gas Budget:
- depositFunds: < 80,000 gas
- releaseFunds: < 65,000 gas

### Directions:
1. Refactor internal memory layouts. Combine multiple boolean mappings into dynamic bitmasks.
2. Optimize storage slot allocation (Warm vs Cold slots).
3. Implement custom assembly (Yul) shortcuts for high-frequency address verifications.
4. Deliver high-coverage gas reports using Hardhat Gas Reporter.`,
                category: "blockchain",
                bounty: { amount: 2.85, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/ethereum/escrow-vault",
                status: "OPEN"
            },
            {
                clientId: clients[2]._id, // Ethereum Fdn
                title: "Implement ERC-4337 UserOperation validation logic in local signature aggregator",
                description: `We need a production-grade signature aggregator that conforms to the ERC-4337 Account Abstraction specification. 

The scope includes constructing a Solidity contract to validate aggregate signatures (BLS and ECDSA) and a lightweight TypeScript helper to format UserOperations. Gas usage and cryptographic security are paramount. Must include unit tests verifying aggregate invalidation states.`,
                category: "blockchain",
                bounty: { amount: 1.80, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/eth-aa/account-abstraction",
                status: "OPEN"
            },

            // AI Bounties
            {
                clientId: clients[3]._id, // Copilot
                title: "Resolve memory leaks in local LLM dynamic sliding-window attention context manager",
                description: `When running a local llama.cpp wrapper inside our Python runtime, memory grows unbounded during extended multi-turn conversations.

### Diagnostic Notes:
- Standard sliding-window memory management leaves abandoned context tokens in C++ memory spaces.
- The leak is exactly proportional to the number of discarded system prompts.

### Requirements:
1. Implement clean garbage collection hooks in Python utilizing ctypes.
2. Ensure sliding-window attention tokens are explicitly cleared from VRAM during context shifts.
3. Provide a test suite running 100 turns in mock context, asserting memory remains constant.`,
                category: "ai",
                bounty: { amount: 2.10, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/copilot-ai/local-agent",
                status: "OPEN"
            },
            {
                clientId: clients[3]._id, // Copilot
                title: "Optimize semantic vector cache lookup speed using specialized SIMD operations",
                description: `Our python-based vector distance checker is too slow when doing k-nearest-neighbor searches across 100,000 local embedding documents, leading to high latency in dynamic agent generation.

We need a clean C++ optimization module with SIMD support (AVX2/NEON) that can be imported directly into Python using Pybind11. Must run cos_sim vector comparisons in under 0.05ms per query.`,
                category: "ai",
                bounty: { amount: 1.65, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/copilot-ai/vector-cache",
                status: "OPEN"
            },

            // MOBILE Bounties
            {
                clientId: clients[0]._id, // Vercel
                title: "Fix layout stuttering and micro-stalls in React Native Reanimated v3 list components",
                description: `Under heavy device workloads, list item dynamic expansion in our React Native Reanimated lists shows micro-stalls (stutters below 45 FPS) on mid-tier Android devices.

The root cause resides in rendering lifecycle thread contention between the JS engine thread and the native UI main thread during fast scrolling. We need a clean refactor that offloads expansion calculations completely to UI Worklets without triggering state changes on the JS thread.`,
                category: "mobile",
                bounty: { amount: 0.75, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/vercel/mobile-next",
                status: "OPEN"
            },

            // GAME Bounties
            {
                clientId: clients[1]._id, // Supabase
                title: "Resolve WebSocket lag spikes in Unity multiplayer state sync connector",
                description: `Our real-time Unity gaming connector experiences massive TCP buffer accumulation and subsequent packet drop spikes under active multiplayer lobby interactions.

We need a dedicated, thread-safe message batching manager in C# that aggregates position and weapon vector inputs on the game loop, sending them in single consolidated socket payloads to the Supabase client without blocking the main rendering thread.`,
                category: "game",
                bounty: { amount: 1.25, currency: "ETH", isEscrowed: true },
                githubRepoUrl: "https://github.com/supabase/unity-connector",
                status: "OPEN"
            }
        ];

        const issues = await Issue.create(issuesData);
        console.log(`✅ ${issues.length} technical bounties created successfully!`);

        // 5. Create Applications Cover Letters
        console.log("📝 Generating Developer Applications...");
        await Application.create([
            {
                issue: issues[0]._id, // Next.js Hydration
                developer: devs[0]._id, // Alex Rivera
                coverLetter: `Hi Vercel team, I've spent the past 3 years optimizing server component rendering cycles at Meta. 

I am intimately familiar with hydration lifecycles in React 18 & 19. The issue here lies in the streaming chunk loader ignoring styled insertions during dynamic segment delivery. I have a working prototype that injects dynamic tokens directly into the styled sheet head on layout completion. I can deploy this to your codebase and write comprehensive verification tests within 3 days.`,
                bidAmount: 0.95,
                status: "PENDING"
            },
            {
                issue: issues[2]._id, // Gas Optimization
                developer: devs[1]._id, // Elena Rostova
                coverLetter: `Hello EF engineering. I am a professional EVM contract auditor and gas golfer. 

I've audited over 30 decentralized exchange protocols. For this dual-deposit contract, I see high-leverage opportunities to replace structural boolean arrays with a single uint256 bitfield, saving up to 45,000 gas on initialization. I will write the contract using custom inline Yul instructions for warm/cold balance checking. I look forward to working on this!`,
                bidAmount: 2.80,
                status: "PENDING"
            },
            {
                issue: issues[4]._id, // LLM Memory Leak
                developer: devs[2]._id, // Kaito Sato
                coverLetter: `Hi Copilot team. I'm Kaito, an AI engineer. 

I ran into this exact context token leak when working on llama.cpp dynamic sliding-window attention wrappers last year. The issue is llama.cpp holds reference counts on discarded prompt tokens in native memory which Python GC fails to reach. I will write a custom ctypes wrapper that explicitly triggers token buffer deletion when prompt windows slide. I can have this ready and tested in 48 hours.`,
                bidAmount: 2.10,
                status: "PENDING"
            },
            {
                issue: issues[6]._id, // Reanimated Layout Stutter
                developer: devs[0]._id, // Alex Rivera
                coverLetter: `Hi Vercel, Alex here. 

Reanimated v3 stutters usually occur when worklet variables are shared back to React components, triggering redundant JS engine render cycles. I will refactor your item expansion logic to rely entirely on Reanimated SharedValues and Native Worklets, ensuring the JS thread remains at 0% workload during list scroll transitions. FPS will remain locked at 60fps.`,
                bidAmount: 0.75,
                status: "PENDING"
            }
        ]);
        console.log("✅ Developer applications seeded!");

        // 6. Create Discussion Comments Threads (High Engagement)
        console.log("💬 Creating Discussion Thread Discussions...");
        const commentsData = [
            // Thread on Next.js Hydration Mismatch
            {
                issueId: issues[0]._id,
                userId: devs[0]._id, // Alex Rivera
                content: "Is this dynamic CSS injection happening during server components streaming or on client-side routing transitions? The injection hook behaves differently in both environments."
            },
            {
                issueId: issues[0]._id,
                userId: clients[0]._id, // Vercel
                content: "Excellent question Alex. It happens primarily during initial server streaming. Client-side routing transitions seem to mount style blocks cleanly without hydration warnings."
            },
            {
                issueId: issues[0]._id,
                userId: devs[2]._id, // Kaito Sato
                content: "I agree with Alex. If it is server streaming, React 19's new useInsertionEffect or bootstrap script loader might be the right place to hook the stylesheet variables."
            },
            {
                issueId: issues[0]._id,
                userId: devs[0]._id, // Alex Rivera
                content: "Thanks for confirming! I am writing a wrapper around insertion buffers. I'll post a draft PR in a few hours."
            },

            // Thread on Gas Optimization
            {
                issueId: issues[2]._id,
                userId: devs[1]._id, // Elena Rostova
                content: "Have you guys considered converting the mapping(address => bool) into a custom bitmap? Packing values into slot structures will save massive storage costs."
            },
            {
                issueId: issues[2]._id,
                userId: devs[3]._id, // Sarah Jenkins
                content: "We should also look at replacing standard transfer calls with low-level CALL instructions to avoid excessive gas forwarding during escrow releases."
            },
            {
                issueId: issues[2]._id,
                userId: clients[2]._id, // Ethereum Fdn
                content: "Yes, converting map allocations to bitmaps is highly encouraged! For low-level CALLs, just make sure to add rigorous re-entrancy protection."
            },
            {
                issueId: issues[2]._id,
                userId: devs[1]._id, // Elena Rostova
                content: "Understood. I will write the bitmap resolver and bundle it with standard OpenZeppelin ReentrancyGuard structures."
            },

            // Thread on LLM Sliding Window Leak
            {
                issueId: issues[4]._id,
                userId: devs[2]._id, // Kaito Sato
                content: "Can you confirm the llama.cpp wrapper version you are using? Some older versions had an open bug relating to prompt context cache invalidation."
            },
            {
                issueId: issues[4]._id,
                userId: clients[3]._id, // Copilot
                content: "We are currently pinned to llama.cpp version b1890. We tried upgrading but encountered regressions in semantic prompt processing speeds."
            },
            {
                issueId: issues[4]._id,
                userId: devs[2]._id, // Kaito Sato
                content: "Okay, perfect. b1890 has the memory leak in context cache. I will patch the local C bindings directly so you don't need to upgrade."
            }
        ];

        // Seed comments sequentially to allow dynamic parent nesting if we want
        for (const comm of commentsData) {
            await Comment.create(comm);
        }
        console.log("✅ Discussion comments seeded successfully!");

        // 7. Update User counts to make it extremely realistic
        console.log("📈 Updating profile statistics...");
        // Alex stats
        await User.findByIdAndUpdate(devs[0]._id, {
            jobsApplied: 2,
            jobsCompleted: 9,
            reputation: 870,
            totalEarnings: 5.6
        });
        // Elena stats
        await User.findByIdAndUpdate(devs[1]._id, {
            jobsApplied: 1,
            jobsCompleted: 7,
            reputation: 995,
            totalEarnings: 15.2
        });
        // Vercel stats
        await User.findByIdAndUpdate(clients[0]._id, {
            jobsPosted: 2
        });

        console.log("\n⭐️ MOCK DATA SEED COMPLETED SUCCESSFULLY! ⭐️");
        console.log("🚀 Enjoy your fully populated, professional developer ecosystem!");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedData();
