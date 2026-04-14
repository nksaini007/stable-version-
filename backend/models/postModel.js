const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: false,
            default: "",
        },
        image: {
            type: String,
            default: null,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Should be the admin who created it
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [commentSchema],
        isBlog: {
            type: Boolean,
            default: false,
        },
        blogUrl: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
