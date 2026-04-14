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
    //  REGULAR POST — Premium Dark Full-Screen Layout
    // ============================================================
    return (
        <div className="min-h-screen bg-[#111] flex flex-col">
            <Nev />

            <div className="flex-1 flex flex-col">

                {/* ── HERO: Image + Title ── */}
                <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: '55vh', minHeight: '320px' }}>
                    {post.image ? (
                        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-[#111]" />
                    )}

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111]/40 to-transparent" />

                    {/* Back */}
                    <button
                        onClick={() => navigate('/community')}
                        className="absolute top-5 left-5 md:left-10 flex items-center gap-2 text-white/50 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors group z-10"
                    >
                        <FaArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" />
                        Community
                    </button>

                    {/* POST badge */}
                    <div className="absolute top-5 right-5 md:right-10 z-10">
                        <span className="flex items-center gap-1.5 bg-[#ff5c00]/20 border border-[#ff5c00]/30 text-[#ff5c00] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-sm">
                            <span className="w-1 h-1 bg-[#ff5c00] rounded-full animate-pulse"></span>
                            Post
                        </span>
                    </div>

                    {/* Title + Meta */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8 md:pb-10 z-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-2xl">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
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
                    <span className="font-mono text-white/20 text-[11px] truncate max-w-xs hidden md:block">{post.title}</span>
                    <div className="flex items-center gap-2 ml-auto">
                        <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isLikedByMe ? 'border-[#ff5c00]/50 text-[#ff5c00] bg-[#ff5c00]/10' : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/60'}`}>
                            <PixelHeart filled={isLikedByMe} /> {post.likes.length}
                        </button>
                        <button onClick={() => document.getElementById('post-comments')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60 transition-all">
                            <FaCommentDots size={11} /> {post.comments.length}
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/30 hover:border-white/20 hover:text-white/60 transition-all">
                            <FaShareAlt size={11} /> Share
                        </button>
                    </div>
                </div>

                {/* ── CONTENT CARD ── */}
                <div className="flex-1 bg-[#0d0d0d] px-4 md:px-10 lg:px-16 pt-8 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-full max-w-4xl mx-auto"
                    >
                        {/* Content label bar */}
                        <div className="bg-[#1e1e1e] border border-white/[0.07] rounded-t-2xl flex items-center gap-3 px-5 py-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-[0_0_4px_#FF5F5780]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] shadow-[0_0_4px_#FEBC2E80]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] shadow-[0_0_4px_#28C84080]"></div>
                            </div>
                            <span className="text-white/20 text-[11px] font-mono ml-2">post_content.txt</span>
                        </div>

                        {/* Content body */}
                        <div className="bg-[#161616] border border-t-0 border-white/[0.07] rounded-b-2xl p-8 md:p-12 shadow-[0_8px_60px_rgba(0,0,0,0.6)]">
                            {post.content ? (
                                <p className="text-white/70 text-base md:text-lg leading-[1.9] font-normal whitespace-pre-line">
                                    {renderTextWithLinks(post.content)}
                                </p>
                            ) : (
                                <p className="text-white/20 italic text-sm">No content provided.</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* ── COMMENTS ── */}
                <div id="post-comments" className="bg-[#111] border-t border-white/[0.06]">
                    <div className="max-w-2xl mx-auto px-5 md:px-8 py-14">

                        <div className="flex items-center gap-3 mb-8">
                            <FaCommentDots size={14} className="text-white/20" />
                            <h2 className="text-sm font-black text-white/80 uppercase tracking-widest">Comments</h2>
                            <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{post.comments.length}</span>
                        </div>

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
};

export default SinglePost;
