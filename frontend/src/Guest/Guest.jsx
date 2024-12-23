import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function Guest() {
  return (
    <div>
      <Navbar />
      <div className="container-fluid mx-0 pt-5 ">
        <div className="mt-5">
          <Outlet />
          <Toaster />
        </div>{" "}
      </div>
    </div>
  );
}

export default Guest;
