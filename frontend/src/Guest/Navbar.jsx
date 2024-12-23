import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
function Navbar() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-2 nav-guest py-2 fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="" style={{ maxWidth: "150px" }} />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item py-2 py-lg-0">
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "link-nav nav-active" : "link-nav"
                  }
                  to=""
                >
                  Login
                </NavLink>
              </li>
              {/* <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav" to="blog">
                  Blog
                </NavLink>
              </li> */}
              <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav" to="services">
                  Services
                </NavLink>
              </li>
              <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav" to="api">
                  Api
                </NavLink>
              </li>
              <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav" to="/faq">
                  FAQ
                </NavLink>
              </li>
              <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav" to="terms">
                  Terms
                </NavLink>
              </li>
              <li className="nav-item py-2 py-lg-0">
                <a
                  className="link-nav"
                  href="https://whatsapp.com/channel/0029VaYLBIIJENxtYWafOE3E"
                  target="_blank"
                >
                  WhatsApp Channel
                </a>
              </li>
              <li className="nav-item py-2 py-lg-0">
                <NavLink className="link-nav nav-active" to="signup">
                  Signup
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
