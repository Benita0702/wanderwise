// PackageDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, ChevronLeft, ChevronRight, Save, Share2, ArrowLeft } from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import MultiStepModal from "../components/MultiStepModal";

function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [reviews, setReviews] = useState([]);

  const todayISO = new Date().toISOString().split("T")[0];

  // ----- Helpers to support different Strapi shapes -----
  const getAttr = (item, key) => {
    // item might be { attributes: { ... } } or direct { Title: ... }
    return (item && item.attributes && item.attributes[key] !== undefined)
      ? item.attributes[key]
      : item?.[key];
  };

  const getImages = (item) => {
    // Support:
    // - item.Images as array of { url } (older style)
    // - item.attributes.Images.data -> [{ attributes: { url } }]
    const imagesFromAttributes = item?.attributes?.Images?.data;
    if (Array.isArray(imagesFromAttributes)) {
      return imagesFromAttributes.map(i => {
        const url = i?.attributes?.url || i?.attributes?.formats?.thumbnail?.url || "";
        return url ? `http://localhost:1337${url}` : null;
      }).filter(Boolean);
    }

    const imagesDirect = item?.Images;
    if (Array.isArray(imagesDirect) && imagesDirect.length > 0) {
      // each might be { url } or { attributes: { url } }
      return imagesDirect.map(img => {
        if (!img) return null;
        if (img.url) return `http://localhost:1337${img.url}`;
        if (img.attributes?.url) return `http://localhost:1337${img.attributes.url}`;
        return null;
      }).filter(Boolean);
    }

    return [];
  };

  const parseRichTextToLines = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input
        .map((blk) => {
          if (blk?.children) return blk.children.map(c => c.text || "").join("").trim();
          if (typeof blk === "string") return blk.trim();
          if (blk?.text) return blk.text;
          return "";
        })
        .filter(Boolean);
    }
    if (typeof input === "string") {
      return input.replace(/<\/?[^>]+(>|$)/g, "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const parseInclusionsExclusions = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(i => String(i).trim()).filter(Boolean);
    if (typeof input === "string") {
      const byNewline = input.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      return byNewline.length > 1 ? byNewline : input.split(",").map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // ----- Fetch offers (separately) -----
  // Accepts basePrice so we can compute percentage/flat correctly.
  const fetchOffersForPackage = async (pkgId, basePrice) => {
    try {
      const res = await axios.get(
  `http://localhost:1337/api/offers?populate=tour_packages&filters[tour_packages][id][$in]=${pkgId}`
);



      if (!res?.data?.data) return [];

      const offers = res.data.data.map(o => {
        const attrs = o.attributes || {};
        const discRaw = attrs.Discount ?? 0;
        const discount = Number(discRaw) || 0;

        // Determine if offer is currently valid (if valid_till exists)
        let valid = true;
        if (attrs.valid_till) {
          const validUntil = new Date(attrs.valid_till);
          valid = !isNaN(validUntil.getTime()) ? validUntil >= new Date() : true;
        }

        // compute final price (supports percentage if 0<discount<100 else fixed)
        let finalPrice = Number(basePrice || 0);
        let oldPrice = null;
        let discountText = "";

        if (discount > 0) {
          if (discount > 0 && discount < 100) {
            // percentage
            finalPrice = Math.round(finalPrice - (finalPrice * discount) / 100);
            oldPrice = Number(basePrice || 0);
            discountText = `${discount}% OFF`;
          } else {
            // treat as flat amount
            finalPrice = Math.max(finalPrice - discount, 0);
            oldPrice = Number(basePrice || 0);
            discountText = `Save ₹${discount}`;
          }
        }

        return {
          id: o.id,
          title: attrs.Title || "",
          discount,
          discountText,
          finalPrice,
          oldPrice,
          valid,
          valid_till: attrs.valid_till || null,
          imageUrls: (() => {
            // handle offer Image field if present (attrs.Image)
            const imgs = attrs.Image;
            if (!imgs) return [];
            // If attrs.Image is an array of objects with url: handle both shapes
            if (Array.isArray(imgs)) {
              return imgs.map(im => im?.url ? `http://localhost:1337${im.url}` : (im?.attributes?.url ? `http://localhost:1337${im.attributes.url}` : null)).filter(Boolean);
            }
            // single object?
            if (imgs?.data) {
              return imgs.data.map(d => {
                const url = d?.attributes?.url;
                return url ? `http://localhost:1337${url}` : null;
              }).filter(Boolean);
            }
            return [];
          })()
        };
      });

      // return only valid offers (not expired) by default
      return offers.filter(o => o.valid);
    } catch (err) {
      console.error("fetchOffersForPackage error:", err);
      return [];
    }
  };

  // ----- Fetch package (working API) then offers separately -----
  useEffect(() => {
    let cancelled = false;

    const fetchPackage = async () => {
      try {
        const res = await axios.get(
          "http://localhost:1337/api/tour-packages?populate=Images&pagination[limit]=100"
        );

        console.log("Response:", res.data);

        const all = res?.data?.data || [];

        console.log("Fetched packages count:", all.length); // ✅ add this too

        // find by numeric id - packageId from params is string
        const item = all.find(pkg => Number(pkg.id) === Number(packageId));

        console.log("Matching package:", item); 

        console.log("packageId from params:", packageId);


        if (!item) {
          if (!cancelled) {
            setPackageData(null);
            setLoading(false);
          }
          return;
        }

        // read fields safely (support both direct and attributes)
        const title = getAttr(item, "Title") || "Untitled Package";
        const basePrice = Number(getAttr(item, "Price") ?? 0);
        const duration = getAttr(item, "Duration_days") ?? "N/A";
        const type = getAttr(item, "Package_type") ?? "N/A";
        const rawDescription = getAttr(item, "Description") ?? "";
        const descriptionText = Array.isArray(rawDescription)
          ? rawDescription.map(d => Array.isArray(d.children) ? d.children.map(c => c.text || "").join(" ") : d.text || "").join("\n").trim()
          : rawDescription;
        const itineraryLines = parseRichTextToLines(getAttr(item, "Itinerary") || getAttr(item, "Itinerary_blocks") || "");
        const inclusionsArr = parseInclusionsExclusions(getAttr(item, "Inclusions"));
        const exclusionsArr = parseInclusionsExclusions(getAttr(item, "Exclusions"));
        const images = getImages(item);
        const imagesToUse = images.length > 0 ? images : ["https://placehold.co/300x200?text=No+Image"];

        // set initial package (offers will be added next)
        if (!cancelled) {
          setPackageData({
            id: item.id,
            title,
            price: basePrice,
            oldPrice: null,
            discountText: "",
            duration,
            type,
            description: descriptionText || "No description provided",
            inclusions: inclusionsArr,
            exclusions: exclusionsArr,
            itinerary: itineraryLines,
            images: imagesToUse,
            offers: []
          });
        }

        // fetch offers separately and attach (use basePrice)
        // fetch offers separately and attach (use basePrice)
const offersArr = await fetchOffersForPackage(item.id, basePrice);

let finalPrice = basePrice;
let oldPrice = null;
let discountText = "";

if (offersArr.length > 0) {
  const best = offersArr.reduce((prev, curr) =>
    curr.finalPrice < prev.finalPrice ? curr : prev
  );
  finalPrice = best.finalPrice;
  oldPrice = best.oldPrice;
  discountText = best.discountText;
}

if (!cancelled) {
  setPackageData(prev => ({
    ...prev,
    offers: offersArr,
    price: finalPrice,
    oldPrice,
    discountText
  }));
}

      } catch (err) {
        console.error("Error fetching package:", err);
        if (!cancelled) setPackageData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    
    fetchPackage();

    // load wishlist
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(Array.isArray(stored) ? stored : []);

    return () => {
      cancelled = true;
    };
  }, [packageId]);




  // ----- Testimonials fetch (unchanged) -----
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get("http://localhost:1337/api/testimonials", {
          params: {
            "filters[tour_packages][id][$eq]": packageId,
            "populate[0]": "user_profiles",
            "populate[1]": "tour_packages",
          },
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });
        setReviews(res.data.data || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setReviews([]);
      }
    };
    fetchTestimonials();
  }, [packageId, user]);

  // ----- Wishlist toggle (unchanged) -----
  const toggleWishlist = () => {
    if (!packageData) return;
    let updated = [...wishlist];
    const exists = updated.find(p => p.id === packageData.id);

    if (exists) updated = updated.filter(p => p.id !== packageData.id);
    else updated.push({ id: packageData.id, title: packageData.title, price: packageData.price, image: packageData.images?.[0] });

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // ----- Add/Delete testimonial (unchanged) -----
  const addTestimonial = async () => {
    if (!user) return alert("You must be logged in to add a review");
    if (!newReview.trim()) return;

    try {
      const res = await axios.post("http://localhost:1337/api/testimonials", {
        data: { comment: newReview.trim(), tour_package: parseInt(packageId, 10), user: user.id }
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setReviews(prev => [...prev, res.data.data]);
      setNewReview("");
    } catch (err) {
      console.error("Error adding testimonial:", err);
      alert("Failed to add review. Check permissions.");
    }
  };

  const deleteTestimonial = async (testimonialId, testimonialUserId) => {
    if (!user || user.id !== testimonialUserId) return alert("You can only delete your own reviews");
    try {
      await axios.delete(`http://localhost:1337/api/testimonials/${testimonialId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(prev => prev.filter(r => r.id !== testimonialId));
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert("Failed to delete review.");
    }
  };

  // ----- Image slider helpers (unchanged) -----
  const nextImage = () => setCurrentImage(prev => (prev + 1) % (packageData?.images?.length || 1));
  const prevImage = () => setCurrentImage(prev => prev === 0 ? (packageData.images.length - 1) : prev - 1);

  // ----- Booking / share / save (unchanged) -----
  const handleBookNow = () => {
    if (!date) return alert("Please select a travel date");
    navigate(`/booking/${packageId}/${date}`);
  };
  const handleSave = () => alert("Package saved!");
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Package link copied!"); };

  if (loading) return <p className="text-center mt-10">Loading package details...</p>;
  if (!packageData) return <p className="text-center mt-10">Package not found.</p>;

  const isWishlisted = wishlist.some(p => p.id === packageData.id);

  // ----- Determine best offer (lowest finalPrice) among valid offers -----
  const offers = Array.isArray(packageData.offers) ? packageData.offers : [];
  const validOffers = offers.filter(o => o.valid);

  let activeOffer = null;
  if (validOffers.length > 0) {
    activeOffer = validOffers.reduce((best, cur) => {
      const curPrice = Number(cur.finalPrice || 0);
      const bestPrice = best ? Number(best.finalPrice || 0) : Infinity;
      return curPrice < bestPrice ? cur : best;
    }, null);
  }

  const displayPrice = activeOffer?.finalPrice ?? Number(packageData.price || 0);
  const displayOldPrice = activeOffer?.oldPrice ?? null;
  const displayDiscountText = activeOffer?.discountText ?? "";


  const taxes = Math.round(displayPrice * 0.10);
  const total = displayPrice + taxes;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/packages")} className="flex items-center text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Packages
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Package Details */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{packageData.title}</h1>
              <div className="text-gray-600 mt-1">{packageData.duration} days • {packageData.type}</div>
            </div>
            <button onClick={toggleWishlist} className="p-2 rounded-full bg-white shadow hover:scale-110 transition">
              <Heart className={`h-7 w-7 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
            </button>
          </div>

          {/* Image Slider */}
          <div className="mt-6 relative rounded-xl overflow-hidden shadow-sm">
            <img src={packageData.images[currentImage]} alt={packageData.title} className="w-full object-contain rounded-xl" />
            {packageData.images.length > 1 && <>
              <button onClick={prevImage} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white p-2 rounded-full shadow"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={nextImage} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white p-2 rounded-full shadow"><ChevronRight className="w-6 h-6" /></button>
            </>}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-6">
              {["overview", "itinerary", "inclusions", "reviews"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 ${activeTab===tab?"text-blue-600 border-b-2 border-blue-600":"text-gray-600"}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6 space-y-6">
            {activeTab==="overview" && <div className="bg-white rounded-lg p-6 shadow-sm"><p className="text-gray-700 whitespace-pre-line">{packageData.description}</p></div>}
            {activeTab==="itinerary" && <div className="bg-white rounded-lg p-6 shadow-sm">
              {packageData.itinerary.length===0 ? <p>No itinerary details provided.</p> : packageData.itinerary.map((line, idx) => (
                <div key={idx} className="border rounded-md p-4 mb-3">{line}</div>
              ))}
            </div>}
            {activeTab==="inclusions" && <div className="bg-white rounded-lg p-6 shadow-sm grid md:grid-cols-2 gap-6">
              <div><h3 className="font-semibold mb-2">Inclusions</h3>
                {packageData.inclusions.length===0 ? <p>No inclusions.</p> : <ul>{packageData.inclusions.map((i,j)=><li key={j}>{i}</li>)}</ul>}
              </div>
              <div><h3 className="font-semibold mb-2">Exclusions</h3>
                {packageData.exclusions.length===0 ? <p>No exclusions.</p> : <ul>{packageData.exclusions.map((i,j)=><li key={j}>{i}</li>)}</ul>}
              </div>
            </div>}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  reviews
                    .filter(r => r && r.attributes)
                    .map(r => {
                      const comment = r.attributes?.comment || "No comment provided";
                      const reviewUser =
                        r.attributes?.user_profiles?.data?.attributes?.name ||
                        r.attributes?.user?.data?.attributes?.name ||
                        "Guest";
                      const reviewUserId =
                        r.attributes?.user_profiles?.data?.id ||
                        r.attributes?.user?.data?.id;

                      return (
                        <div key={r.id} className="border-b pb-4 mb-4 flex justify-between">
                          <div>
                            <div className="font-semibold">{reviewUser}</div>
                            <div>{comment}</div>
                          </div>
                          {user?.id === reviewUserId && (
                            <button
                              onClick={() => deleteTestimonial(r.id, reviewUserId)}
                              className="text-red-500 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      );
                    })
                )}

                {user ? (
                  <>
                    <textarea
                      value={newReview}
                      onChange={e => setNewReview(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 mb-2"
                      placeholder="Write your review..."
                    />
                    <button
                      onClick={addTestimonial}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                      Add Review
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500 mt-2">Log in to add a review.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Booking Card */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <div className="text-2xl font-bold text-blue-600">₹{displayPrice.toLocaleString()}</div>
            {displayOldPrice && displayOldPrice !== displayPrice && (
              <div className="text-gray-400 line-through">₹{displayOldPrice.toLocaleString()}</div>
            )}
            <div className="text-gray-500 text-sm mt-1">per person</div>
            {displayDiscountText && <div className="mt-2 text-green-600 text-sm">{displayDiscountText}</div>}

            {/* Show all offers briefly (optional) */}
            {offers.length > 0 && (
              <div className="bg-yellow-50 border rounded-lg p-3 mb-4">
  <h3 className="font-semibold mb-2">Offers</h3>
  {packageData?.offers?.length > 0 ? (
    packageData.offers.map((offer, idx) => (
      <div key={idx}>
        <p className="text-sm font-medium text-gray-700">
          {offer.Title || offer.title || "Special Offer"}
        </p>
        {offer.Discount && (
          <p className="text-green-600 font-semibold">
            {offer.Discount}% OFF
          </p>
        )}
        {offer.Description && (
          <p className="text-gray-600 text-sm mt-1">
            {offer.Description}
          </p>
        )}
      </div>
    ))
  ) : (
    <p>No current offers</p>
  )}
</div>

            )}

            {/* Date Picker */}
            <label className="block mt-4 text-sm font-medium">Travel Date</label>
            <input
              type="date"
              value={date || todayISO}
              onChange={e => setDate(e.target.value)}
              min={todayISO}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />

            <div className="mt-4 text-sm text-gray-700">
              <div>Package cost: ₹{displayPrice.toLocaleString()}</div>
              <div>Taxes & fees: ₹{taxes.toLocaleString()}</div>
              <div className="font-bold mt-2">Total: ₹{total.toLocaleString()}</div>
            </div>

            <button onClick={handleBookNow} className="mt-6 bg-orange-500 hover:bg-orange-600 text-white w-full py-3 rounded-lg font-semibold">Book Now</button>
            <button onClick={()=>setIsModalOpen(true)} className="mt-3 bg-blue-500 hover:bg-blue-600 text-white w-full py-3 rounded-lg font-semibold">Customize Package</button>
            <MultiStepModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} />

            <div className="flex justify-between mt-4">
              <button onClick={handleSave} className="flex items-center space-x-1 text-green-600"><Save className="w-5 h-5" /> <span>Save</span></button>
              <button onClick={handleShare} className="flex items-center space-x-1 text-blue-600"><Share2 className="w-5 h-5" /> <span>Share</span></button>
            </div>

            <div className="mt-6">
              <p className="text-gray-700 font-medium">Need Help?</p>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="block mt-3 bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg">WhatsApp Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageDetailPage;
