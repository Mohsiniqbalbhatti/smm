import nodemailer from "nodemailer";
import SiteSettings from "../model/SiteSettings.model.js";
import User from "../model/User.model.js"; // Assuming User model is imported
import { generateRecoveryLink } from "./User.controller.js";

export const mailSendingFunctionUser = async (userMail, emailFor) => {
  try {
    // Step 1: Fetch the site settings
    const siteSettings = await SiteSettings.findOne();
    if (!siteSettings) {
      throw new Error("Site settings not found");
    }

    // Check if the email template exists in siteSettings
    const template = siteSettings[emailFor];
    if (!template) {
      throw new Error(`Template ${emailFor} not found in site settings`);
    }

    // Check if the email is for password recovery
    if (emailFor === "passwordRecoveryEmail") {
      // Step 2: Fetch the user data from the database (userName, userEmail, etc.)
      const user = await User.findOne({ email: userMail });
      if (!user) {
        throw new Error("User not found");
      }

      // Step 3: Generate the recovery link using the generateRecoveryLink function
      const { recoveryLink, status, message } = await generateRecoveryLink(
        userMail
      );

      // If there was an error generating the recovery link, handle it
      if (status !== 200) {
        throw new Error(message);
      }

      // Step 4: Replace the placeholder in the email body with the recovery link
      let { subject, body } = template;

      const userData = {
        userName: user.userName,
        userEmail: user.email,
        userFullName: user.fullName,
        // Add any other user-specific data here
      };

      // Replace placeholders like {{userName}} and {{userEmail}} in the body
      body = replacePlaceholders(body, userData);

      // Append the recovery link to the body
      body += ` Here is your recovery link: <a href="${recoveryLink}"> recoveryLink </a>`;

      // Step 5: Fetch admin email credentials from siteSettings
      const adminMail = siteSettings.email_from;
      const adminMailPassword = siteSettings.email_Password; // App-specific password

      // Check if the admin email and password are present
      if (!adminMail || !adminMailPassword) {
        throw new Error("Admin email or password is not set in site settings");
      }

      // Step 6: Create a transporter using nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: adminMail, // Sender's email address
          pass: adminMailPassword, // App-specific password
        },
      });

      // Step 7: Define the email options
      const mailOptions = {
        from: adminMail, // Sender address
        to: userMail, // Recipient email (user's email)
        subject: subject, // Subject from template
        html: body, // Body from template (HTML format)
      };

      // Step 8: Send the email
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      return { success: true, message: "Email sent successfully" };
    }

    // If it's not a password recovery email, handle it similarly
    let { subject, body } = template;
    const adminMail = siteSettings.email_from;
    const adminMailPassword = siteSettings.email_Password;

    if (!adminMail || !adminMailPassword) {
      throw new Error("Admin email or password is not set in site settings");
    }

    // Fetch the user data for non-password recovery emails
    const user = await User.findOne({ email: userMail });
    if (!user) {
      throw new Error("User not found");
    }

    const userData = {
      userName: user.userName,
      userEmail: user.email,
      userFullName: user.fullName,
      // Add any other user-specific data here
    };

    // Replace placeholders in the body
    body = replacePlaceholders(body, userData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminMail,
        pass: adminMailPassword,
      },
    });

    const mailOptions = {
      from: adminMail,
      to: userMail,
      subject: subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error in mailSendingFunctionUser:", error.message);
    if (error.code === "ETIMEDOUT" || error.message.includes("connect")) {
      return {
        success: false,
        message: "Slow internet connection. Please try again.",
      };
    }
    return { success: false, message: error.message };
  }
};

// Utility function to replace placeholders in the email body
function replacePlaceholders(templateBody, userData) {
  return templateBody.replace(/{{(.*?)}}/g, (match, placeholder) => {
    const value = userData[placeholder.trim()];
    return value ? value : match; // If the placeholder exists in the user data, replace it, else leave it as is
  });
}

// Main function to handle email request from the frontend
export const sendEmailToUser = async (req, res) => {
  try {
    const { email, emailFor } = req.body; // Expecting email and emailFor from the frontend

    // Step 1: Validate input data
    if (!email || !emailFor) {
      return res
        .status(400)
        .json({ message: "Email and template type are required" });
    }

    // Step 2: Fetch the user from the database based on the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userMail = user.email;
    // Step 3: Call the reusable email function with the user object
    const result = await mailSendingFunctionUser(userMail, emailFor);

    // Step 4: Respond based on the result from mailSendingFunctionUser
    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error in sendEmailToUser:", error.message);
    return res.status(500).json({
      message: "Server error, failed to send email",
      error: error.message,
    });
  }
};

export const mailSendingFunctionAdmin = async (emailFor) => {
  try {
    // Step 1: Fetch the site settings
    const siteSettings = await SiteSettings.findOne();
    if (!siteSettings) {
      throw new Error("Site settings not found");
    }

    // Check if the email template exists in siteSettings
    const template = siteSettings[emailFor];
    if (!template) {
      throw new Error(`Template ${emailFor} not found in site settings`);
    }

    // Step 2: Fetch necessary template data (subject and body)
    let { subject, body } = template;
    const adminMail = siteSettings.email_from;
    const adminMailPassword = siteSettings.email_Password; // App-specific password

    // Check if the admin email and password are present
    if (!adminMail || !adminMailPassword) {
      throw new Error("Admin email or password is not set in site settings");
    }
    // Replace placeholders like {{userName}} and {{userEmail}} in the body

    // Step 5: Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminMail, // Sender's email address
        pass: adminMailPassword, // App-specific password
      },
    });

    // Step 6: Define the email options
    const mailOptions = {
      from: adminMail, // Sender address
      to: adminMail, // Recipient email (from user data)
      subject: subject, // Subject from template
      html: body, // Body from template (HTML format)
    };

    // Step 7: Send the email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error in mailSendingFunctionUser:", error.message);
    return { success: false, message: error.message };
  }
};

// send custom emails
export const sendCustomEmail = async (to, subject, body) => {
  try {
    // Fetch site settings for email credentials
    const siteSettings = await SiteSettings.findOne();
    if (
      !siteSettings ||
      !siteSettings.email_from ||
      !siteSettings.email_Password
    ) {
      throw new Error("Site settings or email credentials are missing");
    }

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: siteSettings.email_from,
        pass: siteSettings.email_Password, // App-specific password
      },
    });

    const mailOptions = {
      from: siteSettings.email_from,
      to,
      subject,
      html: body,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
