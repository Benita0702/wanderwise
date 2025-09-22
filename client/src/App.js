import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import PlannerPage from "./pages/PlannerPage";
import MyItineraries from "./components/profile/MyItineraries";
import ItineraryDetail from "./components/ItineraryDetail";
import PackagesPage from "./pages/PackagesPage";
import PackageDetailPage from "./pages/PackageDetailPage";
import DashboardPage from "./pages/DashboardPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import BlogPage from "./pages/BlogPage";
import BlogDetails from "./pages/BlogDetails";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import MyBookingsPage from "./pages/BookingPage";
import WishlistPage from "./components/profile/WishlistPage";
import MyBooking from "./components/profile/MyBooking";


function Layout({ children }) {
  const location = useLocation();
  const hideLayout = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {/* Only add pt-16 if NOT home page */}
      <div className={!hideLayout && location.pathname !== "/" ? "pt-16" : ""}>
        {children}
      </div>
      {!hideLayout && <Footer />}
    </>
  );
}


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:packageId" element={<PackageDetailPage />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/my-bookings" element={<MyBooking />} />


          <Route path="/itineraries" element={

            <ProtectedRoute>
              <MyItineraries />
            </ProtectedRoute>
          } />

          <Route
            path="/itinerary/:id"
            element={
              <ProtectedRoute>
                <ItineraryDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:packageId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
