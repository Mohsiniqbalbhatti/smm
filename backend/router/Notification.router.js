import express from "express";

import {
  addNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "../controller/Notification.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = new express.Router();

router.post("/", requireAdmin, addNotification);
router.get("/", getNotifications);
router.put("/:notificationId", requireAdmin, updateNotification);
router.delete("/:notificationId", requireAdmin, deleteNotification);

export default router;
