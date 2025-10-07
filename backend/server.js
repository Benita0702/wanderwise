// Add this to your existing server.js file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const itineraryRoutes = require('./routes/itinerary');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/travel_planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/itinerary', itineraryRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Travel Planner API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});