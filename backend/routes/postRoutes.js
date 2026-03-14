const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const {
    uploadPostImage,
    createPost,
    getPosts,
    getPostById,
    likePost,
    addComment,
    deletePost,
    deleteComment,
} = require("../controllers/postController");

// Public routes
router.get("/", getPosts);
router.get("/:id", getPostById);

// Protected routes (Any logged in user)
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);

// Admin-only routes
router.post("/", protect, adminOnly, uploadPostImage, createPost);
router.delete("/:id", protect, adminOnly, deletePost);
router.delete("/:id/comment/:commentId", protect, adminOnly, deleteComment);

module.exports = router;
