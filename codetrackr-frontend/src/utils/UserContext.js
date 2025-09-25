import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const UserContext = createContext();

// Provider to wrap the app
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Example: Load user from localStorage or fetch from backend
  useEffect(() => {
    const fetchUser = async () => {
      // If you store user info in localStorage after login:
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Or fetch from backend if you have a profile endpoint & auth token
        try {
          // Example: you might want to send an Authorization header with JWT
          const token = localStorage.getItem("token");
          if (token) {
            const res = await axios.get("http://127.0.0.1:8000/api/profile/", {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
            setUser(res.data);
          }
        } catch (err) {
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  // You can provide a function to manually update the user (after login/signup/profile update)
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}