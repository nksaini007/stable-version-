const express = require("express");
const router = express.Router();
const {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowersCount,
} = require("../controllers/followController");
const { protect } = require("../middlewares/authMiddleware");

// Public — get follower counts
router.get("/:userId/followers", getFollowersCount);

// Protected — follow actions
router.post("/:userId", protect, followUser);
router.delete("/:userId", protect, unfollowUser);
router.get("/:userId/status", protect, checkFollowStatus);

module.exports = router;
