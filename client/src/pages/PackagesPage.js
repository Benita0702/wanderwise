import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter } from "lucide-react";
import PackageCard from "../components/PackageCard";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // ✅ State for the selected dates for each package
  const [selectedDates, setSelectedDates] = useState({});

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
    setCurrentPage(1);
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

  // ✅ Function to handle date changes
  const handleDateChange = (packageId, date) => {
    setSelectedDates(prev => ({
      ...prev,
      [packageId]: date
    }));
  };

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
          {/* ... (filter inputs remain the same) ... */}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              {...pkg}
              isWishlisted={wishlist.includes(pkg.id)}
              toggleWishlist={toggleWishlist}
              selectedDate={selectedDates[pkg.id]}
              onDateChange={handleDateChange}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2 items-center">
            {/* ... (pagination buttons remain the same) ... */}
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