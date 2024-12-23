import UserModel from "../model/User.model.js";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const userBalance = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User balance", balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};

export const userApiKey = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};
export const newApiKey = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newAPi = crypto.randomBytes(16).toString("hex");

    user.apiKey = newAPi;
    await user.save();
    res.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};
export const changeEmail = async (req, res) => {
  try {
    const { userName, email, newEmail, password } = req.body;
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.email !== email) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.email = newEmail;
    await user.save();

    res.json({ message: "Email Changed", email: email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};
export const ChangePassword = async (req, res) => {
  try {
    const { userName, password, newPassword } = req.body;
    const user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};

// sending all user
export const allUser = async (req, res) => {
  try {
    // Fetch users from the database, excluding specific fields
    const users = await UserModel.find().select(
      "-orderHistory -updatedAt -password -apiKey"
    ); // Replace "password" and "money" with fields you want to exclude

    res.json(users); // Send filtered users data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};

export const generateRecoveryLink = async (email) => {
  try {
    const user = await UserModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    // Generate recovery token
    const token = jwt.sign(
      { userId: user._id }, // payload
      process.env.JWT_SECRET, // your secret key for signing the token
      { expiresIn: "1h" } // token expiration time
    );

    // Generate the recovery link

    const recoveryLink = `${process.env.FRONTEND_URL}/reset-password/?token=${token}`; // Replace with your actual frontend URL

    // Return the recovery link
    return { status: 200, recoveryLink };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Server error", error: error.message };
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Step 1: Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 2: Check if the token is valid (i.e., it has expired)
    if (!decoded || !decoded.userId) {
      return res
        .status(400)
        .json({ message: "Recovery Link invalid or expired" });
    }

    // Step 3: Find the user in the database using the userId from the decoded token
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 4: Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Step 5: Save the new password to the user
    user.password = hashedPassword;
    await user.save();

    // Step 6: Respond with success
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    // Handle any errors (invalid token, expired token, etc.)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
