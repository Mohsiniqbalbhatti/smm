import passport from "passport";
import UserModel from "../model/User.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// Google login authentication setup
export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Callback after Google login
export const googleCallback = passport.authenticate("google", {
  failureRedirect: "/login",
  session: false,
});

// Handle Google login redirection
export const googleRedirect = async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ googleId: req.user.id });

    if (!existingUser) {
      // Create a new user with Google profile info if none exists
      const newUser = new UserModel({
        googleId: req.user.id,
        fullName: req.user.displayName,
        email: req.user.emails[0].value,
        // Include other fields if necessary
      });
      await newUser.save();
      return res.redirect("/profile");
    }

    // Redirect to profile if user exists
    res.redirect("/profile");
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error during Google login" });
  }
};

// Handle Google login with additional parameters (email, name, tokenId)
export const handleGoogleLogin = async (req, res) => {
  try {
    const { email, name, tokenId } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      // Generate JWT token with minimal necessary information
      const token = jwt.sign(
        {
          _id: existingUser._id, // Corrected to existingUser
          role: existingUser.role, // Use the correct user object
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "User logged in successfully",
        token,
        user: {
          fullname: existingUser.fullName, // Fixed to match schema
          userName: existingUser.userName,
          email: existingUser.email,
          balance: existingUser.balance,
          role: existingUser.role,
          spent: existingUser.spent,
          referral_id: existingUser.referral_id,
          affiliate_bal_transferred: existingUser.affiliate_bal_transferred,
          affiliate_bal_available: existingUser.affiliate_bal_available,
          createdAt: existingUser.createdAt,
          updatedAt: existingUser.updatedAt,
        },
      });
    } else {
      // If the user doesn't exist, create a new one
      const apiKey = crypto.randomBytes(16).toString("hex"); // Generate an API Key
      const userName = email.split("@")[0]; // Create a username from the email

      const newUser = new UserModel({
        fullName: name,
        email,
        password: "google-auth", // Set a default password
        userName, // Set the userName
        apiKey, // Add the generated API Key
        // Include other fields if necessary
      });

      await newUser.save(); // Ensure user is saved before generating token
      const token = jwt.sign(
        {
          _id: newUser._id, // Corrected to newUser
          role: newUser.role, // Use the newUser object
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          fullname: newUser.fullName, // Fixed to match schema
          userName: newUser.userName,
          email: newUser.email,
          balance: newUser.balance,
          role: newUser.role,
          spent: newUser.spent,
          referral_id: newUser.referral_id,
          affiliate_bal_transferred: newUser.affiliate_bal_transferred,
          affiliate_bal_available: newUser.affiliate_bal_available,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error during Google login" });
  }
};
