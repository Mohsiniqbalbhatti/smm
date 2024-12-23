import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

// Create CurrencyContext
const CurrencyContext = createContext();

// CurrencyProvider component
export const CurrencyProvider = ({ children }) => {
  // Get initial currency from local storage or default to 'USD'
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem("currencyType");
    return savedCurrency ? JSON.parse(savedCurrency) : "USD"; // Default value
  });

  // Effect to update local storage whenever currency changes
  useEffect(() => {
    localStorage.setItem("currencyType", JSON.stringify(currency));
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the CurrencyContext
export const useCurrency = () => {
  return useContext(CurrencyContext);
};

let rates = {}; // Object to store fetched rates

// Function to fetch exchange rate for a specific currency
const fetchExchangeRate = async (currency) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL}rate/${currency}`
    );
    if (response.data) {
      rates[currency] = response.data.rate; // Store the fetched rate
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    // Handle error (e.g., set rates[currency] to null, throw error, etc.)
  }
};

// Function to get exchange rate based on currency
const exchangeRate = (rate, currency) => {
  if (currency in rates) {
    return rate * rates[currency]; // Use the fetched rate for conversion
  } else {
    return rate; // Return the same rate if currency is not supported or is USD
  }
};

// Fetch rates for all currencies at once (you can call this function where appropriate)
const fetchAllExchangeRates = async () => {
  await Promise.all(
    ["PKR", "INR", "EUR"].map((currency) => fetchExchangeRate(currency))
  );
};

// Call fetchAllExchangeRates at the start or where appropriate
fetchAllExchangeRates();

export default exchangeRate;
