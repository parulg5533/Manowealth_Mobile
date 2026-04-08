const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
  },
  eventDate: {
    type: Date,
    required: [true, 'Please provide an event date'],
  },
  venue: {
    type: String,
    default: 'TBD',
  },
  location: {
    type: String,
    default: 'TBD',
  },
  createdByRole: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
