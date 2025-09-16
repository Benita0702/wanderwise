import React from "react";

function TestimonialCard({ name, feedback }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", width: "200px" }}>
      <p>"{feedback}"</p>
      <h4>- {name}</h4>
    </div>
  );
}

export default TestimonialCard;
