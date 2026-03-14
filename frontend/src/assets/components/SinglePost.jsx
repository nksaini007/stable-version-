import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Nev from './Nev';
import Footer from './Footer';

const SinglePost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [commentText, setCommentText] = useState("");

    // --- Dynamic Text Parser ---
    const renderTextWithLinks = (text) => {
        if (!text) return text;
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part && part.match(urlRegex)) {
                const href = part.startsWith('http') ? part : `https://${part}`;
                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline transition-colors break-all"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data } = await API.get(`/posts/${id}`);
            setPost(data);
        } catch (error) {
            console.error("Error loading post", error);
            toast.error("Post not found.");
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) return toast.info("Please login to like this post!");

        try {
            // Optimistic update
            const isLiked = post.likes.includes(user._id);
            setPost({
                ...post,
                likes: isLiked
                    ? post.likes.filter(userId => userId !== user._id)
                    : [...post.likes, user._id]
            });

            await API.put(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Error liking post", error);
            fetchPost(); // revert on fail
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.info("Please login to comment!");
        if (!commentText.trim()) return;

        try {
            const { data: updatedComments } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
            setPost({ ...post, comments: updatedComments });
            setCommentText("");
            toast.success("Comment added!");
        } catch (error) {
            console.error("Error adding comment", error);
            toast.error("Failed to add comment.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const { data: updatedComments } = await API.delete(`/posts/${post._id}/comment/${commentId}`);
            setPost({ ...post, comments: updatedComments });
            toast.success("Comment deleted!");
        } catch (error) {
            console.error("Error deleting comment", error);
            toast.error(error.response?.data?.message || "Failed to delete comment");
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Post link copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            toast.error("Failed to copy link.");
        });
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <Nev />
                <div className="flex-1 flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) return null;

    const isLikedByMe = user && post.likes.includes(user._id);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Nev />

            <div className="flex-1 max-w-4xl mx-auto py-12 px-4 sm:px-6 w-full">

                {/* Back Navigation Bar */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md w-max"
                    >
                        <FaArrowLeft className="text-sm" />
                        Back to Community
                    </button>
                </div>

                <div className={`bg-white rounded-3xl border border-gray-100 shadow-[0_12px_40px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col ${post.image ? 'md:flex-row md:h-[85vh]' : 'max-w-3xl mx-auto'}`}>

                    {/* Left Column: Image (Only if image exists) */}
                    {post.image && (
                        <div className="w-full md:w-3/5 bg-gray-900 border-r border-gray-100 flex items-center justify-center h-72 md:h-full flex-shrink-0 relative group">
                            <img
                                src={`${post.image}`}
                                alt={post.title}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* Right Column (or Full Container if no image): Content, Actions, Comments */}
                    <div className={`w-full flex-col flex ${post.image ? 'md:w-2/5' : 'w-full'} h-full`}>
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hide-scrollbar-on-mobile flex flex-col">

                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex-shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                                        {post.author?.profileImage ? (
                                            <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                        ) : (
                                            post.author?.name ? post.author.name.charAt(0).toUpperCase() : "S"
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">{post.author?.name || "Stinchar Team"}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="px-6 py-6 flex-shrink-0">
                                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 leading-snug">{post.title}</h1>
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line tracking-wide">
                                    {renderTextWithLinks(post.content)}
                                </p>
                            </div>

                            {/* Action Bar */}
                            <div className="px-6 py-4 flex items-center justify-between border-y border-gray-100 bg-gray-50/50 flex-shrink-0">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-2 group transition"
                                    >
                                        <div className={`p-2 rounded-full transition-all shadow-sm ${isLikedByMe ? "bg-rose-100 text-rose-500" : "bg-white border border-gray-200 text-gray-500 group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:text-rose-400"}`}>
                                            {isLikedByMe ? <FaHeart className="text-lg scale-110 drop-shadow-sm transition-transform" /> : <FaRegHeart className="text-lg" />}
                                        </div>
                                        <span className={`font-bold text-sm ${isLikedByMe ? "text-rose-600" : "text-gray-600"}`}>{post.likes.length} Likes</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-white border border-gray-200 text-blue-500 shadow-sm">
                                            <FaCommentDots className="text-lg" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-600">{post.comments.length} Comments</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-3 py-1.5 font-bold text-sm text-gray-500 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 shadow-sm border border-gray-200 rounded-full"
                                >
                                    <FaShareAlt className="text-md" />
                                    <span className="hidden sm:inline">Share</span>
                                </button>
                            </div>

                            {/* Expanded Comments Thread */}
                            <div className="px-6 py-6 pb-20 flex-1 bg-gray-50/30">
                                <h3 className="font-extrabold text-base text-gray-900 mb-5 flex items-center gap-2">
                                    Discussion Thread
                                    <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px]">{post.comments.length}</span>
                                </h3>

                                <div className="space-y-4">
                                    {post.comments.length === 0 ? (
                                        <div className="text-center py-8 bg-white rounded-xl border border-gray-200 border-dashed">
                                            <h4 className="text-gray-400 font-bold mb-1 text-sm">It's quiet in here...</h4>
                                            <p className="text-gray-400 text-xs">Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        post.comments.map(comment => (
                                            <div key={comment._id} className="flex gap-3 group/comment bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 overflow-hidden shadow-inner">
                                                    {comment.user?.profileImage ? (
                                                        <img src={`${comment.user.profileImage}`} alt="user" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold uppercase">{comment.user?.name?.charAt(0) || "U"}</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-gray-900">{comment.user?.name || "User"}</p>

                                                            {comment.user?.role === 'admin' && (
                                                                <span className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
                                                            )}
                                                        </div>

                                                        {user?.role === 'admin' && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                title="Delete Comment"
                                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-full"
                                                            >
                                                                <FaTrash className="text-[10px]" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mb-1.5">
                                                        {new Date(comment.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-line">
                                                        {renderTextWithLinks(comment.text)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add Comment Input - Fixed to Bottom of Right Column */}
                        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-md text-xs">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-4 pr-12 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
                                    >
                                        <FaPaperPlane className="text-xs" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SinglePost;
