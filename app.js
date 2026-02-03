import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import commentRoutes from "./routes/comment.routes.js";

import http from "http";
import { initializeSocket } from "./sockets/chat.socket.js";

// Initialize app
const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

// Connect Database
connectDB();

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

import uploadRoutes from "./routes/upload.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", commentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/workspace", workspaceRoutes);

// Serve Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base Route
app.get("/", (req, res) => {
    res.send("Welcome to Bloody Roar Platform API");
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;