import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const PackageCard = ({
  id,
  title,
  price,
  description,
  image,
  duration,
  location,
  isWishlisted,
  toggleWishlist,
}) => {
  return (
    <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <button
          onClick={() =>
            toggleWishlist({ id, title, price, description, image, duration, location })
          }
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:scale-110 transition"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-blue-600 font-bold">₹{price}</span>
          <span className="text-gray-500 text-sm">{duration} Days</span>
        </div>

        {/* View Details */}
        <div className="mt-4">
          <Link
            to={`/packages/${id}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
