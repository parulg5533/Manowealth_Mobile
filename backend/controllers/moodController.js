const { MoodModel } = require('../models/moodModel');

const logMood = async (req, res) => {
  const { userId, mood, stress, sleep, energy, appetite } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const newMoodLog = await MoodModel.create({
      user: userId,
      mood,
      stress,
      sleep,
      energy,
      appetite
    });
    return res.status(201).json({ message: "Mood logged successfully", data: newMoodLog });
  } catch (error) {
    console.error("Error logging mood:", error);
    return res.status(500).json({ error: "Failed to log mood." });
  }
};

const getMoodLogs = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const logs = await MoodModel.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching mood logs:", error);
    return res.status(500).json({ error: "Failed to fetch mood logs." });
  }
};

module.exports = { logMood, getMoodLogs };