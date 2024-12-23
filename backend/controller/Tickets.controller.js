import UserModel from "../model/User.model.js";
import TicketSchema from "../model/Tickets.model.js";
import Ticket from "../model/Tickets.model.js";

export const createNewTicket = async (req, res) => {
  try {
    const { subject, subCategory, referenceId, userMessage, userName } =
      req.body;

    // Validate required fields
    if (!subject || !userMessage) {
      return res
        .status(400)
        .json({ message: "Subject and user message are required." });
    }

    if ((subject === "order" || subject === "payment") && !referenceId) {
      return res.status(400).json({ message: "Payment ID is required." });
    }

    const user = await UserModel.findOne({ userName });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Create new ticket instance
    const newTicket = new TicketSchema({
      user: user._id,
      userName: user.userName,
      userEmail: user.email,
      subject,
      subCategory,
      referenceId,
      userMessages: [
        {
          message: userMessage,
          timestamp: new Date(),
        },
      ],
    });

    // Save the ticket to the database
    const savedTicket = await newTicket.save();

    // Respond with the created ticket
    return res.status(201).json({
      message: "Ticket created successfully.",
      ticket: savedTicket, // Optionally return the saved ticket data
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const sendAllTickets = async (req, res) => {
  try {
    // Fetch all tickets from the database
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    // If no tickets found, return a message
    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found" });
    }

    // Send the tickets as a response to the admin
    return res.status(200).json({
      message: "All tickets fetched successfully",
      tickets, // Returning the tickets data
    });
  } catch (error) {
    // Handle any errors that occur during fetching
    console.error("Error fetching tickets:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const sendTicketByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const updateTicketByTicketId = async (req, res) => {
  try {
    const { ticketId, status, userMessage, adminMessage } = req.body;

    // Find the ticket by ticketId
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update the status if provided
    if (status) {
      ticket.status = status;
    }

    // Add a user message if provided
    if (userMessage) {
      ticket.userMessages.push({
        message: userMessage,
        timestamp: new Date(),
      });
      ticket.userRead = false; // Set userRead to false so user can be notified of new updates
    }

    // Add an admin message if provided
    if (adminMessage) {
      ticket.adminMessages.push({
        message: adminMessage,
        timestamp: new Date(),
      });
      ticket.adminRead = false; // Set adminRead to false to notify the admin of updates
    }

    // Update the updatedAt field
    ticket.updatedAt = new Date();

    // Save the updated ticket
    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendTicketByUserName = async (req, res) => {
  try {
    const { userName } = req.params;
    const tickets = await Ticket.find({ userName: userName }).sort({
      createdAt: -1,
    });
    if (tickets.length === 0) {
      return res.status(404).json({ message: "Tickets not found" });
    }
    return res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
