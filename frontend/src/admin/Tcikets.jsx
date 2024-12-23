import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Tickets() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}ticket/getAllTickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        console.log(response.data.tickets);
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTickets();
    // Fetch tickets data
  }, []);

  const handleTicketClick = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  return (
    <div className="row">
      {loading && <Loader />}
      <div className="col-12">
        <div className="card">
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
