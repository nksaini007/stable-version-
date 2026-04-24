import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaImage, FaNewspaper, FaCommentDots, FaHeart, FaTimes, FaEdit, FaChevronUp } from "react-icons/fa";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { getOptimizedImage } from "../../../../../utils/imageUtils";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CommunityPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: "", content: "", image: null, isBlog: false, blogUrl: "" });
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const scrollRef = useRef(null);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script', 'list', 'indent',
        'direction', 'align',
        'link', 'image', 'video'
    ];

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleContentChange = (content) => {
        setForm({ ...form, content });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, image: file });
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleEdit = (post) => {
        setIsEditing(true);
        setEditId(post._id);
        setForm({
            title: post.title,
            content: post.content,
            isBlog: post.isBlog,
            blogUrl: post.blogUrl || "",
            image: null // We don't pre-fill the file object, but we keep the old image if not changed
        });
        setPreview(post.image ? `${post.image}` : null);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setForm({ title: "", content: "", image: null, isBlog: false, blogUrl: "" });
        setPreview(null);
        setIsEditing(false);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("content", form.content || (form.isBlog ? "Blog Post" : ""));
            formData.append("isBlog", form.isBlog);
            if (form.isBlog) {
                formData.append("blogUrl", form.blogUrl);
            }
            if (form.image) formData.append("image", form.image);

            if (isEditing) {
                await API.put(`/posts/${editId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Post updated successfully!");
            } else {
                await API.post("/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Post created successfully!");
            }

            resetForm();
            fetchPosts();
        } catch (error) {
            console.error("Error saving post", error);
            toast.error(error.response?.data?.message || "Error saving post");
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
        <div className="p-4 md:p-8 bg-[#0D0D0D] min-h-screen text-white font-sans overflow-x-hidden">
            {/* Header Section */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                        <FaNewspaper className="text-2xl text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Community <span className="text-blue-500">Editorial</span></h1>
                        <p className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">Stinchar Content Management Engine</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase">{posts.length} Active Nodes</span>
                    </div>
                </div>
            </header>

            {/* 📝 Editor Section (Full Width) */}
            <section className="mb-12">
                <div className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                    {isEditing && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-10"></div>
                    )}
                    
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                {isEditing ? <FaEdit className="text-blue-400" /> : <FaPlus className="text-blue-400" />}
                                {isEditing ? "Edit Global Post" : "Compose New Bulletin"}
                            </h2>
                            {isEditing && (
                                <button onClick={resetForm} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex items-center gap-2">
                                    <FaTimes /> Cancel Editing
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Headline</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="INPUT STRATEGIC TITLE"
                                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl p-4 outline-none transition-all placeholder:text-white/10 text-lg font-bold"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-3">Content Protocol</label>
                                        <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-3">
                                            <div className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    id="isBlog"
                                                    name="isBlog"
                                                    checked={form.isBlog}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 rounded-lg border-white/10 bg-black text-blue-500 focus:ring-0"
                                                />
                                                <label htmlFor="isBlog" className="text-xs font-bold text-gray-400 cursor-pointer group-hover:text-white transition">REDIRECT TO EXTERNAL URL</label>
                                            </div>
                                        </div>
                                    </div>

                                    {form.isBlog && (
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">External Link</label>
                                            <input
                                                type="url"
                                                name="blogUrl"
                                                required
                                                value={form.blogUrl}
                                                onChange={handleChange}
                                                placeholder="HTTPS://SOURCE.COM"
                                                className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl p-4 outline-none transition-all placeholder:text-white/10 text-sm font-bold uppercase"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Primary Asset</label>
                                    <div className={`relative group ${preview ? 'h-64' : 'h-32'}`}>
                                        {preview ? (
                                            <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                                    <label className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full cursor-pointer hover:bg-gray-200 transition">
                                                        REPLACE IMAGE
                                                        <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                    </label>
                                                    <button type="button" onClick={() => { setForm({ ...form, image: null }); setPreview(null) }} className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full hover:bg-red-600 transition">
                                                        REMOVE
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition group">
                                                <FaImage className="text-2xl text-white/20 group-hover:text-blue-400 mb-2 transition" />
                                                <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Drop Visual Source</span>
                                                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Manuscript Body</label>
                                <div className="quill-premium-editor flex-1 bg-black/20 rounded-2xl overflow-hidden border border-white/10 min-h-[300px] flex flex-col">
                                    <ReactQuill
                                        theme="snow"
                                        value={form.content}
                                        onChange={handleContentChange}
                                        modules={modules}
                                        formats={formats}
                                        disabled={form.isBlog}
                                        placeholder={form.isBlog ? "CONTENT DISABLED IN REDIRECT MODE" : "INITIALIZE CONTENT STREAM..."}
                                        className="h-full flex flex-col"
                                    />
                                </div>
                            </div>
                            
                            <div className="md:col-span-2 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl flex items-center justify-center gap-4 ${
                                        isEditing 
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                        : 'bg-white hover:bg-gray-200 text-black'
                                    } disabled:opacity-50`}
                                >
                                    {submitting ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            SYCHRONIZING...
                                        </div>
                                    ) : (
                                        <>
                                            {isEditing ? <FaEdit /> : <FaPlus />}
                                            {isEditing ? "Apply Global Changes" : "Deploy Post to Network"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* 📋 Posts Database (Detailed List) */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold tracking-tighter uppercase italic flex items-center gap-3">
                        <div className="w-8 h-1 bg-blue-500"></div>
                        Post Database
                    </h2>
                    <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                        Sorted by: Newest Acquisition
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-xs font-black tracking-widest uppercase text-gray-500">Retrieving Stream...</span>
                    </div>
                ) : posts?.length === 0 ? (
                    <div className="text-center p-24 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <FaNewspaper className="mx-auto text-5xl text-white/5 mb-6" />
                        <p className="text-gray-500 font-bold tracking-widest uppercase">System Cache Empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {posts.map(post => (
                            <div key={post._id} className="group bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 rounded-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-2">
                                {/* Thumbnail */}
                                <div className="w-full md:w-48 h-32 flex-shrink-0 bg-black rounded-xl overflow-hidden relative border border-white/5">
                                    {post.image ? (
                                        <img src={getOptimizedImage(post.image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/5">
                                            <FaNewspaper className="text-4xl" />
                                        </div>
                                    )}
                                    {post.isBlog && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded shadow-lg">Link</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{post.title}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                    {post.author?.profileImage ? (
                                                        <img src={getOptimizedImage(post.author.profileImage)} alt="author" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px]">{post.author?.name ? post.author.name.charAt(0) : "A"}</span>
                                                    )}
                                                </div>
                                                <span>{post.author?.name || "CORE_ADMIN"}</span>
                                            </div>
                                            <span className="text-white/10">|</span>
                                            <span>{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-white">{post.likes?.length || 0}</span>
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Likes</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-white">{post.comments?.length || 0}</span>
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Comments</span>
                                        </div>
                                        
                                        <div className="h-10 w-px bg-white/5 hidden md:block mx-2"></div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(post)}
                                                className="p-3 bg-white/5 hover:bg-blue-500 text-blue-400 hover:text-white border border-white/10 rounded-xl transition-all"
                                                title="Edit Protocol"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(post._id)}
                                                className="p-3 bg-white/5 hover:bg-red-500 text-red-400 hover:text-white border border-white/10 rounded-xl transition-all"
                                                title="Terminate Node"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Custom Quill Styles */}
            <style>{`
                .quill-premium-editor .ql-toolbar {
                    background: #1A1A1A;
                    border: none !important;
                    border-bottom: 1px solid rgba(255,255,255,0.1) !important;
                    padding: 12px !important;
                }
                .quill-premium-editor .ql-container {
                    background: transparent;
                    border: none !important;
                    flex: 1;
                    height: 100% !important;
                    min-height: 250px;
                    color: white;
                    font-family: inherit;
                    font-size: 14px;
                }
                .quill-premium-editor .ql-editor {
                    padding: 20px !important;
                }
                .quill-premium-editor .ql-editor.ql-blank::before {
                    color: rgba(255,255,255,0.1);
                    font-style: normal;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                }
                /* Dark Mode Picker */
                .quill-premium-editor .ql-snow.ql-toolbar button .ql-stroke { stroke: #666; }
                .quill-premium-editor .ql-snow.ql-toolbar button:hover .ql-stroke { stroke: #fff; }
                .quill-premium-editor .ql-snow.ql-toolbar .ql-picker { color: #666; }
                .quill-premium-editor .ql-snow.ql-toolbar .ql-picker:hover { color: #fff; }
                .quill-premium-editor .ql-snow.ql-toolbar .ql-picker-options {
                    background-color: #1A1A1A;
                    border-color: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .quill-premium-editor .ql-snow .ql-picker-item { color: #666; }
                .quill-premium-editor .ql-snow .ql-picker-item:hover { color: #fff; }
            `}</style>
            
            {/* Scroll to Top helper for mobile */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-2xl shadow-2xl z-50 md:hidden flex items-center justify-center"
            >
                <FaChevronUp />
            </button>
        </div>
    );
};

export default CommunityPosts;
