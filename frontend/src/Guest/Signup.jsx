import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import Loader from "../components/Loader";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [load, setLoad] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoad(true); // Start loading state
    const userinfo = {
      fullName: data.fullname,
      userName: data.username,
      email: data.email,
      whatsapp: data.whatsapp,
      password: data.password,
    };

    await axios
      .post(`${import.meta.env.VITE_URL}user/signup`, userinfo)
      .then((res) => {
        if (res.status === 200) {
          // Success case
          toast.success(res.data.message || "User registered successfully"); // Display success toast
          localStorage.setItem("user", JSON.stringify(res.data.user)); // Store user data in local storage
          setLoad(false); // End loading state
        }
      })
      .catch((err) => {
        setLoad(false); // End loading state

        if (err.response) {
          // If response was received from the server
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 400) {
            // Handle specific 400 errors
            toast.error(message || "Registration failed: Bad request");
          } else {
            toast.error("Server error. Please try again later.");
          }
          console.log("Error message:", message); // Log error for debugging
        } else {
          // If no response was received (e.g., network error)
          toast.error("Network error. Please check your connection.");
          console.log("Error:", err.message);
        }
      });
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const eyeplace = {
    position: "absolute",
    right: "20px",
    top: "70%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  };
  const invalidFeedback = {
    position: "absolute",
    bottom: "-20px",
    fontSize: "0.875em",
    color: "#dc3545",
    width: "100%",
    paddingLeft: "15px",
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        {load && <Loader />}
        <div className="home-section-banner"></div>

        <div className="col-11  col-md-8 col-lg-5 my-5 ">
          <Link className="mb-2 text-dark" to={"/"}>
            <FaArrowLeftLong /> Go back to Login page
          </Link>
          <h2 className="text-center my-4">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="mb-3">
              <label htmlFor="fullname" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control p-2"
                id="fullname"
                {...register("fullname", { required: "Full Name is required" })}
              />
              {errors.fullname && (
                <span className="text-danger">{errors.fullname.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control p-2"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-danger">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type={!showPassword ? "password" : "text"}
                className="form-control p-2"
                id="password"
                {...register("password", { required: "Password is required" })}
              />
              <span style={eyeplace} onClick={togglePasswordVisibility}>
                {!showPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
              {errors.password && (
                <span className="text-danger" style={invalidFeedback}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-3 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type={!showConfirmPassword ? "password" : "text"}
                className="form-control p-2"
                id="confirmPassword"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => {
                    const { password } = getValues();
                    return value === password || "Passwords do not match";
                  },
                })}
              />
              <span style={eyeplace} onClick={toggleConfirmPasswordVisibility}>
                {!showConfirmPassword ? <FaRegEyeSlash /> : <FaEye />}
              </span>
              {errors.confirmPassword && (
                <span className="text-danger" style={invalidFeedback}>
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
