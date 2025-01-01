import express from "express";
import multer from "multer";
import path from "path"; // Add this import statement
import {
  uploadLogo,
  uploadFavicon,
} from "../controller/uploadAssets.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary storage for uploaded files
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname); // Use path.extname after importing path
    cb(null, `${file.fieldname}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});

// Route to update logo
router.post("/update-logo", upload.single("logo"), uploadLogo);

// Route to update favicon
router.post(
  "/update-favicon",

  upload.single("favicon"),
  uploadFavicon
);

export default router;
