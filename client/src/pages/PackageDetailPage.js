import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/tour-packages");
        const item = response.data.data.find(
          (pkg) => pkg.id === parseInt(packageId)
        );
        if (!item) return;

        setPackageData({
          title: item.Title?.replace(/“|”/g, "") || "Untitled Package",
          price: item.Price || "N/A",
          duration: item.Duration_days || "N/A",
          type: item.Package_type || "N/A",
          description: item.Description?.[0]?.children?.[0]?.text || "No description provided",
          inclusions: item.Inclusions || "Not specified",
          exclusions: item.Exclusions || "Not specified",
          images: ["https://via.placeholder.com/300x200"], // replace with real image field if added later
        });
      } catch (err) {
        console.error("Error fetching package:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  if (loading) return <p>Loading package details...</p>;
  if (!packageData) return <p>Package not found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{packageData.title}</h1>
      <p><b>Price:</b> ₹{packageData.price}</p>
      <p><b>Duration:</b> {packageData.duration} days</p>
      <p><b>Type:</b> {packageData.type}</p>
      <p>{packageData.description}</p>

      <h2>Inclusions</h2>
      <p>{packageData.inclusions}</p>

      <h2>Exclusions</h2>
      <p>{packageData.exclusions}</p>

      <h2>Images</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        {packageData.images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="package"
            style={{ width: "300px", height: "200px" }}
          />
        ))}
      </div>

      <button
        onClick={() => navigate(`/booking/${packageId}`)}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Book Now
      </button>
    </div>
  );
}

export default PackageDetailPage;
