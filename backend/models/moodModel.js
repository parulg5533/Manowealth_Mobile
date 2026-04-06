const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mood: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  stress: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sleep: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  energy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  appetite: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const MoodModel = mongoose.model('Mood', moodSchema);
module.exports = { MoodModel };
