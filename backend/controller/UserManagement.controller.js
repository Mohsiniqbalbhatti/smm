import UserModel from "../model/User.model.js";
import bcryptjs from "bcryptjs";
import { sendCustomEmail } from "../controller/SendEmails.controller.js";
/**
 * Controller to edit a user's details
 */
export const editUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from URL parameters
  const updates = req.body; // Data for updating user

  try {
    // Check if password is provided for update
    if (updates.password && updates.password !== null) {
      const salt = await bcryptjs.genSalt(10);
      updates.password = await bcryptjs.hash(updates.password, salt);
    } else {
      // If no password is provided, remove it from the updates object
      delete updates.password;
    }

    // Update the user in the database
    const updatedUser = await UserModel.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated user
      runValidators: true, // Ensure validations are applied
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

/**
 * Controller to delete a user
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from URL parameters

  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

/**
 * Controller to send mail to  a user
 */
export const sendMail = async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const emailResponse = await sendCustomEmail(user.email, subject, body);
    res.status(200).json({ message: emailResponse.message });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
};
