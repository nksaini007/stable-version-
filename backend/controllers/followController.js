const User = require("../models/userModel");

/**
 * POST /api/follow/:userId — Follow a user
 */
const followUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    if (targetId === currentId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    // Check if already following
    if (target.followers.includes(currentId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add to target's followers
    target.followers.push(currentId);
    await target.save();

    // Add to current user's following
    await User.findByIdAndUpdate(currentId, { $addToSet: { following: targetId } });

    res.json({
      message: "Followed successfully",
      followersCount: target.followers.length,
      isFollowing: true,
    });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/follow/:userId — Unfollow a user
 */
const unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    // Remove from target's followers
    target.followers = target.followers.filter(
      (id) => id.toString() !== currentId.toString()
    );
    await target.save();

    // Remove from current user's following
    await User.findByIdAndUpdate(currentId, { $pull: { following: targetId } });

    res.json({
      message: "Unfollowed successfully",
      followersCount: target.followers.length,
      isFollowing: false,
    });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/follow/:userId/status — Check follow status
 */
const checkFollowStatus = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user._id;

    const target = await User.findById(targetId).select("followers");
    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = target.followers.includes(currentId);
    res.json({ isFollowing, followersCount: target.followers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/follow/:userId/followers — Get followers count (public)
 */
const getFollowersCount = async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select("followers following");
    if (!target) return res.status(404).json({ message: "User not found" });

    res.json({
      followersCount: target.followers?.length || 0,
      followingCount: target.following?.length || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowersCount,
};
