import { protect } from "./auth.middleware.js";

// Admin-only middleware — checks req.user.role from JWT (server-side safe)
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};

// Combined protect + isAdmin shortcut
export const adminProtect = [protect, isAdmin];
