import express from "express";
import signUp from "../controller/SignUp.controller.js";
import { Login, AdminLogin } from "../controller/Login.controller.js";
import {
  userBalance,
  userApiKey,
  newApiKey,
  changeEmail,
  ChangePassword,
  resetPassword,
} from "../controller/User.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = new express.Router();

// Authentication Routes
router.post("/signup", signUp);
router.post("/login", Login);
router.post("/admin/login", AdminLogin);

// User Information Routes
router.get("/balance/:userName", requireAuth, userBalance);
router.get("/apiKey/:userName", requireAuth, userApiKey);

// API Key Management
router.put("/newApiKey/:userName", requireAuth, newApiKey);

// Account Management
router.put("/changeEmail", requireAuth, changeEmail);
router.put("/ChangePassword", requireAuth, ChangePassword);

router.post("/resetPassword", resetPassword);

export default router;
