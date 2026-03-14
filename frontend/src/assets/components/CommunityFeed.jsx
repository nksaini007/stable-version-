import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Nev from './Nev';
import Footer from './Footer';

const CommunityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const navigate = useNavigate();

    // --- Dynamic Text Parser ---
    // Detects URLs in text and converts them to clickable anchor tags
    const renderTextWithLinks = (text) => {
        if (!text) return text;

        // Regex to match URLs starting with http://, https://, or www.
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

        // Split text by URLs
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part && part.match(urlRegex)) {
                // Ensure proper formatting for 'www.' links missing http protocol
                const href = part.startsWith('http') ? part : `https://${part}`;
                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline transition-colors break-all"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking link from opening comment dropdown if applicable
                    >
                        {part}
                    </a>
                );
            }
            return part; // Return normal text
        });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await API.get('/posts');
            setPosts(data);
        } catch (error) {
            console.error("Error loading posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (!user) return toast.info("Please login to like this post!");

        try {
            // Optimistic update
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(user._id);
                    return {
                        ...p,
                        likes: isLiked
                            ? p.likes.filter(id => id !== user._id)
                            : [...p.likes, user._id]
                    };
                }
                return p;
            }));

            await API.put(`/posts/${postId}/like`);
        } catch (error) {
            console.error("Error liking post", error);
            fetchPosts(); // revert on fail
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        if (!user) return toast.info("Please login to comment!");
        if (!commentText.trim()) return;

        try {
            const { data: updatedComments } = await API.post(`/posts/${postId}/comment`, { text: commentText });

            setPosts(posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
            setCommentText("");
            toast.success("Comment added!");
        } catch (error) {
            console.error("Error adding comment", error);
            toast.error("Failed to add comment.");
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const { data: updatedComments } = await API.delete(`/posts/${postId}/comment/${commentId}`);
            setPosts(posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
            toast.success("Comment deleted!");
        } catch (error) {
            console.error("Error deleting comment", error);
            toast.error(error.response?.data?.message || "Failed to delete comment");
        }
    };


    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <Nev />
                <div className="flex-1 flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Nev />

            <div className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 w-full">
              
                {posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No community updates available yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {posts.map(post => {
                            const isLikedByMe = user && post.likes.includes(user._id);
                            const showComments = activeCommentId === post._id;
                            const isExpanded = expandedPostId === post._id;

                            // Truncation logic
                            const isLongText = post.content && post.content.length > 120;

                            return (
                                <div key={post._id} className="relative h-[400px]">
                                    <div
                                        className={`absolute inset-x-0 top-0 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col ${isExpanded ? 'z-30 h-auto min-h-[400px] pb-[53px]' : 'z-0 h-full'}`}
                                    >
                                        {/* Header */}
                                        <div
                                            className="px-5 py-1 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                            onClick={() => navigate(`/community/post/${post._id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden">
                                                    {post.author?.profileImage ? (
                                                        <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                                    ) : (
                                                        post.author?.name ? post.author.name.charAt(0).toUpperCase() : "S"
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-xs">{post.author?.name || "Stinchar Team"}</h4>
                                                    <p className="text-[10px] text-gray-400">
                                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Title & Content */}
                                        <div className="px-5 py-3 flex-shrink-0">
                                            <h3 className="text-base font-bold text-gray-800 mb-1 leading-tight line-clamp-2">{post.title}</h3>
                                            <div className="text-gray-600 text-xs leading-relaxed">
                                                <p className={`whitespace-pre-line ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                                    {renderTextWithLinks(post.content)}
                                                </p>
                                                {isLongText && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedPostId(isExpanded ? null : post._id);
                                                            if (showComments && !isExpanded) setActiveCommentId(null); // Close comments if opening text
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 font-semibold mt-1 text-[11px]"
                                                    >
                                                        {isExpanded ? "Read Less" : "Read More"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Image */}
                                        {post.image && (
                                            <div
                                                className="w-full bg-gray-50 border-y border-gray-100 relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer"
                                                onClick={() => navigate(`/community/post/${post._id}`)}
                                            >
                                                <img
                                                    src={`${post.image}`}
                                                    alt={post.title}
                                                    className={`w-full object-cover transition-all duration-500 ${isExpanded ? 'max-h-[500px]' : 'h-40 hover:scale-105'}`}
                                                />
                                            </div>
                                        )}

                                        {/* Spacer to push actions to bottom */}
                                        <div className="flex-1"></div>

                                        {/* Actions */}
                                        <div className={`px-5 py-3 flex items-center justify-between border-t border-gray-50 bg-white relative z-20 ${isExpanded ? 'absolute bottom-0 inset-x-0' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                {/* Like Button */}
                                                <button
                                                    onClick={() => handleLike(post._id)}
                                                    className="flex items-center gap-1.5 group transition"
                                                >
                                                    <div className={`p-1.5 rounded-full transition-all ${isLikedByMe ? "bg-rose-100 text-rose-500" : "bg-gray-50 text-gray-500 group-hover:bg-rose-50 group-hover:text-rose-400"}`}>
                                                        {isLikedByMe ? <FaHeart className="text-sm drop-shadow-md scale-110 transition-transform" /> : <FaRegHeart className="text-sm" />}
                                                    </div>
                                                    <span className={`text-xs font-semibold ${isLikedByMe ? "text-rose-500" : "text-gray-500"}`}>{post.likes.length}</span>
                                                </button>

                                                {/* Comment Button */}
                                                <button
                                                    onClick={() => setActiveCommentId(showComments ? null : post._id)}
                                                    className="flex items-center gap-1.5 group transition"
                                                >
                                                    <div className={`p-1.5 rounded-full transition-all ${showComments ? "bg-blue-100 text-blue-600" : "bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"}`}>
                                                        <FaCommentDots className="text-sm" />
                                                    </div>
                                                    <span className={`text-xs font-semibold ${showComments ? "text-blue-600" : "text-gray-500"}`}>{post.comments.length}</span>
                                                </button>
                                            </div>

                                            <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 hover:bg-blue-50 rounded-full">
                                                <FaShareAlt className="text-sm" />
                                            </button>
                                        </div>

                                        {/* Comments Section Dropdown */}
                                        {showComments && (
                                            <div className="absolute inset-x-0 top-[65px] bottom-[53px] bg-white/95 backdrop-blur-sm z-10 flex flex-col px-4 pt-2 pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-gray-100 rounded-t-xl transition-all duration-300">
                                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                                    {post.comments.length === 0 ? (
                                                        <p className="text-center text-gray-400 text-xs py-2">No comments yet. Start the conversation!</p>
                                                    ) : (
                                                        post.comments.map(comment => (
                                                            <div key={comment._id} className="flex gap-2 group/comment">
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mt-0.5">
                                                                    {comment.user?.profileImage ? (
                                                                        <img src={`${comment.user.profileImage}`} alt="user" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-bold">{comment.user?.name?.charAt(0) || "U"}</div>
                                                                    )}
                                                                </div>
                                                                <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none border border-gray-100 shadow-sm flex-1 relative">
                                                                    <div className="flex justify-between items-start mb-0.5">
                                                                        <p className="text-[10px] font-bold text-gray-800">{comment.user?.name || "User"}</p>
                                                                        {user?.role === 'admin' && (
                                                                            <button
                                                                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                                                                title="Delete Comment"
                                                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-opacity ml-2 shrink-0"
                                                                            >
                                                                                <FaTrash className="text-[10px]" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-600 leading-snug break-words whitespace-pre-line">
                                                                        {renderTextWithLinks(comment.text)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Add Comment Input */}
                                                <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-end gap-2 mt-3 flex-shrink-0">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                                                        {user?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Write..."
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-full py-1.5 pl-3 pr-8 text-xs outline-none focus:border-blue-400 transition-colors shadow-inner"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!commentText.trim()}
                                                            className="absolute right-1 top-1 bottom-1 w-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
                                                        >
                                                            <FaPaperPlane className="text-[8px]" />
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default CommunityFeed;
