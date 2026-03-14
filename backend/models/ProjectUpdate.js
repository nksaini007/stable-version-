const mongoose = require("mongoose");

const projectUpdateSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ConstructionProject",
            required: true,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Update title is required"],
            trim: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: [true, "Update content is required"],
            maxlength: 2000,
        },
        images: [{ type: String }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("ProjectUpdate", projectUpdateSchema);
