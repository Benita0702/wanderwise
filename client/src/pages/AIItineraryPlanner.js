import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Calendar } from '../components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { CalendarIcon, MapPinIcon, UsersIcon, HeartIcon } from 'lucide-react';
import { format } from 'date-fns';
import ItineraryDisplay from '../components/ItineraryDisplay';

const AIItineraryPlanner = () => {
  const [destinations, setDestinations] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [travelerType, setTravelerType] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  const travelerTypes = [
    { value: "solo", label: "Solo" },
    { value: "couple", label: "Couple" },
    { value: "family", label: "Family" },
    { value: "corporate", label: "Corporate" }
  ];

  const preferenceOptions = [
    { value: "adventure", label: "Adventure" },
    { value: "relaxation", label: "Relaxation" },
    { value: "culture", label: "Culture" },
    { value: "food", label: "Food" },
    { value: "luxury", label: "Luxury" },
    { value: "budget", label: "Budget" }
  ];

  const handlePreferenceChange = (preference, checked) => {
    setPreferences(prev => 
      checked 
        ? [...prev, preference]
        : prev.filter(p => p !== preference)
    );
  };

  const handleSaveItinerary = async (updatedItinerary) => {
    try {
      const response = await fetch(`/api/itinerary/${updatedItinerary.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedItinerary.title,
          isPublic: updatedItinerary.isPublic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setItinerary(data.itinerary);
        alert('Itinerary saved successfully!');
      } else {
        alert('Failed to save itinerary');
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary');
    }
  };

  const handleShareItinerary = async (itineraryToShare) => {
    try {
      const response = await fetch(`/api/itinerary/${itineraryToShare.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const shareUrl = data.shareUrl;
        
        if (navigator.share) {
          navigator.share({
            title: itineraryToShare.title,
            text: `Check out my travel itinerary for ${itineraryToShare.destinations}`,
            url: shareUrl,
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareUrl);
          alert('Itinerary link copied to clipboard!');
        }
      } else {
        alert('Failed to create share link');
      }
    } catch (error) {
      console.error('Error sharing itinerary:', error);
      alert('Failed to share itinerary');
    }
  };

  const generateItinerary = async () => {
    if (!destinations || !startDate || !endDate || !travelerType || preferences.length === 0) {
      alert("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinations,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          travelerType,
          preferences
        }),
      });

      const data = await response.json();
      setItinerary(data.itinerary);
      
      if (data.warning) {
        alert(data.warning);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <MapPinIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            AI Travel Itinerary Planner
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Create personalized travel plans with real AI. Get intelligent itineraries powered by Ollama.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Input Form */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>
                Plan Your Trip
              </CardTitle>
              <CardDescription className="text-base">
                Enter your travel details to generate an AI-powered itinerary with real-time intelligence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destinations */}
              <div className="space-y-2">
                <Label htmlFor="destinations" className="text-sm font-medium">
                  Destination(s)
                </Label>
                <Textarea
                  id="destinations"
                  placeholder="Enter your destination (e.g., Goa, Mysore, Bangalore, Mumbai, Delhi, Agra)"
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  {['Goa', 'Mysore', 'Bangalore', 'Mumbai', 'Delhi', 'Agra'].map((destination) => (
                    <Button
                      key={destination}
                      variant="outline"
                      size="sm"
                      onClick={() => setDestinations(destination)}
                      className="text-xs"
                    >
                      {destination}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Travel Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Traveler Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Traveler Type</Label>
                <Select value={travelerType} onValueChange={setTravelerType}>
  <SelectTrigger>
    <SelectValue placeholder="Select traveler type" />
  </SelectTrigger>
  <SelectContent>
    {travelerTypes.map((type) => (
      <SelectItem key={type.value} value={type.value}>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          {type.label}
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>

              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferences</Label>
                <div className="grid grid-cols-2 gap-3">
                  {preferenceOptions.map((preference) => (
                    <div key={preference.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference.value}
                        checked={preferences.includes(preference.value)}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(preference.value, checked)
                        }
                      />
                      <Label htmlFor={preference.value} className="text-sm cursor-pointer">
                        {preference.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generateItinerary} 
                disabled={isGenerating}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Itinerary Display */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                  <HeartIcon className="h-5 w-5 text-green-600" />
                </div>
                Your Itinerary
              </CardTitle>
              <CardDescription className="text-base">
                Your AI-generated travel itinerary will appear here
              </CardDescription>
            </CardHeader>
              <CardContent>
              {itinerary ? (
                <ItineraryDisplay 
                  itinerary={itinerary}
                  onSave={handleSaveItinerary}
                  onShare={handleShareItinerary}
                />
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in the form and generate your itinerary</p>
                  <p className="text-sm mt-2">Your personalized travel plan will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIItineraryPlanner;