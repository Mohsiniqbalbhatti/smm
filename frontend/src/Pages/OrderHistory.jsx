import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { LuBadgeCheck } from "react-icons/lu";
import { FaCalendarAlt, FaClipboard, FaClock } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import Loader from "../components/Loader";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";
import { IoSearch } from "react-icons/io5";
import toast from "react-hot-toast";
import { useSiteSettings } from "../context/SiteSettingsProvider";
import { Helmet } from "react-helmet"; // Import Helmet for SEO

function OrderHistory() {
  const [authUser] = useAuth(); // Get authUser from context
  const userName = authUser.userName;
  const [orderHistory, setOrderHistory] = useState([]); // State to hold order history
  const [loading, setLoading] = useState(true); // State to manage loading status
  const { currency } = useCurrency();
  const [search, setSearch] = useState("");
  const { siteSettings } = useSiteSettings();

  if (!authUser) {
    return <Login />;
  }

  // State for filter selection
  const [filter, setFilter] = useState("1"); // Default to "All"
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}OrderHistory/${userName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setOrderHistory(response.data.orderHistory); // Update state with fetched data
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchOrderHistory();
  }, []); // Empty dependency array

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    };
    // Format to 'YYYY-MM-DD HH:mm:ss'
    return date.toLocaleString("sv-SE", options).replace(" ", " "); // Remove the space between date and time
  };

  const copyToClipboard = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  // Filter orders based on the selected filter and search term
  const filteredOrders = orderHistory.filter((order) => {
    const orderIdString = order.orderId.toString().toLowerCase(); // Ensure orderId is a string
    const isInFilter =
      filter === "1" || // All orders
      (filter === "2" && order.orderStatus === "Pending") || // Pending orders
      (filter === "3" && order.orderStatus === "In progress") || // In progress orders
      (filter === "4" && order.orderStatus === "Processing") || // Processing orders
      (filter === "5" && order.orderStatus === "Completed") ||
      (filter === "6" && order.orderStatus === "Canceled") || // Completed orders
      (filter === "7" && order.orderStatus === "Partial"); // Completed orders
    // Completed orders

    const matchesSearchTerm = orderIdString.includes(search.toLowerCase()); // Match search term

    return isInFilter && matchesSearchTerm; // Return orders that match filter and search
  });

  const filterLabels = {
    1: "All",
    2: "Pending",
    3: "In Progress",
    4: "Processing",
    5: "Completed",
    6: "Canceled",
    7: "Partial",
  };

  // send order for refill
  const handleRefillClick = async (order) => {
    const OrderDetails = {
      orderId: order.orderId,
      orderIdAPi: order.orderIdAPi,
      ApiName: order.ApiName,
    };
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}NewOrder/addRefil`, // rest  API URL fo refill
        OrderDetails,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        } // Data to be sent in the request body
      );

      if ((res.status = 200)) {
        toast.success(res.data.message);
      } else if ((res.status = 202)) {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error", error); // Handle the error
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }
  };

  return (
    <div>
      <Helmet>
        <title>Order History | {siteSettings?.domainName}</title>
        <meta
          name="description"
          content={`View your past orders and transactions on ${siteSettings?.domainName}. Easily track your order history and status for a seamless experience.`}
        />
        <meta
          name="keywords"
          content="order history, transaction history, past orders, order tracking, {siteSettings?.domainName} orders"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content={`Order History | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Access your order history on ${siteSettings?.domainName}. Check your previous orders, their status, and transaction details in one place.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/OrderHistory`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://${siteSettings?.domainName}/OrderHistory`}
        />
      </Helmet>

      <h1>Order History</h1>
      <div className="row justify-content-center align-items-center my-2">
        <div className="col-12 col-md-6 mt-2">
          <select
            name="SelectOrderHistoryType"
            id="OrderHistoryType"
            className="p-3 w-100 w-md-75 rounded-pill"
            value={filter}
            onChange={(e) => setFilter(e.target.value)} // Update filter state
          >
            <option value="1">All</option>
            <option value="2">Pending</option>
            <option value="3">In Progress</option>
            <option value="4">Processing</option>
            <option value="5">Completed</option>
            <option value="6">Canceled</option>
            <option value="7">Partial</option>
          </select>
        </div>
        <div className="col-12 col-md-6 mt-2">
          <div className="header-search float-start float-md-end me-2 bg-400 rounded-pill p-2">
            <div className="header-search-box">
              <input
                type="text"
                className="form-control w-100"
                placeholder="Enter Order Id"
                value={search}
                onChange={(e) => setSearch(e.target.value)} // Update search state
              />
            </div>
            <IoSearch className="fs-4" />
          </div>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <div
            className="d-flex justify-content-center my-2 flex-column"
            key={order._id}
          >
            <div
              className="order-date-list rounded w-100"
              data-order-date={order.createdAt}
            >
              <FaCalendarAlt className="fs-5 pe-2" />
              {formatDate(order.createdAt)}
            </div>
            <div className="order-box rounded p-3 row">
              <div className="rounded">
                <div className="order-box-top row p-3 justify-content-between">
                  <div className="order-id col-12 col-md-1">
                    <span className="fw-semibold">ID:</span> {order.orderId}
                  </div>
                  <div className="order-name col-12 col-md-8 my-2 my-md-0">
                    {order.serviceName.slice(0, 100)}
                  </div>
                  <div className="col-12 col-md-3 my-2 my-md-0">
                    <div
                      className={
                        order.orderStatus === "Completed"
                          ? "completed float-end w-md-auto"
                          : order.orderStatus === "Canceled"
                          ? "canceled float-end w-100 w-md-auto"
                          : "other float-end w-100 w-md-auto"
                      }
                    >
                      {order.orderStatus === "Completed" ? (
                        <LuBadgeCheck className="fs-5 pe-1" />
                      ) : order.orderStatus === "Canceled" ? (
                        <MdBlock className="fs-5 pe-1" />
                      ) : (
                        <FaClock className="fs-5 pe-1" />
                      )}
                      <span className="order-status-text">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="order-box-bottom row p-3 justify-content-between">
                  <div
                    className="order-link col-12 col-sm-5 d-flex align-item-center"
                    onClick={() => copyToClipboard(order.link)}
                    style={{ cursor: "pointer" }} // Style for the icon
                    title="Copy Link"
                  >
                    <span className="fw-semibold">
                      <FaClipboard className="me-2" />
                    </span>{" "}
                    {order.link}
                  </div>
                  <div className="col-12 col-sm-5 my-2 my-sm-0">
                    {order.orderStatus === "Completed" && order.refill ? (
                      <button
                        type="button"
                        className="btn btn-success float-start float-sm-end"
                        aria-label="Refill the order"
                        title="Add Order For Refill"
                        onClick={() => {
                          handleRefillClick(order);
                        }}
                      >
                        Refill
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className="btn btn-main float-start float-sm-end me-2 "
                      data-bs-toggle="modal"
                      data-bs-target={`#modal-${order.orderId}`} // Unique target for each order
                    >
                      Order Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Unique Modal for Each Order */}
            <div
              className="modal fade"
              id={`modal-${order.orderId}`} // Unique ID for each modal
              tabIndex="-1"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered custom-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">
                      {order.orderId} Order Detail
                    </h1>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-12 border-bottom-bold mt-0 py-2">
                        <span className="fw-bold pe-3">Service Id:</span>
                        {order.serviceId}
                      </div>
                      <div className="col-12 border-bottom-bold py-2">
                        <span className="fw-bold pe-3">Date:</span>
                        {formatDate(order.createdAt)}
                      </div>
                      <div
                        className="col-12 border-bottom-bold py-2"
                        onClick={() => copyToClipboard(order.link)}
                        style={{ cursor: "pointer" }} // Style for the icon
                        title="Copy Link"
                      >
                        <span className="fw-bold pe-3">Link:</span>
                        <FaClipboard /> {order.link}
                      </div>
                      <div className="col-12 border-bottom-bold py-2">
                        <span className="fw-bold pe-3">Charge: {currency}</span>
                        {exchangeRate(order.rate, currency)}
                      </div>
                      <div className="col-12 border-bottom-bold py-2 order-name">
                        <span className="fw-bold pe-3 order-name">
                          Service Name:
                        </span>
                        {order.serviceName}
                      </div>
                      <div className="col-4 py-2 border-end-bold">
                        <span className="fw-bold pe-3 ">Start Count:</span>
                        {order.startCount}
                      </div>
                      <div className="col-4 py-2 border-end-bold">
                        <span className="fw-bold pe-3 ">Quantity:</span>
                        {order.quantity}
                      </div>
                      <div className="col-4 py-2 ">
                        <span className="fw-bold pe-3 ">Remains:</span>
                        {order.remain}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="d-flex justify-content-center my-5">
          <h2>{`No orders Available for ${filterLabels[filter]} category`}</h2>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
