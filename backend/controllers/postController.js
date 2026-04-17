const Post = require("../models/postModel");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Ensure upload directory exists
const postDir = path.join(__dirname, "..", "uploads", "posts");
if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });

// Multer Config for Post Images
const { storage } = require("../config/cloudinary");
const uploadPostImage = multer({ storage }).single("image");

// ==============================
// CREATE Post (Admin Only)
// POST /api/posts
// ==============================
const createPost = async (req, res) => {
    try {
        const { title, content, isBlog, blogUrl } = req.body;
        let image = null;

        if (req.file) {
            image = req.file.path;
        }

        // FormData sends booleans as strings — parse correctly
        const isBlogBool = isBlog === "true" || isBlog === true;

        const newPost = new Post({
            title,
            content: isBlogBool ? (content || "") : content,
            image,
            isBlog: isBlogBool,
            blogUrl: isBlogBool ? (blogUrl || null) : null,
            author: req.user._id,
        });

        const savedPost = await newPost.save();

        // Populate author before returning
        await savedPost.populate("author", "name profileImage role");

        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// GET All Posts (Public)
// GET /api/posts
// ==============================
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name profileImage role")
            .populate("comments.user", "name profileImage role")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// GET Single Post (Public)
// GET /api/posts/:id
// ==============================
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name profileImage role")
            .populate("comments.user", "name profileImage role");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        console.error("Error fetching post by ID:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// LIKE / UNLIKE Post
// PUT /api/posts/:id/like
// ==============================
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user._id;
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        console.error("Error liking post:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// ADD COMMENT to Post
// POST /api/posts/:id/comment
// ==============================
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = {
            user: req.user._id,
            text,
        };

        post.comments.push(newComment);
        await post.save();

        // Populate user details for the new comment
        await post.populate("comments.user", "name profileImage role");

        res.status(201).json(post.comments);
    } catch (error) {
        console.error("Error adding comment:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// DELETE Post (Admin Only)
// DELETE /api/posts/:id
// ==============================
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Ensure user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ==============================
// UPDATE Post (Admin Only)
// PUT /api/posts/:id
// ==============================
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, isBlog, blogUrl } = req.body;
        
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Ensure user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to update posts" });
        }

        const isBlogBool = isBlog === "true" || isBlog === true;

        post.title = title || post.title;
        post.content = isBlogBool ? (content || post.content) : content;
        post.isBlog = isBlogBool;
        post.blogUrl = isBlogBool ? (blogUrl || post.blogUrl) : null;

        if (req.file) {
            post.image = req.file.path;
        }

        const updatedPost = await post.save();
        await updatedPost.populate("author", "name profileImage role");

        res.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    uploadPostImage,
    createPost,
    updatePost,
    getPosts,
    getPostById,
    likePost,
    addComment,
    deletePost,
    deleteComment,
};
