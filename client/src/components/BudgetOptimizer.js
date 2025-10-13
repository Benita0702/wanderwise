import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import DestinationAutocomplete from './DestinationAutocomplete';

// Mock API response for testing
const mockBudgetOptimization = (budget, destination, duration) => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePercentages = {
        flights: 0.35,
        accommodation: 0.30,
        activities: 0.20,
        food: 0.15
      };

      // Adjust percentages based on destination type
      if (destination.toLowerCase().includes('goa') || 
          destination.toLowerCase().includes('kerala') || 
          destination.toLowerCase().includes('andaman')) {
        basePercentages.accommodation = 0.35;
        basePercentages.flights = 0.30;
        basePercentages.activities = 0.20;
        basePercentages.food = 0.15;
      } else if (destination.toLowerCase().includes('shimla') || 
                 destination.toLowerCase().includes('manali') || 
                 destination.toLowerCase().includes('kashmir')) {
        basePercentages.activities = 0.25;
        basePercentages.accommodation = 0.30;
        basePercentages.flights = 0.30;
        basePercentages.food = 0.15;
      }

      // Check if flights should be available
      const hasFlights = !destination.toLowerCase().includes('mumbai') && 
                        !destination.toLowerCase().includes('delhi') && 
                        !destination.toLowerCase().includes('bangalore') &&
                        !destination.toLowerCase().includes('pune') &&
                        !destination.toLowerCase().includes('chennai') &&
                        !destination.toLowerCase().includes('kolkata') &&
                        !destination.toLowerCase().includes('hyderabad');

      const originalCosts = {
        flights: Math.round(budget * basePercentages.flights * 1.2),
        accommodation: Math.round(budget * basePercentages.accommodation * 1.2),
        activities: Math.round(budget * basePercentages.activities * 1.2),
        food: Math.round(budget * basePercentages.food * 1.2)
      };

      const optimizedCosts = {
        flights: Math.round(budget * basePercentages.flights),
        accommodation: Math.round(budget * basePercentages.accommodation),
        activities: Math.round(budget * basePercentages.activities),
        food: Math.round(budget * basePercentages.food)
      };

      const savings = {
        flights: originalCosts.flights - optimizedCosts.flights,
        accommodation: originalCosts.accommodation - optimizedCosts.accommodation,
        activities: originalCosts.activities - optimizedCosts.activities,
        food: originalCosts.food - optimizedCosts.food
      };

      const totalOriginalCost = Object.values(originalCosts).reduce((sum, cost) => sum + cost, 0);
      const totalOptimizedCost = Object.values(optimizedCosts).reduce((sum, cost) => sum + cost, 0);
      const estimatedSavings = totalOriginalCost - totalOptimizedCost;

      resolve({
        success: true,
        data: {
          optimizedBudget: {
            totalBudget: budget,
            estimatedSavings,
            breakdown: {
              flights: {
                available: hasFlights,
                original: originalCosts.flights,
                optimized: optimizedCosts.flights,
                savings: savings.flights
              },
              accommodation: {
                available: true,
                original: originalCosts.accommodation,
                optimized: optimizedCosts.accommodation,
                savings: savings.accommodation
              },
              activities: {
                available: true,
                original: originalCosts.activities,
                optimized: optimizedCosts.activities,
                savings: savings.activities
              },
              food: {
                available: true,
                original: originalCosts.food,
                optimized: optimizedCosts.food,
                savings: savings.food
              }
            }
          }
        }
      });
    }, 1500); // Simulate 1.5 second delay
  });
};

