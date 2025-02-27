import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import { FaUser } from "react-icons/fa";
import { useForm } from "react-hook-form";

function TicketDetailsAdmin() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [load, setLoad] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const getTicket = async () => {
    setLoad(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}ticket/getTicket/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setTicket(res.data.ticket);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getTicket();
  }, [ticketId]);

  const onSubmit = async (data) => {
    setLoad(true);
    const ticketData = {
      adminMessage: data.message,
      ticketId: ticketId,
    };

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}ticket/updateTicket`,
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setTicket(res.data.ticket);
        reset();
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setLoad(false);
    }
  };

  if (load) return <Loader />;

  // Merge and sort messages by timestamp
  const allMessages = ticket && [
    ...ticket.userMessages.map((msg) => ({ ...msg, sender: "user" })),
    ...ticket.adminMessages.map((msg) => ({ ...msg, sender: "admin" })),
  ];
  allMessages?.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  //   update ticket status
  const updateTicketStatus = async (status) => {
    setLoad(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}ticket/updateTicket`,
        {
          ticketId,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setTicket(res.data.ticket); // Update the ticket with new status
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="row">
      {load && <Loader />}
      {!load && ticket && (
        <div className="col-12">
          {/* Ticket Info Card */}
          <div className="card rounded">
            <div className="card-title">
              <h5 className="ms-3">Ticket no #{ticketId}</h5>
            </div>
            <div className="card-body mt-0">
              <div className="table-responsive">
                <table className="table custom-table">
                  <tbody>
                    <tr>
                      <th>Status</th>
                      <select
                        className="form-select"
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                        <option value="answered">Answered</option>
                      </select>{" "}
                    </tr>
                    <tr>
                      <th>Username</th>
                      <td>{ticket.userName}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{ticket.userEmail}</td>
                    </tr>
                    <tr>
                      <th>Created At</th>
                      <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="card rounded my-3">
            <div className="card-title">
              <h5 className="ms-3">
                Order - {ticket.subject} - #{ticket.ticketId}
              </h5>
            </div>
            <div className="card-body mt-0">
              {/* Display All Messages */}
              {allMessages &&
                allMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`d-flex ${
                      message.sender === "admin" ? "justify-content-end" : ""
                    } mb-3`}
                  >
                    {message.sender === "user" ? (
                      <>
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
                          className="my-auto"
                        >
                          <FaUser />
                        </div>
                        <div className="d-flex flex-column align-items-start">
                          <div className="p-3 rounded bg-primary text-white">
                            <p className="mb-1">{message.message}</p>
                            <small>
                              {new Date(message.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <span className="fw-bold">{ticket.userName}</span>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex  flex-row-reverse">
                        <div
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            backgroundColor: "#ff6347",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            marginLeft: "10px",
                          }}
                          className="my-auto"
                        >
                          <FaUser />
                        </div>
                        <div className="d-flex flex-column align-items-start">
                          <div className="p-3 rounded bg-danger text-white">
                            <p className="mb-1">{message.message}</p>
                            <small>
                              {new Date(message.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <span className="fw-bold">Admin</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* Message Input Form */}
              {
                ticket.status !== "closed" && ticket.status !== "answered" ? (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-4 border rounded"
                  >
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">
                        Message
                      </label>
                      <textarea
                        id="message"
                        className={`form-control ${
                          errors.message ? "is-invalid" : ""
                        }`}
                        placeholder="Type your message here..."
                        {...register("message", {
                          required: "Message is required",
                          maxLength: {
                            value: 500,
                            message: "Message cannot exceed 500 characters",
                          },
                        })}
                      ></textarea>
                      {errors.message && (
                        <small className="text-danger">
                          {errors.message.message}
                        </small>
                      )}
                    </div>
                    <button type="submit" className="btn btn-main">
                      Submit
                    </button>
                  </form>
                ) : (
                  <div>
                    <strong>
                      <p className="text-center">This Ticket is closed !</p>
                    </strong>
                  </div>
                ) // If status is 'closed', do not render the form
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetailsAdmin;
