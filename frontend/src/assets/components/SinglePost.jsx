import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import {
    FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash,
    FaArrowLeft, FaCrosshairs, FaExternalLinkAlt, FaLock, FaRedoAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Nev from './Nev';
import Footer from './Footer';

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
    const [iframeLoading, setIframeLoading] = useState(true);
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
        <div className="min-h-screen bg-[#111] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
        </div>
    );

    if (!post) return null;

    const isLikedByMe = user && post.likes.includes(user._id);

    // ============================================================
    //  BLOG POST — Premium Embedded Browser Window Layout
    // ============================================================
    if (post.isBlog) {
        const displayUrl = post.blogUrl?.replace(/^https?:\/\//, '') || '';

        return (
            <div className="min-h-screen bg-[#111] flex flex-col">
                <Nev />

                {/* ── PAGE WRAPPER ── */}
                <div className="flex-1 flex flex-col">

                    {/* ── HERO: Image + Title ── */}
                    <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: '45vh', minHeight: '280px' }}>
                        {/* BG image or gradient */}
                        {post.image ? (
                            <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                        )}

                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#111]/40 to-transparent" />

                        {/* Back button */}
                        <button
                            onClick={() => navigate('/community')}
                            className="absolute top-5 left-5 md:left-10 flex items-center gap-2 text-white/50 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors group z-10"
                        >
                            <FaArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" />
                            Community
                        </button>

                        {/* BLOG badge */}
                        <div className="absolute top-5 right-5 md:right-10 z-10">
                            <span className="flex items-center gap-1.5 bg-violet-600/80 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-violet-900/30">
                                <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                                Blog
                            </span>
                        </div>

                        {/* Title + Meta at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 md:pb-10 z-10">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl">
                                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-2xl">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Author */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                                            {post.author?.profileImage
                                                ? <img src={post.author.profileImage} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/50">{post.author?.name?.charAt(0) || 'A'}</div>
                                            }
                                        </div>
                                        <span className="text-white/70 text-xs font-semibold">{post.author?.name || 'Admin'}</span>
                                    </div>
                                    <span className="text-white/20 text-xs">•</span>
                                    <span className="text-white/40 text-xs">{new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span className="text-white/20 text-xs">•</span>
                                    {/* Like inline */}
                                    <button onClick={handleLike} className={`flex items-center gap-1 text-xs font-bold transition-colors ${isLikedByMe ? 'text-[#ff5c00]' : 'text-white/40 hover:text-white/70'}`}>
                                        <PixelHeart filled={isLikedByMe} />
                                        {post.likes.length}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── ACTION BAR ── */}
                    <div className="bg-[#1a1a1a] border-y border-white/[0.06] px-6 md:px-12 py-3 flex items-center justify-between gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 text-white/30 text-xs">
                            <span className="font-mono truncate max-w-xs text-[11px]">{post.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isLikedByMe ? 'border-[#ff5c00]/50 text-[#ff5c00] bg-[#ff5c00]/10' : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/60'}`}>
                                <PixelHeart filled={isLikedByMe} /> {post.likes.length}
                            </button>
                            <button onClick={() => document.getElementById('blog-comments')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60 transition-all">
                                <FaCommentDots size={11} /> {post.comments.length}
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60 transition-all">
                                <FaShareAlt size={11} />
                            </button>
                            <a href={post.blogUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold transition-all border border-white/10">
                                <FaExternalLinkAlt size={9} /> New Tab
                            </a>
                        </div>
                    </div>

                    {/* ── BROWSER WINDOW (Premium iframe wrapper) ── */}
                    <div className="flex-1 bg-[#0d0d0d] px-4 md:px-10 lg:px-16 pt-8 pb-0">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-full max-w-7xl mx-auto rounded-t-2xl overflow-hidden shadow-[0_-8px_80px_rgba(0,0,0,0.8)]"
                            style={{ height: '80vh', minHeight: '520px', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Browser chrome bar */}
                            <div className="bg-[#252525] flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
                                {/* Mac-style window dots */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_4px_#FF5F5780]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-[0_0_4px_#FEBC2E80]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_4px_#28C84080]"></div>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                    {/* Address bar */}
                                    <div className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-md px-3 py-1.5 flex items-center gap-2 min-w-0">
                                        <FaLock size={8} className="text-green-400/70 flex-shrink-0" />
                                        <span className="text-[#8a8a8a] text-[11px] font-mono truncate">{displayUrl}</span>
                                    </div>
                                </div>

                                {/* Reload + Open */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => { setIframeLoading(true); document.getElementById('blog-iframe').src += ''; }}
                                        className="text-white/20 hover:text-white/60 transition-colors p-1"
                                    >
                                        <FaRedoAlt size={11} />
                                    </button>
                                    <a href={post.blogUrl} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors p-1">
                                        <FaExternalLinkAlt size={11} />
                                    </a>
                                </div>
                            </div>

                            {/* iframe */}
                            <div className="relative flex-1 bg-white overflow-hidden">
                                {/* Loading overlay */}
                                {iframeLoading && (
                                    <div className="absolute inset-0 bg-[#f5f5f5] flex flex-col items-center justify-center gap-3 z-10">
                                        <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin"></div>
                                        <p className="text-xs text-gray-400 font-medium">Loading page...</p>
                                    </div>
                                )}
                                <iframe
                                    id="blog-iframe"
                                    src={post.blogUrl}
                                    title={post.title}
                                    className="w-full h-full border-none"
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                    onLoad={() => setIframeLoading(false)}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* ── COMMENTS ── */}
                    <div id="blog-comments" className="bg-[#111] border-t border-white/[0.06]">
                        <div className="max-w-2xl mx-auto px-5 md:px-8 py-14">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <FaCommentDots size={14} className="text-white/20" />
                                <h2 className="text-sm font-black text-white/80 uppercase tracking-widest">Comments</h2>
                                <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{post.comments.length}</span>
                            </div>

                            {/* Input */}
                            <form onSubmit={handleCommentSubmit} className="mb-10">
                                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] focus-within:border-white/20 transition-colors">
                                    <textarea
                                        placeholder="Leave a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        rows={3}
                                        className="w-full px-5 py-4 text-sm text-white/70 bg-transparent outline-none resize-none placeholder:text-white/20"
                                    />
                                    <div className="flex justify-end px-4 py-3 border-t border-white/[0.05]">
                                        <button type="submit" disabled={!commentText.trim()} className="flex items-center gap-2 px-5 py-2 bg-white text-black text-xs font-black rounded-full hover:bg-[#ff5c00] hover:text-white transition-all disabled:opacity-20">
                                            <FaPaperPlane size={10} /> Post
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* List */}
                            {post.comments.length === 0 ? (
                                <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-2xl">
                                    <FaCrosshairs className="text-white/10 mx-auto mb-3" size={24} />
                                    <p className="text-xs text-white/20">No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {post.comments.map((comment, i) => (
                                        <motion.div key={comment._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                    {comment.user?.profileImage
                                                        ? <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/30">{comment.user?.name?.charAt(0) || 'U'}</div>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px] font-bold text-white/80">{comment.user?.name || 'User'}</span>
                                                            {comment.user?.role === 'admin' && <span className="bg-[#ff5c00] text-white text-[8px] font-black px-2 py-0.5 rounded-full">Admin</span>}
                                                            <span className="text-[10px] text-white/20">{new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                        </div>
                                                        {user?.role === 'admin' && (
                                                            <button onClick={() => handleDeleteComment(comment._id)} className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                                <FaTrash size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-white/40 leading-relaxed">{renderTextWithLinks(comment.text)}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    // ============================================================
    //  REGULAR POST — Original Layout (Unchanged)
    // ============================================================
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
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
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
                            <div className="absolute bottom-4 right-4 flex gap-1">{[...Array(6)].map((_, i) => <div key={i} className={`w-1 h-4 ${i % 2 === 0 ? 'bg-[#ff5c00]/40' : 'bg-white/10'}`}></div>)}</div>
                        </div>
                    )}

                    <div className={`w-full flex flex-col ${post.image ? 'lg:w-[40%]' : 'w-full'} bg-white relative`}>
                        <div className="flex-1 overflow-y-auto scrollbar-tech pb-32 lg:pb-24">
                            <div className="px-6 lg:px-8 py-6 border-b-2 border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-black flex items-center justify-center font-heading text-lg lg:text-xl bg-black text-white shrink-0 overflow-hidden">
                                        {post.author?.profileImage ? <img src={post.author.profileImage} alt="" className="w-full h-full object-cover" /> : post.author?.name?.charAt(0).toUpperCase() || "S"}
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
                                <div className="text-black/80 text-xs lg:text-sm font-bold uppercase leading-loose tracking-wide whitespace-pre-line border-l-4 border-black/10 pl-5 py-2">{renderTextWithLinks(post.content)}</div>
                            </div>
                            <div className="px-6 lg:px-8 py-6 flex items-center justify-between border-y-2 border-black/5 bg-[#fbfbfb]">
                                <div className="flex items-center gap-6 lg:gap-8">
                                    <button onClick={handleLike} className="flex items-center gap-3 group/hub">
                                        <div className={`transition-all ${isLikedByMe ? "text-[#ff5c00]" : "text-black opacity-20 group-hover/hub:opacity-100"}`}><PixelHeart filled={isLikedByMe} /></div>
                                        <div className="flex flex-col"><span className="text-[7px] font-black text-black/30 uppercase tracking-widest leading-none mb-1">ENDORSE</span><span className={`text-[11px] font-black leading-none ${isLikedByMe ? "text-[#ff5c00]" : "text-black"}`}>{post.likes.length}</span></div>
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="text-black opacity-20"><FaCommentDots size={16} /></div>
                                        <div className="flex flex-col"><span className="text-[7px] font-black text-black/30 uppercase tracking-widest leading-none mb-1">TRAFFIC</span><span className="text-[11px] font-black text-black leading-none">{post.comments.length}</span></div>
                                    </div>
                                </div>
                                <button onClick={handleShare} className="w-10 h-10 border-2 border-black/10 flex items-center justify-center text-black/30 hover:text-[#ff5c00] hover:border-[#ff5c00] transition-all hover:scale-105 active:scale-95"><FaShareAlt size={14} /></button>
                            </div>
                            <div className="px-6 lg:px-8 py-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.4em] flex items-center gap-3 italic"><div className="w-2 h-2 bg-[#ff5c00] rotate-45"></div>COMM_LOG_ENTRIES</h3>
                                    <div className="h-[2px] flex-1 mx-6 bg-black/5"></div>
                                </div>
                                <div className="space-y-8">
                                    {post.comments.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-3xl">
                                            <FaCrosshairs className="text-black/10 mb-5" size={32} />
                                            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] text-center px-8">Awaiting First Comment...</p>
                                        </div>
                                    ) : post.comments.map(comment => (
                                        <div key={comment._id} className="relative group/comment flex gap-4 lg:gap-6">
                                            <div className="w-10 h-10 border-2 border-black/10 flex items-center justify-center font-black text-xs text-black/30 bg-black/[0.03] shrink-0 overflow-hidden">
                                                {comment.user?.profileImage ? <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" /> : comment.user?.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[10px] font-black text-black uppercase tracking-tight">{comment.user?.name || "User"}</p>
                                                        {comment.user?.role === 'admin' && <span className="bg-[#ff5c00] text-black text-[6px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">ADMIN</span>}
                                                    </div>
                                                    {user?.role === 'admin' && <button onClick={() => handleDeleteComment(comment._id)} className="text-black/10 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all p-1.5 rounded-lg"><FaTrash size={12} /></button>}
                                                </div>
                                                <div className="text-[11px] font-bold text-black/70 leading-relaxed uppercase bg-black/[0.04] p-4 border-l-2 border-[#ff5c00]/30">{renderTextWithLinks(comment.text)}</div>
                                                <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-30">{new Date(comment.createdAt).toLocaleDateString()} @ {new Date(comment.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="fixed lg:absolute bottom-0 inset-x-0 p-4 lg:p-8 bg-white/95 backdrop-blur-xl border-t-2 border-black z-40 lg:z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative group">
                                    <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full bg-black/5 border-2 border-black/10 px-6 py-4 text-[10px] lg:text-[11px] font-black outline-none focus:border-black focus:bg-white transition-all uppercase placeholder:text-black/20" />
                                    <div className="absolute top-0 right-0 w-12 h-[3px] bg-[#ff5c00] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                </div>
                                <button type="submit" disabled={!commentText.trim()} className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#ff5c00] transition-all disabled:opacity-20 translate-y-[-2px] shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"><FaPaperPlane size={20} /></button>
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
