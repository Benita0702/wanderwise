// src/components/PackageCard.js
import React from "react";
import { Heart, MapPin, Star } from "lucide-react";

const PackageCard = ({
  id,
  title,
  price,
  discount,
  category,
  description,
  image,
  location,
  duration,
  rating,
  isWishlisted,
  onWishlistToggle,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 relative">
      {/* Wishlist Heart */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onWishlistToggle(id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full ${
          isWishlisted ? "bg-red-100 text-red-500" : "bg-white text-gray-600"
        } hover:scale-110 transition`}
      >
        <Heart
          size={18}
          className={isWishlisted ? "fill-red-500 text-red-500" : ""}
        />
      </button>

      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover"
      />

      {/* Card Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin size={14} />
          <span>{location}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-3">{duration} Days Tour</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{rating}</span>
        </div>

        {/* ✅ Discount & Price Display */}
        <div className="flex items-baseline gap-2 mb-4">
          {discount ? (
            <>
              <span className="text-gray-400 line-through text-sm">
                ₹{discount.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-blue-600">
                ₹{price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              ₹{price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Button */}
        <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          View Details
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
