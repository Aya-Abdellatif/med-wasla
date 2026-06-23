import multer from "multer";
import AppError from "../utils/AppError.js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Only JPEG, PNG, and WebP images are allowed", 400) as unknown as null, false);
    }
  },
});
