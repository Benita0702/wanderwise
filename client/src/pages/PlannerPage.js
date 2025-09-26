/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar as CalendarIcon, Users, Settings, Save, Share, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getAISuggestions } from '../api/ai';

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
  const [customInputs, setCustomInputs] = useState({});
  const [aiGenerated, setAiGenerated] = useState(false);

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

  const steps = [
    { id: 1, title: 'Destination & Dates', icon: MapPin },
    { id: 2, title: 'Traveler Type', icon: Users },
    { id: 3, title: 'Preferences', icon: Settings },
    { id: 4, title: 'Generate Itinerary', icon: CalendarIcon },
  ];

  // Step navigation
  const handleNext = () => {
    if (currentStep === 1) {
      const { startDate, endDate, destinations, budget } = plannerData;
      if (!destinations[0] || !startDate || !endDate || !budget) return alert('Please fill all fields.');

      const today = new Date().setHours(0,0,0,0);
      if (new Date(startDate) < today) return alert('Start date cannot be in the past.');
      if (new Date(startDate) > new Date(endDate)) return alert('End date must be after start date.');

      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000*60*60*24)) + 1;
      if (totalDays > 15) return alert('Trips can only be planned up to 15 days.');

      setItinerary(Array.from({ length: totalDays }, (_, i) => ({ day: i + 1, activities: [] })));
    }

    if (currentStep === 2 && !plannerData.travelerType) return alert('Please select traveler type.');
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

  const handleCustomInput = (dayIndex, value) => {
    setCustomInputs({ ...customInputs, [dayIndex]: value });
  };

  const addCustomActivity = (dayIndex) => {
    if (!customInputs[dayIndex]) return;
    const updated = [...itinerary];
    updated[dayIndex].activities.push({ activity: customInputs[dayIndex], type: 'Custom' });
    setItinerary(updated);
    setCustomInputs({ ...customInputs, [dayIndex]: '' });
  };

  const generateAISuggestions = async () => {
    if (!plannerData.destinations[0] || !plannerData.budget) return alert("Enter destination and budget");

    try {
      const suggestions = await getAISuggestions(
        plannerData.destinations[0],
        plannerData.preferences,
        itinerary.length,
        plannerData.budget
      );

      const updatedItinerary = itinerary.map(day => {
        const daySug = suggestions.find(s => s.day === day.day);
        return daySug ? { ...day, activities: daySug.activities.map(a => ({ activity: a, type: 'AI' })) } : day;
      });

      setItinerary(updatedItinerary);
      setAiGenerated(true);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI suggestions");
    }
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
    doc.text(`Budget: ₹${plannerData.budget}`, 14, 54);
    let y = 60;
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
    if (!user || !token) return navigate("/login");
    try {
      const payload = {
        data: {
          title: `${plannerData.destinations[0]} - ${plannerData.startDate}`,
          destination: plannerData.destinations[0],
          startDate: plannerData.startDate,
          endDate: plannerData.endDate,
          travelerType: plannerData.travelerType,
          preferences: plannerData.preferences,
          activities: itinerary,
          users_permissions_user: user.id,
        }
      };
      const response = await api.post("/itineraries", payload);
      if (response.data) alert("Itinerary saved successfully!");
      navigate("/itineraries");
    } catch (err) {
      console.error("Save error:", err.response ? err.response.data : err);
      alert("Error saving itinerary. Check console.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Itinerary: ${plannerData.destinations[0]}`,
      text: `Check out this itinerary for ${plannerData.destinations[0]} (${plannerData.startDate} - ${plannerData.endDate})`,
      url: `${window.location.origin}/share/itinerary?dest=${encodeURIComponent(plannerData.destinations[0] || '')}`
    };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Share link copied: ' + shareData.url);
      navigate('/share');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI-Powered Itinerary Planner</h1>
          <p className="text-xl text-gray-600">Plan your perfect trip your way</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const completed = currentStep >= step.id;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${completed ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {index < steps.length - 1 && <div className={`h-1 w-20 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-xl shadow-lg p-8 space-y-6">

          {/* Step 1: Destination, Dates, Budget */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                value={plannerData.destinations[0]}
                onChange={e => setPlannerData(prev => ({ ...prev, destinations: [e.target.value] }))}
                placeholder="Enter destination"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="number"
                value={plannerData.budget}
                onChange={e => setPlannerData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="Enter budget (₹)"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="date"
                value={plannerData.startDate}
                onChange={e => setPlannerData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="date"
                value={plannerData.endDate}
                onChange={e => setPlannerData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          )}

          {/* Step 2: Traveler Type */}
          {currentStep === 2 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {travelerTypes.map(type => (
                <button key={type.id} onClick={() => setPlannerData(prev => ({ ...prev, travelerType: type.id }))} className={`p-4 border rounded-lg ${plannerData.travelerType === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-semibold">{type.title}</div>
                  <div className="text-gray-600 text-sm">{type.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {preferencesList.map(pref => (
                <button key={pref.id} onClick={() => togglePreference(pref.id)} className={`p-4 border rounded-lg ${plannerData.preferences.includes(pref.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="text-xl mb-2">{pref.emoji}</div>
                  <div className="font-medium">{pref.name}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Itinerary */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <button onClick={generateAISuggestions} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Generate AI Itinerary</button>

              {itinerary.map((day, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-2">
                  <div className="font-semibold text-lg">Day {day.day}</div>
                  {day.activities.length === 0 ? <div className="text-gray-500">No activities yet</div> :
                    day.activities.map((act, i) => <div key={i}>- {act.activity} ({act.type})</div>)
                  }
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={customInputs[idx] || ''} onChange={e => handleCustomInput(idx, e.target.value)} placeholder="Add custom activity" className="flex-1 p-2 border rounded-lg" />
                    <button onClick={() => addCustomActivity(idx)} className="px-3 bg-green-500 text-white rounded-lg">Add</button>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 mt-4">
                <button onClick={exportPDF} className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-1"><Download className="w-4 h-4"/> Export PDF</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1"><Save className="w-4 h-4"/> Save</button>
                <button onClick={handleShare} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-1"><Share className="w-4 h-4"/> Share</button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && <button onClick={handleBack} className="px-4 py-2 border rounded-lg">Back</button>}
            {currentStep < 4 && <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
