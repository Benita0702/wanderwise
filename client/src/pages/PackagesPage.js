import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter } from "lucide-react";
import PackageCard from "../components/PackageCard";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // ✅ Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(50000);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 9;

  // ✅ Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/tour-packages?populate=Images&pagination[limit]=100"
        );

        console.log("RAW RESPONSE:", response.data);

        const formattedPackages = response.data.data.map((item) => ({
          id: item.id,
          title: item.Title || "No Title",
          price: item.Price || 0,
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
          discount: item.Discount_price || null,
          location: item.Location || "India",
          duration: item.Duration_days || 0,
          rating: item.Rating || 4.5,
        }));

        setPackages(formattedPackages);
        setFilteredPackages(formattedPackages);

        // Load wishlist IDs from localStorage
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

  // ✅ Apply Filters + Sort
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
        if (selectedDurations.includes("4-7") && days >= 4 && days <= 7) return true;
        if (selectedDurations.includes("8+") && days >= 8) return true;
        return false;
      });
    }

    result.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );

    setFilteredPackages(result);
    setCurrentPage(1); // reset to page 1 when filters change
  }, [searchTerm, selectedCategory, priceRange, selectedDurations, sortOrder, packages]);

  // ✅ Wishlist handler
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

  // ✅ Pagination logic
  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = filteredPackages.slice(indexOfFirstPackage, indexOfLastPackage);
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) return <p className="text-center py-10">Loading packages...</p>;
  if (!packages.length) return <p className="text-center py-10">No packages found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tour Packages</h1>
          <p className="text-xl text-gray-600">
            Discover amazing destinations with our curated travel packages
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="relative col-span-1 lg:col-span-2">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {["All", "Weekend", "Honeymoon", "Adventure", "Luxury"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="range"
              min="0"
              max="50000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹0</span>
              <span>₹{priceRange.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-sm text-gray-700">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDurations.includes("1-3")}
                onChange={() => handleDurationChange("1-3")}
                className="form-checkbox text-blue-600"
              />
              <span>1–3 Days</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDurations.includes("4-7")}
                onChange={() => handleDurationChange("4-7")}
                className="form-checkbox text-blue-600"
              />
              <span>4–7 Days</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDurations.includes("8+")}
                onChange={() => handleDurationChange("8+")}
                className="form-checkbox text-blue-600"
              />
              <span>8+ Days</span>
            </label>
          </div>

          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="asc">Sort: Low to High</option>
              <option value="desc">Sort: High to Low</option>
            </select>
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              {...pkg}
              isWishlisted={wishlist.includes(pkg.id)}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2 items-center">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md border ${currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700"
                }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => goToPage(i + 1)}
                className={`px-4 py-2 rounded-md border ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md border ${currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700"
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
