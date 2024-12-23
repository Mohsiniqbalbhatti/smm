import UserModel from "../model/User.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for empty fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      // Use a generic error message to avoid leaking information
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token with minimal necessary information
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response with token
    res.json({
      message: "Logged in successfully",
      token,
      user: {
        fullname: user.fullname,
        userName: user.userName,
        email: user.email,
        balance: user.balance,
        role: user.role,
        spent: user.spent,
        referral_id: user.referral_id,
        affiliate_bal_transferred: user.affiliate_bal_transferred,
        affiliate_bal_available: user.affiliate_bal_available,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    // console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};
export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for empty fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      // Use a generic error message to avoid leaking information
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res.status(401).json({ message: "Access Denied !" });
    }

    // Generate JWT token with minimal necessary information
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send response with token
    res.json({
      message: "Logged in successfully",
      token,
      user: {
        fullname: user.fullname,
        userName: user.userName,
        email: user.email,
        balance: user.balance,
        role: user.role,
        spent: user.spent,
        referral_id: user.referral_id,
        affiliate_bal_transferred: user.affiliate_bal_transferred,
        affiliate_bal_available: user.affiliate_bal_available,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    // console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};
