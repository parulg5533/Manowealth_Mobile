const HelpAFriend = require('../models/helpAFriendModel');

const submitHelpAFriend = async (req, res) => {
  try {
    const {
      reporterName,
      reporterEmail,
      reporterRollNo,
      friendName,
      friendRollNo,
      friendContact,
      issue,
      reason,
    } = req.body;

    if (!reporterName || !reporterEmail || !friendName || !friendContact || !issue || !reason) {
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }

    const newReport = new HelpAFriend({
      reporterName,
      reporterEmail,
      reporterRollNo: reporterRollNo || '',
      friendName,
      friendRollNo: friendRollNo || '',
      friendContact,
      issue,
      reason,
    });

    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getHelpAFriendEntries = async (req, res) => {
  try {
    const entries = await HelpAFriend.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { submitHelpAFriend, getHelpAFriendEntries };