import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

function Tickets() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [subCategories, setSubCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [load, setLoad] = useState(false);
  const [authUser] = useAuth();
  const navigate = useNavigate();

  // Watch the subject field for conditional rendering
  const selectedSubject = watch("subject");

  // Define subcategories for each subject
  const subCategoryOptions = {
    order: ["Refill", "Cancellation", "Speed Up", "Other"],
    payment: [],
    service: [],
    other: [],
  };

  // Update subcategories when subject changes
  React.useEffect(() => {
    setSubCategories(subCategoryOptions[selectedSubject] || []);
  }, [selectedSubject]);

  // Form submission handler
  const onSubmit = async (data) => {
    setLoad(true); // Start loading state
    const ticketData = {
      userName: authUser.userName, // Replace with appropriate user data from authUser
      subject: data.subject,
      subCategory: data.subCategory,
      referenceId: data.referenceId,
      userMessage: data.userMessage, // Use userMessage instead of description
    };

    try {
      // Make a POST request to the API endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_URL}ticket/createNewTicket`,
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle success response
      console.log("Ticket created successfully:", response.data);
      toast.success(response.data.message);
    } catch (error) {
      // Handle error response
      console.error(
        "Error creating ticket:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoad(false); // Stop loading state
    }
  };

  const fetchTickets = async () => {
    const userName = authUser.userName;
    setLoad(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}ticket/getTicketsForUser/${userName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setTickets(response.data.tickets);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    fetchTickets();
    // Fetch tickets data
  }, []);

  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="row">
      {load && <Loader />}
      <div className="col-12">
        <div className="card">
          <div className="card-title">
            <h3>Create a New Ticket</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Subject Dropdown */}
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <select
                  id="subject"
                  className="form-select"
                  {...register("subject", { required: "Subject is required" })}
                >
                  <option value="">Select Subject</option>
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <small className="text-danger">
                    {errors.subject.message}
                  </small>
                )}
              </div>

              {/* Subcategory Dropdown (if available) */}
              {subCategories.length > 0 && (
                <div className="mb-3">
                  <label htmlFor="subCategory" className="form-label">
                    Subcategory
                  </label>
                  <select
                    id="subCategory"
                    className="form-select"
                    {...register("subCategory")}
                  >
                    <option value="">Select Subcategory</option>
                    {subCategories.map((sub, index) => (
                      <option key={index} value={sub.toLowerCase()}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reference ID (conditionally displayed) */}
              {(selectedSubject === "order" ||
                selectedSubject === "payment") && (
                <div className="mb-3">
                  <label htmlFor="referenceId" className="form-label">
                    {selectedSubject === "order" ? "Order ID" : "Payment ID"}
                  </label>
                  <input
                    type="text"
                    id="referenceId"
                    className="form-control"
                    {...register("referenceId", {
                      required: `${
                        selectedSubject === "order" ? "Order ID" : "Payment ID"
                      } is required`,
                    })}
                  />
                  {errors.referenceId && (
                    <small className="text-danger">
                      {errors.referenceId.message}
                    </small>
                  )}
                </div>
              )}

              {/* User Message Field */}
              <div className="mb-3">
                <label htmlFor="userMessage" className="form-label">
                  Message
                </label>
                <textarea
                  id="userMessage"
                  className="form-control"
                  rows="4"
                  {...register("userMessage", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters",
                    },
                  })}
                ></textarea>
                {errors.userMessage && (
                  <small className="text-danger">
                    {errors.userMessage.message}
                  </small>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-main">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>

        <div className="card my-5">
          <div className="card-title">
            <h5>Tickets</h5>
          </div>
          <div
            className="card-body"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="ticket"
                title="open ticket"
                style={{ borderBottom: "1px solid #ccc", padding: "10px" }}
                onClick={() => handleTicketClick(ticket.ticketId)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      backgroundColor: "#6b6ef9",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      marginRight: "10px",
                    }}
                  >
                    <FaUser />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontWeight: "bold" }}>
                      #{ticket.ticketId} - {ticket.subject}{" "}
                      {ticket.subCategory ? `- ${ticket.subCategory}` : ""} -{" "}
                      {ticket.userName}
                    </span>
                  </div>
                  <span class="badge rounded-pill text-bg-danger">
                    {ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)}
                  </span>
                </div>
                <div style={{ color: "#555", fontSize: "12px" }}>
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tickets;
