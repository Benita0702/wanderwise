// src/pages/LoginPage.js
import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { login, STRAPI_URL } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { user, setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(formData.email, formData.password);

      // Save token + user in cookies
      Cookies.set("token", res.data.jwt, {
        expires: 3650,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("user", JSON.stringify(res.data.user), { expires: 3650 });

      // Update context
      setUser(res.data.user);
      setToken(res.data.jwt);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    const redirectTo = `${window.location.origin}/connect/google/redirect`;
    window.location.href = `${STRAPI_URL}/api/connect/google?redirect_to=${encodeURIComponent(
      redirectTo
    )}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Toggle buttons */}
          <div className="flex justify-center mb-6 space-x-4">
            <Link
              to="/signup"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Sign Up
            </Link>
            <button
              disabled
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              Log In
            </button>
          </div>

          <h1 className="text-3xl font-bold text-center">Travel TripNexa</h1>
          <p className="text-center text-gray-500">Journey Begins</p>

          {/* Google Login */}
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition"
            >
              <img src="/images/google.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <div className="text-center my-4 text-gray-400">or</div>

          {/* Email Login */}
          <form onSubmit={handleSubmit}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300"
            />

            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <label>
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-900"
            >
              Log In
            </button>
          </form>

          {error && (
            <div className="text-red-500 mt-3 text-center">{error}</div>
          )}
        </div>
      </div>

      {/* Right side - Image with overlay text */}
      <div className="hidden md:flex flex-1 relative">
        <img
          src="/images/login.jpg"
          alt="Travel"
          className="w-full h-screen object-cover"
        />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="text-2xl font-bold">Wander, Explore, Experience.</h2>
          <p className="mt-2 opacity-90">
            Discover new places, embrace adventures, and create unforgettable
            memories.
          </p>
        </div>
      </div>
    </div>
  );
}
