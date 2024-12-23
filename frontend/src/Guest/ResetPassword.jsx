import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import axios from "axios";
import { useForm } from "react-hook-form";
import Loader from "../components/Loader";

function ResetPassword() {
  const [load, setLoad] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate(); // Hook to handle navigation
  const token = new URLSearchParams(location.search).get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid or expired token.");
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoad(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}user/resetPassword`,
        { token, newPassword: data.newPassword }
      );

      setSuccessMessage("Password reset successfully!");
      setLoad(false);
      // Redirect after successful password reset
      setTimeout(() => {
        navigate("/"); // Use navigate for redirection
      }, 2000); // Timeout for better UX before redirecting
    } catch (error) {
      setLoad(false);
      setErrorMessage("Failed to reset password. Please try again later.");
      console.log(error);
    }
  };

  return (
    <div className="position-relative">
      {load && <Loader />}
      <div
        className="row"
        style={{ display: "grid", placeItems: "center", height: "70vh" }}
      >
        <div className="col-12 col-md-4 card p-5">
          <h4>Recover Your Password</h4>

          {/* Display error or success messages */}
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="Enter new password"
                {...register("newPassword", {
                  required: "New Password is required", // Custom message for required
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
              {errors.newPassword && (
                <span className="text-danger">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm New Password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required", // Custom message for required
                })}
              />
              {errors.confirmPassword && (
                <span className="text-danger">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              Reset Password
            </button>
          </form>

          <Link to="/" className="d-flex align-items-center mt-3">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
