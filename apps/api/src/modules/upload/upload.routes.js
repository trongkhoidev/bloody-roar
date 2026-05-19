import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../../shared/middleware/errorHandler.middleware.js";
import { ApiResponse } from "../../shared/response/ApiResponse.js";

const router = express.Router();
const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * @route POST /api/upload
 */
router.post(
    "/",
    upload.single("file"),
    asyncHandler(async (req, res) => {
        if (!req.file) throw new Error("No file uploaded");
        const filePath = `/${UPLOAD_DIR}/${req.file.filename}`;
        res.status(200).json(ApiResponse.ok({
            url: filePath,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
        }, "File uploaded successfully"));
    })
);

export default router;
