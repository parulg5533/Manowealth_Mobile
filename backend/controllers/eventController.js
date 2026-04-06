const Event = require('../models/eventModel');

// @desc    Get all events
// @route   GET /v1/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving events', error: error.message });
  }
};

// @desc    Create a new event
// @route   POST /v1/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, eventDate, location } = req.body;

    if (!title || !description || !eventDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, description and eventDate' });
    }

    const event = await Event.create({ title, description, eventDate, location });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating event', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /v1/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting event', error: error.message });
  }
};
