import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { FaCrosshairs, FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Nev from './Nev';
import Footer from './Footer';

// --- Pixel Heart Icon ---
const PixelHeart = ({ filled }) => (
    <svg width="18" height="18" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all transform hover:scale-110">
        <path d="M1 1H2V2H1V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M3 1H4V2H3V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M2 1H3V2H2V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M5 1H6V2H5V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M6 1H7V2H6V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M7 1H8V2H7V1Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M0 2H1V5H0V2Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M1 5H2V6H1V5Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M2 6H3V7H2V6Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M3 7H5V8H3V7Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M5 6H6V7H5V6Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M6 5H7V6H6V5Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M7 2H8V5H7V2Z" fill={filled ? "#ff5c00" : "currentColor"} />
        <path d="M4 2H5V3H4V2Z" fill={filled ? "#ff5c00" : "currentColor"} />
    </svg>
);

const CommunityFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const navigate = useNavigate();

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
                        className="text-[#ff5c00] hover:underline transition-colors break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
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
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(user._id);
                    return {
                        ...p,
                        likes: isLiked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    };
                }
                return p;
            }));
            await API.put(`/posts/${postId}/like`);
        } catch (error) {
            console.error("Error liking post", error);
            fetchPosts();
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
            toast.success("Comment localized!");
        } catch (error) {
            console.error("Error adding comment", error);
            toast.error("Packet transmission failed.");
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this log?")) return;
        try {
            const { data: updatedComments } = await API.delete(`/posts/${postId}/comment/${commentId}`);
            setPosts(posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
            toast.success("Entry purged.");
        } catch (error) {
            console.error("Error deleting comment", error);
            toast.error(error.response?.data?.message || "Purge failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#e5e5e5] flex flex-col justify-center items-center gap-4 font-mono">
            <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
            <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">DLOAD_COMM_FED...</p>
        </div>
    );

    return (
        <div className="bg-[#e5e5e5] min-h-screen flex flex-col font-mono selection:bg-[#ff5c00] selection:text-black tech-grid">
            <Nev />
            <div className="scanline"></div>

            <div className="flex-1 max-w-[2000px] mx-auto py-20 px-6 w-full relative z-10">
                <div className="mb-16 flex items-end gap-6 overflow-hidden">
                    <div className="flex flex-col">
                        <span className="text-[#ff5c00] font-black text-[10px] tracking-[0.5em] mb-2 uppercase select-none font-mono">//_COMM_SYNC_V3.1_NODE</span>
                        <h1 className="text-5xl md:text-8xl font-heading font-black tracking-tight leading-none uppercase">
                            COMMUNITY<span className="text-black/10">_LOG</span>
                        </h1>
                    </div>
                </div>
              
                {posts.length === 0 ? (
                    <div className="text-center py-40 border-4 border-black/5 bg-white/50 backdrop-blur-md">
                        <FaCrosshairs size={40} className="mx-auto mb-6 text-black/10 animate-pulse" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-black/20">NO_ENTRY_DETECTED_IN_SECTOR</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                        {posts.map(post => {
                            const isLikedByMe = user && post.likes.includes(user._id);
                            const showComments = activeCommentId === post._id;
                            const isExpanded = expandedPostId === post._id;
                            const isLongText = post.content && post.content.length > 120;

                            return (
                                <div key={post._id} className="relative group">
                                    <div
                                        className={`bg-white border-2 border-black shadow-[10px_10px_0px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 relative flex flex-col ${isExpanded ? 'z-30 h-auto pb-[60px]' : 'h-[500px]'}`}
                                    >
                                        <div className="corner-decal decal-tl border-black"></div>
                                        <div className="corner-decal decal-br border-black opacity-30 group-hover:opacity-100 transition-opacity"></div>

                                        {/* Header */}
                                        <div
                                            className="px-5 py-4 flex items-center justify-between border-b-2 border-black/5 bg-white cursor-pointer group/header relative"
                                            onClick={() => navigate(`/community/post/${post._id}`)}
                                        >
                                           <div className="absolute top-1 right-2 text-[6px] font-black opacity-10 uppercase tracking-widest">POST_P_00{post._id.slice(-4)}</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-heading text-xl bg-black text-white shrink-0">
                                                    {post.author?.profileImage ? (
                                                        <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                                    ) : (
                                                        post.author?.name ? post.author.name.charAt(0).toUpperCase() : "S"
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="font-black text-black text-[10px] uppercase tracking-tighter leading-none group-hover/header:text-[#ff5c00] transition-colors">{post.author?.name || "SYS_OPERATOR"}</h4>
                                                    <p className="text-[7px] font-black opacity-40 mt-1 uppercase tracking-wider">
                                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full border-2 border-black ${isLikedByMe ? 'bg-[#ff5c00] animate-pulse' : 'bg-transparent'}`}></div>
                                        </div>

                                        {/* Content Wrapper */}
                                        <div className="flex-1 flex flex-col overflow-hidden">
                                            {/* Image */}
                                            {post.image && (
                                                <div
                                                    className="w-full bg-black/5 border-b-2 border-black relative overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group/img"
                                                    onClick={() => navigate(`/community/post/${post._id}`)}
                                                >
                                                    <img
                                                        src={`${post.image}`}
                                                        alt={post.title}
                                                        className={`w-full object-cover transition-all duration-700 group-hover/img:scale-105 ${isExpanded ? 'max-h-[500px]' : 'h-56'}`}
                                                    />
                                                    <div className="absolute inset-0 border-[12px] border-white/5 pointer-events-none"></div>
                                                </div>
                                            )}

                                            {/* Title & Body */}
                                            <div className="px-5 py-6 space-y-3">
                                                <h3 className="text-lg font-heading font-black text-black leading-[1.1] uppercase tracking-tighter line-clamp-2">{post.title}</h3>
                                                <div className="text-black/60 text-[9px] font-bold leading-relaxed uppercase">
                                                    <p className={`${!isExpanded ? 'line-clamp-3' : ''}`}>
                                                        {renderTextWithLinks(post.content)}
                                                    </p>
                                                    {isLongText && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedPostId(isExpanded ? null : post._id);
                                                            }}
                                                            className="text-[#ff5c00] hover:text-black font-black mt-2 text-[8px] border-b-2 border-[#ff5c00]/20 pb-0.5 tracking-widest"
                                                        >
                                                            {isExpanded ? "[ CLOSE_LOG ]" : "[ EXPAND_LOG ]"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Bar */}
                                        <div className={`px-5 py-4 flex items-center justify-between border-t-2 border-black bg-white z-20 ${isExpanded ? 'absolute bottom-0 inset-x-0' : 'mt-auto'}`}>
                                            <div className="flex items-center gap-6">
                                                <button
                                                    onClick={() => handleLike(post._id)}
                                                    className="flex items-center gap-2 group/action"
                                                >
                                                    <div className={`transition-all ${isLikedByMe ? "text-[#ff5c00]" : "text-black opacity-10 group-hover/action:opacity-100"}`}>
                                                        <PixelHeart filled={isLikedByMe} />
                                                    </div>
                                                    <span className={`text-[9px] font-black ${isLikedByMe ? "text-[#ff5c00]" : "text-black/30"}`}>{post.likes.length}._</span>
                                                </button>

                                                <button
                                                    onClick={() => setActiveCommentId(showComments ? null : post._id)}
                                                    className="flex items-center gap-2 group/action"
                                                >
                                                    <div className={`transition-all ${showComments ? "text-black" : "text-black opacity-10 group-hover/action:opacity-100"}`}>
                                                        <FaCommentDots size={16} />
                                                    </div>
                                                    <span className={`text-[9px] font-black ${showComments ? "text-black" : "text-black/30"}`}>{post.comments.length}._</span>
                                                </button>
                                            </div>

                                            <button className="text-black/10 hover:text-[#ff5c00] transition-colors">
                                                <FaShareAlt size={14} />
                                            </button>
                                        </div>

                                        {/* Comments Overlay */}
                                        {showComments && (
                                            <div className="absolute inset-x-0 top-[76px] bottom-[62px] bg-white z-10 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
                                                <div className="flex items-center gap-2 mb-6 border-b-2 border-black/5 pb-2">
                                                   <span className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">SCTR::PUBLIC_CONN::LOG</span>
                                                </div>
                                                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-tech">
                                                    {post.comments.length === 0 ? (
                                                        <p className="text-center text-black/20 text-[8px] font-black uppercase py-4">BUFFER_EMPTY::START_CONNECTION</p>
                                                    ) : (
                                                        post.comments.map(comment => (
                                                            <div key={comment._id} className="flex gap-4 group/comment border-l-2 border-black/10 pl-4 py-2 hover:border-black transition-colors">
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <p className="text-[8px] font-black uppercase text-black/40">{comment.user?.name || "LOG_USER"}</p>
                                                                        {user?.role === 'admin' && (
                                                                            <button onClick={() => handleDeleteComment(post._id, comment._id)} className="text-black/10 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all">
                                                                                <FaTrash size={9} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[9px] font-bold text-black leading-snug uppercase">
                                                                        {renderTextWithLinks(comment.text)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-3 mt-4 border-t-2 border-black pt-4">
                                                    <input
                                                        type="text"
                                                        placeholder="INIT_ENTRY..."
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        className="flex-1 bg-black/5 border-2 border-black/5 px-4 py-3 text-[9px] font-black outline-none focus:border-black transition-colors uppercase placeholder:text-black/20"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!commentText.trim()}
                                                        className="w-12 h-12 bg-black text-white flex items-center justify-center hover:bg-[#ff5c00] transition-colors disabled:opacity-20 translate-y-[-1px]"
                                                    >
                                                        <FaPaperPlane size={14} />
                                                    </button>
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
