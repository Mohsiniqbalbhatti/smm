import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaBell, FaUserAlt, FaCoins, FaUserShield } from "react-icons/fa";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import logo from "../assets/logo.png";
import Loader from "./Loader";
import axios from "axios";
import toast from "react-hot-toast";
function Navbar() {
  const [screen, setScreen] = useState(); // State for screen size
  const { currency, setCurrency } = useCurrency();
  const [authUser] = useAuth();
  const [notifications, setNotifications] = useState([]); // Ensure it's an array
  const [load, setLoad] = useState(false);

  const fetchNotifications = async () => {
    setLoad(true);
    await axios
      .get(`${import.meta.env.VITE_URL}admin/notification`)
      .then((res) => {
        setNotifications(res.data.notifications);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || "An error occurred";
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoad(false);
      });
  };
  useEffect(() => {
    const updateScreen = () => {
      if (window.innerWidth > 992) {
        setScreen("lg");
      } else if (window.innerWidth >= 768 && window.innerWidth <= 992) {
        setScreen("md");
      } else if (window.innerWidth >= 576) {
        setScreen("sm");
      } else {
        setScreen("xsm");
      }
    };

    updateScreen(); // Set initial screen size
    window.addEventListener("resize", updateScreen); // Add event listener for resizing

    fetchNotifications();
    // Cleanup event listener when component unmounts
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <nav className="navbar bg-body-tertiary fixed-top ">
      {load && <Loader />}
      <div className="w-100">
        <div className="row d-flex">
          <div className="col-12 col-lg-3 d-flex justify-content-between">
            <Link to="/" className="text-dark text-decoration-none">
              <img src={logo} alt="" style={{ maxWidth: "150px" }} />
              {/* <h3 className="my-auto d-none d-lg-block">NEW SMM</h3> */}
            </Link>
            <button
              className="navbar-toggler d-block d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div className="col-12 col-lg-9 d-flex justify-content-between mt-3 mt-lg-0">
            {/* Header Search Box */}
            <div className="header-search d-lg-flex d-none">
              <div className="header-search-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Service Here"
                />
              </div>
              <IoSearch className="fs-4" />
            </div>

            {/* User section with notifications and username */}
            <div className="d-flex align-items-center justify-content-between w-100 ">
              <button
                className=" btn bell mx-4 position-relative "
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNotifications"
                aria-controls="offcanvasNotifications"
              >
                <FaBell className="fw-semiBold fs-4" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {"."}
                </span>
              </button>
              <div className="currency mx-2 btn btn-currency-select">
                <FaCoins className="pe-1 d-none d-md-inline" />
                <select
                  className="currency-select"
                  value={currency}
                  onChange={handleCurrencyChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
              <Link className="user mx-2 btn btn-second" to={"/profile"}>
                <FaUserAlt />
                {screen === "lg"
                  ? authUser.userName
                  : screen === "md"
                  ? authUser.userName
                  : screen === "sm"
                  ? authUser.userName.slice(0, 5)
                  : ""}{" "}
              </Link>
            </div>
          </div>
        </div>

        {/*Offcanvas notification*/}
        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasNotifications"
          aria-labelledby="offcanvasNotificationsLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNotificationsLabel">
              Notifications
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="notification-list ps-0">
              {notifications.map((notification, index) => (
                <li key={index}>
                  <div className="card">
                    <div className="card-title d-flex justify-content-between align-items-center">
                      {notification.title}{" "}
                      <span className=" badge rounded-pill bg-danger text-end">
                        {new Date(notification?.startDate).toDateString()}
                      </span>
                    </div>
                    <div
                      className="card-detail"
                      dangerouslySetInnerHTML={{
                        __html: notification.description,
                      }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*offcanvas side bar  */}
        <div
          className="offcanvas offcanvas-start"
          style={{
            maxWidth: "300px",
          }}
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <div
              className="menu"
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 100px)",
                paddingBottom: "60px",
              }}
            >
              {/* Navigation links using React Router Link */}
              <Link to="/updates" className="nav-link">
                Updates
              </Link>
              <Link to="" className="nav-link">
                New Order
              </Link>
              <Link to="/OrderHistory" className="nav-link">
                Orders History
              </Link>
              <Link to="/addFunds" className="nav-link">
                Add Funds
              </Link>
              <Link to="/services" className="nav-link">
                Services
              </Link>
              <Link to="/tickets" className="nav-link">
                Tickets
              </Link>
              <Link to="/api" className="nav-link">
                API
              </Link>
              {/* <Link to="/refer-earn" className="nav-link">
                Refer & Earn
              </Link>
              <Link to="/mass-orders" className="nav-link">
                Mass Orders
              </Link>
              <Link to="/blog" className="nav-link">
                Blog
              </Link>
              <Link to="/child-panel" className="nav-link">
                Child Panel
              </Link> */}
              <Link to="/terms" className="nav-link">
                Terms
              </Link>
              {/* Admin Dropdown */}
              {authUser.role === "admin" ? (
                <div className="dropdown">
                  <a
                    href="#"
                    className="nav-link dropdown-toggle"
                    id="adminDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUserShield className="fs-4 fw-bold pe-2" />
                    Admin
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                    <li>
                      <Link to="/admin/ApiProviders" className="dropdown-item">
                        Api Providers
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/categories" className="dropdown-item">
                        Categories
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/services" className="dropdown-item">
                        Services
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/services" className="dropdown-item">
                        Services
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/OrderLogs" className="dropdown-item">
                        Order-Logs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/UserManagement"
                        className="dropdown-item"
                      >
                        User Management
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/PaymentMethods"
                        className="dropdown-item"
                      >
                        Payment Methods
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/transactionsLog"
                        className="dropdown-item"
                      >
                        Transactions Log
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/tickets" className="dropdown-item">
                        Tickets
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/siteSettings" className="dropdown-item">
                        Site Settings
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/siteSettings" className="dropdown-item">
                        Site Settings
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/notification" className="dropdown-item">
                        Notification
                      </Link>
                    </li>
                  </ul>
                </div>
              ) : (
                ""
              )}
            </div>
            <div style={{ backgroundColor: "rgba(255, 255, 255)" }}>
              <button
                className="btn btn-main w-75 position-absolute"
                style={{ bottom: 10 }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
