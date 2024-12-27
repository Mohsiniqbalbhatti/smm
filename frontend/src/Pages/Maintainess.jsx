import React from "react";
import { FaTools } from "react-icons/fa";
import { Link } from "react-router-dom";

function Maintenance() {
  return (
    <div className="container">
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
        <span>
          <FaTools
            className="text-danger"
            style={{ width: "100px", height: "100px" }}
          />
        </span>
        <h1 className="display-4 mt-5">Website Under Maintenance</h1>
        <p className="lead">
          Our Website is currently under going scheduled maintenance
        </p>
        <p className="text-muted">
          We should to be back shortly. Thank you for your patience!
        </p>
      </div>
    </div>
  );
}

export default Maintenance;
