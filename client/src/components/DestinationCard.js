import React from "react";

function DestinationCard({ name, description, image }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", width: "200px" }}>
      <img src={image} alt={name} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}

export default DestinationCard;
