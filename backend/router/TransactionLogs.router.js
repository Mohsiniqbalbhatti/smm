import { Router } from "express";
import {
  approveTransaction,
  rejectTransaction, // Corrected typo here
  sendAllTransactions,
  sendTransactionsByUserID,
} from "../controller/TransactionLogs.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import requireAuth from "../middleware/requireAuth.js";
const router = new Router();

// get all transactions admin only
router.get("/admin/allTransactions", requireAdmin, sendAllTransactions);
router.get(
  "/UserTransactions/:userName",
  requireAuth,
  sendTransactionsByUserID
);

// approve transaction
router.put("/admin/approveTransaction/:_id", requireAdmin, approveTransaction); // Corrected typo here
router.put("/admin/rejectTransaction/:_id", requireAdmin, rejectTransaction); // Corrected typo here
export default router;
