import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { STRAPI_URL } from "../api";
import PackageCard from "../components/PackageCard";
import renderRichText from "../utils/renderRichText"; // Assuming you have this utility

function OfferDetails() {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        // ✅ FIX: Use the correct indexed syntax for multiple populates
        const res = await axios.get(
          `${STRAPI_URL}/api/offers?filters[slug][$eq]=${slug}&populate[0]=Image&populate[1]=tour_packages.Images`
        );
        if (res.data.data.length > 0) {
          setOffer(res.data.data[0]);
        }
      } catch (err)
      {
        console.error("Error fetching offer:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [slug]);

  const handleDateChange = (packageId, date) => {
    setSelectedDates(prev => ({ ...prev, [packageId]: date }));
  };

  if (loading) return <p className="text-center py-10">Loading offer...</p>;
  if (!offer) return <p className="text-center py-10">Offer not found.</p>;

  // ✅ FIX: Transform nested tour_packages data to match what PackageCard expects
  const formattedPackages = offer.tour_packages?.map((pkg) => ({
    id: pkg.id,
    title: pkg.Title || "No Title",
    price: pkg.Price || 0,
    image:
      pkg.Images && pkg.Images.length > 0
        ? `${STRAPI_URL}${pkg.Images[0].url}`
        : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60",
    location: pkg.Location || "Destination",
    duration: pkg.Duration_days || 0,
    rating: pkg.Rating || 4.5,
  })) || [];


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {offer.Image && offer.Image.length > 0 && (
        <img
          src={`${STRAPI_URL}${offer.Image[0].url}`}
          alt={offer.Title}
          className="w-full h-72 object-cover rounded-lg mb-8 shadow-lg"
        />
      )}
      <h1 className="text-4xl font-bold mb-4">{offer.Title}</h1>
      <p className="text-xl text-red-600 font-semibold mb-6">
        Save {offer.Discount}%! (Valid until {new Date(offer.valid_till).toLocaleDateString()})
      </p>

      <div className="prose max-w-none mb-12">
        {renderRichText(offer.Description)}
      </div>

      <h2 className="text-3xl font-bold mb-6">Included Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {formattedPackages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            {...pkg}
            selectedDate={selectedDates[pkg.id]}
            onDateChange={handleDateChange}
            // Add dummy functions for wishlist if not available in this context
            isWishlisted={false}
            toggleWishlist={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

export default OfferDetails;