// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromCookie = Cookies.get("token");
    const userData = Cookies.get("user");

    if (tokenFromCookie && userData) {
      setUser(JSON.parse(userData));
      setToken(tokenFromCookie);
    }

    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const res = await fetch("http://localhost:1337/api/auth/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();

    Cookies.set("token", data.jwt);
    Cookies.set("user", JSON.stringify(data.user));

    setToken(data.jwt);
    setUser(data.user);

    return data.user;
  };

  const register = async (username, email, password) => {
    const res = await fetch("http://localhost:1337/api/auth/local/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) throw new Error("Registration failed");

    const data = await res.json();

    Cookies.set("token", data.jwt);
    Cookies.set("user", JSON.stringify(data.user));

    setToken(data.jwt);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Add this custom hook
export const useAuth = () => useContext(AuthContext);
