const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  sentByRole: { type: String, enum: ['admin', 'superadmin'], required: true },
  sentById: { type: mongoose.Schema.Types.ObjectId, required: true },
  sentByName: { type: String, default: '' },
  recipientType: {
    type: String,
    enum: ['all_users', 'all_admins', 'broadcast_all', 'individual', 'admin_students'],
    required: true,
  },
  recipients: [{ type: mongoose.Schema.Types.ObjectId }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
