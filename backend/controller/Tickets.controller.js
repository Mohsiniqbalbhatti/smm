import UserModel from "../model/User.model.js";
import TicketSchema from "../model/Tickets.model.js";
import Ticket from "../model/Tickets.model.js";
import { sendCustomEmail } from "./SendEmails.controller.js";
import SiteSettings from "../model/SiteSettings.model.js";

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

    // send mail to the user and admin
    const sendMailToUserOnTicket = await SiteSettings.findOne({
      is_ticket_notice_email: true, // Checking if is_ticket_notice_email is true
      is_ticket_notice_email_admin: true, // Checking if is_ticket_notice_email is true
    });
    // send mail to user
    if (sendMailToUserOnTicket) {
      const to = user.email; //  The user's email to send to
      const subject = `Ticket Created  || ${sendMailToUserOnTicket.domainName}`; // email subject
      const body = `Hey ${user.userName}!, \n You have successfully created the ticket.\n Kindly have patience you will get the reply as soon as possible from our team.`; // email body
      await sendCustomEmail(to, subject, body); // Sending the email
    }
    // send mail to admin
    if (sendMailToUserOnTicket.is_ticket_notice_email_admin) {
      const to = sendMailToUserOnTicket.email_from; //  The user's email to send to
      const subject = `New Ticket Created  || ${sendMailToUserOnTicket.domainName}`; // email subject
      const body = `Hey Admin! \n There is a new Ticket Created.\n Kindly Check it out as soon as possible.`; // email body
      await sendCustomEmail(to, subject, body); // Sending the email
    }
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

    // send mail to admin and user if status is updated
    if (status && ticket.status !== status) {
      // send mail to the user and admin
      const sendMailToUserOnTicket = await SiteSettings.findOne({
        is_ticket_notice_email: true, // Checking if is_ticket_notice_email is true
      });
      // send mail to user
      if (sendMailToUserOnTicket) {
        const to = ticket.userEmail; //  The user's email to send to
        const subject = `Ticket Status Updated  || ${sendMailToUserOnTicket.domainName}`; // email subject
        const body = `Hey ${ticket.userName}!, \n The status of your Ticket ${ticket?.ticketId} has been updated to ${status}.`; // email body
        await sendCustomEmail(to, subject, body); // Sending the email
      }

      ticket.status = status;
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
