import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillGoogleCircle } from "react-icons/ai";
import {
  FaEye,
  FaFacebook,
  FaInstagram,
  FaRegEyeSlash,
  FaTiktok,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Marquee from "react-fast-marquee";
import faq from "../assets/faq.png";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useSiteSettings } from "../context/SiteSettingsProvider";

function Login() {
  const { siteSettings } = useSiteSettings();

  const [load, setLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const onSubmit = async (data) => {
    const userinfo = {
      email: data.email,
      password: data.password,
    };
    setLoad(true); // Start loading state
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}user/login`,
        userinfo
      );

      // Check if the response contains data and if the token is present
      if (res.data) {
        localStorage.setItem("token", JSON.stringify(res.data.token));
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("User Logged In successfully");
        if (res.data.user.role === "admin") {
          window.location.href = "/Admin-statistics";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.err("Error Logging In: ", err);

      // Check if the error response exists and has a message
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message); // Show error message from backend
      } else {
        toast.error("An unexpected error occurred. Please try again."); // Fallback error message
      }
    } finally {
      setLoad(false); // End loading state
    }
  };

  // google login
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const responseGoogle = async (response) => {
    if (response && response.credential) {
      const { credential } = response;
      const userinfo = jwtDecode(credential); // Decode the JWT token

      const userData = {
        email: userinfo.email,
        name: userinfo.name,
        tokenId: credential,
      };

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_URL}login/auth/google`,
          userData
        );
        if (res.data) {
          toast.success("User Logged In successfully via Google");
          localStorage.setItem("user", JSON.stringify(res.data.user));
          localStorage.setItem("token", res.data.token);
          window.location.href = "/"; // Redirect to the home page
        }
      } catch (error) {
        console.error("Error logging in with Google:", error);
        toast.error("Google login failed. Please try again.");
      }
    } else {
      console.error("Google response does not contain profile information");
      toast.error("Google login failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const password = watch("password");

  useEffect(() => {
    if (password && password.length > 0) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [password]);

  const eyeplace = {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  };

  return (
    <div className="position-relative">
      {load && <Loader />}
      <div className="row justify-content-center mt-4">
        <div className="col-12 col-sm-10 col-md-12">
          <h1 className="text-center text-danger my-2 py-1 mt-3 rounded">
            "Most Trusted Panel"
          </h1>
          <h2 className="text-center my-3">Top Global SMM Panel</h2>
          <h3 className="text-center my-2 text-gradient">
            Dominate Social Media with the World’s Best SMM Panel at Wholesale
            Prices!
          </h3>
        </div>
      </div>
      <div className="home-section-banner"></div>
      <div className="row mt-2">
        <div className="col-12 d-flex justify-content-center">
          <Link
            to={"/service"}
            className="btn btn btn-outline-danger m-2 py-3 px-4"
          >
            Price List
          </Link>
          <Link to={"/signup"} className="btn btn btn-main m-2 py-3 px-4">
            Register
          </Link>
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-11  bg-300 py-5 border-400  px-2 px-sm-5 rounded">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3 justify-content-center">
              <div className="col-lg-3  ">
                <input
                  type="email"
                  className="form-control p-3"
                  id="exampleInputEmail1"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
                {errors.email && (
                  <div className="invalid-feedback">Email is required.</div>
                )}{" "}
              </div>
              <div className="col-lg-3 position-relative">
                <input
                  type={!showPassword ? "password" : "text"}
                  className="form-control p-3"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
                {isTyping && (
                  <span style={eyeplace} onClick={togglePasswordVisibility}>
                    {!showPassword ? <FaRegEyeSlash /> : <FaEye />}
                  </span>
                )}
                {!isTyping && (
                  <Link
                    style={eyeplace}
                    to={"/forgetPassword"}
                    className="text-dark"
                  >
                    Forgot Password?
                  </Link>
                )}
                {errors.password && (
                  <div className="invalid-feedback">Password is required.</div>
                )}{" "}
              </div>

              <div className="col-lg-2 d-flex align-items-center">
                <button type="submit" className="btn btn-main w-100  p-3">
                  Login
                </button>
              </div>
              <div className="col-lg-2 d-flex align-items-center ">
                <GoogleLogin
                  onSuccess={responseGoogle}
                  onError={(error) => {
                    console.error("Google login error:", error);
                    toast.error("Google login failed. Please try again.");
                  }}
                  logo={AiFillGoogleCircle}
                  className="btn btn-warning w-100 py-3 mx-auto"
                  text="Login with Google"
                >
                  Login with <AiFillGoogleCircle className="fs-3" />
                </GoogleLogin>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="row my-5">
        <div className="col-12">
          <Marquee speed={50} autoFill={true}>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              Facebook <FaFacebook style={{ color: "#3b5998" }} />
            </div>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              Twitter <FaTwitter style={{ color: "#1DA1F2" }} />
            </div>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              Instagram <FaInstagram style={{ color: "#E1306C" }} />
            </div>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              YouTube <FaYoutube style={{ color: "#FF0000" }} />
            </div>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              Twitch <FaTwitch style={{ color: "#9146FF" }} />
            </div>
            <div className="btn bg-300 border fs-3 p-3 m-3 border-secondary">
              TikTok <FaTiktok style={{ color: "#080303" }} />
            </div>
          </Marquee>
        </div>
      </div>

      <div className="row mb-5 justify-content-center align-items-center">
        <div className="col-12">
          <h1 className="text-center">
            Frequently Asked Question <span className="text-red">(FAQ)</span>
          </h1>
        </div>
        <div className="col-12 col-md-10 col-lg-5 my-3   mx-auto">
          <div className="accordion accordion-flush" id="accordionFlushExample">
            <div
              className="accordion-item"
              style={{
                margin: "0 15px 20px 0",
                borderRadius: "10px",
                border: "1px solid #ffffff20",
                boxShadow:
                  "0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22)",
                overflow: "hidden",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseOne"
                  aria-expanded="false"
                  aria-controls="flush-collapseOne"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                  }} // Remove default styles
                >
                  What is an Smm Pannel?
                </button>
              </h2>
              <div
                id="flush-collapseOne"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className="accordion-body">
                  SMM Panel is a social media marketing Website . which is
                  provide you instagram followers, likes and other social media
                  services in just few dollars. smm panel make your profiles
                  high quality with enogh likes and followers.
                </div>
              </div>
            </div>
            <div
              className="accordion-item"
              style={{
                margin: "0 15px 20px 0",
                borderRadius: "10px",
                border: "1px solid #ffffff20",
                boxShadow:
                  "0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22)",
                overflow: "hidden",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseTwo"
                  aria-expanded="false"
                  aria-controls="flush-collapseTwo"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                  }} // Remove default styles
                >
                  What is an Smm Service?
                </button>
              </h2>
              <div
                id="flush-collapseTwo"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className="accordion-body">
                  SMM Service is called social Media Marketing Services, in Smm
                  websites you can see Lot of Social Media Services For example
                  instagram followers likes and many more, in very low price.
                  and quality of followers and likes is too Best. which is help
                  in your business and profiles quality.
                </div>
              </div>
            </div>
            <div
              className="accordion-item"
              style={{
                margin: "0 15px 20px 0",
                borderRadius: "10px",
                border: "1px solid #ffffff20",
                boxShadow:
                  "0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22)",
                overflow: "hidden",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseThree"
                  aria-expanded="false"
                  aria-controls="flush-collapseThree"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                  }} // Remove default styles
                >
                  Why Chose us?
                </button>
              </h2>
              <div
                id="flush-collapseThree"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className="accordion-body">
                  In This Panel You will get 24/7 Support. and all services in
                  low price. with quality. We Are updating services daily For
                  clients satisfaction. so you will get always positive results
                  from us.
                </div>
              </div>
            </div>
            <div
              className="accordion-item"
              style={{
                margin: "0 15px 20px 0",
                borderRadius: "10px",
                border: "1px solid #ffffff20",
                boxShadow:
                  "0 14px 28px rgba(0, 0, 0, .25), 0 10px 10px rgba(0, 0, 0, .22)",
                overflow: "hidden",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#flush-collapseFour"
                  aria-expanded="false"
                  aria-controls="flush-collapseFour"
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                  }} // Remove default styles
                >
                  Which Pannel is Best?
                </button>
              </h2>
              <div
                id="flush-collapseFour"
                className="accordion-collapse collapse"
                data-bs-parent="#accordionFlushExample"
              >
                <div className="accordion-body">
                  This Panel is the one of the best smm panel in world now with
                  best smm services at cheap prices.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-5 d-none d-lg-flex">
          <img src={faq} className="img-fluid" alt="FAQ" />
        </div>
      </div>

      <div className="row">
        <div className="col-12 bg-200 bg-soft py-3">
          <p className="text-center">
            All Rights Reserved by &copy;{" "}
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              {siteSettings ? siteSettings.domainName : ""}{" "}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
