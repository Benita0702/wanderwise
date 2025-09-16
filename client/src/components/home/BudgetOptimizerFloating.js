import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, TrendingDown, Plane, Hotel, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#f59e0b'];

export function BudgetOptimizerFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState('balanced');
  const [suggestions, setSuggestions] = useState(null);

  const optimizeBudget = () => {
    if (!budget || !destination || !duration) {
      alert('Please fill in all fields');
      return;
    }

    const budgetNum = parseInt(budget);
    const days = parseInt(duration);
    const dailySpend = Math.round(budgetNum / days);

    // Base allocations
    let allocations = {
      flights: 0.4,
      accommodation: 0.3,
      activities: 0.2,
    };

    // Adjust based on priority
    if (priority === 'luxury') allocations.accommodation += 0.1;
    if (priority === 'foodie') allocations.activities += 0.1;
    if (priority === 'adventure') allocations.activities += 0.15;

    // Normalize to sum = 1
    const total = Object.values(allocations).reduce((a, b) => a + b, 0);
    Object.keys(allocations).forEach(
      (key) => (allocations[key] = allocations[key] / total)
    );

    setSuggestions({
      originalBudget: budgetNum,
      optimizedBudget: Math.round(budgetNum * 0.85),
      savings: Math.round(budgetNum * 0.15),
      dailySpend,
      recommendations: [
        {
          category: 'Flights',
          original: Math.round(budgetNum * allocations.flights),
          optimized: Math.round(budgetNum * allocations.flights * 0.9),
          tip: 'Book flights 6-8 weeks early and use fare trackers.',
          icon: Plane,
        },
        {
          category: 'Accommodation',
          original: Math.round(budgetNum * allocations.accommodation),
          optimized: Math.round(budgetNum * allocations.accommodation * 0.85),
          tip: 'Stay in homestays, guesthouses, or book weekday stays.',
          icon: Hotel,
        },
        {
          category: 'Activities',
          original: Math.round(budgetNum * allocations.activities),
          optimized: Math.round(budgetNum * allocations.activities * 0.8),
          tip: 'Join free walking tours and explore local street markets.',
          icon: MapPin,
        },
      ],
    });
  };

  const resetOptimizer = () => {
    setSuggestions(null);
    setBudget('');
    setDestination('');
    setDuration('');
    setPriority('balanced');
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-6 z-40 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors ${
          isOpen ? 'hidden' : 'block'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Calculator className="h-5 w-5" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-20 right-0 z-40 w-96 h-[calc(100%-80px)] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto"
          >

            {/* Header */}
              <div className="bg-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <h3 className="font-semibold">Budget Optimizer</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetOptimizer}
                  className="p-1 hover:bg-green-500 rounded text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-green-500 rounded"
                >
                  <X className="h-5 w-5" /> {/* proper close button */}
                </button>
              </div>
            </div>

            <div className="p-6">
              {!suggestions ? (
                /* Input Form */
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Let's optimize your travel budget
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Get personalized recommendations to save money on your trip
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Goa, Kerala"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range (₹)
                      </label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter amount in ₹"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select duration</option>
                        <option value="3">3 Days</option>
                        <option value="5">5 Days</option>
                        <option value="7">7 Days</option>
                        <option value="10">10+ Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="balanced">Balanced</option>
                        <option value="luxury">Luxury Stay</option>
                        <option value="foodie">Foodie</option>
                        <option value="adventure">Adventurer</option>
                      </select>
                    </div>

                    <button
                      onClick={optimizeBudget}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Optimize My Budget
                    </button>
                  </div>
                </div>
              ) : (
                /* Results */
                <div className="space-y-6">
                  {/* Savings Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-900">
                        Potential Savings
                      </h4>
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        ₹{suggestions.savings.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700">
                        Save {Math.round((suggestions.savings / suggestions.originalBudget) * 100)}% on your trip
                      </div>
                      <div className="mt-2 text-gray-700 text-sm">
                        Daily Spend: <span className="font-semibold">₹{suggestions.dailySpend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Budget Allocation</h4>
                    <PieChart width={300} height={220}>
                      <Pie
                        data={suggestions.recommendations.map(rec => ({
                          name: rec.category,
                          value: rec.optimized,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {suggestions.recommendations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Cost Breakdown & Tips
                    </h4>
                    <div className="space-y-4">
                      {suggestions.recommendations.map((rec, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <rec.icon className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">{rec.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 line-through">
                                ₹{rec.original.toLocaleString()}
                              </div>
                              <div className="font-semibold text-green-600">
                                ₹{rec.optimized.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{rec.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={resetOptimizer}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Try Different Budget
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
