'use strict';

/**
 * budget-optimizer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::budget-optimizer.budget-optimizer', ({ strapi }) => ({
  async optimize(ctx) {
    try {
      const { budget, destination, duration, priority } = ctx.request.body;

      // Validate input
      if (!budget || !destination || !duration) {
        return ctx.badRequest('Missing required fields: budget, destination, duration');
      }

      if (typeof budget !== 'number' || budget <= 0) {
        return ctx.badRequest('Budget must be a positive number');
      }

      // Check minimum budget requirements
      const minimumBudget = getMinimumBudget(destination, duration);
      
      if (budget < minimumBudget) {
        return ctx.badRequest(
          `The budget of ₹${budget} is below the minimum recommended budget of ₹${minimumBudget} for ${destination} for ${duration}. Please increase your budget for a better travel experience.`
        );
      }

      // Get AI-powered budget optimization
      const optimizationResult = await getAIBudgetOptimization(budget, destination, duration);

      return {
        success: true,
        data: optimizationResult
      };

    } catch (error) {
      console.error('Budget optimization error:', error);
      return ctx.internalServerError('Failed to optimize budget. Please try again later.');
    }
  }
}));

// Minimum budget requirements for different destinations and durations
const MINIMUM_BUDGETS = {
  'Goa': {
    '1-2 days': 3000,
    '3-5 days': 7000,
    '1 week': 12000,
    '2 weeks': 20000,
    '3 weeks': 28000,
    '1 month': 35000
  },
  'Mumbai': {
    '1-2 days': 4000,
    '3-5 days': 9000,
    '1 week': 15000,
    '2 weeks': 25000,
    '3 weeks': 35000,
    '1 month': 45000
  },
  'Delhi': {
    '1-2 days': 3500,
    '3-5 days': 8000,
    '1 week': 14000,
    '2 weeks': 23000,
    '3 weeks': 32000,
    '1 month': 40000
  },
  'Bangalore': {
    '1-2 days': 4000,
    '3-5 days': 9000,
    '1 week': 16000,
    '2 weeks': 28000,
    '3 weeks': 38000,
    '1 month': 48000
  },
  'Shimla': {
    '1-2 days': 5000,
    '3-5 days': 12000,
    '1 week': 20000,
    '2 weeks': 35000,
    '3 weeks': 48000,
    '1 month': 60000
  },
  'Manali': {
    '1-2 days': 6000,
    '3-5 days': 15000,
    '1 week': 25000,
    '2 weeks': 40000,
    '3 weeks': 55000,
    '1 month': 70000
  },
  'Kashmir': {
    '1-2 days': 8000,
    '3-5 days': 20000,
    '1 week': 35000,
    '2 weeks': 60000,
    '3 weeks': 85000,
    '1 month': 110000
  },
  'Kerala': {
    '1-2 days': 6000,
    '3-5 days': 15000,
    '1 week': 25000,
    '2 weeks': 40000,
    '3 weeks': 55000,
    '1 month': 70000
  },
  'Rajasthan': {
    '1-2 days': 5000,
    '3-5 days': 12000,
    '1 week': 22000,
    '2 weeks': 38000,
    '3 weeks': 52000,
    '1 month': 65000
  },
  'Andaman': {
    '1-2 days': 10000,
    '3-5 days': 25000,
    '1 week': 45000,
    '2 weeks': 80000,
    '3 weeks': 110000,
    '1 month': 140000
  }
};

// Default minimum budget for destinations not in the list
const DEFAULT_MINIMUM_BUDGETS = {
  '1-2 days': 4000,
  '3-5 days': 9000,
  '1 week': 16000,
  '2 weeks': 28000,
  '3 weeks': 38000,
  '1 month': 48000
};

function getMinimumBudget(destination, duration) {
  // Check if destination is in our predefined list
  for (const [key, value] of Object.entries(MINIMUM_BUDGETS)) {
    if (destination.toLowerCase().includes(key.toLowerCase())) {
      return value[duration] || DEFAULT_MINIMUM_BUDGETS[duration];
    }
  }
  
  // Return default budget if destination not found
  return DEFAULT_MINIMUM_BUDGETS[duration];
}

function generateBudgetOptimization(budget, destination, duration) {
  const minimumBudget = getMinimumBudget(destination, duration);
  
  // If budget is below minimum, we'll still generate a breakdown but it will be tight
  const actualBudget = Math.max(budget, minimumBudget);
  
  // Generate base percentages for different categories
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
    // Beach destinations - higher accommodation cost
    basePercentages.accommodation = 0.35;
    basePercentages.flights = 0.30;
    basePercentages.activities = 0.20;
    basePercentages.food = 0.15;
  } else if (destination.toLowerCase().includes('shimla') || 
             destination.toLowerCase().includes('manali') || 
             destination.toLowerCase().includes('kashmir')) {
    // Mountain destinations - higher activities cost
    basePercentages.activities = 0.25;
    basePercentages.accommodation = 0.30;
    basePercentages.flights = 0.30;
    basePercentages.food = 0.15;
  }
  
  // Calculate original costs (with some inefficiency)
  const inefficiencyFactor = 1.2; // 20% inefficiency in original planning
  
  const originalCosts = {
    flights: Math.round(actualBudget * basePercentages.flights * inefficiencyFactor),
    accommodation: Math.round(actualBudget * basePercentages.accommodation * inefficiencyFactor),
    activities: Math.round(actualBudget * basePercentages.activities * inefficiencyFactor),
    food: Math.round(actualBudget * basePercentages.food * inefficiencyFactor)
  };
  
  // Calculate optimized costs
  const optimizedCosts = {
    flights: Math.round(actualBudget * basePercentages.flights),
    accommodation: Math.round(actualBudget * basePercentages.accommodation),
    activities: Math.round(actualBudget * basePercentages.activities),
    food: Math.round(actualBudget * basePercentages.food)
  };
  
  // Calculate savings
  const savings = {
    flights: originalCosts.flights - optimizedCosts.flights,
    accommodation: originalCosts.accommodation - optimizedCosts.accommodation,
    activities: originalCosts.activities - optimizedCosts.activities,
    food: originalCosts.food - optimizedCosts.food
  };
  
  // Determine availability based on destination and duration
  const hasFlights = !destination.toLowerCase().includes('mumbai') && 
                    !destination.toLowerCase().includes('delhi') && 
                    !destination.toLowerCase().includes('bangalore') &&
                    !destination.toLowerCase().includes('pune') &&
                    !destination.toLowerCase().includes('chennai') &&
                    !destination.toLowerCase().includes('kolkata') &&
                    !destination.toLowerCase().includes('hyderabad');
  
  const breakdown = {
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
  };
  
  const totalOriginalCost = Object.values(originalCosts).reduce((sum, cost) => sum + cost, 0);
  const totalOptimizedCost = Object.values(optimizedCosts).reduce((sum, cost) => sum + cost, 0);
  const estimatedSavings = totalOriginalCost - totalOptimizedCost;
  
  return {
    totalBudget: actualBudget,
    estimatedSavings,
    breakdown
  };
}

async function getAIBudgetOptimization(budget, destination, duration) {
  try {
    // Note: You'll need to configure the ZAI SDK with your API key
    const ZAI = require('z-ai-web-dev-sdk');
    const zai = await ZAI.create();
    
    const prompt = `
You are a travel budget optimization expert. I need you to provide a detailed budget breakdown for a trip to ${destination} for ${duration} with a total budget of ₹${budget}.

Please provide the optimization in the following JSON format:
{
  "flights": {
    "available": true/false,
    "original": number,
    "optimized": number,
    "savings": number
  },
  "accommodation": {
    "available": true/false,
    "original": number,
    "optimized": number,
    "savings": number
  },
  "activities": {
    "available": true/false,
    "original": number,
    "optimized": number,
    "savings": number
  },
  "food": {
    "available": true/false,
    "original": number,
    "optimized": number,
    "savings": number
  }
}

Guidelines:
1. Consider the destination type (beach, mountain, city, etc.) when allocating budget
2. Flights should be marked as unavailable for major metro cities like Mumbai, Delhi, Bangalore, etc.
3. Original costs should include typical inefficiencies (20-30% higher than optimized)
4. Optimized costs should reflect smart booking strategies and local insights
5. Ensure the total optimized costs don't exceed the budget
6. Provide realistic amounts based on Indian travel costs

Return only the JSON object, no additional text.
`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a travel budget optimization expert specializing in Indian destinations. Provide detailed, realistic budget breakdowns in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // Clean the response content - remove markdown code block formatting if present
    let cleanContent = responseContent.trim();
    
    // Remove ```json and ``` wrappers if they exist
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Remove any leading/trailing whitespace that might interfere with JSON parsing
    cleanContent = cleanContent.trim();
    
    // Parse the JSON response
    const aiBreakdown = JSON.parse(cleanContent);
    
    // Calculate totals and savings
    const totalOriginalCost = Object.values(aiBreakdown).reduce((sum, category) => sum + category.original, 0);
    const totalOptimizedCost = Object.values(aiBreakdown).reduce((sum, category) => sum + category.optimized, 0);
    const estimatedSavings = totalOriginalCost - totalOptimizedCost;

    return {
      totalBudget: budget,
      estimatedSavings,
      breakdown: aiBreakdown
    };
  } catch (error) {
    console.error('AI optimization failed, falling back to rule-based:', error);
    // Fallback to rule-based optimization
    return generateBudgetOptimization(budget, destination, duration);
  }
}