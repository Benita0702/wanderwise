// src/pages/PlannerPage.js
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Settings,
  Save,
  Share,
  Download  
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import ActivityCard from '../components/ActivityCard';
import { AuthContext } from '../context/AuthContext';
import { createItinerary } from '../api/itineraries';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Make sure you import the main api instance


// Sample activities
const sampleActivities = {
  Adventure: [
    { name: 'Trekking', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60' },
    { name: 'Rafting', image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=60' },
    { name: 'Zip-lining', image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=400&q=60' },
  ],
  Relaxation: [
    { name: 'Spa', image: 'https://images.unsplash.com/photo-1588776814546-3e4b6deebf9f?auto=format&fit=crop&w=400&q=60' },
    { name: 'Beach Walk', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=60' },
    { name: 'Yoga', image: 'https://images.unsplash.com/photo-1554284126-6f0e57a1cf9f?auto=format&fit=crop&w=400&q=60' },
  ],
  Culture: [
    { name: 'Museum Visit', image: 'https://images.unsplash.com/photo-1549887534-5f5b6b0e0569?auto=format&fit=crop&w=400&q=60' },
    { name: 'Local Tour', image: 'https://images.unsplash.com/photo-1533622597524-a121cfd2cf2c?auto=format&fit=crop&w=400&q=60' },
    { name: 'Art Gallery', image: 'https://images.unsplash.com/photo-1581092795363-1e9a03a9ab22?auto=format&fit=crop&w=400&q=60' },
  ],
  Food: [
    { name: 'Street Food', image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=400&q=60' },
    { name: 'Cooking Class', image: 'https://images.unsplash.com/photo-1598514982723-bb5f64655be8?auto=format&fit=crop&w=400&q=60' },
    { name: 'Food Tour', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=60' },
  ],
  Luxury: [
    { name: '5-star Resort', image: 'https://images.unsplash.com/photo-1505682634904-d7c4f8ebd9e6?auto=format&fit=crop&w=400&q=60' },
    { name: 'Private Yacht', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=60' },
    { name: 'Luxury Dining', image: 'https://images.unsplash.com/photo-1564758866811-cc72b37c71e8?auto=format&fit=crop&w=400&q=60' },
  ],
  Budget: [
    { name: 'City Walk', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=60' },
    { name: 'Hostel Stay', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60' },
    { name: 'Free Sightseeing', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=400&q=60' },
  ],
};

export default function PlannerPage() {
  const { user, token } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [plannerData, setPlannerData] = useState({
    destinations: [''],
    startDate: '',
    endDate: '',
    travelerType: '',
    preferences: [],
    budget: ''
  });

  const [itinerary, setItinerary] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [customInputs, setCustomInputs] = useState({});

  const travelerTypes = [
    { id: 'solo', title: 'Solo Traveler', description: 'Exploring on your own', icon: '🧳' },
    { id: 'couple', title: 'Couple', description: 'Romantic getaway for two', icon: '💑' },
    { id: 'family', title: 'Family', description: 'Fun for all ages', icon: '👨‍👩‍👧‍👦' },
    { id: 'corporate', title: 'Corporate', description: 'Business travel', icon: '💼' },
  ];

  const preferencesList = [
    { id: 'Adventure', name: 'Adventure', emoji: '🏔️' },
    { id: 'Relaxation', name: 'Relaxation', emoji: '🧘‍♀️' },
    { id: 'Culture', name: 'Culture', emoji: '🏛️' },
    { id: 'Food', name: 'Food', emoji: '🍜' },
    { id: 'Luxury', name: 'Luxury', emoji: '✨' },
    { id: 'Budget', name: 'Budget', emoji: '💰' },
  ];

  // Step navigation
  const handleNext = () => {
    if (currentStep === 1) {
      const { startDate, endDate, destinations } = plannerData;
      if (!destinations[0] || !startDate || !endDate) {
        alert('Please fill all fields.');
        return;
      }

      const today = new Date().setHours(0, 0, 0, 0);
      if (new Date(startDate) < today) {
        alert('Start date cannot be in the past.');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert('End date must be after start date.');
        return;
      }

      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      if (totalDays > 15) {
        alert('Trips can only be planned up to 15 days.');
        return;
      }

      const daysArr = [];
      for (let i = 0; i < totalDays; i++) {
        daysArr.push({ day: i + 1, activities: [] });
      }
      setItinerary(daysArr);
    }

    if (currentStep === 2 && !plannerData.travelerType) {
      alert('Please select traveler type.');
      return;
    }

    setCurrentStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  const togglePreference = (prefId) => {
    setPlannerData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(p => p !== prefId)
        : [...prev.preferences, prefId]
    }));
  };

  const addActivity = (dayIndex, activityObj) => {
    const updated = [...itinerary];
    updated[dayIndex].activities.push(activityObj);
    setItinerary(updated);
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const updated = [...itinerary];
    updated[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(updated);
  };

  const generateAISuggestions = (dayIndex) => {
    const suggestions = [];
    plannerData.preferences.forEach((pref) => {
      const acts = sampleActivities[pref] || [];
      if (acts.length > 0) {
        const activity = acts[Math.floor(Math.random() * acts.length)];
        suggestions.push({ activity: activity.name, type: pref, image: activity.image });
      }
    });
    setAiSuggestions({ ...aiSuggestions, [dayIndex]: suggestions });
  };

  const handleCustomInput = (dayIndex, value) => {
    setCustomInputs({ ...customInputs, [dayIndex]: value });
  };

  const addCustomActivity = (dayIndex) => {
    if (!customInputs[dayIndex]) return;
    addActivity(dayIndex, {
      activity: customInputs[dayIndex],
      type: 'Custom',
      image: 'https://via.placeholder.com/150'
    });
    setCustomInputs({ ...customInputs, [dayIndex]: '' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('JourneyNest Itinerary', 14, 20);
    doc.setFontSize(12);
    doc.text(`Destination: ${plannerData.destinations[0]}`, 14, 30);
    doc.text(`Dates: ${plannerData.startDate} to ${plannerData.endDate}`, 14, 36);
    doc.text(`Traveler Type: ${plannerData.travelerType}`, 14, 42);
    doc.text(`Preferences: ${plannerData.preferences.join(', ') || 'None'}`, 14, 48);
    let y = 58;
    itinerary.forEach((day) => {
      doc.text(`Day ${day.day}:`, 14, y);
      y += 6;
      if (day.activities.length === 0) {
        doc.text('No activities selected for this day.', 16, y);
        y += 6;
      } else {
        day.activities.forEach((act) => {
          doc.text(`- ${act.activity} (${act.type})`, 16, y);
          y += 6;
        });
      }
    });
    doc.save(`${plannerData.destinations[0] || 'itinerary'}_itinerary.pdf`);
  };

const handleSave = async () => {
  try {
    if (!user || !token) {
      alert("You must be logged in to save an itinerary.");
      navigate("/login");
      return;
    }

    const payload = {
      data: { // Strapi v4 requires the payload to be wrapped in a `data` object
        title: `${plannerData.destinations[0] || "Itinerary"} - ${plannerData.startDate}`,
        destination: plannerData.destinations[0],
        startDate: plannerData.startDate,
        endDate: plannerData.endDate,
        travelerType: plannerData.travelerType,
        preferences: plannerData.preferences,
        activities: itinerary,
        // user: user.id,
      }
    };

    const response = await api.post("/itineraries", payload);

    if (response.data) {
      alert("Itinerary saved successfully!");
      navigate("/itineraries");
    } else {
      alert("Failed to save itinerary. Please try again.");
    }
  } catch (err) {
    console.error("Save error:", err.response ? err.response.data : err);
    alert("An error occurred while saving. Check the console for details.");
  }
};



  const handleShare = async () => {
    const shareData = {
      title: `Itinerary: ${plannerData.destinations[0]}`,
      text: `Check out this itinerary for ${plannerData.destinations[0]} (${plannerData.startDate} - ${plannerData.endDate})`,
      url: `${window.location.origin}/share/itinerary?dest=${encodeURIComponent(plannerData.destinations[0] || '')}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Share canceled', err);
      }
    } else {
      const link = shareData.url;
      await navigator.clipboard.writeText(link);
      alert('Share link copied to clipboard: ' + link);
      navigate('/share');
    }
  };

  const steps = [
    { id: 1, title: 'Destination & Dates', icon: MapPin },
    { id: 2, title: 'Traveler Type', icon: Users },
    { id: 3, title: 'Preferences', icon: Settings },
    { id: 4, title: 'Generate Itinerary', icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI-Powered Itinerary Planner</h1>
          <p className="text-xl text-gray-600">Plan your perfect trip your way</p>
        </motion.div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const completed = currentStep >= step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${completed ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-20 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <span key={s.id} className={`text-sm font-medium ${currentStep >= s.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Card */}
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Where would you like to go?</h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Destination(s)</label>
                <input
                  type="text"
                  value={plannerData.destinations[0]}
                  onChange={(e) => setPlannerData(prev => ({ ...prev, destinations: [e.target.value] }))}
                  placeholder="e.g., Goa, Kerala, Rajasthan"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={plannerData.startDate}
                    onChange={(e) => setPlannerData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    min={plannerData.startDate || new Date().toISOString().split('T')[0]}
                    value={plannerData.endDate}
                    onChange={(e) => setPlannerData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (Optional)</label>
                <select
                  value={plannerData.budget}
                  onChange={(e) => setPlannerData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  <option value="budget">Budget (Under ₹15,000)</option>
                  <option value="mid">Mid-range (₹15,000 - ₹30,000)</option>
                  <option value="luxury">Luxury (Above ₹30,000)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Who's traveling?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travelerTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPlannerData(prev => ({ ...prev, travelerType: type.id }))}
                    className={`p-6 rounded-xl border text-left hover:border-blue-500 focus:outline-none transition-all ${
                      plannerData.travelerType === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-semibold">{type.title}</div>
                    <div className="text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">What are your preferences?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {preferencesList.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    className={`p-4 rounded-lg border text-left hover:border-blue-500 focus:outline-none transition-all ${
                      plannerData.preferences.includes(pref.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-xl mb-2">{pref.emoji}</div>
                    <div className="font-medium">{pref.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Day-wise Itinerary</h2>
              <div className="space-y-8">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-4">Day {day.day}</h3>

                    <div className="space-y-4 mb-4">
                      {day.activities.length === 0 ? (
                        <p className="text-gray-500">No activities added yet</p>
                      ) : (
                        day.activities.map((act, aIdx) => (
                          <ActivityCard
                            key={aIdx}
                            activity={act.activity}
                            type={act.type}
                            image={act.image}
                            onRemove={() => removeActivity(idx, aIdx)}
                          />
                        ))
                      )}
                    </div>

                    {/* AI Suggestions */}
                    <div className="mt-4">
                      <button
                        onClick={() => generateAISuggestions(idx)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                      >
                        Get AI Suggestions
                      </button>
                      {aiSuggestions[idx] && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {aiSuggestions[idx].map((sug, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50"
                              onClick={() => addActivity(idx, sug)}
                            >
                              <img src={sug.image} alt={sug.activity} className="w-full h-32 object-cover rounded-lg mb-2" />
                              <div className="font-medium">{sug.activity}</div>
                              <div className="text-sm text-gray-500">{sug.type}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom Activity Input */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Activity</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customInputs[idx] || ''}
                          onChange={(e) => handleCustomInput(idx, e.target.value)}
                          placeholder="e.g., Sunset at the beach"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => addCustomActivity(idx)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save/Share/PDF */}
              <div className="flex flex-wrap justify-end gap-4 mt-8">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  <Save className="h-5 w-5 mr-2" /> Save Itinerary
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
                >
                  <Share className="h-5 w-5 mr-2" /> Share
                </button>
                <button
                  onClick={exportPDF}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                >
                  <Download className="h-5 w-5 mr-2" /> Export as PDF
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button onClick={handleBack} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition">
              Back
            </button>
          ) : (
            <div />
          )}
          {currentStep < 4 && (
            <button onClick={handleNext} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
