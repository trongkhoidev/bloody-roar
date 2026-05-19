import mongoose from "mongoose";
import logger from "../../shared/logger/logger.js";

const MAX_RETRY = 3;
const RETRY_DELAY_MS = 3000;

/**
 * Connect to MongoDB with retry logic.
 * Exported so app.js can await it before starting background jobs.
 */
export async function connectDB(attempt = 1) {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI is not set in environment variables");

        await mongoose.connect(uri);
        logger.info("✅ MongoDB connected");
    } catch (err) {
        logger.error({ err, attempt }, "MongoDB connection failed");

        if (attempt < MAX_RETRY) {
            logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            return connectDB(attempt + 1);
        }

        logger.fatal("Could not connect to MongoDB after max retries. Exiting.");
        process.exit(1);
    }
}

export default connectDB;
