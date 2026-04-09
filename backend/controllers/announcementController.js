const Announcement = require('../models/announcementModel');
const User = require('../models/userSchema');
const mongoose = require('mongoose');

// ─── POST / ───────────────────────────────────────────────────────────────────
// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      sentByRole,
      sentById,
      sentByName,
      recipientType,
      recipientId,
    } = req.body;

    if (!title || !message || !sentByRole || !sentById || !recipientType) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    let recipients = [];

    if (recipientType === 'admin_students') {
      // Fetch all users assigned to this admin
      const students = await User.find(
        { assigned_admin: new mongoose.Types.ObjectId(sentById) },
        '_id'
      );
      recipients = students.map((s) => s._id);
    } else if (recipientType === 'individual') {
      if (!recipientId) {
        return res.status(400).json({ success: false, message: 'recipientId is required for individual type.' });
      }
      recipients = [new mongoose.Types.ObjectId(recipientId)];
    }
    // all_users, all_admins, broadcast_all → recipients stays []

    const announcement = await Announcement.create({
      title,
      message,
      sentByRole,
      sentById: new mongoose.Types.ObjectId(sentById),
      sentByName: sentByName || '',
      recipientType,
      recipients,
      readBy: [],
    });

    return res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error('createAnnouncement error:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ─── GET /user/:userId ────────────────────────────────────────────────────────
// Announcements visible to a regular user
exports.getUserAnnouncements = async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const announcements = await Announcement.find({
      $or: [
        { recipientType: 'all_users' },
        { recipientType: 'broadcast_all' },
        {
          recipientType: { $in: ['individual', 'admin_students'] },
          recipients: userObjId,
        },
      ],
    }).sort({ createdAt: -1 });

    const mapped = announcements.map((a) => {
      const obj = a.toObject();
      obj.isRead = a.readBy.some((id) => id.equals(userObjId));
      return obj;
    });

    const unreadCount = mapped.filter((a) => !a.isRead).length;

    return res.status(200).json({ success: true, announcements: mapped, unreadCount });
  } catch (error) {
    console.error('getUserAnnouncements error:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ─── GET /admin/:adminId ──────────────────────────────────────────────────────
// Announcements visible to an admin
exports.getAdminAnnouncements = async (req, res) => {
  try {
    const { adminId } = req.params;
    const adminObjId = new mongoose.Types.ObjectId(adminId);

    const announcements = await Announcement.find({
      $or: [
        { recipientType: 'all_admins' },
        { recipientType: 'broadcast_all' },
        {
          recipientType: 'individual',
          recipients: adminObjId,
        },
      ],
    }).sort({ createdAt: -1 });

    const mapped = announcements.map((a) => {
      const obj = a.toObject();
      obj.isRead = a.readBy.some((id) => id.equals(adminObjId));
      return obj;
    });

    const unreadCount = mapped.filter((a) => !a.isRead).length;

    return res.status(200).json({ success: true, announcements: mapped, unreadCount });
  } catch (error) {
    console.error('getAdminAnnouncements error:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ─── GET /all ─────────────────────────────────────────────────────────────────
// All announcements — superadmin view
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('getAllAnnouncements error:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ─── PATCH /:id/read/:userId ──────────────────────────────────────────────────
// Mark an announcement as read for a specific user
exports.markRead = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await Announcement.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('markRead error:', error);
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
