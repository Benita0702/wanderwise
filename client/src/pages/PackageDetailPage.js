// src/pages/PackageDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart } from "lucide-react";

function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [travelers, setTravelers] = useState(1);
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // helpers to parse Strapi rich text / strings into arrays or text
  const parseRichTextToLines = (input) => {
    if (!input) return [];
    // if already array of blocks (Strapi rich text)
    if (Array.isArray(input)) {
      return input
        .map((blk) => {
          if (blk?.children && Array.isArray(blk.children)) {
            return blk.children.map((c) => c.text || "").join("").trim();
          }
          if (typeof blk === "string") return blk.trim();
          if (blk?.text) return blk.text;
          // fallback
          return "";
        })
        .filter(Boolean);
    }
    if (typeof input === "string") {
      // remove HTML tags if any
      const cleaned = input.replace(/<\/?[^>]+(>|$)/g, "");
      // split on newlines
      return cleaned
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    // unknown structure
    return [];
  };

  const parseInclusionsExclusions = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map((i) => (typeof i === "string" ? i.trim() : String(i))).filter(Boolean);
    }
    if (typeof input === "string") {
      // try newline split first (Strapi often returns newline separated)
      const byNewline = input.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (byNewline.length > 1) return byNewline;
      // fallback to comma separated
      return input.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1337/api/tour-packages?populate=*`
        );

        const item = response.data.data.find(
          (pkg) => pkg.id === parseInt(packageId)
        );
        if (!item) {
          setPackageData(null);
          return;
        }

        // DESCRIPTION: join rich text blocks into a paragraph
        let descriptionText = "No description provided";
        if (Array.isArray(item.Description)) {
          descriptionText = item.Description
            .map((d) =>
              Array.isArray(d.children)
                ? d.children.map((c) => c.text || "").join(" ")
                : typeof d.text === "string"
                ? d.text
                : ""
            )
            .join("\n")
            .trim();
        } else if (typeof item.Description === "string") {
          descriptionText = item.Description;
        }

        // ITINERARY: convert to lines array (works with rich-text blocks or plain string)
        const itineraryLines = parseRichTextToLines(item.Itinerary || item.Itinerary_blocks || item.Itinerary || "");

        // INCLUSIONS / EXCLUSIONS: handle array or string
        const inclusionsArr = parseInclusionsExclusions(item.Inclusions);
        const exclusionsArr = parseInclusionsExclusions(item.Exclusions);

        setPackageData({
          id: item.id,
          title: item.Title?.replace(/“|”/g, "") || "Untitled Package",
          price: item.Price || 0,
          oldPrice: item.Discount || null, // if you store original price or discount value adjust accordingly
          duration: item.Duration_days || "N/A",
          type: item.Package_type || "N/A",
          description: descriptionText,
          inclusions: inclusionsArr,
          exclusions: exclusionsArr,
          itinerary: itineraryLines,
          images:
            item.Images?.data?.map(
              (img) => `http://localhost:1337${img.attributes.url}`
            ) || ["https://placehold.co/300x200?text=No+Image"],
          rating: item.Rating || null,
          reviews: item.reviews || null, // if you have reviews relation, keep it; otherwise null
        });
      } catch (err) {
        console.error("Error fetching package:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();

    // Load wishlist from localStorage
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(Array.isArray(stored) ? stored : []);
  }, [packageId]);

  const toggleWishlist = () => {
    if (!packageData) return;
    let updated = [...wishlist];
    const exists = updated.find((p) => p.id === packageData.id);

    if (exists) {
      updated = updated.filter((p) => p.id !== packageData.id);
    } else {
      updated.push({
        id: packageData.id,
        title: packageData.title,
        price: packageData.price,
        image: packageData.images?.[0] || "",
      });
    }

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  if (loading) return <p className="text-center mt-10">Loading package details...</p>;
  if (!packageData) return <p className="text-center mt-10">Package not found.</p>;

  const isWishlisted = wishlist.some((p) => p.id === packageData.id);

  // Price calculation (per person * travelers)
  const packageCost = Number(packageData.price || 0) * Number(travelers || 1);
  const taxes = Math.round(packageCost * 0.18); // example 18% tax
  const total = packageCost + taxes;

  // today for date min (prevent past)
  const todayISO = new Date().toISOString().split("T")[0];

  // whether to show reviews tab
  const hasReviews = Array.isArray(packageData.reviews) && packageData.reviews.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: main content (2 cols) */}
        <div className="md:col-span-2">
          {/* header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{packageData.title}</h1>
              <div className="text-gray-600 mt-1">
                {packageData.duration} days • {packageData.type}
              </div>
            </div>

            <div>
              <button
                onClick={toggleWishlist}
                className="p-2 rounded-full bg-white shadow hover:scale-110 transition"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`h-7 w-7 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                />
              </button>
            </div>
          </div>

          {/* top image */}
          <div className="mt-6 rounded-xl overflow-hidden shadow-sm">
            <img
              src={packageData.images[0]}
              alt={packageData.title}
              className="w-full h-56 object-cover"
            />
          </div>

          {/* tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("itinerary")}
                className={`py-3 ${activeTab === "itinerary" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
              >
                Itinerary
              </button>
              <button
                onClick={() => setActiveTab("inclusions")}
                className={`py-3 ${activeTab === "inclusions" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
              >
                Inclusions
              </button>
              {hasReviews && (
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`py-3 ${activeTab === "reviews" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
                >
                  Reviews
                </button>
              )}
            </nav>
          </div>

          {/* tab content */}
          <div className="mt-6 space-y-6">
            {activeTab === "overview" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-3">About This Package</h2>
                <p className="text-gray-700 whitespace-pre-line">{packageData.description}</p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Package Highlights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  <li>✅ Beautiful beach resort accommodation</li>
                  <li>✅ Water sports and adventure activities</li>
                  <li>✅ Guided sightseeing tours</li>
                  <li>✅ Delicious local cuisine</li>
                  <li>✅ Professional tour guide</li>
                  <li>✅ 24/7 customer support</li>
                </ul>
              </div>
            )}

            {activeTab === "itinerary" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Day-wise Itinerary</h2>
                {packageData.itinerary.length === 0 && (
                  <p className="text-gray-600">No itinerary details provided.</p>
                )}
                {packageData.itinerary.map((line, idx) => (
                  <div key={idx} className="border rounded-md p-4 mb-3">
                    {/* If the line already contains "Day", show as-is; otherwise number it */}
                    {/day\s*\d+/i.test(line) ? (
                      <div className="text-gray-800">{line}</div>
                    ) : (
                      <div>
                        <strong>Day {idx + 1}:</strong> <span className="text-gray-700 ml-2">{line}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "inclusions" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Inclusions & Exclusions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Inclusions</h3>
                    {packageData.inclusions.length === 0 ? (
                      <p className="text-gray-600">No inclusions provided.</p>
                    ) : (
                      <ul className="list-disc list-inside text-gray-700">
                        {packageData.inclusions.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Exclusions</h3>
                    {packageData.exclusions.length === 0 ? (
                      <p className="text-gray-600">No exclusions provided.</p>
                    ) : (
                      <ul className="list-disc list-inside text-gray-700">
                        {packageData.exclusions.map((exc, i) => (
                          <li key={i}>{exc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && hasReviews && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
                {packageData.reviews.map((r, i) => (
                  <div key={i} className="border-b pb-4 mb-4">
                    <div className="font-semibold">{r.user || "Guest"}</div>
                    <div className="text-gray-700">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: booking card (1 col) */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <div>
              <p className="text-2xl font-bold text-blue-600">₹{Number(packageData.price).toLocaleString()}</p>
              {packageData.oldPrice && (
                <div className="text-gray-400 line-through">₹{Number(packageData.oldPrice).toLocaleString()}</div>
              )}
              <div className="text-gray-500 text-sm mt-1">per person</div>
              {packageData.oldPrice && (
                <div className="mt-2 text-green-600 text-sm">Save ₹{(Number(packageData.oldPrice) - Number(packageData.price)).toLocaleString()}</div>
              )}
            </div>

            {/* date */}
            <label className="block mt-4 text-sm font-medium">Travel Date</label>
            <input
              type="date"
              value={date}
              min={todayISO}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />

            {/* travelers */}
            <label className="block mt-4 text-sm font-medium">Number of Travelers</label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value, 10))}
              className="w-full border rounded-md px-3 py-2 mt-1"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Adult" : "Adults"}
                </option>
              ))}
            </select>

            {/* price breakdown */}
            <div className="mt-4 text-sm text-gray-700">
              <div>Package cost: ₹{packageCost.toLocaleString()}</div>
              <div>Taxes & fees: ₹{taxes.toLocaleString()}</div>
              <div className="font-bold mt-2">Total: ₹{total.toLocaleString()}</div>
            </div>

            <button
              onClick={() => navigate(`/booking/${packageId}`)}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white w-full py-3 rounded-lg font-semibold"
            >
              Book Now
            </button>

            {/* WhatsApp support */}
            <div className="mt-6">
              <p className="text-gray-700 font-medium">Need Help?</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageDetailPage;
