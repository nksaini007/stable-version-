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
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        metaDescription: {
            type: String,
            default: "",
        },
        tags: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

// Pre-save hook to generate slug from title
postSchema.pre("save", async function (next) {
    if (this.isModified("title") || !this.slug) {
        // Generate base slug: lower case, replace spaces/special chars with hyphens
        let baseSlug = (this.title || "post")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Remove non-word [a-z0-9_], non-space, non-hyphen
            .replace(/[\s_-]+/g, "-") // Replace spaces/underscores/hyphens with a single hyphen
            .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

        // Handle case where title is only special characters
        if (!baseSlug) baseSlug = "post";

        // Ensure unique slug
        let slug = baseSlug;
        let count = 1;
        while (true) {
            const existingPost = await this.constructor.findOne({ slug, _id: { $ne: this._id } });
            if (!existingPost) break;
            slug = `${baseSlug}-${count++}`;
        }
        
        this.slug = slug;
    }

    // Auto-generate meta description if empty
    if (!this.metaDescription && this.content && typeof this.content === 'string') {
        // Strip HTML if any and take first 155 chars
        const plainText = this.content.replace(/<[^>]*>?/gm, '');
        if (plainText) {
            this.metaDescription = plainText.substring(0, 155).trim() + (plainText.length > 155 ? "..." : "");
        }
    }

    next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
