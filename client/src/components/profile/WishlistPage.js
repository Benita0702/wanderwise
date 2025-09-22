import React, { useEffect, useState } from "react";
import PackageCard from "../PackageCard"; // ✅ Correct import
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(Array.isArray(stored) ? stored : []);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((p) => p.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  if (!wishlist.length) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <p className="text-center text-gray-600">
          Your wishlist is empty.{" "}
          <Link to="/packages" className="text-blue-600 hover:underline">
            Browse packages
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist ❤️</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((pkg) => (
          <PackageCard
            key={pkg.id}
            {...pkg}
            isWishlisted={true}
            toggleWishlist={() => removeFromWishlist(pkg.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
