import axios from "axios";
import React, { useEffect, useState } from "react";
import { FcApproval } from "react-icons/fc";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { FaBan } from "react-icons/fa";

function TransactionLogs() {
  const [transactions, setTransactions] = useState([]);
  const [load, setLoad] = useState(false);
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const fetchTransactions = async (req, res) => {
    setLoad(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}transactionsLogs/admin/allTransactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  const handleApproveClick = async (transaction) => {
    setLoad(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}transactionsLogs/admin/approveTransaction/${
          transaction._id
        }`,
        {}, // Empty body since no data is sent
        {
          headers: {
            Authorization: `Bearer ${token}`, // Correct placement of the token
          },
        }
      );
      if (res.data) {
        fetchTransactions();
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error(error.message);
    } finally {
      setLoad(false);
    }
  };

  const handleRejectClick = async (transaction) => {
    setLoad(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}transactionsLogs/admin/rejectTransaction/${
          transaction._id
        }`,
        {}, // Empty body since no data is sent
        {
          headers: {
            Authorization: `Bearer ${token}`, // Correct placement of the token
          },
        }
      );
      if (res.data) {
        fetchTransactions();
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error(error.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="row">
      {load && <Loader />}

      <div className="col-12">
        <table className="table table-bordered border-secondary custom-table2">
          <thead>
            <tr>
              <th className="fw-medium">No</th>
              <th className="fw-medium">Username</th>
              <th className="fw-medium">Transaction ID</th>
              <th className="fw-medium">Payment ID</th>
              <th className="fw-medium">Payment method</th>
              <th className="fw-medium">Amount (includes fee)</th>
              <th className="fw-medium">Currency</th>
              <th className="fw-medium">Status </th>
              <th className="fw-medium">Created At</th>
              <th className="fw-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{transaction.userName}</td>
                <td>{transaction.transactionId}</td>
                <td>{transaction.paymentId}</td>
                <td>{transaction.paymentMethod}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.currency}</td>
                <td>{transaction.status}</td>
                <td>{new Date(transaction.createdAt).toLocaleString()}</td>

                <td className="d-flex flex-column align-items-center">
                  {transaction?.status === "pending" && (
                    <>
                      <button
                        className="btn btn-sm btn-warning mb-2"
                        title="Approve Payment"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasEdit"
                        aria-controls="offcanvasRight"
                        onClick={() => handleApproveClick(transaction)}
                      >
                        <FcApproval />
                      </button>

                      <button
                        className="btn btn-sm btn-danger mb-2"
                        title="Reject Payment"
                        onClick={() => handleRejectClick(transaction)}
                      >
                        <FaBan />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionLogs;
