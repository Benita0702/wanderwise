import React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Star } from "lucide-react";

function PackageCard({
  id,
  title,
  price,
  image,
  discount,
  location,
  duration,
  rating,
  isWishlisted,
  toggleWishlist,
  selectedDate,
  onDateChange
}) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => toggleWishlist({ id, title, price, image })}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white"
        >
          <Heart
            className={`w-6 h-6 ${
              isWishlisted ? "text-red-500 fill-current" : "text-gray-700"
            }`}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> {location}
          </span>
          <span className="text-sm font-semibold flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" /> {rating}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex-grow">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{duration} Days Tour</p>

        {/* ✅ Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Start Date
          </label>
          <input
            type="date"
            value={selectedDate || today}
            onChange={(e) => onDateChange(id, e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div>
            {discount && (
              <span className="text-sm text-gray-500 line-through mr-2">
                ₹{discount.toLocaleString()}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              ₹{price.toLocaleString()}
            </span>
          </div>
          <Link
            to={`/booking/${id}/${selectedDate || today}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PackageCard;