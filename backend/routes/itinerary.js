const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const Ollama = require('ollama');

// Check Ollama connection
const checkOllamaConnection = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error) {
    console.error('Ollama connection check failed:', error);
    return false;
  }
};

// Generate a new itinerary using Ollama AI
router.post('/generate', async (req, res) => {
  try {
    const { destinations, startDate, endDate, travelerType, preferences } = req.body;

    if (!destinations || !startDate || !endDate || !travelerType || !preferences) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, create or get a default user
    let defaultUser = await User.findOne({ email: "default@example.com" });

    if (!defaultUser) {
      defaultUser = new User({
        email: "default@example.com",
        name: "Default User"
      });
      await defaultUser.save();
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check if Ollama is available
    const ollamaAvailable = await checkOllamaConnection();

    if (!ollamaAvailable) {
      console.log('Ollama not available, using fallback itinerary');
      
      // Return fallback itinerary
      const fallbackItinerary = {
        title: `${days}-Day Trip to ${destinations}`,
        days: Array.from({ length: days }, (_, i) => {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          
          return {
            dayNumber: i + 1,
            date: currentDate.toISOString().split('T')[0],
            description: `Day ${i + 1} of your ${travelerType} trip to ${destinations}`,
            activities: [
              {
                title: `Explore ${destinations}`,
                type: "activity",
                description: "Discover the local culture and attractions",
                location: destinations,
                startTime: "09:00",
                endTime: "12:00",
                cost: 0,
                notes: "Ollama AI service not available - please ensure Ollama is running"
              }
            ]
          };
        })
      };

      const savedItinerary = new Itinerary({
        title: fallbackItinerary.title,
        destinations,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelerType,
        preferences: preferences,
        userId: defaultUser._id,
        days: fallbackItinerary.days
      });

      await savedItinerary.save();

      return res.status(201).json({
        success: true,
        itinerary: savedItinerary,
        warning: "Ollama AI service not available - please ensure Ollama is running and try again"
      });
    }

    try {
      // Initialize Ollama
      console.log('Connecting to Ollama...');
      
      // Create a detailed prompt for itinerary generation
      const prompt = `Generate a detailed travel itinerary for the following requirements:

Destination: ${destinations}
Travel Dates: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}
Number of Days: ${days}
Traveler Type: ${travelerType}
Preferences: ${preferences.join(', ')}

Please provide a day-wise itinerary with the following structure:
- Day 1: [Date]
  - Morning: [Activity with location and brief description]
  - Afternoon: [Activity with location and brief description]
  - Evening: [Activity with location and brief description]
  - Night: [Activity with location and brief description]

For each day, include a mix of activities based on the preferences. Focus on real, actual places and attractions in ${destinations}. Include famous landmarks, temples, beaches, markets, museums, and other tourist attractions that are actually present in the destination.

Please format the response as a JSON object with the following structure:
{
  "title": "Trip to [Destination]",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "description": "Brief overview of the day",
      "activities": [
        {
          "title": "Activity Name",
          "type": "activity|accommodation|restaurant|transport",
          "description": "Detailed description",
          "location": "Location name",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "cost": 0,
          "notes": "Additional notes"
        }
      ]
    }
  ]
}

Make sure to include:
1. Real and actual places that exist in ${destinations}
2. Proper timing for each activity
3. Logical flow of activities throughout the day
4. Mix of cultural, historical, and recreational activities
5. Accurate location names and descriptions`;

      // Generate itinerary using Ollama
      console.log('Generating itinerary with Ollama...');
      
      const response = await Ollama.chat({
        model: 'llama2',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner who creates detailed, practical, and personalized travel itineraries. Always respond with valid JSON format. Focus on real, actual places and attractions that exist in the destination.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2000
        }
      });

      console.log('Ollama response received:', response.message.content);

      // Parse the AI response
      let itinerary;
      try {
        // Extract JSON from the response (in case there's additional text)
        const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          itinerary = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed itinerary from AI response');
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('AI Response:', response.message.content);
        throw new Error('Failed to parse AI response');
      }

      // Validate the itinerary structure
      if (!itinerary.title || !itinerary.days || !Array.isArray(itinerary.days)) {
        throw new Error('Invalid itinerary structure from AI');
      }

      // Ensure each day has required fields
      itinerary.days = itinerary.days.map((day, index) => {
        if (!day.dayNumber) day.dayNumber = index + 1;
        if (!day.date) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + index);
          day.date = currentDate.toISOString().split('T')[0];
        }
        if (!day.description) day.description = `Day ${index + 1} of your ${travelerType} trip to ${destinations}`;
        if (!day.activities || !Array.isArray(day.activities)) {
          day.activities = [];
        }
        
        // Ensure each activity has required fields
        day.activities = day.activities.map(activity => ({
          title: activity.title || 'Activity',
          type: activity.type || 'activity',
          description: activity.description || '',
          location: activity.location || destinations,
          startTime: activity.startTime || '09:00',
          endTime: activity.endTime || '10:00',
          cost: activity.cost || 0,
          notes: activity.notes || ''
        }));
        
        return day;
      });

      // Save itinerary to database
      const savedItinerary = new Itinerary({
        title: itinerary.title,
        destinations,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelerType,
        preferences: preferences,
        userId: defaultUser._id,
        days: itinerary.days
      });

      await savedItinerary.save();
      console.log('Itinerary saved to database');

      res.status(201).json({
        success: true,
        itinerary: savedItinerary
      });

    } catch (aiError) {
      console.error('AI service error:', aiError);
      
      // Fallback to basic itinerary if AI fails
      const fallbackItinerary = {
        title: `${days}-Day Trip to ${destinations}`,
        days: Array.from({ length: days }, (_, i) => {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          
          return {
            dayNumber: i + 1,
            date: currentDate.toISOString().split('T')[0],
            description: `Day ${i + 1} of your ${travelerType} trip to ${destinations}`,
            activities: [
              {
                title: `Explore ${destinations}`,
                type: "activity",
                description: "Discover the local culture and attractions",
                location: destinations,
                startTime: "09:00",
                endTime: "12:00",
                cost: 0,
                notes: "AI service unavailable - using fallback itinerary"
              }
            ]
          };
        })
      };

      const savedItinerary = new Itinerary({
        title: fallbackItinerary.title,
        destinations,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        travelerType,
        preferences: preferences,
        userId: defaultUser._id,
        days: fallbackItinerary.days
      });

      await savedItinerary.save();

      res.status(201).json({
        success: true,
        itinerary: savedItinerary,
        warning: "AI service unavailable - using fallback itinerary"
      });
    }

  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Get itinerary by ID
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    res.json({ itinerary });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

// Update itinerary
router.put('/:id', async (req, res) => {
  try {
    const { title, isPublic } = req.body;
    
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { title, isPublic },
      { new: true }
    );
    
    if (!updatedItinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    res.json({ itinerary: updatedItinerary });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
});

// Share itinerary
router.post('/:id/share', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Generate share token if not exists
    if (!itinerary.shareToken) {
      itinerary.shareToken = uuidv4();
      await itinerary.save();
    }
    
    const shareUrl = `${req.protocol}://${req.get('host')}/shared/${itinerary.shareToken}`;
    
    res.json({ shareUrl });
  } catch (error) {
    console.error('Error sharing itinerary:', error);
    res.status(500).json({ error: 'Failed to share itinerary' });
  }
});

