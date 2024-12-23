import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "../components/Loader";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function AdminLogin() {
  const [Load, setLoad] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const userinfo = {
      email: data.email,
      password: data.password,
    };
    setLoad(true); // Start loading state
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}user/admin/login`,
        userinfo
      );

      // Check if the response contains data and if the token is present
      if (res.data) {
        const user = jwtDecode(res.data.token); // Decode JWT to get user info
        console.log(user);
        localStorage.setItem("token", JSON.stringify(res.data.token));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("Admin Logged In successfully");
        window.location.href = "/";
      }
    } catch (err) {
      console.log("Error Logging In: ", err);

      // Check if the error response exists and has a message
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message); // Show error message from backend
      } else {
        alert("An unexpected error occurred. Please try again."); // Fallback error message
      }
    } finally {
      setLoad(false); // End loading state
    }
  };

  return (
    <div className="container">
      {Load && <Loader />}
      <div className="row d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="card p-5 col-lg-5 col-md-8 col-10">
          <h1 className="card-title text-center mb-5">Admin Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${
                  errors.username ? "is-invalid" : ""
                }`}
                id="email"
                {...register("email", { required: "email is required" })}
              />
              {errors.username && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                id="password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-main">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
