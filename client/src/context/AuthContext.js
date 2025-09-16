// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);   // store token
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromCookie = Cookies.get("token");
    const userData = Cookies.get("user");

    if (tokenFromCookie && userData) {
      setUser(JSON.parse(userData));
      setToken(tokenFromCookie);   // ✅ restore token from cookie
    }

    setLoading(false);
  }, []);

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    setToken(null);   // clear token
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
