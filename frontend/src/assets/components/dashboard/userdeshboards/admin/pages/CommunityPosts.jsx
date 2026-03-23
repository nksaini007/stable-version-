import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaImage, FaNewspaper, FaCommentDots, FaHeart, FaTimes } from "react-icons/fa";
import API from "../../../../../api/api";
import { toast } from "react-toastify";

const CommunityPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", content: "", image: null });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/posts");
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts", error);
            toast.error("Failed to load community posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, image: file });
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("content", form.content);
            if (form.image) formData.append("image", form.image);

            await API.post("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Post created successfully!");
            setForm({ title: "", content: "", image: null });
            setPreview(null);
            fetchPosts();
        } catch (error) {
            console.error("Error creating post", error);
            toast.error(error.response?.data?.message || "Error creating post");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await API.delete(`/posts/${id}`);
            toast.success("Post deleted");
            setPosts(posts.filter((p) => p._id !== id));
        } catch (error) {
            console.error("Error deleting post", error);
            toast.error("Failed to delete post");
        }
    };

    return (
        <div className="p-6 md:p-8 bg-[#121212] min-h-screen">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-400 rounded-xl">
                    <FaNewspaper className="text-xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Community Posts</h1>
                    <p className="text-sm text-[#8E929C]">Manage announcements and blogs for your community.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 📝 Create Post Form */}
                <div className="lg:col-span-1 border border-[#2A2B2F] bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl  p-6 overflow-hidden max-h-min h-fit sticky top-20">
                    <h2 className="text-lg font-bold text-white mb-4 border-b pb-2">Create New Post</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#8E929C] uppercase mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter an engaging title..."
                                className="w-full border border-[#2A2B2F] focus:border-white focus:ring-1 focus:ring-0 rounded-lg p-3 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#8E929C] uppercase mb-1">Content</label>
                            <textarea
                                name="content"
                                required
                                value={form.content}
                                onChange={handleChange}
                                rows="5"
                                placeholder="What do you want to share with the community?"
                                className="w-full border border-[#2A2B2F] focus:border-white focus:ring-1 focus:ring-0 rounded-lg p-3 outline-none transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#8E929C] uppercase mb-1">Image (Optional)</label>
                            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-[#2A2B2F] rounded-lg cursor-pointer hover:bg-[#121212] transition">
                                <span className="flex items-center gap-2 text-[#8E929C] text-sm">
                                    <FaImage /> {form.image ? "Change Image" : "Upload an image"}
                                </span>
                                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>

                        {preview && (
                            <div className="relative mt-2">
                                <img src={preview} alt="Preview" className="w-full h-auto max-h-48 object-cover rounded-lg border " />
                                <button type="button" onClick={() => { setForm({ ...form, image: null }); setPreview(null) }} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs  hover:bg-red-600">
                                    <FaTimes />
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-white text-black hover:bg-gray-200 text-white font-bold rounded-lg transition  disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {submitting ? "Posting..." : <><FaPlus /> Publish Post</>}
                        </button>
                    </form>
                </div>

                {/* 📋 Posts List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-white border-b pb-2">Recent Posts</h2>

                    {loading ? (
                        <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : posts?.length === 0 ? (
                        <div className="text-center py-12 bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F]">
                            <FaNewspaper className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="text-[#8E929C] font-medium">No posts published yet.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post._id} className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F]  overflow-hidden transition hover:">
                                {post.image && (
                                    <div className="w-full h-48 sm:h-64 bg-[#121212] relative">
                                        <img src={`${post.image}`} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-white leading-tight">{post.title}</h3>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                                            title="Delete Post"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <p className="text-[#8E929C] text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {post.content}
                                    </p>

                                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#2A2B2F] text-sm text-[#8E929C]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 text-[10px] font-bold overflow-hidden ">
                                                {post.author?.profileImage ? (
                                                    <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                                ) : (
                                                    post.author?.name ? post.author.name.charAt(0).toUpperCase() : "A"
                                                )}
                                            </span>
                                            <span>By {post.author?.name || "Admin"}</span>
                                        </div>
                                        <div className="flex items-center gap-4 ml-auto">
                                            <span className="flex items-center gap-1.5"><FaHeart className="text-rose-400" /> {post.likes?.length || 0} Likes</span>
                                            <span className="flex items-center gap-1.5"><FaCommentDots className="text-blue-400" /> {post.comments?.length || 0} Comments</span>
                                            <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPosts;
