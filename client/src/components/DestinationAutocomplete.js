import React, { useState, useEffect, useRef } from 'react';

const DestinationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter destination" 
}) => {
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Indian destinations for autocomplete
  const indianDestinations = [
    'Goa', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad',
    'Mysore', 'Tiruchirappalli', 'Bareilly', 'Jalandhar', 'Tiruppur', 'Gurgaon',
    'Aligarh', 'Jalgaon', 'Saharanpur', 'Guntur', 'Amravati', 'Bikaner', 'Nellore',
    'Bhavnagar', 'Bhubaneswar', 'Kochi', 'Warangal', 'Kolhapur', 'Shimla', 'Manali',
    'Ooty', 'Kodaikanal', 'Munnar', 'Alleppey', 'Thekkady', 'Wayanad', 'Coorg',
    'Chikmagalur', 'Hampi', 'Gokarna', 'Pondicherry', 'Kanyakumari', 'Rameswaram',
    'Madhya Pradesh', 'Rajasthan', 'Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh',
    'Telangana', 'Gujarat', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'West Bengal',
    'Punjab', 'Haryana', 'Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir',
    'Ladakh', 'Andaman & Nicobar', 'Lakshadweep', 'Daman & Diu', 'Dadra & Nagar Haveli',
    'Puducherry', 'Chandigarh', 'Delhi NCR', 'Mumbai Metropolitan Region',
    'Bangalore Urban', 'Hyderabad Metropolitan', 'Chennai Metropolitan', 'Kolkata Metropolitan'
  ];

  useEffect(() => {
    if (value.length > 0) {
      const filtered = indianDestinations.filter(dest =>
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered.slice(0, 10));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDestinationSelect = (destination) => {
    onChange(destination);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        required
      />
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleDestinationSelect(dest)}
              >
                {dest}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No destinations found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationAutocomplete;