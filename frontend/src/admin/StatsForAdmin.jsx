import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import {
  FaCheckCircle,
  FaStarHalfAlt,
  FaTicketAlt,
  FaUsers,
} from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import { GiCash, GiCoins } from "react-icons/gi";
import {
  FaArrowUpWideShort,
  FaCartFlatbedSuitcase,
  FaTicketSimple,
} from "react-icons/fa6";
import { MdCancel, MdOutlinePendingActions, MdTimer } from "react-icons/md";
import { HiReceiptRefund } from "react-icons/hi";

function StatsForAdmin() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const [load, setLoad] = useState(false);
  const [stats, setStats] = useState({}); // Changed to an object to match the structure of the API response.
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);

  // Fetch stats from the API
  const fetchStats = async () => {
    setLoad(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_URL}statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        setStats(res.data.stats); // Save fetched data in state
        setUsers(res.data.stats?.last5User);
        setOrders(res.data.stats?.last5Orders);
        setSellers(res.data.stats?.top5BestSellers);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Define the card data, mapping titles to stats fields
  const cardData = [
    {
      title: "Total Users",
      detail: stats?.totalUsers,
      icon: <FaUsers className="fs-2" />,
    },
    {
      title: "Total Amount Received",
      detail: stats.totalAmountReceived,
      icon: <BsCashCoin className="fs-2" />,
    },
    {
      title: "Total Providers Balance",
      detail: stats.totalProvidersBalance,
      icon: <GiCoins className="fs-2" />,
    },
    {
      title: "Total Profit Today ",
      detail: stats.totalProfitToday,
      icon: <GiCash className="fs-2" />,
    },
    {
      title: "Total Profit 30days ",
      detail: stats.totalProfit30Days,
      icon: <GiCoins className="fs-2" />,
    },
    {
      title: "Total Users Balance",
      detail: stats.totalUsersBalance,
      icon: <GiCash className="fs-2" />,
    },
    {
      title: "Total Orders",
      detail: stats.totalOrders,
      icon: <FaCartFlatbedSuitcase className="fs-2" />,
    },
    {
      title: "Completed Orders",
      detail: stats.ordersCompleted,
      icon: <FaCheckCircle className="fs-2" />,
    },
    {
      title: "Processing Orders",
      detail: stats.ordersProcessing,
      icon: <FaArrowUpWideShort className="fs-2" />,
    },
    {
      title: "In Progress Orders",
      detail: stats.ordersProgress,
      icon: <MdTimer className="fs-2" />,
    },
    {
      title: "Pending Orders",
      detail: stats.ordersPending,
      icon: <MdOutlinePendingActions className="fs-2" />,
    },
    {
      title: "Partial Orders",
      detail: stats.ordersPartial,
      icon: <FaStarHalfAlt className="fs-2" />,
    },
    {
      title: "Canceled Orders",
      detail: stats.ordersCanceled,
      icon: <MdCancel className="fs-2" />,
    },
    {
      title: "Refunded Orders",
      detail: stats.ordersRefunded,
      icon: <HiReceiptRefund className="fs-2" />,
    },
    {
      title: "Total Tickets",
      detail: stats.totalTickets,
      icon: <FaTicketAlt className="fs-2" />,
    },
    {
      title: "Pending Tickets",
      detail: stats.ticketsPending,
      icon: <FaTicketSimple className="fs-2" />,
    },
    {
      title: "Closed Tickets",
      detail: stats.ticketsClosed,
      icon: <FaTicketAlt className="fs-2" />,
    },
    {
      title: "Answered Tickets",
      detail: stats.ticketsAnswered,
      icon: <FaTicketAlt className="fs-2" />,
    },
  ];

  return (
    <div className="px-3 px-lg-2">
      {load && <Loader />}
      {/* Responsive card layout */}
      <div className="row gy-4 gx-3">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="col-12 col-sm-6 col-lg-3 d-flex align-items-stretch"
          >
            <div className="card w-100">
              <div className="border-bottom">
                <h6 className="mb-0 card-title">{card.title}</h6>
              </div>
              <div>
                <p className="mb-0 card-detail d-flex justify-content-between align-items-center">
                  {card.detail !== undefined ? card.detail : "N/A"}
                  {card.icon ? card.icon : ""}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="overflow-x-auto mx-2 my-3">
          <table className="table table-bordered border-secondary custom-table border-bottom">
            <thead>
              <tr>
                <th colSpan={9}>five Newest Users </th>
              </tr>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">UserName</th>
                <th className="fw-medium">Email</th>
                <th className="fw-medium">Balance</th>
                <th className="fw-medium">Status</th>
                <th className="fw-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{parseFloat(user.balance).toFixed(3)}</td>
                  <td>{user.status}</td>
                  <td>{new Date(user.createdAt).toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto mx-2 my-3">
          <table className="table table-bordered border-secondary custom-table border-bottom">
            <thead>
              <tr>
                <th colSpan={9}>Last five Orders</th>
              </tr>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">order Id</th>
                <th className="fw-medium">Username</th>
                <th className="fw-medium">service Name</th>
                <th className="fw-medium">link</th>
                <th className="fw-medium">Quantity</th>
                <th className="fw-medium">Status</th>
                <th className="fw-medium">Error</th>
                <th className="fw-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{order.orderId}</td>
                  <td>{order.userName}</td>
                  <td>{order.serviceName}</td>
                  <td>{order.link}</td>
                  <td>{order.quantity}</td>
                  <td>{order.orderStatus}</td>
                  <td>{order?.error}</td>
                  <td>{new Date(order.createdAt).toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto mx-2 my-3">
          <table className="table table-bordered border-secondary custom-table border-bottom">
            <thead>
              <tr>
                <th colSpan={9}>Top five Sellers </th>
              </tr>
              <tr>
                <th className="fw-medium">No</th>
                <th className="fw-medium">serviceId</th>
                <th className="fw-medium">serviceName</th>
                <th className="fw-medium">count</th>
                <th className="fw-medium">ApiName</th>
                <th className="fw-medium">service</th>
                <th className="fw-medium">Rate per 1000 </th>
                <th className="fw-medium">min/max</th>
                <th className="fw-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{seller.serviceId}</td>
                  <td>{seller.details.serviceName}</td>
                  <td>{seller.count}</td>
                  <td>{seller.details.ApiName}</td>
                  <td>{seller.details.service}</td>
                  <td>
                    {/* {seller.details.pannelRate.toParseFloat().toFixed(3)} /{" "} */}
                    {parseFloat(seller.details.pannelRate).toFixed(4)} /{" "}
                    {parseFloat(seller.details.ApiRate).toFixed(4)}
                  </td>
                  <td>
                    {seller.details.min}/{seller.details.max}
                  </td>
                  <td>{new Date(seller.details.createdAt).toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StatsForAdmin;
