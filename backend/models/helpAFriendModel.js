const mongoose = require('mongoose');

const helpAFriendSchema = new mongoose.Schema({
  reporterName: {
    type: String,
    required: true,
  },
  reporterEmail: {
    type: String,
    required: true,
  },
  reporterRollNo: {
    type: String,
  },
  friendName: {
    type: String,
    required: true,
  },
  friendRollNo: {
    type: String,
  },
  friendContact: {
    type: String,
  },
  issue: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HelpAFriend = mongoose.model('HelpAFriend', helpAFriendSchema);

module.exports = HelpAFriend;
