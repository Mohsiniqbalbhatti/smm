// routers/authRoutes.js

import express from "express";
import {
  googleLogin,
  googleCallback,
  googleRedirect,
  handleGoogleLogin, // You need to implement this function
} from "../controller/authGoogle.controller.js"; // Ensure the correct path to the controller

const router = express.Router();

// GET route to initiate Google login
router.get("/auth/google", googleLogin);

// GET route to handle Google callback
router.get("/auth/google/callback", googleCallback, googleRedirect);

// POST route to handle Google login after receiving user data
router.post("/auth/google", handleGoogleLogin); // Add this line

export default router;
