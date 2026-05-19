import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Structured logger (Pino).
 * - Dev: pretty-printed coloured output via pino-pretty.
 * - Prod: JSON lines (compatible with Datadog, Render, etc.).
 */
const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    ...(isDev && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
            },
        },
    }),
});

export default logger;
