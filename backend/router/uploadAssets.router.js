import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; // Import fs module to check and create directories
import {
  uploadLogo,
  uploadFavicon,
} from "../controller/uploadAssets.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();
router.use(requireAdmin);
// Check if 'uploads' folder exists, if not create it
const __dirname = path.resolve(); // For ES modules

const checkAndCreateUploadsFolder = () => {
  const uploadsPath = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath); // Create the folder if it doesn't exist
  }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    checkAndCreateUploadsFolder(); // Ensure uploads folder exists before saving file
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
router.post("/update-favicon", upload.single("favicon"), uploadFavicon);

export default router;
