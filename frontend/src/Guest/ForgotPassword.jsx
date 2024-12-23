import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "../components/Loader";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [load, setLoad] = useState(false); // State to handle loading

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const emailInfo = {
      email: data.email,
      emailFor: "passwordRecoveryEmail",
    };
    console.log(emailInfo);
    setLoad(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}sendMail/sendMailToUser`,
        emailInfo
      );

      if (res.data) {
        console.log(res.data);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoad(false);
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
          <Link className="mb-2 text-dark" to={"/"}>
            <FaArrowLeftLong /> Go back to Login page
          </Link>
          <h1>Forgot Password</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                required
                placeholder="Enter your email address"
                {...register("email", {
                  required: "Email is required", // Added a custom message for required
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
            <button type="submit" className="btn btn-main">
              Reset Password
            </button>
          </form>
        </div>
      </div>
      <div className="home-section-banner"></div>
    </div>
  );
}

export default ForgotPassword;
