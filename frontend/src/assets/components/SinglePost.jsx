import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import {
    FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash,
    FaArrowLeft, FaCrosshairs, FaExternalLinkAlt, FaHeart
} from 'react-icons/fa';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Nev from './Nev';
import Footer from './Footer';

// Pixel Heart
const PixelHeart = ({ filled }) => (
    <svg width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const SinglePost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const [commentText, setCommentText] = useState("");

    const renderTextWithLinks = (text) => {
        if (!text) return text;
        const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, index) => {
            if (part && part.match(urlRegex)) {
                const href = part.startsWith('http') ? part : `https://${part}`;
                return <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-[#ff5c00] hover:underline break-all">{part}</a>;
            }
            return part;
        });
    };

    useEffect(() => { fetchPost(); window.scrollTo(0, 0); }, [id]);

    const fetchPost = async () => {
        try {
            const { data } = await API.get(`/posts/${id}`);
            setPost(data);
        } catch {
            toast.error("Post Not Found.");
            navigate('/community');
        } finally { setLoading(false); }
    };

    const handleLike = async () => {
        if (!user) return toast.info("Please login to like.");
        try {
            const isLiked = post.likes.includes(user._id);
            setPost({ ...post, likes: isLiked ? post.likes.filter(i => i !== user._id) : [...post.likes, user._id] });
            await API.put(`/posts/${post._id}/like`);
        } catch { fetchPost(); }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.info("Please login to comment.");
        if (!commentText.trim()) return;
        try {
            const { data: updatedComments } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
            setPost({ ...post, comments: updatedComments });
            setCommentText("");
            toast.success("Comment posted!");
        } catch { toast.error("Failed to post."); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            const { data: updated } = await API.delete(`/posts/${post._id}/comment/${commentId}`);
            setPost({ ...post, comments: updated });
        } catch { toast.error("Failed."); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => toast.success("Link copied!"))
            .catch(() => toast.error("Failed to copy."));
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (!post) return null;

    const isLikedByMe = user && post.likes.includes(user._id);

    // ========================================
    //  BLOG POST — Premium Article Page
    // ========================================
    if (post.isBlog) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
                <Nev />

                {/* ── FULL-SCREEN HERO ── */}
                <div className="relative w-full flex-shrink-0" style={{ height: '100vh', minHeight: '600px' }}>

                    {/* Background image */}
                    {post.image ? (
                        <img
                            src={post.image}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-slate-900 to-black" />
                    )}

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/20" />

                    {/* Back button — top left */}
                    <motion.button
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => navigate('/community')}
                        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-white/60 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors group z-10"
                    >
                        <FaArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
                        Community
                    </motion.button>

                    {/* Blog badge — top right */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="absolute top-6 right-6 md:top-10 md:right-10 z-10"
                    >
                        <span className="flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 text-violet-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
                            Blog
                        </span>
                    </motion.div>

                    {/* Bottom content — Title + Meta + CTA */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-14 md:pb-20 z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="max-w-4xl"
                        >
                            {/* Title */}
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tight mb-6 uppercase">
                                {post.title}
                            </h1>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-4 mb-10">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden flex-shrink-0">
                                        {post.author?.profileImage
                                            ? <img src={post.author.profileImage} alt="author" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-white/60 text-xs font-black">{post.author?.name?.charAt(0).toUpperCase() || 'A'}</div>
                                        }
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold leading-none">{post.author?.name || 'Admin'}</p>
                                        <p className="text-white/40 text-[10px] mt-0.5">{new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="h-3 w-px bg-white/20 hidden sm:block" />

                                <button onClick={handleLike} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors">
                                    <PixelHeart filled={isLikedByMe} />
                                    <span className={isLikedByMe ? 'text-[#ff5c00]' : ''}>{post.likes.length} likes</span>
                                </button>

                                <div className="h-3 w-px bg-white/20 hidden sm:block" />

                                <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors">
                                    <FaShareAlt size={11} />
                                    Share
                                </button>
                            </div>

                            {/* CTA Button — the main action */}
                            <a
                                href={post.blogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-[#ff5c00] hover:text-white transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,92,0,0.3)]"
                            >
                                <HiOutlineBookOpen size={18} />
                                Read Full Article
                                <FaExternalLinkAlt size={11} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </a>
                        </motion.div>
                    </div>

                    {/* Scroll hint */}
                    <div className="absolute bottom-6 right-8 text-white/20 text-[9px] font-bold uppercase tracking-widest hidden md:flex items-center gap-2">
                        <span>Scroll for comments</span>
                        <div className="flex flex-col gap-0.5">
                            <div className="w-px h-3 bg-white/20 mx-auto" />
                            <div className="w-1 h-1 bg-white/20 rounded-full mx-auto" />
                        </div>
                    </div>
                </div>

                {/* ── COMMENTS SECTION ── */}
                <div id="blog-comments" className="bg-[#0f0f0f] border-t border-white/5">
                    <div className="max-w-2xl mx-auto px-5 md:px-8 py-16">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <FaCommentDots size={16} className="text-white/20" />
                                <h2 className="text-sm font-black text-white uppercase tracking-widest">Comments</h2>
                                <span className="text-xs font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{post.comments.length}</span>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} className="mb-12 group">
                            <div className="border border-white/10 bg-white/5 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
                                <textarea
                                    placeholder="Leave a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={3}
                                    className="w-full px-5 py-4 text-sm text-white/80 bg-transparent outline-none resize-none placeholder:text-white/20"
                                />
                                <div className="flex items-center justify-end px-4 py-3 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="flex items-center gap-2 px-5 py-2 bg-white text-black text-xs font-black uppercase tracking-wider rounded-full hover:bg-[#ff5c00] hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        <FaPaperPlane size={10} />
                                        Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comments */}
                        {post.comments.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                <FaCrosshairs className="text-white/10 mx-auto mb-4" size={28} />
                                <p className="text-sm font-semibold text-white/20">No comments yet</p>
                                <p className="text-xs text-white/10 mt-1">Be the first to comment!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {post.comments.map((comment, i) => (
                                    <motion.div
                                        key={comment._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden flex-shrink-0">
                                                {comment.user?.profileImage
                                                    ? <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/30">{comment.user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white/90">{comment.user?.name || 'User'}</span>
                                                        {comment.user?.role === 'admin' && <span className="bg-[#ff5c00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>}
                                                        <span className="text-[10px] text-white/20">{new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                    {user?.role === 'admin' && (
                                                        <button onClick={() => handleDeleteComment(comment._id)} className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                            <FaTrash size={11} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-white/50 leading-relaxed">{renderTextWithLinks(comment.text)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    // ========================================
    //  REGULAR POST — Original Layout (unchanged)
    // ========================================
    return (
        <div className="bg-[#e5e5e5] min-h-screen flex flex-col font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative overflow-hidden">
            <Nev />
            <div className="scanline"></div>

            <div className="flex-1 max-w-6xl mx-auto py-0 lg:py-24 px-0 lg:px-8 w-full relative z-10">

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 hidden lg:block">
                    <button onClick={() => navigate('/community')} className="flex items-center gap-3 text-black/40 hover:text-[#ff5c00] font-black text-[10px] uppercase tracking-widest transition-all group">
                        <div className="w-8 h-8 border-2 border-black/10 flex items-center justify-center group-hover:border-[#ff5c00] transition-colors"><FaArrowLeft /></div>
                        RETURN TO FEED
                    </button>
                </motion.div>

                <div className="lg:hidden fixed top-24 left-4 z-50">
                    <button onClick={() => navigate('/community')} className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        <FaArrowLeft />
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border-x-0 lg:border-2 border-black shadow-none lg:shadow-[15px_15px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col min-h-screen lg:min-h-[70vh] relative ${post.image ? 'lg:flex-row' : 'max-w-4xl mx-auto lg:border-2'}`}
                >
                    <div className="hidden lg:block corner-decal decal-tl border-black"></div>
                    <div className="hidden lg:block corner-decal decal-tr border-black"></div>
                    <div className="hidden lg:block corner-decal decal-bl border-black"></div>
                    <div className="hidden lg:block corner-decal decal-br border-black opacity-30"></div>

                    {post.image && (
                        <div className="w-full lg:w-[60%] lg:min-h-[400px] bg-[#0f172a] border-b-2 lg:border-b-0 lg:border-r-2 border-black flex items-center justify-center relative group overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-auto lg:h-full object-contain lg:p-4 group-hover:scale-[1.05] transition-transform duration-1000" />
                            <div className="absolute top-4 left-4 text-[7px] font-black text-white/20 uppercase tracking-[0.4em]">IMG_SCTR::00{post._id.slice(-4)}</div>
                            <div className="absolute top-4 right-4 bg-white/5 backdrop-blur-md px-2 py-1 border border-white/10 text-[6px] font-black text-white/40 uppercase tracking-widest">ENCRYPTED_SIGNAL_V2.1</div>
                            <div className="absolute bottom-4 right-4 flex gap-1">
                                {[...Array(6)].map((_, i) => <div key={i} className={`w-1 h-4 ${i % 2 === 0 ? 'bg-[#ff5c00]/40' : 'bg-white/10'}`}></div>)}
                            </div>
                        </div>
                    )}

                    <div className={`w-full flex flex-col ${post.image ? 'lg:w-[40%]' : 'w-full'} bg-white relative`}>
                        <div className="flex-1 overflow-y-auto scrollbar-tech pb-32 lg:pb-24">
                            <div className="px-6 lg:px-8 py-6 border-b-2 border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-black flex items-center justify-center font-heading text-lg lg:text-xl bg-black text-white shrink-0 overflow-hidden">
                                        {post.author?.profileImage ? <img src={post.author.profileImage} alt="author" className="w-full h-full object-cover" /> : post.author?.name?.charAt(0).toUpperCase() || "S"}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-black text-black text-[9px] lg:text-[10px] uppercase tracking-tighter leading-none">{post.author?.name || "SYS_OPERATOR"}</h4>
                                        <span className="text-[7px] font-black text-black/40 uppercase tracking-wider mt-1">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[6px] font-black text-black/20 uppercase tracking-widest hidden sm:block">NODE_LINK::OK</span>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>

                            <div className="px-6 lg:px-8 py-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-[2px] bg-[#ff5c00]"></div>
                                        <div className="text-[8px] font-black text-[#ff5c00] uppercase tracking-[0.3em]">SCTR_DATA_SCAN::00{post._id.slice(-2)}</div>
                                    </div>
                                    <h1 className="text-xl lg:text-3xl font-heading font-black text-black uppercase tracking-tighter leading-tight italic">{post.title}</h1>
                                </div>
                                <div className="text-black/80 text-xs lg:text-sm font-bold uppercase leading-loose tracking-wide whitespace-pre-line border-l-4 border-black/10 pl-5 py-2">
                                    {renderTextWithLinks(post.content)}
                                </div>
                            </div>

                            <div className="px-6 lg:px-8 py-6 flex items-center justify-between border-y-2 border-black/5 bg-[#fbfbfb]">
                                <div className="flex items-center gap-6 lg:gap-8">
                                    <button onClick={handleLike} className="flex items-center gap-3 group/hub">
                                        <div className={`transition-all ${isLikedByMe ? "text-[#ff5c00]" : "text-black opacity-20 group-hover/hub:opacity-100"}`}><PixelHeart filled={isLikedByMe} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black text-black/30 uppercase tracking-widest leading-none mb-1">ENDORSE</span>
                                            <span className={`text-[11px] lg:text-[12px] font-black leading-none ${isLikedByMe ? "text-[#ff5c00]" : "text-black"}`}>{post.likes.length}</span>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="text-black opacity-20"><FaCommentDots size={16} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black text-black/30 uppercase tracking-widest leading-none mb-1">TRAFFIC</span>
                                            <span className="text-[11px] lg:text-[12px] font-black text-black leading-none">{post.comments.length}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleShare} className="w-10 h-10 border-2 border-black/10 flex items-center justify-center text-black/30 hover:text-[#ff5c00] hover:border-[#ff5c00] transition-all hover:scale-105 active:scale-95">
                                    <FaShareAlt size={14} />
                                </button>
                            </div>

                            <div className="px-6 lg:px-8 py-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                                        <div className="w-2 h-2 bg-[#ff5c00] rotate-45"></div>COMM_LOG_ENTRIES
                                    </h3>
                                    <div className="h-[2px] flex-1 mx-6 bg-black/5"></div>
                                </div>
                                <div className="space-y-8">
                                    {post.comments.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-3xl bg-black/[0.02]">
                                            <FaCrosshairs className="text-black/10 mb-5" size={32} />
                                            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] text-center px-8">Awaiting First Comment...</p>
                                        </div>
                                    ) : (
                                        post.comments.map(comment => (
                                            <div key={comment._id} className="relative group/comment flex gap-4 lg:gap-6">
                                                <div className="w-10 h-10 border-2 border-black/10 flex items-center justify-center font-black text-xs text-black/30 bg-black/[0.03] shrink-0 overflow-hidden">
                                                    {comment.user?.profileImage ? <img src={comment.user.profileImage} alt="user" className="w-full h-full object-cover" /> : comment.user?.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[10px] font-black text-black uppercase tracking-tight leading-none">{comment.user?.name || "User"}</p>
                                                            {comment.user?.role === 'admin' && <span className="bg-[#ff5c00] text-black text-[6px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">ADMIN</span>}
                                                        </div>
                                                        {user?.role === 'admin' && (
                                                            <button onClick={() => handleDeleteComment(comment._id)} className="text-black/10 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg">
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-black/70 leading-relaxed uppercase bg-black/[0.04] p-4 border-l-2 border-[#ff5c00]/30">
                                                        {renderTextWithLinks(comment.text)}
                                                    </div>
                                                    <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-30">{new Date(comment.createdAt).toLocaleDateString()} @ {new Date(comment.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="fixed lg:absolute bottom-0 inset-x-0 p-4 lg:p-8 bg-white/95 backdrop-blur-xl border-t-2 border-black z-40 lg:z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative group">
                                    <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full bg-black/5 border-2 border-black/10 px-6 py-4 text-[10px] lg:text-[11px] font-black outline-none focus:border-black focus:bg-white transition-all uppercase placeholder:text-black/20" />
                                    <div className="absolute top-0 right-0 w-12 h-[3px] bg-[#ff5c00] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                </div>
                                <button type="submit" disabled={!commentText.trim()} className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#ff5c00] transition-all disabled:opacity-20 translate-y-[-2px] shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                    <FaPaperPlane size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="mt-20 lg:mt-0"><Footer /></div>
        </div>
    );
};

export default SinglePost;
