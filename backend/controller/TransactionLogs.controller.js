import mongoose from "mongoose";
import CurrencyConvertorModel from "../model/CurrencyConvertor.model.js";
import transactionModel from "../model/TransactionLogs.model.js";
import UserModel from "../model/User.model.js";

export const sendAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.find().sort({ createdAt: -1 }); // Use TransactionModel here
    if (transactions.length > 0) {
      res.status(200).json(transactions);
    } else {
      res.status(404).json({ message: "No transactions found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch all transactions", error });
  }
};

// send transactions by id
export const sendTransactionsByUserID = async (req, res) => {
  try {
    const { userName } = req.params; // Get user ID from params

    // Fetch transactions related to the user, ensure user is ObjectId
    const transactions = await transactionModel
      .find({
        userName,
      })
      .sort({ createdAt: -1 });

    if (transactions.length > 0) {
      res.status(200).json(transactions); // Return transactions if found
    } else {
      res
        .status(404)
        .json({ message: "No transactions found related to the user" });
    }
  } catch (error) {
    console.error("Error in fetching transactions:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user's transactions", error });
  }
};
// Controller Function
export const approveTransaction = async (req, res) => {
  try {
    const { _id } = req.params; // Get transaction ID from params

    // Find and update transaction status to "success"
    const transaction = await transactionModel.findByIdAndUpdate(
      _id,
      { $set: { status: "success" } },
      { new: true }
    );

    // If transaction is not found, return 404
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Retrieve transaction currency
    const transactionCurrency = transaction.currency;

    // Fetch the conversion rate for this currency to USD
    const conversionData = await CurrencyConvertorModel.findOne({
      currency: transactionCurrency,
    });

    if (!conversionData || !conversionData.rate) {
      return res.status(500).json({
        message: `Conversion rate for ${transactionCurrency} not found`,
      });
    }

    const conversionRateToUSD = conversionData.rate;

    // Convert transaction amount to USD
    const amountInUSD = transaction.amount / conversionRateToUSD;

    // Find the user associated with the transaction
    const user = await UserModel.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's balance by adding the converted amount in USD
    const updatedBalance = user.balance + amountInUSD;

    await UserModel.findByIdAndUpdate(
      user._id,
      { $set: { balance: updatedBalance } },
      { new: true }
    );

    res.status(200).json({ message: "Payment Approved" });
    console.log("Transaction approved successfully.");
  } catch (error) {
    console.error("Error in approving transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectTransaction = async (req, res) => {
  try {
    const { _id } = req.params; // Get transaction ID from params

    // Find and update transaction status to "success"
    const transaction = await transactionModel.findByIdAndUpdate(
      _id,
      { $set: { status: "rejected" } },
      { new: true }
    );

    // If transaction is not found, return 404
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Payment Rejected" });
  } catch (error) {
    console.error("Error in Rejecting transaction:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
