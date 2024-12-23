import express from "express";
import {
  editOrder,
  getOrderHistory,
  getOrderHistoryByUser,
} from "../controller/OrderHistory.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = new express.Router();

router.use(requireAuth);
router.get("/:userName", getOrderHistoryByUser);
export default router;
