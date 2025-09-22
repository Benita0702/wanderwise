// src/pages/SignupPage.js
import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { signup, STRAPI_URL } from "../api";
import { AuthContext } from "../context/AuthContext";

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { user, setUser } = useContext(AuthContext);
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
      const res = await signup(formData.username, formData.email, formData.password);

      // ✅ Save token in cookies
      Cookies.set("token", res.data.jwt, {
        expires: 3650,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("user", JSON.stringify(res.data.user), { expires: 3650 });

      // ✅ Save in localStorage also
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem("username", res.data.user.username);

      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Signup failed");
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
      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Toggle buttons */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              disabled
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Sign Up
            </button>
            <Link
              to="/login"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Log In
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-center">Travel TripNexa</h1>
          <p className="text-center text-gray-500">Create Account</p>

          {/* Google Signup */}
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <input
              name="username"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Sign Up
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
          <h2 className="text-2xl font-bold">Escape the Ordinary</h2>
          <p className="mt-2 opacity-90">
            Embrace the journey and experience the world your way.
          </p>
        </div>
      </div>
    </div>
  );
}
