const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['accommodation', 'activity', 'restaurant', 'transport'],
    required: true
  },
  description: String,
  location: String,
  startTime: String,
  endTime: String,
  cost: {
    type: Number,
    default: 0
  },
  notes: String
}, { _id: true });

const daySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: String,
  activities: [activitySchema]
}, { _id: true });

const itinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  destinations: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  travelerType: {
    type: String,
    required: true
  },
  preferences: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  days: [daySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Itinerary', itinerarySchema);