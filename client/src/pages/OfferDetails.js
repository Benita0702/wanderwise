import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import axios from "axios";
import { STRAPI_URL } from "../api";
import PackageCard from "../components/PackageCard";
import renderRichText from "../utils/renderRichText";
import { Link } from "react-router-dom";

function OfferDetails() {
  const { slug } = useParams();
  const navigate = useNavigate(); // ✅ initialize navigate
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await axios.get(
          `${STRAPI_URL}/api/offers?filters[slug][$eq]=${slug}&populate[0]=Image&populate[1]=tour_packages.Images`
        );
        if (res.data.data.length > 0) setOffer(res.data.data[0]);
      } catch (err) {
        console.error("Error fetching offer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [slug]);

  if (loading) return <p className="text-center py-10">Loading offer...</p>;
  if (!offer) return <p className="text-center py-10">Offer not found.</p>;

  const discount = offer.Discount || 0;

  const formattedPackages =
    offer.tour_packages?.map((pkg) => {
      const originalPrice = pkg.Price || 0;
      const discountedPrice =
        discount > 0
          ? Math.round(originalPrice - (originalPrice * discount) / 100)
          : originalPrice;

      return {
        id: pkg.id,
        title: pkg.Title || "No Title",
        price: discountedPrice,
        discount: discount > 0 ? originalPrice : null,
        image:
          pkg.Images?.[0]?.url
            ? `${STRAPI_URL}${pkg.Images[0].url}`
            : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60",
        location: pkg.Location || "Destination",
        duration: pkg.Duration_days || 0,
        rating: pkg.Rating || 4.5,
      };
    }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ✅ Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mb-4 text-gray-600 hover:text-blue-600 flex items-center"
      >
        ← Back to Home
      </button>

      {offer.Image?.[0]?.url && (
        <img
          src={`${STRAPI_URL}${offer.Image[0].url}`}
          alt={offer.Title}
          className="w-full h-72 object-cover rounded-lg mb-8 shadow-lg"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{offer.Title}</h1>
      {discount > 0 && (
        <p className="text-xl text-red-600 font-semibold mb-6">
          Save {discount}%! (Valid until{" "}
          {new Date(offer.valid_till).toLocaleDateString()})
        </p>
      )}

      <div className="prose max-w-none mb-12">
        {renderRichText(offer.Description)}
      </div>

      <h2 className="text-3xl font-bold mb-6">Included Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {formattedPackages.map((pkg) => (
    <Link key={pkg.id} to={`/packages/${pkg.id}`}>
      <PackageCard
        id={pkg.id}
        title={pkg.title}
        price={pkg.price}
        discount={pkg.discount}
        image={pkg.image}
        location={pkg.location}
        duration={pkg.duration}
        rating={pkg.rating}
        // Pass wishlist props if you have functionality
        isWishlisted={false} 
        onWishlistToggle={() => {}}
      />
    </Link>
  ))}
</div>

    </div>
  );
}

export default OfferDetails;
