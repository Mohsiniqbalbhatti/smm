import express from "express";
import {
  updateExchangeRates,
  getExchangeRate,
} from "../controller/CurrencyConvertor.controller.js";

const router = express.Router();

// Route to update exchange rates manually (or via a cron job)
router.get("/update", (req, res) => {
  updateExchangeRates();
  res
    .status(200)
    .json({ message: "Updating exchange rates in the background" });
});

// Route to get exchange rate for a specific currency
router.get("/:currency", getExchangeRate);

export default router;
