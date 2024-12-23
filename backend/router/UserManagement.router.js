import express from "express";

import requireAuth from "../middleware/requireAuth.js";
import {
  deleteUser,
  editUser,
  sendMail,
} from "../controller/UserManagement.controller.js";

const router = new express.Router();

// Authentication Routes
router.put("/editUser/:id", editUser);
router.delete("/deleteUser/:id", requireAuth, deleteUser);
router.post("/sendMail/:id", requireAuth, sendMail);

export default router;
