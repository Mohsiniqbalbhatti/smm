import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
export const Authcontext = createContext();

function AuthProvider({ children }) {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const [authUser, setAuthUser] = useState(user ? JSON.parse(user) : undefined);

  // Store the expiration time in the state
  const [expirationTime, setExpirationTime] = useState(null);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode the token payload
        const tokenExpirationTime = payload.exp * 1000; // Convert to milliseconds
        setExpirationTime(tokenExpirationTime); // Set the expiration time in the state

        if (tokenExpirationTime < Date.now()) {
          logoutUser(); // If token has expired immediately, log out the user
        } else {
          // Set up a timeout to log the user out after the token expires
          setTimeout(() => {
            logoutUser();
          }, tokenExpirationTime - Date.now()); // Run this when the token expires
        }
      }
    };

    checkTokenExpiration(); // Check token expiration on component mount

    // Cleanup the timeout on component unmount
    return () => clearTimeout(expirationTime);
  }, [token]); // Dependency array with token to check whenever token changes

  const logoutUser = () => {
    toast.error("Session Expired, please login again!");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setAuthUser(undefined); // Set the user as undefined to log out
      window.location.href = "/"; // Redirect to home or login page
    }, 3000);
  };

  return (
    <Authcontext.Provider value={[authUser, setAuthUser]}>
      {children}
    </Authcontext.Provider>
  );
}

export const useAuth = () => useContext(Authcontext);
export default AuthProvider;