// Add activity to a day
router.post('/:id/day/:dayId/activity', async (req, res) => {
  try {
    const { title, type, description, location, startTime, endTime, cost, notes } = req.body;
    
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    const day = itinerary.days.id(req.params.dayId);
    
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }
    
    day.activities.push({
      title,
      type,
      description,
      location,
      startTime,
      endTime,
      cost,
      notes
    });
    
    await itinerary.save();
    
    res.json({ success: true, activity: day.activities[day.activities.length - 1] });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Update activity
router.put('/:id/activity/:activityId', async (req, res) => {
  try {
    const { title, type, description, location, startTime, endTime, cost, notes } = req.body;
    
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Find the activity in any day
    let activityFound = false;
    
    itinerary.days.forEach(day => {
      const activity = day.activities.id(req.params.activityId);
      if (activity) {
        activity.title = title;
        activity.type = type;
        activity.description = description;
        activity.location = location;
        activity.startTime = startTime;
        activity.endTime = endTime;
        activity.cost = cost;
        activity.notes = notes;
        activityFound = true;
      }
    });
    
    if (!activityFound) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    await itinerary.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id/activity/:activityId', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Find and remove the activity from any day
    let activityFound = false;
    
    itinerary.days.forEach(day => {
      const activityIndex = day.activities.findIndex(a => a._id.toString() === req.params.activityId);
      if (activityIndex !== -1) {
        day.activities.splice(activityIndex, 1);
        activityFound = true;
      }
    });
    
    if (!activityFound) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    await itinerary.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;