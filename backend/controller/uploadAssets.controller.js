import path from "path";
import fs from "fs";

const __dirname = path.resolve(); // To get the current directory

// Controller to handle logo upload
export const uploadLogo = (req, res) => {
  console.log("Uploading");
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file uploaded." });
    }

    const targetPath = path.join(__dirname, "dist/assets/logo-DRmXP4pW.png"); // Adjust path as needed
    fs.renameSync(req.file.path, targetPath);

    res.status(200).json({ message: "Logo updated successfully!" });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({ message: "Failed to update logo." });
  }
};

// Controller to handle favicon upload
export const uploadFavicon = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No favicon file uploaded." });
    }

    const targetPath = path.join(__dirname, "dist/assets/favicon.ico"); // Adjust path as needed
    fs.renameSync(req.file.path, targetPath);

    res.status(200).json({ message: "Favicon updated successfully!" });
  } catch (error) {
    console.error("Error uploading favicon:", error);
    res.status(500).json({ message: "Failed to update favicon." });
  }
};
