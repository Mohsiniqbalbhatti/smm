import React from "react";
import { Link, NavLink } from "react-router-dom"; // Import Link from react-router-dom
import { FaCartShopping } from "react-icons/fa6";
import { MdOutlineNewReleases } from "react-icons/md";
import {
  FaHistory,
  FaInfoCircle,
  FaPlug,
  FaServer,
  FaTicketAlt,
  FaWallet,
  FaUserShield,
  FaQuestionCircle, // Admin icon
} from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

function SideBar() {
  const [authUser, setAuthUser] = useAuth();

  const handleLogout = () => {
    toast.success("Logout Successful");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthUser(undefined);
  };
  return (
    <div>
      {/* sideBar  */}
      <div
        className="sideBar py-3 position-fixed mt-5"
        style={{ height: "100vh", minWidth: "22%" }}
      >
        {/* Middle Section: Scrollable Menu */}
        <div
          className="col-12 menu"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 100px)",
            paddingBottom: "60px",
          }}
        >
          {/* Admin Dropdown */}
          {authUser.role === "admin" ? (
            <>
              <div className="dropdown">
                <button
                  href="#"
                  className="nav-link dropdown-toggle"
                  id="adminDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUserShield className="fs-4 fw-bold pe-2" />
                  Admin
                </button>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li>
                    <Link to="/Admin-statistics" className="dropdown-item">
                      Admin statistics
                    </Link>
                  </li>
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
                    <Link to="/admin/OrderLogs" className="dropdown-item">
                      Order-Logs
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/UserManagement" className="dropdown-item">
                      User Management
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/PaymentMethods" className="dropdown-item">
                      Payment Methods
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/transactionsLog" className="dropdown-item">
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
                    <Link to="/admin/notifications" className="dropdown-item">
                      Notification
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/uploadAssets" className="dropdown-item">
                      Upload Assets
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            ""
          )}
          <NavLink to="/updates" className="nav-link">
            <MdOutlineNewReleases className="fs-4 fw-bold pe-1" />
            Updates
          </NavLink>
          <NavLink to="/" className="nav-link">
            <FaCartShopping className="fs-4 fw-bold pe-1" />
            New Order
          </NavLink>
          <NavLink
            to="/OrderHistory"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FaHistory className="fs-4 fw-bold pe-1" />
            Orders History
          </NavLink>
          <Link to="/addFunds" className="nav-link">
            <FaWallet className="fs-4 fw-bold pe-1" />
            Add Funds
          </Link>
          <Link to="/services" className="nav-link">
            <FaServer className="fs-4 fw-bold pe-1" />
            Services
          </Link>
          <Link to="/tickets" className="nav-link">
            <FaTicketAlt className="fs-4 fw-bold pe-1" />
            Tickets
          </Link>
          <Link to="/api" className="nav-link">
            <FaPlug className="fs-4 fw-bold pe-1" />
            API
          </Link>
          {/* <Link to="/refer-earn" className="nav-link">
            <FaUsers className="fs-4 fw-bold pe-1" />
            Refer & Earn
          </Link>
          <Link to="/mass-orders" className="nav-link">
            <FaFolderPlus className="fs-4 fw-bold pe-1" />
            Mass Orders
          </Link>
          <Link to="/blog" className="nav-link">
            <FaEdit className="fs-4 fw-bold pe-1" />
            Blog
          </Link>
          <Link to="/child-panel" className="nav-link">
            <MdChildFriendly className="fs-4 fw-bold pe-1" />
            Child Panel
          </Link> */}
          <Link to="/faq" className="nav-link">
            <FaQuestionCircle className="fs-4 fw-bold pe-1" />
            FAQ
          </Link>
          <Link to="/terms" className="nav-link">
            <FaInfoCircle className="fs-4 fw-bold pe-1" />
            Terms
          </Link>
        </div>

        {/* Bottom Section: Logout Button */}
        <div
          className="position-absolute py-1 d-flex justify-content-center"
          style={{
            bottom: 50,
            backgroundColor: "rgba(255, 255, 255)",
            zIndex: 10,
            width: "100%",
          }}
        >
          <button className="btn btn-main w-100 mx-3" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
