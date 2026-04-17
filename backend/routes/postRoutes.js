const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const {
    uploadPostImage,
    createPost,
    updatePost,
    getPosts,
    getPostById,
    getPostBySlug,
    likePost,
    addComment,
    deletePost,
    deleteComment,
} = require("../controllers/postController");

// Public routes
router.get("/", getPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id", getPostById);

// Protected routes (Any logged in user)
router.put("/:id/like", protect, likePost);
router.post("/:id/comment", protect, addComment);

// Admin-only routes
router.post("/", protect, adminOnly, uploadPostImage, createPost);
router.put("/:id", protect, adminOnly, uploadPostImage, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);
router.delete("/:id/comment/:commentId", protect, adminOnly, deleteComment);

module.exports = router;