const getCreativeDestinationText = (destination) => {
  const creativeTexts = {
    'Shimla': 'where the mountains whisper colonial tales and pine-scented breezes dance through historic streets',
    'Manali': 'an adventure lover\'s paradise nestled in the Himalayas, offering thrilling experiences at every turn',
    'Goa': 'where golden sands meet azure waters, creating a perfect symphony of relaxation and vibrant culture',
    'Mumbai': 'the city that never sleeps, where dreams take flight against the backdrop of the Arabian Sea',
    'Delhi': 'a magnificent tapestry of ancient heritage and modern aspirations, where history meets tomorrow',
    'Bangalore': 'the garden city that blooms with innovation, where technology thrives amidst lush greenery',
    'Kolkata': 'a cultural melting pot where art, literature, and cuisine create an unforgettable sensory experience',
    'Chennai': 'where tradition dances with progress, offering a gateway to South India\'s rich heritage',
    'Hyderabad': 'the pearl city that sparkles with regal charm and culinary delights that tantalize the senses',
    'Pune': 'an educational oasis where young minds flourish and the spirit of Maharashtra comes alive',
    'Jaipur': 'the pink city that radiates royal elegance, where every corner tells a story of valor and grandeur',
    'Agra': 'home to the eternal symbol of love, where the Taj Mahal stands as a testament to timeless romance',
    'Varanasi': 'the spiritual heart of India, where ancient rituals unfold on the sacred banks of the Ganges',
    'Rishikesh': 'the yoga capital that beckons souls seeking peace and enlightenment in the Himalayan foothills',
    'Ooty': 'a hill station where emerald tea plantations carpet the hills and misty mornings paint perfect pictures',
    'Munnar': 'nature\'s masterpiece where rolling hills meet endless tea gardens in a symphony of green',
    'Coorg': 'Scotland of India, where coffee plantations, misty hills, and warm hospitality create magic',
    'Darjeeling': 'the queen of Himalayas, where tea gardens cascade down mountains and sunrise paints the sky',
    'Leh': 'a high-altitude desert where Buddhist monasteries stand sentinel over breathtaking landscapes',
    'Kashmir': 'paradise on earth, where houseboats float on serene lakes and mountains touch the clouds',
    'Kanyakumari': 'where three oceans embrace, marking the southern tip of India\'s incredible journey',
    'Rameswaram': 'a sacred island where faith flows as freely as the waters surrounding its ancient shores',
    'Madurai': 'the Athens of the East, where temple towers pierce the sky and devotion fills the air',
    'Mysore': 'a city of palaces where royal legacy lives on in every corner and festival celebration',
    'Hampi': 'a mystical land of ruins where ancient boulders tell stories of a glorious Vijayanagara empire',
    'Ajanta': 'where ancient artists carved masterpieces into rock, preserving Buddhist tales for eternity',
    'Ellora': 'an architectural marvel where three faiths coexist in stone, showcasing India\'s religious harmony',
    'Khajuraho': 'the land of temples where stone sculptures celebrate life, love, and divine beauty',
    'Mahabalipuram': 'where ancient artisans carved stories in stone, leaving behind a legacy by the sea',
    'Pondicherry': 'a slice of France in India, where colonial charm meets Tamil culture in perfect harmony',
    'Gokarna': 'a temple town where spiritual seekers and beach lovers find their perfect sanctuary',
    'Pushkar': 'the sacred lake town where mythology comes alive and colors paint the desert landscape',
    'Udaipur': 'the city of lakes where palaces float on water and romance fills the Rajasthani air',
    'Jaisalmer': 'the golden city where sandstone fortresses rise from the desert like a mirage made real',
    'Jodhpur': 'the blue city that stands as a proud sentinel in the Thar desert, radiating Rajput valor',
    'Bikaner': 'the camel country where desert traditions thrive and magnificent forts guard ancient secrets',
    'Mount Abu': 'Rajasthan\'s only hill station, where cool breezes carry the scent of pine and spirituality',
    'Ranthambore': 'where tigers roam free in their royal domain, creating unforgettable wildlife encounters',
    'Corbett': 'the tiger land where the call of the wild echoes through pristine forests and river valleys',
    'Kaziranga': 'the land of rhinos where grasslands stretch as far as the eye can see, teeming with life',
    'Periyar': 'a spice-scented paradise where wildlife and plantations create a perfect natural symphony',
    'Silent Valley': 'the last evergreen forest where nature speaks in whispers and biodiversity thrives',
    'Sundarbans': 'the mangrove paradise where the Royal Bengal tiger reigns supreme over tidal waters',
    'Andaman': 'emerald islands where pristine beaches and coral reefs create an underwater wonderland',
    'Lakshadweep': 'coral paradise where turquoise waters gently lap at shores untouched by time',
    'Diu': 'an island of peace where Portuguese heritage meets Gujarati culture in tranquil harmony',
    'Daman': 'a tiny paradise where coastal breezes carry stories of colonial past and vibrant present',
    'Silvassa': 'the garden city where tribal heritage and natural beauty create a unique charm',
    'Kavaratti': 'the coral island where lagoon waters sparkle like diamonds under tropical sun',
    'Agatti': 'the gateway to Lakshadweep where every sunset paints the sky in brilliant hues',
    'Minicoy': 'the southernmost island where Maldivian culture blends seamlessly with Indian spirit',
    'Port Blair': 'the gateway to Andaman where history and nature combine in perfect harmony',
    'Havelock': 'the beach paradise where Radhanagar Beach stretches like a ribbon of pristine white sand',
    'Neil Island': 'the vegetable bowl where natural bridges stand as testaments to nature\'s artistry',
    'Baratang': 'the land of mud volcanoes where limestone caves hold secrets millions of years old',
    'Diglipur': 'the northernmost island where Saddle Peak stands watch over pristine natural beauty',
    'Long Island': 'the island of adventures where every path leads to a new discovery',
    'Little Andaman': 'the island of waterfalls where nature\'s power is displayed in magnificent cascades',
    'Great Nicobar': 'the southernmost point where Indira Point marks India\'s eastern frontier',
    'Car Nicobar': 'the coral paradise where tribal traditions and natural beauty create magic',
    'Katchal': 'the island of sunrise where the first rays of dawn paint the sky in golden light',
    'Teressa': 'the island of coconuts where palm groves sway gently in the ocean breeze',
    'Camorta': 'the island of mangroves where intricate ecosystems thrive in brackish waters',
    'Nancowry': 'the island of tribes where ancient traditions continue in harmony with nature',
    'Trinket': 'the island of turtles where marine life finds sanctuary in pristine waters',
    'Tillangchong': 'the island of birds where winged creatures create a symphony of sounds',
    'Invisible': 'the hidden island where mystery and seclusion create an aura of enchantment',
    'Strait': 'the island of passage where journeys begin and stories unfold',
    'Brother': 'the twin island where sibling islands stand as guardians of the sea',
    'Sister': 'the sister island where feminine grace is reflected in every landscape',
    'North Sentinel': 'the forbidden island where ancient tribes live in isolation from modern world',
    'South Sentinel': 'the sentinel island where nature remains pristine and untouched',
    'Jolly Buoy': 'the island of coral reefs where underwater worlds burst with vibrant colors',
    'Red Skin': 'the island of red coral where marine life creates a living masterpiece',
    'Mahatma Gandhi': 'the marine national park where conservation meets natural beauty',
    'Rani Jhansi': 'the island of freedom where the spirit of independence lives on',
    'Mount Harriet': 'the highest point where panoramic views stretch to infinity',
    'Chidiya Tapu': 'the island of birds where winged wonders fill the air with song',
    'Ross Island': 'the historical island where colonial ruins whisper stories of the past',
    'Viper Island': 'the island of justice where history\'s lessons are etched in stone'
  };

  return creativeTexts[destination] || 'a destination that promises unforgettable memories and unique experiences waiting to be discovered';
};

