import mongoose from "mongoose";
import Notifications from "../model/Notification.model.js";

export const addNotification = async (req, res) => {
  try {
    const { type, title, description, status, startDate, expiryDate } =
      req.body;

    // Validate input data
    if (
      !type ||
      !title ||
      !description ||
      !status ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new notification object
    const notification = new Notifications({
      type,
      title,
      description,
      status,
      startDate,
      expiryDate,
    });
    // Save the notification to the database
    await notification.save();
    // Return the created notification
    return res
      .status(200)
      .json({ message: "Notification added successfully", notification });
  } catch (error) {
    console.error("Error adding notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    // Use Mongoose's find method instead of findAll()
    const notifications = await Notifications.find();

    // If no notifications are found, return a 404 status code
    if (notifications.length === 0) {
      return res.status(404).json({ message: "No Notifications available" });
    }

    // If notifications are found, return them with a 200 status code
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params; // Extract the notification ID from the URL params
    const { type, title, description, startDate, expiryDate, status } =
      req.body; // Extract data from the request body

    // Find the notification by ID and update it with the new values
    const updatedNotification = await Notifications.findByIdAndUpdate(
      notificationId, // Find the notification by ID
      {
        type,
        title,
        description,
        startDate,
        expiryDate,
        status,
      },
      { new: true } // This option returns the updated notification after the update
    );

    // Check if the notification was found and updated
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Respond with the updated notification
    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the notification" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params; // Extract the notification ID from the URL params

    // Validate the notificationId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    // Attempt to find and delete the notification by ID
    const deletedNotification = await Notifications.findByIdAndDelete(
      notificationId
    );

    // If no notification was found with the given ID, return an error message
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Send a success response after deleting the notification
    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the notification" });
  }
};
