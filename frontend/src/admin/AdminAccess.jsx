import React from "react";
import { Link } from "react-router-dom";

function AdminAccess() {
  return (
    <div>
      <div className="container">
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="display-4">404 - Access Blocked </h1>
          <p className="lead">
            If you are the admin Kindly login with Admin Account.
          </p>
          <Link to="/" className="btn btn-main">
            Go to the Main Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminAccess;
