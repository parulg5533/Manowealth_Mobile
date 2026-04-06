const Review = require("../models/ReviewModel");
const userModel = require("../models/userSchema");

exports.submitReview = async (req, res) => {
  try {
    const { text, rating, year, branch } = req.body;
    const userId = req.decoded.userId || req.decoded.id; //checks userid then id

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const newReview = new Review({
      user: userId,
      text,
      rating: rating || 5,
      year,
      branch,
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "username email profile_pic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};