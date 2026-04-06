const {NotificationModel} = require("../models/notificationModel");

const sendSos = async (req, res) => {
  const { userId, admin, message, username } = req.body;
  // console.log(userId, admin, message, username )
  try {
    const notification = await NotificationModel.create({
      user: userId,
      admin:admin,
      message:message,
      userName: username,
    });

    return res
      .status(201)
      .json({ message: "Notification sent successfully"});
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
};

const getAllSoS = async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = await NotificationModel.find({ admin: id }).lean();
    if (!notifications || notifications.length === 0) {
      return res.status(404).send('no messages');
    }

    const Profile = require('../models/profileModel');
    const userModel = require('../models/userSchema');
    const mergedNotifications = [];

    for (const notification of notifications) {
      const profile = await Profile.findOne({ user: notification.user }).lean();
      const user = await userModel.findById(notification.user).lean();
      mergedNotifications.push({
        ...notification,
        rollNumber: profile?.rollNumber || "NA",
        instituteEmail: profile?.instituteEmail || "NA",
        email: user?.email || notification.userName,
        phoneNumber: profile?.contactNumber || "NA",
      });
    }

    return res.status(200).send(mergedNotifications);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
}

const markSosResolved = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.findByIdAndUpdate(
      id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'SOS alert not found' });
    return res.status(200).json({ message: 'SOS marked as resolved', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to mark SOS as resolved' });
  }
};

module.exports = { sendSos, getAllSoS, markSosResolved };