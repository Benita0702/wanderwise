import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import PackageCard from "../components/PackageCard";
import { Link } from "react-router-dom";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(50000);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 9;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/tour-packages?populate[0]=Images&populate[1]=offers&pagination[limit]=100"
        );

        const formattedPackages = response.data.data.map((item) => {
          const originalPrice = item.Price || 0;
          const offer = item.offers?.[0];
          const discountPercent = offer?.Discount || 0;

          const discountedPrice =
            discountPercent > 0
              ? Math.round(originalPrice - (originalPrice * discountPercent) / 100)
              : originalPrice; 

          return {
            id: item.id,
            title: item.Title || "No Title",
            price: discountedPrice,
            discount: discountPercent > 0 ? originalPrice : null,
            category: item.Package_type || "General",
            description: Array.isArray(item.Description)
              ? item.Description.map((d) =>
                  d.children?.map((c) => c.text).join(" ")
                ).join(" ")
              : "No description available",
            image:
              item.Images?.[0]?.url
                ? `http://localhost:1337${item.Images[0].url}`
                : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=60",
            location: item.Location || "India",
            duration: item.Duration_days || 0,
            rating: item.Rating || 4.5,
          };
        });

        setPackages(formattedPackages);
        setFilteredPackages(formattedPackages);

        const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(stored.map((p) => p.id));
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    let result = [...packages];

    if (searchTerm.trim()) {
      result = result.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (pkg) => pkg.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    result = result.filter((pkg) => pkg.price <= priceRange);

    if (selectedDurations.length > 0) {
      result = result.filter((pkg) => {
        const days = Number(pkg.duration);
        if (selectedDurations.includes("1-3") && days <= 3) return true;
        if (selectedDurations.includes("4-7") && days >= 4 && days <= 7)
          return true;
        if (selectedDurations.includes("8+") && days >= 8) return true;
        return false;
      });
    }

    result.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

    setFilteredPackages(result);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, selectedDurations, sortOrder, packages]);

  const toggleWishlist = (pkg) => {
    let stored = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (stored.some((p) => p.id === pkg.id)) {
      stored = stored.filter((p) => p.id !== pkg.id);
    } else {
      stored.push(pkg);
    }

    localStorage.setItem("wishlist", JSON.stringify(stored));
    setWishlist(stored.map((p) => p.id));
  };

  const handleDurationChange = (value) => {
    setSelectedDurations((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleDateChange = (packageId, date) => {
    setSelectedDates((prev) => ({
      ...prev,
      [packageId]: date,
    }));
  };

  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = filteredPackages.slice(
    indexOfFirstPackage,
    indexOfLastPackage
  );
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) return <p className="text-center py-10">Loading packages...</p>;
  if (!packages.length)
    return <p className="text-center py-10">No packages found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tour Packages
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing destinations with our curated travel packages
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="flex items-center border rounded-lg px-3 py-2 col-span-2">
            <Search className="text-gray-400 mr-2" size={20} />
            <input
              type="text"
              placeholder="Search by title or location"
              className="w-full outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full border rounded-lg p-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {[...new Set(packages.map((pkg) => pkg.category))].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Price (Up to ₹{priceRange})
            </label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-sm text-gray-600 mb-1">Duration</label>
            {["1-3", "4-7", "8+"].map((d) => (
              <label key={d} className="text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={selectedDurations.includes(d)}
                  onChange={() => handleDurationChange(d)}
                  className="mr-2 accent-blue-600"
                />
                {d} days
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort</label>
            <select
              className="w-full border rounded-lg p-2"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <Link to={`/packages/${pkg.id}`}>
                <PackageCard
                  {...pkg}
                  isWishlisted={wishlist.includes(pkg.id)}
                  onWishlistToggle={() => toggleWishlist(pkg)}
                  selectedDate={selectedDates[pkg.id]}
                  onDateChange={handleDateChange}
                />
              </Link>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2 items-center">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => goToPage(num)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No packages found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PackagesPage;
