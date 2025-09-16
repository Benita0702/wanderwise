import React from "react";
import { useNavigate } from "react-router-dom";

function PackageCard({ title, price, description, image, packageId }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        width: "250px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <img
        src={image}
        alt={title}
        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }}
        onError={(e) => (e.target.src = "https://via.placeholder.com/250x150")}
      />
      <h3 style={{ margin: "10px 0 5px 0", fontSize: "18px" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: "#555" }}>
        {description.length > 80 ? description.slice(0, 80) + "..." : description}
      </p>
      <p style={{ fontWeight: "bold", margin: "5px 0" }}>Price: ${price}</p>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={() => navigate(`/packages/${packageId}`)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "#1D4ED8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          View Details
        </button>
        <button
          onClick={() => navigate(`/booking/${packageId}`)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "#10B981",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default PackageCard;
