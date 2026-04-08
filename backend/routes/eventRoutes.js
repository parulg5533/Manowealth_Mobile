const express = require('express');
const {
  getEvents,
  createEvent,
  deleteEvent,
  getEventNotifications,
  markNotifsRead,
} = require('../controllers/eventController');
const verifyToken = require('../middlewares/authenticateToken');

const router = express.Router();

// Public — anyone can view events (home screen & dashboard without login)
router.get('/', getEvents);

// Protected — only logged-in admin / super admin can create
router.post('/', verifyToken, createEvent);

// User event notifications — must come BEFORE /:id to avoid route conflict
router.get('/notifications/:userId', verifyToken, getEventNotifications);
router.patch('/notifications/read/:userId', verifyToken, markNotifsRead);

// Protected — delete by ID
router.delete('/:id', verifyToken, deleteEvent);

module.exports = router;
