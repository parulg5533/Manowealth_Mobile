const express = require("express");
const router = express.Router();
const { submitReview, getAllReviews } = require("../controllers/ReviewController");
const verifyToken = require("../middlewares/authenticateToken");

router.post("/", verifyToken, submitReview);
router.get("/", getAllReviews);

module.exports = router;