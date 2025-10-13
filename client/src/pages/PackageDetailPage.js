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
  const [travelers, setTravelers] = useState(1);
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newReview, setNewReview] = useState("");
  const [reviews, setReviews] = useState([]);

  const todayISO = new Date().toISOString().split("T")[0];

  // --- Helper functions ---
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

  // --- Fetch Package ---
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(
          "http://localhost:1337/api/tour-packages?populate=Images&pagination[limit]=100"
        );
        const item = res.data.data.find(pkg => pkg.id === parseInt(packageId));
        if (!item) {
          setPackageData(null);
          return;
        }

        const descriptionText = Array.isArray(item.Description)
          ? item.Description.map(d => Array.isArray(d.children) ? d.children.map(c => c.text || "").join(" ") : d.text || "").join("\n").trim()
          : item.Description || "No description provided";

        const itineraryLines = parseRichTextToLines(item.Itinerary || item.Itinerary_blocks || "");
        const inclusionsArr = parseInclusionsExclusions(item.Inclusions);
        const exclusionsArr = parseInclusionsExclusions(item.Exclusions);

        setPackageData({
          id: item.id,
          title: item.Title?.replace(/“|”/g, "") || "Untitled Package",
          price: item.Price || 0,
          oldPrice: item.Discount || null,
          duration: item.Duration_days || "N/A",
          type: item.Package_type || "N/A",
          description: descriptionText,
          inclusions: inclusionsArr,
          exclusions: exclusionsArr,
          itinerary: itineraryLines,
          images: Array.isArray(item.Images) && item.Images.length > 0
            ? item.Images.map(img => `http://localhost:1337${img.url}`)
            : ["https://placehold.co/300x200?text=No+Image"],
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

  // --- Fetch Testimonials ---
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
    if (err.response?.status === 401) {
      console.warn("Testimonials are restricted. Please log in to view.");
      setReviews([]);
    }
  }
};

// --- Fetch on load ---
useEffect(() => {
  fetchTestimonials();
}, [packageId, user]);


  // --- Wishlist ---
  const toggleWishlist = () => {
    if (!packageData) return;
    let updated = [...wishlist];
    const exists = updated.find(p => p.id === packageData.id);

    if (exists) updated = updated.filter(p => p.id !== packageData.id);
    else updated.push({ id: packageData.id, title: packageData.title, price: packageData.price, image: packageData.images[0] });

    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  // --- Add / Delete Review ---
  const addTestimonial = async () => {
  if (!user) return alert("You must be logged in to add a review");
  if (!newReview.trim()) return;

  try {
    const res = await axios.post("http://localhost:1337/api/testimonials", {
      data: { comment: newReview.trim(), tour_package: parseInt(packageId, 10), user: user.id }
    }, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    setReviews([...reviews, res.data.data]);
    setNewReview("");
  } catch (err) {
    console.error("Error adding testimonial:", err);
    alert("Failed to add review. Make sure your Strapi permissions allow adding testimonials.");
  }
};


  const deleteTestimonial = async (testimonialId, testimonialUserId) => {
  if (!user || user.id !== testimonialUserId) return alert("You can only delete your own reviews");

  try {
    await axios.delete(`http://localhost:1337/api/testimonials/${testimonialId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    setReviews(reviews.filter(r => r.id !== testimonialId));
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    alert("Failed to delete review. Check your Strapi permissions.");
  }
};


  // --- Image Slider ---
  const nextImage = () => setCurrentImage(prev => (prev + 1) % packageData.images.length);
  const prevImage = () => setCurrentImage(prev => prev === 0 ? packageData.images.length - 1 : prev - 1);

  // --- Booking / Share / Save ---
  const handleBookNow = () => user ? navigate(`/booking/${packageId}`) : navigate("/login");
  const handleSave = () => alert("Package saved!");
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Package link copied!"); };

  if (loading) return <p className="text-center mt-10">Loading package details...</p>;
  if (!packageData) return <p className="text-center mt-10">Package not found.</p>;

  const isWishlisted = wishlist.some(p => p.id === packageData.id);
  const packageCost = Number(packageData.price) * Number(travelers);
  const taxes = Math.round(packageCost * 0.10);
  const total = packageCost + taxes;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/packages")} className="flex items-center text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Packages
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Package Details */}
        <div className="md:col-span-2">
          {/* Header */}
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
  .filter(r => r && r.attributes) // ✅ filter out bad or empty items
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
            <div className="text-2xl font-bold text-blue-600">₹{Number(packageData.price).toLocaleString()}</div>
            {packageData.oldPrice && <div className="text-gray-400 line-through">₹{Number(packageData.oldPrice).toLocaleString()}</div>}
            <div className="text-gray-500 text-sm mt-1">per person</div>
            <div className="mt-2 text-green-600 text-sm">{packageData.oldPrice ? `Save ₹${(Number(packageData.oldPrice)-Number(packageData.price)).toLocaleString()}` : ""}</div>

            <label className="block mt-4 text-sm font-medium">Travel Date</label>
            <input type="date" min={todayISO} value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded-md px-3 py-2 mt-1" />

            <label className="block mt-4 text-sm font-medium">Number of Travelers</label>
            <select value={travelers} onChange={e=>setTravelers(parseInt(e.target.value,10))} className="w-full border rounded-md px-3 py-2 mt-1">
              {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} {n===1?"Adult":"Adults"}</option>)}
            </select>

            <div className="mt-4 text-sm text-gray-700">
              <div>Package cost: ₹{packageCost.toLocaleString()}</div>
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
