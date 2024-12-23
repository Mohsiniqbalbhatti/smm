import React, { useEffect, useState } from "react";
import axios from "axios";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loader from "../components/Loader";
import { RiMailSendLine } from "react-icons/ri";
import { IoSearch } from "react-icons/io5";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast"; // Importing toast for notifications
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function UserManagement() {
  const [allUsers, setAllUsers] = useState([]); // State to hold users
  const { currency } = useCurrency(); // Currency context
  const [load, setLoad] = useState(false); // Loading state
  const [search, setSearch] = useState(""); // Search term
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for editing
  const [selectedUserForMail, setSelectedUserForMail] = useState(null); // Selected user for mail
  const [emailBody, setEmailBody] = useState("");
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {
    register: registerForMail,
    handleSubmit: handleForMail,
    reset: resetForMail, // Get reset for the edit form
    formState: { errors: errorsForMail },
  } = useForm();

  // Fetching all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoad(true); // Show loader while fetching
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_URL}adminOnly/allUser`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data) setAllUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoad(false); // Hide loader after fetching
      }
    };
    fetchAllUsers();
  }, [token]);

  // Filtering users based on search input
  const filteredUsers = allUsers.filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      user.userName.toLowerCase().includes(searchTerm) ||
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  // Handle edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
  };

  // Submit handler for user edit form
  const onSubmit = async (data) => {
    const editUserData = {
      fullName: data.fullName,
      email: data.email,
      status: data.status,
      whatsapp: data.whatsapp,
      role: data.role,
      // Send password only if it's provided
      password: data.password ? data.password : null, // If no password, send null
      balance: data.balance,
    };

    console.log(editUserData);
    setLoad(true);

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_URL}userManagement/editUser/${
          selectedUser._id
        }`, // <-- Pass the user ID in the URL
        editUserData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data) {
        toast.success(res.data.message);
        setSelectedUser(null); // Clear selection after successful edit
        setAllUsers((prev) =>
          prev.map((user) =>
            user._id === selectedUser._id ? { ...user, ...editUserData } : user
          )
        ); // Optimistically update UI
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoad(false);
    }
  };

  // Resetting form values when a user is selected for editing
  useEffect(() => {
    if (selectedUser) {
      reset({
        fullName: selectedUser.fullName || "",
        email: selectedUser.email || "",
        status: selectedUser.status || "",
        whatsapp: selectedUser.whatsapp || "",
        role: selectedUser.role || "",
        password: "",
        balance: selectedUser.balance || "",
      });
    }
  }, [selectedUser, reset]);

  // delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoad(true);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_URL}userManagement/deleteUser/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        toast.success("User deleted successfully");
        setAllUsers(allUsers.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoad(false);
    }
  };

  // Handle edit button click
  const sendEmailToUser = (user) => {
    setSelectedUserForMail(user);
  };
  const onSubmitEmail = async (data) => {
    setLoad(true);
    const mailData = {
      subject: data.emailSubject,
      body: emailBody,
    };
    console.log(mailData);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}userManagement/sendMail/${
          selectedUserForMail._id
        }`,
        mailData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        toast.success("Email sent successfully");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setLoad(false);
    }
  };
  return (
    <div>
      {load && <Loader />}
      <div className="row">
        <div className="col-6">
          <div className="header-search float-start me-2 bg-400 rounded p-2">
            <div className="header-search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Username or Email Address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <IoSearch className="fs-4" />
          </div>
        </div>
        <div className="col-12">
          <div className="overflow-x-auto mx-2 mt-3">
            {filteredUsers.length > 0 ? (
              <table className="table table-bordered border-secondary custom-table2">
                <thead>
                  <tr>
                    <th className="fw-medium">No</th>
                    <th className="fw-medium">User Profile</th>
                    <th className="fw-medium">Balance {currency}</th>
                    <th className="fw-medium">Created At</th>
                    <th className="fw-medium">Status</th>
                    <th className="fw-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <ul>
                          <li>Full Name: {user.fullName}</li>
                          <li>User Name: {user.userName}</li>
                          <li>WhatsApp: {user.whatsapp}</li>
                          <li>Email: {user.email}</li>
                          <li>Role: {user.role}</li>
                          <li>Spent: {user.spent}</li>
                          <li>
                            Affiliate Balance Transferred:{" "}
                            {user.affiliate_bal_transferred}
                          </li>
                          <li>
                            Affiliate Balance Available:{" "}
                            {user.affiliate_bal_available}
                          </li>
                          <li>Referral ID: {user.referral_id}</li>
                        </ul>
                      </td>
                      <td>
                        {exchangeRate(
                          parseFloat(user.balance),
                          currency
                        ).toFixed(2)}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge text-bg-${
                            user.status === "Active" ? "success" : "danger"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="d-flex flex-column align-items-center">
                        <button
                          className="btn btn-sm btn-warning mb-2"
                          title="Edit User"
                          onClick={() => handleEditClick(user)}
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasRight"
                          aria-controls="offcanvasRight"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger mb-2"
                          title="Delete User"
                        >
                          <FaTrash onClick={() => handleDeleteUser(user._id)} />
                        </button>
                        <button
                          className="btn btn-sm btn-info mb-2"
                          title="Send Mail"
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasEmail"
                          aria-controls="offcanvasEmail"
                          onClick={() => sendEmailToUser(user)} // Ensures user selection
                        >
                          <RiMailSendLine />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center">No users found</p>
            )}

            {selectedUser && ( // Check if selectedUser is not null
              <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="offcanvasRight"
                aria-labelledby="offcanvasRightLabel"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasRightLabel">
                    <FaEdit className="pe-2 fs-2" /> Edit User
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="offcanvas-body">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Full Name */}
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        defaultValue={selectedUser?.fullName}
                        {...register("fullName", { required: true })}
                        placeholder="Enter Full Name"
                      />
                      {errors.fullName?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Full Name is required
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        defaultValue={selectedUser?.email}
                        {...register("email", { required: true })}
                        placeholder="Enter Email"
                      />
                      {errors.email?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Email is required
                        </p>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="mb-3">
                      <label htmlFor="whatsapp" className="form-label">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="whatsapp"
                        defaultValue={selectedUser?.whatsapp}
                        {...register("whatsapp", { required: true })}
                        placeholder="Enter WhatsApp Number"
                      />
                      {errors.whatsapp?.type === "required" && (
                        <p role="alert" className="text-danger">
                          WhatsApp number is required
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        id="status"
                        className="form-select"
                        defaultValue={selectedUser?.status}
                        {...register("status", { required: true })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {errors.status?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Status is required
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">
                        Account Type (Role)
                      </label>
                      <select
                        id="role"
                        className="form-select"
                        defaultValue={selectedUser?.role}
                        {...register("role", { required: true })}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                      {errors.role?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Role is required
                        </p>
                      )}
                    </div>

                    {/* Balance */}
                    <div className="mb-3">
                      <label htmlFor="balance" className="form-label">
                        Add Funds (Balance) in USD
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="balance"
                        defaultValue={selectedUser?.balance}
                        {...register("balance", { required: true })}
                        placeholder="Enter Balance Amount"
                      />
                      {errors.balance?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Balance is required
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        {...register("password")}
                        placeholder="Enter New Password"
                      />
                    </div>

                    <button type="submit" className="btn btn-main">
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            )}

            {selectedUserForMail && (
              <div
                className="offcanvas offcanvas-end"
                tabIndex="-1"
                id="offcanvasEmail"
                aria-labelledby="offcanvasEmailLabel"
              >
                <div className="offcanvas-header">
                  <h5 id="offcanvasEmailLabel">
                    Send Email to {selectedUserForMail.fullName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas" // Ensures the offcanvas can be closed
                    aria-label="Close"
                  ></button>
                </div>

                <div className="offcanvas-body">
                  {/* Add your email form */}
                  <form onSubmit={handleForMail(onSubmitEmail)}>
                    <div className="mb-3">
                      <label htmlFor="emailSubject" className="form-label">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="emailSubject"
                        placeholder="Enter email subject"
                        {...registerForMail("emailSubject", { required: true })}
                      />
                      {errorsForMail.emailSubject?.type === "required" && (
                        <p role="alert" className="text-danger">
                          Subject is required
                        </p>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="emailMessage" className="form-label">
                        Body
                      </label>
                      <ReactQuill
                        id="emailMessage"
                        value={emailBody}
                        onChange={setEmailBody}
                        placeholder="Enter your message"
                        theme="snow"
                      />
                    </div>

                    <button type="submit" className="btn btn-main">
                      Send Email
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
