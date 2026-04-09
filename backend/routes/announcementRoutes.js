const express = require('express');
const {
  createAnnouncement,
  getUserAnnouncements,
  getAdminAnnouncements,
  getAllAnnouncements,
  markRead,
} = require('../controllers/announcementController');
const verifyToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/', verifyToken, createAnnouncement);
router.get('/user/:userId', verifyToken, getUserAnnouncements);
router.get('/admin/:adminId', verifyToken, getAdminAnnouncements);
router.get('/all', verifyToken, getAllAnnouncements);
router.patch('/:id/read/:userId', verifyToken, markRead);

module.exports = router;
