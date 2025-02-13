import React, { useEffect, useState } from "react";
import { MdOutlineAddCircle } from "react-icons/md";
import {
  FaCoins,
  FaHandsHelping,
  FaShoppingCart,
  FaWallet,
} from "react-icons/fa";
import axios from "axios";
import Loader from "../components/Loader";
import { useForm } from "react-hook-form";
import CustomDropdown from "../components/CustomDropdown";
import DropdownForService from "../components/DropdownForService";
import exchangeRate, { useCurrency } from "../context/CurrencyContext";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import Login from "../Guest/Login";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../context/SiteSettingsProvider";
import { Helmet } from "react-helmet"; // Import Helmet for SEO

function NewOrder() {
  const [services, setServices] = useState([]); // State to hold services
  const [categories, setCategories] = useState([]); // State to hold categories
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
  const [selectedService, setSelectedService] = useState(null); // State for selected service
  const [load, setLoad] = useState(false); // State to handle loading
  const [success, setSuccess] = useState(false);
  const [OrderDetails, setOrderDetails] = useState(null);
  const { currency } = useCurrency();
  const [authUser, setAuthUser] = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedServices, setSearchedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [isDripFeedChecked, setIsDripFeedChecked] = useState(false);
  const { siteSettings } = useSiteSettings();

  if (!authUser) {
    return <Login />;
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const quantity = watch("quantity");
  const token = localStorage.getItem("token")?.replace(/^"|"$|'/g, "") || null;
  const fetchData = async () => {
    setLoad(true); // Set loading to true when fetching data
    try {
      const [categoryResponse, servicesResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_URL}Guest/getCategory`),
        axios.get(`${import.meta.env.VITE_URL}Guest/allServices`),
      ]);

      const fetchedCategories = categoryResponse.data;
      const sortedCategories = fetchedCategories
        .filter(
          (category) =>
            category.status === "active" && category.ApiStatus === "active"
        )
        .sort((a, b) => a.sort - b.sort);
      setCategories(sortedCategories);
      setSelectedCategory(sortedCategories[0].name); // Set default selected category

      const fetchedServices = servicesResponse.data;
      if (fetchedServices) {
        setAllServices(fetchedServices); // Store all services
        const filteredServices = fetchedServices.filter(
          (service) =>
            service.category === sortedCategories[0].name && // Use the default category
            service.status === "active"
        );
        setServices(filteredServices); // Set services based on the default category
        setSelectedService(filteredServices[0]); // Set default selected service
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoad(false); // Set loading to false after fetching data
    }
  };

  // handle category change
  const handleCategoryChange = (selectedCategoryName) => {
    setSelectedCategory(selectedCategoryName); // Update selected category
    const filteredServices = allServices.filter(
      // Filter from all services
      (service) =>
        service.category === selectedCategoryName && service.status === "active"
    );
    setServices(filteredServices); // Update services state with filtered services
    setSelectedService(filteredServices[0]); // Update selected service
  };

  // Handle service change
  const handleServiceChange = (selectedService) => {
    setSelectedService(selectedService); // Update selected service with the full service object
  };

  useEffect(() => {
    fetchData(); // Fetch categories on component mount
  }, []);

  // handle default value for quantity
  useEffect(() => {
    if (selectedService) {
      setValue("quantity", searchedServices.min); // Set the default value when selectedOrder changes
    }
  }, [selectedService, setValue]);
  // calculate charged amount
  const calculateCharge = () => {
    if (selectedService && quantity > 0) {
      return parseFloat(
        exchangeRate(selectedService.rate, currency) * (quantity / 1000)
      ).toFixed(5);
    }
    return 0; // Return 0 if quantity is not valid
  };
  // handle submit form for new order
  const onSubmit = async (data) => {
    const chargeAmount = selectedService.rate * (quantity / 1000);

    const newOrderData = {
      userName: authUser.userName,
      ApiName: selectedService.ApiName,
      service: selectedService.service,
      quantity: data.quantity,
      linkOrUrl: data.link,
      rate: chargeAmount,
      serviceName: selectedService.name,
      serviceId: selectedService.serviceId,
      refill: selectedService.refill,
      cancel: selectedService.cancel,
      dripfeed: isDripFeedChecked, // Set dripfeed based on the checkbox state
      ...(isDripFeedChecked && {
        runs: data.runs, // Include runs if dripfeed is checked
        intervals: data.intervals, // Include intervals if dripfeed is checked
      }),
    };

    setLoad(true);
    if (authUser.balance < newOrderData.rate) {
      toast.error("Insufficient balance!");
      setLoad(false);

      return;
    }

    // Update user balance

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}NewOrder/AddOrder`, // Correct API URL
        newOrderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } // Data to be sent in the request body
      );

      if (res.data) {
        const response = res.data;
        const NewOrderDetails = {
          link: response.orderHistory.link,
          orderId: response.orderHistory.orderId,
          quantity: response.orderHistory.quantity,
          rate: response.orderHistory.rate,
          serviceID: response.orderHistory.serviceId,
          serviceName: response.orderHistory.serviceName,
        };
        setOrderDetails(NewOrderDetails);
        setSuccess(true);
        const updatedBalance = authUser.balance - newOrderData.rate;
        const updatedSpent = authUser.spent + newOrderData.rate;
        setAuthUser({
          ...authUser,
          balance: updatedBalance,
          spent: updatedSpent,
        });

        toast.success(`Order Added Successfully!`);
      }
    } catch (error) {
      console.error("Error", error); // Handle the error
    } finally {
      setLoad(false); // Ensure loading is set to false after the request
    }
  };

  useEffect(() => {
    setSuccess(false);
  }, []);
  const userName = authUser.userName;

  const updateBalance = async (userName) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}user/balance/${userName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setAuthUser((prevAuthUser) => ({
          ...prevAuthUser,
          balance: res.data.balance,
        }));
      }
    } catch (error) {
      console.error("error balance", error); // Handle the error
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const searchedService = allServices.filter(
        (service) =>
          service.serviceId.toString().includes(searchTerm.trim()) ||
          service.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );

      // Only update state if a matching service is found
      if (searchedService.length > 0) {
        setSearchedServices(searchedService);
      }
    }
  }, [searchTerm, allServices]);

  useEffect(() => {
    updateBalance(userName);
  }, []);

  const handleCheckboxChange = () => {
    setIsDripFeedChecked(!isDripFeedChecked);
  };

  // cards array
  const cards = [
    {
      icon: <FaHandsHelping className="fs-4 fw-bold pe-1" />,
      title: "Welcome",
      content: <p className="mb-0">{authUser.userName}</p>,
    },
    {
      icon: <FaCoins className="fs-4 fw-bold pe-1" />,
      title: "Total Spent",
      content: (
        <p className="mb-0">
          {currency}{" "}
          {exchangeRate(parseFloat(authUser.spent), currency)
            .toFixed(2)
            .slice(0, 7)}
        </p>
      ),
    },
    {
      icon: <FaShoppingCart className="fs-4 fw-bold pe-1" />,
      title: "Orders",
      content: <p className="mb-0">54321</p>,
    },
    {
      icon: <FaWallet className="fs-4 fw-bold pe-1" />,
      title: "Balance",
      content: (
        <div className="row align-items-center">
          <div className="col-7 border-end pe-2">
            <p className="mb-0" style={{ fontSize: "15px" }}>
              <span className="red-circle"></span>
              {currency}{" "}
              {exchangeRate(parseFloat(authUser.balance), currency)
                .toFixed(2)
                .slice(0, 7)}
            </p>
          </div>
          <Link
            to="/addFunds"
            className="col-5 text-dark text-decoration-none text-center"
          >
            <p className="mb-0">
              <MdOutlineAddCircle className="me-1" />
              ADD
            </p>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 px-lg-2">
      <Helmet>
        <title>{`New Orders | ${siteSettings?.domainName || ""}`}</title>{" "}
        <meta
          name="description"
          content={`Place new orders for services on ${siteSettings?.domainName}. Explore available services and start a new order for your social media needs.`}
        />
        <meta
          name="keywords"
          content="new orders, place order, services, order services, social media services, {siteSettings?.domainName} orders"
        />
        <meta name="robots" content="index, follow" />
        <meta
          property="og:title"
          content={`New Orders | ${siteSettings?.domainName}`}
        />
        <meta
          property="og:description"
          content={`Start a new order on ${siteSettings?.domainName} for your social media services. Choose from a wide range of services tailored to your needs.`}
        />
        <meta
          property="og:url"
          content={`https://${siteSettings?.domainName}`}
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://${siteSettings?.domainName}`} />
      </Helmet>

      {/* stats */}
      {load ? <Loader /> : ""}
      <div className="row gy-4 gx-3">
        {cards.map((stat, index) => (
          <div
            key={index}
            className="col-12 col-sm-6 col-lg-3 d-flex align-items-stretch"
          >
            <div className="card w-100">
              <div className="border-bottom">
                <h6 className="mb-0 card-title">
                  {stat.icon}
                  {stat.title}
                </h6>
              </div>
              <div className="card-detail">{stat.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Successfull details only if order is successfull */}

      {success ? (
        <div className="row">
          <div
            className="col-12 bg-info-subtle p-3 rounded"
            style={{
              overflowX: "scroll",
            }}
          >
            <h6 className="fw-bold ">Your Order has been received.</h6>
            <p className="my-0"> Order Id: {OrderDetails.orderId}</p>
            <p className="my-0"> Service Id:{OrderDetails.serviceID} </p>
            <p className="my-0"> Service Name: {OrderDetails.serviceName}</p>
            <p className="my-0"> Quantity: {OrderDetails.quantity}</p>
            <p className="my-0">
              {" "}
              Link: <small>{OrderDetails.link}</small>
            </p>
            <p className="my-0">
              {" "}
              Charge {currency}:{" "}
              {exchangeRate(parseFloat(OrderDetails.rate), currency)
                .toFixed(6)
                .slice(0, 7)}{" "}
            </p>
          </div>
        </div>
      ) : (
        ""
      )}

      {/* place order */}
      <div className="row my-2 ">
        <div className="col-md col-12 mx-1 mb-2">
          {/* order and mass orders btn */}
          <div className="row mb-2">
            <div className="col-12 card">
              <div className="row">
                <div className="col-6 p-2 ps-4 border-end">
                  <button className="btn btn-main w-100 w-lg-auto">
                    New Order
                  </button>
                </div>
                <div className="col-6 p-2">
                  <button className="btn btn-second w-100 w-lg-auto">
                    Mass Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* order form */}
          <div className="row">
            <div className="col-12 p-0">
              <div className="card order-form p-3">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <input
                    type="text"
                    placeholder="Search for a service here"
                    className="form-control my-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {searchTerm && (
                    <div className="row">
                      <div className="col-12 dropDown_Search">
                        {searchedServices.map((service) => (
                          <div
                            className="searched_item py-2"
                            key={service.serviceId}
                            onClick={() => {
                              setSelectedService(service);
                              setSelectedCategory(service.category);
                              setSearchTerm("");
                            }}
                          >
                            <span className="badge rounded-pill bg-danger">
                              {service.serviceId}
                            </span>
                            {service.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Category Dropdown */}
                  <div className="mb-3">
                    <label htmlFor="service" className="form-label">
                      Category
                    </label>
                    <CustomDropdown
                      options={categories}
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    />
                  </div>

                  {/* Service Dropdown */}
                  <div className="mb-3">
                    <label htmlFor="service" className="form-label">
                      Service{" "}
                      {selectedService ? (
                        <>
                          <span className=" badge rounded-pill bg-danger">
                            {selectedService.serviceId}
                          </span>
                          <span className=" badge rounded-pill bg-danger float-end">
                            {selectedService.refill}
                          </span>
                        </>
                      ) : (
                        ""
                      )}
                    </label>
                    <DropdownForService
                      options={services} // Use services array for options
                      value={selectedService ? selectedService.name : ""} // Display selected service's name or empty if none selected
                      onChange={handleServiceChange} // Call the updated handleServiceChange function
                    />
                  </div>

                  {/* Link Input */}
                  <div className="mb-3">
                    <label htmlFor="link" className="form-label">
                      Link
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="link"
                      placeholder="Enter the link"
                      {...register("link", { required: true })}
                    />
                    {errors.link && (
                      <div className="invalid-feedback">Link is Required.</div>
                    )}
                  </div>

                  {/* Average Time */}
                  <div className="mb-3">
                    <label className="form-label">Average Time</label>
                    <p className="bg-400 p-2 rounded">
                      {" "}
                      {selectedService && selectedService.average_time
                        ? `${Math.floor(
                            selectedService.average_time / 60
                          )} hours ${selectedService.average_time % 60} minutes`
                        : "Avg time not available"}{" "}
                    </p>
                  </div>
                  {selectedService && selectedService.dripfeed ? (
                    <>
                      <input
                        type="checkbox"
                        checked={isDripFeedChecked}
                        onChange={handleCheckboxChange}
                        id="dripfeedCheckbox"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="dripfeedCheckbox"
                      >
                        Dripfeed
                      </label>

                      {isDripFeedChecked && (
                        <>
                          <div className="mb-3">
                            <label className="form-label" htmlFor="runs">
                              Runs
                            </label>
                            <input
                              type="number" // Changed from 'runs' to 'number'
                              className="form-control"
                              id="runs"
                              placeholder="Enter the Runs"
                              min={1}
                              {...register("runs", { required: true })} // Updated field name
                            />
                            {errors.runs && (
                              <div className="invalid-feedback">
                                Runs are Required for dripfeed
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="form-label" htmlFor="intervals">
                              intervalss (in minutes)
                            </label>
                            <input
                              type="number" // Changed from 'intervals' to 'number'
                              className="form-control"
                              id="intervals"
                              placeholder="Enter the intervalss"
                              min={1}
                              {...register("intervals", { required: true })}
                            />
                            {errors.intervals && (
                              <div className="invalid-feedback">
                                intervalss are Required for dripfeed
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : null}

                  {/* Quantity Input */}
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">
                      Quantity{" "}
                      <span className="fw-light ps-auto">
                        {`min: ${
                          selectedService ? selectedService.min : "10"
                        } max: ${
                          selectedService ? selectedService.max : "10000"
                        } `}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: {
                          value: selectedService ? selectedService.min : 50, // Use selectedService.min if available, otherwise 50
                          message: `Minimum quantity is ${
                            selectedService ? selectedService.min : 50
                          }`, // Error message with fallback
                        },
                        max: {
                          value: selectedService ? selectedService.max : 50000, // Use selectedService.max if available, otherwise 50000
                          message: `Maximum quantity is ${
                            selectedService ? selectedService.max : 50000
                          }`, // Error message with fallback
                        },
                      })}
                    />

                    {errors.quantity && (
                      <p className="text-danger">{errors.quantity.message}</p>
                    )}
                  </div>
                  {/* Rs Charge */}
                  <div className="mb-3">
                    <label className="form-label"> Charge</label>
                    <p
                      className="bg-400 rounded p-2"
                      style={{
                        minHeight: "35px",
                      }}
                    >
                      {selectedService && quantity > 0
                        ? `${currency} ${calculateCharge()}`
                        : "Please enter Quantity first"}
                    </p>
                  </div>

                  <button type="submit" className="btn btn-main">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* selected service  */}
        <div className="col-md col-12 card mx-1 mb-2 ">
          <div className="row">
            <div className="col-12">
              <h6 className="py-3">Selected Service</h6>
            </div>
            <div className="col-12 card">
              <div className="card-title d-flex align-items-center justify-content-between flex-row">
                <p className="text-16 mb-0">Service ID</p>
                <p className="text-16 mb-0">
                  <strong>
                    {" "}
                    {selectedService ? selectedService.serviceId : "000"}
                  </strong>
                </p>
              </div>
              <div className="card-detail border-end-400 d-flex align-items-md-center justify-content-between flex-column flex-md-row">
                <p className="text-12 mb-0">
                  <strong> Min:</strong>{" "}
                  {selectedService ? selectedService.min : "100"}
                </p>
                <p className="text-12 mb-0">
                  <strong> Max:</strong>{" "}
                  {selectedService ? selectedService.max : "50000"}
                </p>

                <div className="btn btn-main mt-2 mt-md-0">Selected</div>
              </div>
            </div>
            {/* service desc  */}
            <div className="col-12 card">
              <div className="card-single my-3">
                <h6>Description</h6>
                <p>
                  {selectedService
                    ? selectedService.description
                    : " We needed 3 Minutes 3-4 video for proper working After service overload speed will decrease Channel Subscriber Must be Above Then one for starting Order Wait for one order complete thenreorder on same Cancel or Refill Anytime"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewOrder;
