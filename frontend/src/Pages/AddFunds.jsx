import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider.jsx";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet"; // Import Helmet for SEO
import { useSiteSettings } from "../context/SiteSettingsProvider";

function AddFunds() {
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  const { siteSettings } = useSiteSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [authUser] = useAuth();
  const [methods, setMethods] = useState([]);
  const [load, setLoad] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchMethods = async () => {
    setLoad(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}payments/AllPaymentMethodsUser`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.paymentMethods) {
        setMethods(res.data.paymentMethods);
        // Ensure selectedMethod only gets set if it's not already set
        if (!selectedMethod) {
          setSelectedMethod(res.data.paymentMethods[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoad(false);
    }
  };

  const fetchUsersTransactions = async () => {
    setLoad(true); // Set loading state to true
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL}transactionsLogs/UserTransactions/${
          authUser.userName
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error); // Log the error
    } finally {
      setLoad(false); // Set loading state to false after the request finishes
    }
  };
  useEffect(() => {
    fetchUsersTransactions();
    fetchMethods();
  }, []);

  const handleMethodChange = (e) => {
    const selectedId = e.target.value;
    const selected = methods.find((method) => method._id === selectedId);
    setSelectedMethod(selected);
  };

  // sending payment
  const handleFormSubmit = async (data) => {
    // Check if selectedMethod is available
    if (!selectedMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    setLoad(true);
    try {
      const paymentInfo = {
        transactionId: data.params.transaction,
        amount: parseFloat(data.params.amount).toFixed(2).toString(),
        userName: authUser.userName,
        paymentMethod: selectedMethod.name,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_URL}payments/${selectedMethod.routeName}`,
        paymentInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data) {
        reset({
          params: {
            amount: "",
            transaction: "",
          },
          understandTerms: false,
        });
        fetchUsersTransactions();
      }

      if (res.status === 200) {
        toast.success("Payment successful, funds added!");
      } else if (res.status === 400) {
        toast.error("Transaction ID or amount mismatch!");
      } else if (res.status === 202) {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error in payment:", error);
      toast.error("Payment failed! Please try again.");
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="row">
      <Helmet>
        <title>{`ADD Funds | ${siteSettings?.domainName || ""}`}</title>{" "}
        <meta
          name="description"
          content={`Easily add funds to your ${siteSettings?.domainName} account. Secure and reliable payment options to ensure seamless transactions.`}
        />
        <meta
          name="keywords"
          content="add funds, account balance, secure payment, top-up, funds management"
        />
        <meta
          property="og:title"
          content={`Add Funds | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Top up your ${siteSettings?.domainName} account balance effortlessly. Choose secure payment options for a smooth experience.`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}/add-funds`}
        />
      </Helmet>

      {load && <Loader />}
      <div className="col-12">
        <div className="card">
          <div className="card-title">
            <select
              name="methodsList"
              id="methodsList"
              className="w-100 p-2"
              onChange={handleMethodChange}
              value={selectedMethod?._id || ""}
            >
              {methods.map((method) => (
                <option key={method._id} value={method._id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          {selectedMethod && (
            <>
              <img
                src={selectedMethod.img}
                alt=""
                className="img-fluid mx-auto my-2"
                style={{ maxWidth: "40%" }}
              />
              <div className="bg-300 text-center my-5">
                <h6 className="bg-danger d-inline px-3 text-light rounded">
                  ACCOUNT TITLE:
                </h6>
                <h6>{selectedMethod.accountTitle}</h6>
                <h6 className="bg-danger d-inline px-3 text-light rounded">
                  ACCOUNT NUMBER:
                </h6>
                <h6>{selectedMethod.accountNumber}</h6>
              </div>
              <form className="px-4" onSubmit={handleSubmit(handleFormSubmit)}>
                {selectedMethod?.userParams &&
                  Object.keys(selectedMethod.userParams).map((key) => (
                    <div className="mb-3" key={key}>
                      <label htmlFor={key} className="form-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={key}
                        {...register(`params.${key}`, {
                          required: `${key} is required`,
                        })}
                      />
                      {errors?.params?.[key] && (
                        <p className="text-danger">
                          {errors.params[key].message}
                        </p>
                      )}
                    </div>
                  ))}

                {/* Checkbox input */}
                <div className="mb-3 px-2">
                  <input
                    type="checkbox"
                    className="me-2"
                    {...register("understandTerms", {
                      required: "You must agree to the terms",
                    })}
                  />
                  <label htmlFor="transactionId">
                    Yes, I understand that after the funds are added, I will not
                    ask for a fraudulent dispute or charge-back!
                  </label>
                  {errors.understandTerms && (
                    <p className="text-danger">
                      {errors.understandTerms.message}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-main btn px-5 my-2">
                  Pay
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {transactions.length > 0 && (
        <>
          {" "}
          <div className="col-12">
            <h4>Trnasacitons History</h4>
            <div className="overflow-x-auto mx-2 mt-3">
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th className="fw-medium">No</th>
                    <th className="fw-medium">UserName</th>
                    <th className="fw-medium">Payment Id</th>
                    <th className="fw-medium">Transaction Id</th>
                    <th className="fw-medium">Method</th>
                    <th className="fw-medium">Amount</th>
                    <th className="fw-medium">Currency</th>
                    <th className="fw-medium">Status</th>
                    <th className="fw-medium">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{transaction.userName}</td>
                      <td>{transaction.paymentId}</td>
                      <td>{transaction.transactionId}</td>
                      <td>{transaction.paymentMethod}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.currency}</td>
                      <td>{transaction.status}</td>
                      <td>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AddFunds;
