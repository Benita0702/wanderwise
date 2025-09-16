import React from 'react';

const ActivityCard = ({ activity, type, image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-40 border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg"
    >
      <img
        src={image}
        alt={activity}
        className="w-full h-24 object-cover"
        onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
      />
      <div className="p-2">
        <h4 className="font-semibold">{activity}</h4>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
    </div>
  );
};

export default ActivityCard;
