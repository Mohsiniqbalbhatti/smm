import React from "react";
import { NavLink, Outlet } from "react-router-dom";

function SiteSettings() {
  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12 col-md-8 mx-auto">
          <Outlet />
        </div>{" "}
        <div className="col-12 col-md-4 mx-auto">
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 bg-400 py-3">
            <li className="nav-item ">
              <NavLink className="nav-link" to="/admin/siteSettings">
                Website Settings
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/termsPolicy">
                Terms policy
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/faq">
                FAQ settings
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/pagesText">
                Pages Text
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/childPanel">
                Child Panel
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/affiliate">
                Affiliate
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/emailSetting">
                Email Setting
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/admin/emailTemplate">
                Email Templates
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SiteSettings;
