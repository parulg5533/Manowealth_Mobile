const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  userName:{type:String,required:true},
  admin: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = { NotificationModel };
