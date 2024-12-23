import axios from "axios";
import CurrencyConvertorModel from "../model/CurrencyConvertor.model.js"; // Adjust the path based on your project structure
import cron from "node-cron"; // Ensure this is imported

// Replace this with your API key
const API_KEY = "d2abda1daa0d64fbcb41bc91";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

// Fetch exchange rates and update the database
export const updateExchangeRates = async () => {
  try {
    const res = await axios.get(API_URL);

    if (res.data && res.data.conversion_rates) {
      const { conversion_rates } = res.data;
      console.log(
        "conversion_rates",
        "INR",
        conversion_rates.INR,
        "PKR",
        conversion_rates.PKR,
        "EUR",
        conversion_rates.EUR
      );
      // Update rates for INR, PKR, and EUR
      await CurrencyConvertorModel.updateOne(
        { currency: "INR" },
        { $set: { rate: conversion_rates.INR } },
        { upsert: true }
      );
      await CurrencyConvertorModel.updateOne(
        { currency: "PKR" },
        { $set: { rate: conversion_rates.PKR } },
        { upsert: true }
      );
      await CurrencyConvertorModel.updateOne(
        { currency: "EUR" },
        { $set: { rate: conversion_rates.EUR } },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
  }
};
// Get the latest exchange rate from the database
export const getExchangeRate = async (req, res) => {
  try {
    const { currency } = req.params; // Get the currency from the request (e.g., INR, PKR, EUR)
    const rateData = await CurrencyConvertorModel.findOne({ currency });

    if (rateData) {
      return res.status(200).json({ rate: rateData.rate });
    } else {
      return res.status(404).json({ message: "Currency not found" });
    }
  } catch (error) {
    console.error("Error retrieving exchange rate:", error);
    res.status(500).json({ message: "Server error" });
  }
};

cron.schedule("0 */6 * * *", () => {
  console.log("Running cron job to update exchange rates...");
  updateExchangeRates();
});
