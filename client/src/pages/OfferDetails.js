// src/pages/OfferDetails.js
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { STRAPI_URL } from "../api";

export default function OfferDetails() {
  const { slug } = useParams();
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/offer?filters[slug][$eq]=${slug}&populate=packages,packages.image`
        );
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        if (data.data?.length > 0) {
          setOffer(data.data[0]);
        } else {
          setError("Offer not found");
        }
      } catch (err) {
        console.error("Error fetching offer:", err);
        setError("Something went wrong while loading the offer.");
      }
    }
    fetchOffer();
  }, [slug]);

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!offer) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Offer Details */}
      <h1 className="text-3xl font-bold">{offer.attributes.Title}</h1>
      {offer.attributes.Description && (
        <p className="text-gray-600 mt-2">{offer.attributes.Description}</p>
      )}
      <p className="text-red-600 font-bold mt-3">
        Save {offer.attributes.Discount}%!
      </p>

      {/* Related Packages */}
      <h2 className="text-2xl font-semibold mt-8">Packages in this offer:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {offer.attributes.packages?.data?.length > 0 ? (
          offer.attributes.packages.data.map((pkg) => (
            <div
              key={pkg.id}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{pkg.attributes.Title}</h3>

              {/* Package Image */}
              {pkg.attributes.image?.data && (
                <img
                  src={`${STRAPI_URL}${pkg.attributes.image.data.attributes.url}`}
                  alt={pkg.attributes.Title}
                  className="h-40 w-full object-cover rounded-md my-3"
                />
              )}

              <p className="text-gray-700">{pkg.attributes.Description}</p>
              <p className="text-blue-600 font-semibold mt-2">
                ₹{pkg.attributes.Price}
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
          <p className="text-gray-500 mt-4">
            No packages are linked to this offer yet.
          </p>
        )}
      </div>
    </div>
  );
}
