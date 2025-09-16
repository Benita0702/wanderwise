import React, { useEffect, useState } from "react";
import PackageCard from "../components/PackageCard";
import axios from "axios";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/tour-packages");
        const formattedPackages = response.data.data.map((item) => ({
          id: item.id,
          title: item.Title.replace(/“|”/g, "") || "No Title",
          price: item.Price || "N/A",
          description:
            typeof item.Description === "string"
              ? item.Description
              : item.Description?.data || "No description available",
          image:
            item.Image ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=250&q=60",
        }));
        setPackages(formattedPackages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) return <p>Loading packages...</p>;
  if (!packages.length) return <p>No packages found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Tour Packages</h1>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            packageId={pkg.id}
            title={pkg.title}
            price={pkg.price}
            description={pkg.description}
            image={pkg.image}
          />
        ))}
      </div>
    </div>
  );
}

export default PackagesPage;