const BudgetOptimizer = () => {
  const [budgetData, setBudgetData] = useState({
    budget: '',
    destination: '',
    duration: '3-5 days',
  });
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [budgetWarning, setBudgetWarning] = useState('');
  const [minimumBudgetInfo, setMinimumBudgetInfo] = useState(null);
  const [currency] = useState('₹');

  const API_BASE_URL = '/api'; // This will work with React proxy or you can use your actual backend URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBudgetData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'budget') {
      const budgetNum = parseFloat(value);
      if (budgetNum < 500) {
        setBudgetWarning('Can you make the budget price a little more? This amount might be too low for a good travel experience.');
      } else {
        setBudgetWarning('');
      }
      setMinimumBudgetInfo(null);
    }
  };

  const handleDestinationChange = (value) => {
    setBudgetData(prev => ({ ...prev, destination: value }));
    setMinimumBudgetInfo(null);
  };

  const handleReset = () => {
    setBudgetData({
      budget: '',
      destination: '',
      duration: '3-5 days',
    });
    setOptimizationResult(null);
    setError('');
    setBudgetWarning('');
    setMinimumBudgetInfo(null);
  };

  const handleOptimize = async () => {
    if (!budgetData.budget || !budgetData.destination) {
      setError('Please fill in budget and destination');
      return;
    }

    const budgetNum = parseFloat(budgetData.budget);
    if (budgetNum < 500) {
      setError('Please increase your budget for better travel options');
      return;
    }

    setLoading(true);
    setError('');
    setMinimumBudgetInfo(null);

    try {
      // Try real API first, fall back to mock
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/budget-optimizer/optimize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            budget: budgetNum,
            destination: budgetData.destination,
            duration: budgetData.duration,
          }),
        });

        if (!response.ok) {
          throw new Error('API not available');
        }

        const data = await response.json();
        setOptimizationResult(data.data);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
        // Use mock data as fallback
        const mockData = await mockBudgetOptimization(budgetNum, budgetData.destination, budgetData.duration);
        setOptimizationResult(mockData.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to optimize budget. Please try again.');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  const durationOptions = [
    '1-2 days',
    '3-5 days',
    '1 week',
    '2 weeks',
    '3 weeks',
    '1 month'
  ];

  const getPieChartData = () => {
    if (!optimizationResult) return [];
    
    const { breakdown } = optimizationResult.optimizedBudget;
    const data = [];
    
    if (breakdown.flights.available && breakdown.flights.optimized > 0) {
      data.push({ name: 'Flights', value: breakdown.flights.optimized, color: '#3B82F6' });
    }
    if (breakdown.accommodation.available && breakdown.accommodation.optimized > 0) {
      data.push({ name: 'Accommodation', value: breakdown.accommodation.optimized, color: '#10B981' });
    }
    if (breakdown.activities.available && breakdown.activities.optimized > 0) {
      data.push({ name: 'Activities', value: breakdown.activities.optimized, color: '#F59E0B' });
    }
    if (breakdown.food.available && breakdown.food.optimized > 0) {
      data.push({ name: 'Food', value: breakdown.food.optimized, color: '#EF4444' });
    }
    
    return data;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Let's optimize your travel budget</h1>
        <p className="text-sm text-gray-600">Enter your travel details to get personalized budget recommendations</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <DestinationAutocomplete
            value={budgetData.destination}
            onChange={handleDestinationChange}
            placeholder="e.g., Goa, Kerala"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Range (₹)
          </label>
          <input
            type="number"
            name="budget"
            value={budgetData.budget}
            onChange={handleInputChange}
            placeholder="Enter your budget"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <select
            name="duration"
            value={budgetData.duration}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {durationOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value="Budget-friendly"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Budget-friendly">Budget-friendly</option>
            <option value="Balanced">Balanced</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {budgetWarning && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p className="text-sm">{budgetWarning}</p>
        </div>
      )}
      
      {minimumBudgetInfo && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-md">
          <p className="text-sm font-medium">Minimum Budget Requirement</p>
          <p className="text-sm">
            For {minimumBudgetInfo.destination} for {minimumBudgetInfo.duration}, the minimum recommended budget is {formatCurrency(minimumBudgetInfo.minimumBudget)}.
          </p>
        </div>
      )}

      <div className="flex space-x-3 pt-2">
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Optimizing...' : 'Optimize My Budget'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Reset
        </button>
      </div>

      {optimizationResult && (
        <div className="mt-6 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{budgetData.destination}</h2>
            <p className="text-gray-600 italic text-sm">
              {getCreativeDestinationText(budgetData.destination)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-green-800 font-medium">Estimated Savings</span>
              <span className="text-green-800 font-bold">
                {formatCurrency(optimizationResult.optimizedBudget.estimatedSavings)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderCustomizedLabel}
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown & Tips</h3>
            <div className="space-y-4">
              {optimizationResult.optimizedBudget.breakdown.flights.available && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <h4 className="font-medium text-blue-900">Flights</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Book flights 6-8 weeks in advance for better prices. Use price tracking tools to monitor fare changes.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original: {formatCurrency(optimizationResult.optimizedBudget.breakdown.flights.original)}</span>
                    <span className="font-medium">Optimized: {formatCurrency(optimizationResult.optimizedBudget.breakdown.flights.optimized)}</span>
                    <span className="text-green-600">Save: {formatCurrency(optimizationResult.optimizedBudget.breakdown.flights.savings)}</span>
                  </div>
                </div>
              )}

              {optimizationResult.optimizedBudget.breakdown.accommodation.available && (
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <h4 className="font-medium text-green-900">Accommodation</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Consider homestays, guesthouses, or weekday bookings for better rates. Book directly with hotels when possible.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original: {formatCurrency(optimizationResult.optimizedBudget.breakdown.accommodation.original)}</span>
                    <span className="font-medium">Optimized: {formatCurrency(optimizationResult.optimizedBudget.breakdown.accommodation.optimized)}</span>
                    <span className="text-green-600">Save: {formatCurrency(optimizationResult.optimizedBudget.breakdown.accommodation.savings)}</span>
                  </div>
                </div>
              )}

              {optimizationResult.optimizedBudget.breakdown.activities.available && (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-medium text-yellow-900">Activities</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Join free walking tours, explore local markets, and look for city tourism cards that offer multiple attractions at discounted rates.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original: {formatCurrency(optimizationResult.optimizedBudget.breakdown.activities.original)}</span>
                    <span className="font-medium">Optimized: {formatCurrency(optimizationResult.optimizedBudget.breakdown.activities.optimized)}</span>
                    <span className="text-green-600">Save: {formatCurrency(optimizationResult.optimizedBudget.breakdown.activities.savings)}</span>
                  </div>
                </div>
              )}

              {optimizationResult.optimizedBudget.breakdown.food.available && (
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h4 className="font-medium text-red-900">Food</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Try local street food, eat where locals eat, and consider accommodations with kitchen facilities to prepare some meals.
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original: {formatCurrency(optimizationResult.optimizedBudget.breakdown.food.original)}</span>
                    <span className="font-medium">Optimized: {formatCurrency(optimizationResult.optimizedBudget.breakdown.food.optimized)}</span>
                    <span className="text-green-600">Save: {formatCurrency(optimizationResult.optimizedBudget.breakdown.food.savings)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Try Different Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetOptimizer;