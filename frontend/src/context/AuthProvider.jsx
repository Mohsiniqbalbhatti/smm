import React, { createContext, useContext, useState, useEffect } from "react";
export const Authcontext = createContext();

function AuthProvider({ children }) {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const [authUser, setAuthUser] = useState(user ? JSON.parse(user) : undefined);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode the token payload
        const expirationTime = payload.exp * 1000; // Convert to milliseconds

        if (expirationTime < Date.now()) {
          window.location.href = "/";
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setAuthUser(undefined); // Log the user out if token is expired
        }
      }
    };

    checkTokenExpiration(); // Check token expiration on component mount
  }, [token]);

  return (
    <Authcontext.Provider value={[authUser, setAuthUser]}>
      {children}
    </Authcontext.Provider>
  );
}

export const useAuth = () => useContext(Authcontext);
export default AuthProvider;
