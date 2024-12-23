import UserModel from "../model/User.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { mailSendingFunctionUser } from "./SendEmails.controller.js";
import SiteSettings from "../model/SiteSettings.model.js";

const signUp = async (req, res) => {
  try {
    const { fullName, whatsapp, email, password, userName } = req.body;
    if (!fullName || !email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await UserModel.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcryptjs.genSalt(10); // Use genSalt instead of salt
    const hashedPassword = await bcryptjs.hash(password, salt);

    const apiKey = crypto.randomBytes(16).toString("hex"); // Generate an API Key

    const newUser = new UserModel({
      fullName,
      whatsapp,
      email,
      password: hashedPassword,
      userName,
      role: "user", // Explicitly set role if desired, but not necessary
      apiKey, // Add the generated API Key
    });

    await newUser.save();

    const sendMailToUserOnSignup = await SiteSettings.findOne({
      is_welcome_email: true, // Checking if is_welcome_email is true
    });

    if (sendMailToUserOnSignup) {
      // If the setting exists and is_welcome_email is true
      const emailFor = "newUserWelcomeEmail"; // Email template key
      const userMail = email; // The user's email to send to
      await mailSendingFunctionUser(userMail, emailFor); // Sending the email
    }

    return res.status(200).json({
      message: "User registered successfully",
      user: {
        fullName: newUser.fullName,
        whatsapp: newUser.whatsapp,
        email: newUser.email,
        userName: newUser.userName,
        role: newUser.role, // Include role in response if needed
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};

export default signUp;
