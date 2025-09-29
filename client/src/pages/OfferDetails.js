// src/pages/OfferDetails.js
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { STRAPI_URL } from "../api";
import renderRichText from "../utils/renderRichText";

export default function OfferDetails() {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffer() {
      try {
        setLoading(true);
        const res = await fetch(
          `${STRAPI_URL}/api/offers?filters[slug][$eq]=${slug}&populate[tour_packages][populate]=Images`
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Error ${res.status}: ${errorData.error?.message || 'Failed to fetch'}`);
        }
        
        const data = await res.json();

        if (data.data?.length > 0) {
          setOffer(data.data[0]); // The API response is an array, so we take the first element
        } else {
          setError("Offer not found");
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
        setError(err.message || "Something went wrong while loading the offer.");
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [slug]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!offer) return <p className="p-8 text-center">Offer data is not available.</p>;

  // ✅ **FIX: Accessing fields directly from the 'offer' object**
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">{offer.Title}</h1>
      {offer.Description && (
        <div className="text-gray-600 mt-2 prose">
          {renderRichText(offer.Description)}
        </div>
      )}
      <p className="text-red-600 font-bold mt-3">
        Save {offer.Discount}%!
      </p>

      <h2 className="text-2xl font-semibold mt-8 border-b pb-2">Packages in this offer:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {offer.tour_packages?.length > 0 ? (
          offer.tour_packages.map((pkg) => (
            <div
              key={pkg.id}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{pkg.Title}</h3>

              {pkg.Images?.url ? (
                <img
                  src={`${STRAPI_URL}${pkg.Images.url}`}
                  alt={pkg.Title}
                  className="h-40 w-full object-cover rounded-md my-3"
                />
              ) : (
                <div className="h-40 w-full bg-gray-200 rounded-md my-3 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
                
              <div className="text-gray-700 prose line-clamp-3">
                {renderRichText(pkg.Description)}
              </div>
              
              <p className="text-blue-600 font-semibold mt-2">
                ₹{pkg.Price}
              </p>

              <Link
                to={`/packages/${pkg.id}`}
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Package
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-4 col-span-full">
            No packages are linked to this offer yet.
          </p>
        )}
      </div>
    </div>
  );
}