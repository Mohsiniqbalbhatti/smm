import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { LuBadgeCheck } from "react-icons/lu";
import {
  FaCalendarAlt,
  FaClipboard,
  FaClock,
  FaEdit,
  FaGasPump,
  FaPaperPlane,
  FaTrashAlt,
} from "react-icons/fa";
import { MdBlock, MdCancel } from "react-icons/md";
import Loader from "../components/Loader";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function OrderLogs() {
  const [authUser] = useAuth(); // Get authUser from context
  const [orderHistory, setOrderHistory] = useState([]); // State to hold order history
  const [loading, setLoading] = useState(true); // State to manage loading status
  const { currency } = useCurrency();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [rate, setRate] = useState(0);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  // State for filter selection
  const [filter, setFilter] = useState("1"); // Default to "All"

  //  form for  edit order history
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}adminOnly/allOrderHistory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          setOrderHistory(response.data); // Update state with fetched data
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchOrderHistory();
  }, []); // Empty dependency array

  // Filter orders based on the selected filter and search term
  const filteredOrders = orderHistory.filter((order) => {
    const orderIdString = order.orderId.toString().toLowerCase(); // Ensure orderId is a string
    const userNameToString = order.userName.toString().toLowerCase(); // Ensure orderId is a string
    const isInFilter =
      filter === "1" || // All orders
      (filter === "2" && order.orderStatus === "Pending") || // Pending orders
      (filter === "3" && order.orderStatus === "In progress") || // In progress orders
      (filter === "4" && order.orderStatus === "Processing") || // Processing orders
      (filter === "5" && order.orderStatus === "Completed") || // Completed orders
      (filter === "6" && order.orderStatus === "Canceled") || // Completed orders
      (filter === "7" && order.orderStatus === "Partial") || // Completed orders
      (filter === "8" && order.error !== "No Error" && order.error !== null);
    // Completed orders

    const matchesSearchTerm =
      orderIdString.includes(search.toLowerCase()) ||
      userNameToString.includes(search.toLocaleLowerCase()); // Match search term

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
    8: "No Error",
  };
  const quantity = watch("quantity");

  // Function to calculate the rate
  const calculatedRate = () => {
    if (!selectedOrder || !selectedOrder.rate) return 0;
    return (parseFloat(quantity) * parseFloat(selectedOrder.rate)) / 100;
  };

  // Update rate whenever quantity changes
  useEffect(() => {
    setRate(calculatedRate());
  }, [quantity, selectedOrder]);
  // Handle select change for orderstatus
  useEffect(() => {
    if (selectedOrder) {
      setValue("status", selectedOrder.orderStatus); // Set the default value when selectedOrder changes
    }
  }, [selectedOrder, setValue]);
  // default setvalue for quantity
  useEffect(() => {
    if (selectedOrder) {
      setValue("quantity", selectedOrder.quantity); // Set the default value when selectedOrder changes
    }
  }, [selectedOrder, setValue]);
  // edit order code

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setRate(calculatedRate()); // Update the rate based on the selected order's quantity
  };

  const onSubmit = async (data) => {
    const orderData = {
      _id: selectedOrder._id,
      quantity: data.quantity,
      remain: data.quantity,
      rate: rate.toString(),
      orderStatus: data.status,
    };

    console.log(orderData);
    setLoading(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_URL}adminOnly/editOrder`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Order updated successfully!"); // Optional: Add a success toast notification
      }
    } catch (error) {
      console.error("Error editing order:", error);
      toast.error("Failed to update the order."); // Optional: Add an error toast notification
    } finally {
      setLoading(false); // Ensure loading state is cleared
    }
  };

  // resend order
  const handleResendClick = async (order) => {
    const orderData = {
      orderId: order.orderId,
      userName: order.userName,
      ApiName: order.ApiName,
      service: order.service,
      quantity: order.quantity,
      linkOrUrl: order.link,
      rate: order.rate,
      serviceName: order.serviceName,
      serviceId: order.serviceId,
      refill: order.refill,
      cancel: order.cancel,
      dripfeed: order.dripfeed, // Set dripfeed based on the checkbox state
      ...(order.dripfeed && {
        runs: order.runs, // Include runs if dripfeed is checked
        intervals: order.intervals, // Include intervals if dripfeed is checked
      }),
    };
    console.log("orderData", orderData);
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}NewOrder/AddOrder`, // Correct API URL
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } // Data to be sent in the request body
      );

      if (res.data) {
        const response = res.data;
        console.log(response);
        toast.success(`Order Resent Successfully!`);
      }
    } catch (error) {
      console.error("Error", error); // Handle the error
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }
  };

  // handle cancel
  const handleCancelClick = async (order) => {
    const OrderDetails = {
      orderId: order.orderId,
      orderIdAPi: order.orderIdAPi,
      ApiName: order.ApiName,
    };
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}NewOrder/addNewCancel`, // rest  API URL fo refill
        OrderDetails,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("cancel", res.data);

      if ((res.status = 200)) {
        toast.success(res.data.message);
      } else if ((res.status = 202 || 404)) {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error", error); // Handle the error
    } finally {
      setLoading(false); // Ensure loading is set to false after the request
    }
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
      <h1>Order History</h1>
      <div className="row">
        <div className="col-6">
          <select
            name="SelectOrderHistoryType"
            id="OrderHistoryType"
            className="p-3 w-75 rounded-pill"
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
            <option value="8">Error</option>
          </select>
        </div>
        <div className="col-6">
          <div className="header-search float-end me-2 bg-400 rounded p-2">
            <div className="header-search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Order Id or Username"
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
        <>
          <div className="overflow-x-auto mx-2 mt-3">
            <table className="table table-bordered border-secondary custom-table2">
              <thead>
                <tr>
                  <th className="fw-medium">Created At</th>
                  <th className="fw-medium">Order ID</th>
                  <th className="fw-medium">API Order ID</th>
                  <th className="fw-medium">User Name</th>
                  <th className="fw-medium">Order Details</th>
                  <th className="fw-medium">Status</th>
                  <th className="fw-medium">API Response</th>
                  <th className="fw-medium">Cancel Response</th>
                  <th className="fw-medium">Refill Response</th>
                  <th className="fw-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{order.orderId}</td>
                    <td>{order.orderIdAPi}</td>
                    <td>{order.userName}</td>
                    <td>
                      <ul>
                        <li>
                          {order.ApiName} - {order.service}
                        </li>
                        <li>pannel Service Id {order.serviceId}</li>
                        <li>{order.serviceName}</li>
                        <li>Link: {order.link}</li>
                        <li>Quantity: {order.quantity}</li>
                        <li>
                          Charged by API ({currency}):{" "}
                          {exchangeRate(
                            parseFloat(order.chargeAPI),
                            currency
                          ).toFixed(2)}
                        </li>
                        <li>
                          Charged by Us ({currency}):{" "}
                          {exchangeRate(
                            parseFloat(order.rate),
                            currency
                          ).toFixed(2)}
                        </li>
                        <li>Start Count: {order.startCount}</li>
                        <li>Remaining: {order.remain}</li>
                        <li>Minimum: {order.min}</li>
                        <li>Maximum: {order.max}</li>
                      </ul>
                    </td>
                    <td>{order.orderStatus}</td>
                    <td>{order.error}</td>
                    <td>
                      {order.CancelResponse
                        ? order.CancelResponse.error ||
                          order.CancelResponse.status
                        : "No Response Available"}
                    </td>
                    <td>
                      {order.refillResponse
                        ? order.refillResponse.error ||
                          order.refillResponse.status
                        : "No Response Available"}
                    </td>
                    <td className="d-flex align-items-center flex-column justify-content-center">
                      <button
                        className="btn btn-sm btn-warning mb-2"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasEditOrder"
                        aria-controls="offcanvasRight"
                        onClick={() => handleEditClick(order)}
                        title="Edit Order"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="btn btn-sm btn-success mb-2"
                        title="Resend order"
                        onClick={() => handleResendClick(order)}
                      >
                        <FaPaperPlane />
                      </button>
                      {order.cancel &&
                      order.orderStatus !== "Canceled" &&
                      order.orderStatus !== "Partial" &&
                      order.orderStatus !== "Completed" ? (
                        <button
                          className="btn btn-sm btn-danger mb-2"
                          title="Add For Cancel"
                          onClick={() => handleCancelClick(order)}
                        >
                          <MdCancel />
                        </button>
                      ) : (
                        ""
                      )}
                      {order.refill && order.orderStatus == "Completed" ? (
                        <button
                          className="btn btn-sm btn-danger mb-2"
                          title="Add For refill"
                          onClick={() => {
                            handleRefillClick(order);
                          }}
                        >
                          <FaGasPump />
                        </button>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="d-flex justify-content-center my-5">
          <h2>{`No orders available for ${filterLabels[filter]} category`}</h2>
        </div>
      )}

      {/* Bulk add offcanvas right */}
      <div
        className="offcanvas offcanvas-end pb-4"
        tabIndex="-1"
        id="offcanvasEditOrder"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5
            className="offcanvas-title d-flex align-items-center"
            id="offcanvasRightLabel"
          >
            <FaEdit className="pe-2 fs-2" /> Edit Order
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <hr />
        <div className="offcanvas-body">
          <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Order Id (Disabled) */}
            <div className="mb-3 col-md-6">
              <label htmlFor="OrderId" className="form-label">
                Order Id
              </label>
              <input
                type="text"
                className="form-control"
                id="OrderId"
                value={selectedOrder.orderId || ""}
                disabled
              />
            </div>

            {/* API Order Id (Disabled) */}
            <div className="mb-3 col-md-6">
              <label htmlFor="ApiOrderId" className="form-label">
                API Order Id
              </label>
              <input
                type="text"
                className="form-control"
                id="ApiOrderId"
                value={selectedOrder.orderIdAPi || ""}
                disabled
              />
            </div>

            {/* User Name (Disabled) */}
            <div className="mb-3 col-md-12">
              <label htmlFor="userName" className="form-label">
                UserName
              </label>
              <input
                type="text"
                className="form-control"
                id="userName"
                value={selectedOrder.userName || ""}
                disabled
              />
            </div>

            {/* Service (Disabled) */}
            <div className="mb-3 col-md-12">
              <label htmlFor="serviceName" className="form-label">
                Service
              </label>
              <textarea
                type="text"
                className="form-control"
                id="serviceName"
                value={selectedOrder.serviceName || ""}
                disabled
              />
            </div>

            {/* Quantity */}
            <div className="mb-3 col-md-12">
              <label htmlFor="quantity" className="form-label">
                Quantity
              </label>
              <input
                type="number"
                className="form-control"
                id="quantity"
                min={parseFloat(selectedOrder.min) || 10}
                max={parseFloat(selectedOrder.max) || 10000}
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity must be at least 1" },
                })}
              />
              {errors.quantity && (
                <span className="text-danger">{errors.quantity.message}</span>
              )}
            </div>

            {/* Rate (Disabled) */}
            <div className="mb-3 col-md-12">
              <label htmlFor="rate" className="form-label">
                Rate {currency}
              </label>
              <input
                type="text"
                className="form-control"
                id="rate"
                value={
                  rate
                    ? exchangeRate(parseFloat(rate), currency).toFixed(2)
                    : exchangeRate(
                        parseFloat(selectedOrder.rate),
                        currency
                      ).toFixed(2)
                }
                disabled
              />
            </div>

            {/* Start Count */}
            <div className="mb-3 col-md-6">
              <label htmlFor="startCount" className="form-label">
                Start Count
              </label>
              <input
                type="text"
                className="form-control"
                id="startCount"
                value={selectedOrder.startCount}
              />
              {errors.startCount && (
                <span className="text-danger">{errors.startCount.message}</span>
              )}
            </div>

            {/* Remains */}
            <div className="mb-3 col-md-6">
              <label htmlFor="remain" className="form-label">
                Remains
              </label>
              <input
                type="text"
                className="form-control"
                id="remain"
                value={selectedOrder.remain}
              />
            </div>

            {/* Status */}
            <div className="mb-3 col-md-12">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                className="form-select"
                {...register("status", { required: "Status is required" })}
              >
                <option value="">Select status type</option>
                <option value="Pending">Pending</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
                <option value="Partial">Partial</option>
              </select>
              {errors.status && (
                <span className="text-danger">{errors.status.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-main">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderLogs;
