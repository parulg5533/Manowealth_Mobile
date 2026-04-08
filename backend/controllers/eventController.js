const Event = require('../models/eventModel');
const EventNotif = require('../models/eventNotifModel');
const userModel = require('../models/userSchema');

// @desc    Get all events (public)
// @route   GET /v1/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving events', error: error.message });
  }
};

// @desc    Create a new event (admin / super admin)
// @route   POST /v1/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, eventDate, venue, location, createdByRole } = req.body;

    if (!title || !description || !eventDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, description and eventDate' });
    }

    const resolvedVenue = venue || location || 'TBD';
    const event = await Event.create({
      title,
      description,
      eventDate,
      venue: resolvedVenue,
      location: resolvedVenue,
      createdByRole: createdByRole || 'admin',
    });

    // When super admin creates event → notify all users
    if (createdByRole === 'superadmin') {
      try {
        const users = await userModel.find({}, '_id');
        if (users.length > 0) {
          const notifs = users.map(u => ({
            userId: u._id,
            eventId: event._id,
            eventTitle: event.title,
            read: false,
          }));
          await EventNotif.insertMany(notifs);
        }
      } catch (notifErr) {
        console.log('Event notification creation error:', notifErr.message);
        // Don't fail the event creation if notification fails
      }
    }

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
    // Also clean up notifications for this event
    await EventNotif.deleteMany({ eventId: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting event', error: error.message });
  }
};

// @desc    Get unread event notifications for a user
// @route   GET /v1/event-notifications/:userId
exports.getEventNotifications = async (req, res) => {
  try {
    const notifs = await EventNotif.find({ userId: req.params.userId, read: false })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ count: notifs.length, notifications: notifs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// @desc    Mark all event notifications as read for a user
// @route   PATCH /v1/event-notifications/read/:userId
exports.markNotifsRead = async (req, res) => {
  try {
    await EventNotif.updateMany({ userId: req.params.userId, read: false }, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications read', error: error.message });
  }
};
