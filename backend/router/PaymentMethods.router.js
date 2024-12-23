import express from "express";
import {
  AllPaymentMethods,
  AllPaymentMethodsUser,
  updatePaymentMethod,
} from "../controller/PaymentMethods.controller.js";
import { addUPaisaAutoPayment } from "../paymentControllers/UpaisaAuto/UpaisAuto.controller.js";
import { addJazzCashAutoPayment } from "../paymentControllers/jazzcashAuto/jazzcashAuto.controller.js";
import { addEasyPesaAutoPayment } from "../paymentControllers/EasyPaisaAuto/EasypaisAuto.controller.js";
import requireAuth from "../middleware/requireAuth.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = new express.Router();

// GET endpoint to fetch all payment methods admin
router.get("/getAll", requireAuth, AllPaymentMethods);
// GET endpoint to fetch all payment methods user
router.get("/AllPaymentMethodsUser", requireAuth, AllPaymentMethodsUser);

// PUT endpoint to update a specific payment method by its ID
router.put("/update/:methodId", requireAdmin, updatePaymentMethod);

// payment jazzcash easy paisa upaisa and all methods
router.post("/UPaisaAutoPayment", requireAuth, addUPaisaAutoPayment);
router.post("/JazzCashAutoPayement", requireAuth, addJazzCashAutoPayment);
router.post("/EasyPaisaAutoPayement", requireAuth, addEasyPesaAutoPayment);

export default router;
