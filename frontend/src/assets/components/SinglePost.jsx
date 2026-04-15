import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import {
    FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash,
    FaArrowLeft, FaCrosshairs, FaExternalLinkAlt
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
    //  BLOG POST — New Layout: Title Top → Full Iframe → Actions → Comments
    // ============================================================
    if (post.isBlog) {
        return (
            <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', flexDirection: 'column' }}>
                <Nev />

                {/* ── TOP TITLE BAR ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexShrink: 0,
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Back */}
                    <button
                        onClick={() => navigate('/community')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                            padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    >
                        <FaArrowLeft size={9} /> Back
                    </button>

                    {/* Blog Badge */}
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.4)',
                        color: '#a78bfa', fontSize: '9px', fontWeight: 900,
                        letterSpacing: '0.18em', padding: '4px 10px', borderRadius: '20px',
                        textTransform: 'uppercase', flexShrink: 0,
                    }}>
                        <span style={{ width: 6, height: 6, background: '#a78bfa', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                        Blog
                    </span>

                    {/* Title */}
                    <h1 style={{
                        flex: 1, fontSize: '15px', fontWeight: 800,
                        color: 'rgba(255,255,255,0.88)', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                    }}>
                        {post.title}
                    </h1>

                    {/* Open in new tab */}
                    <a
                        href={post.blogUrl} target="_blank" rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700,
                            padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                            transition: 'all 0.2s', flexShrink: 0, letterSpacing: '0.06em',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                        <FaExternalLinkAlt size={9} /> Open
                    </a>
                </div>

                {/* ── FULL PAGE IFRAME ── */}
                <div style={{ flex: 1, position: 'relative', minHeight: '75vh' }}>
                    {iframeLoading && (
                        <div style={{
                            position: 'absolute', inset: 0, background: '#111',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '12px', zIndex: 10,
                        }}>
                            <div style={{
                                width: 36, height: 36, border: '3px solid rgba(255,255,255,0.07)',
                                borderTop: '3px solid #a78bfa', borderRadius: '50%',
                                animation: 'spin 0.9s linear infinite',
                            }}></div>
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', letterSpacing: '0.12em', fontWeight: 600 }}>Loading Blog...</p>
                        </div>
                    )}
                    <iframe
                        id="blog-iframe"
                        src={post.blogUrl}
                        title={post.title}
                        style={{ width: '100%', height: '100%', minHeight: '75vh', border: 'none', display: 'block' }}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        onLoad={() => setIframeLoading(false)}
                    />
                </div>

                {/* ── POST INFO + LIKE / SHARE / COMMENT ACTIONS ── */}
                <div style={{
                    background: '#141414',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    padding: '20px 24px',
                }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

                        {/* Author + Date row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                overflow: 'hidden', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {post.author?.profileImage
                                    ? <img src={post.author.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontSize: '13px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{post.author?.name?.charAt(0) || 'A'}</span>
                                }
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{post.author?.name || 'Admin'}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Action buttons — Like, Comment, Share */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '14px 18px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '14px',
                        }}>
                            {/* Like */}
                            <button
                                onClick={handleLike}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '10px 0',
                                    background: isLikedByMe ? 'rgba(255,92,0,0.15)' : 'transparent',
                                    border: isLikedByMe ? '1px solid rgba(255,92,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                                    color: isLikedByMe ? '#ff5c00' : 'rgba(255,255,255,0.45)',
                                    fontSize: '13px', fontWeight: 700,
                                }}
                            >
                                <PixelHeart filled={isLikedByMe} />
                                <span>{post.likes.length} Like{post.likes.length !== 1 ? 's' : ''}</span>
                            </button>

                            {/* Comment */}
                            <button
                                onClick={() => document.getElementById('blog-comments')?.scrollIntoView({ behavior: 'smooth' })}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '10px 0',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                                    color: 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 700,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <FaCommentDots size={13} />
                                <span>{post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}</span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '10px 0',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                                    color: 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 700,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <FaShareAlt size={13} />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── COMPACT COMMENT SECTION ── */}
                <div id="blog-comments" style={{
                    background: '#0e0e0e',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    padding: '24px',
                }}>
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <FaCommentDots size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
                            <span style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Comments</span>
                            <span style={{
                                fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                                background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px',
                            }}>{post.comments.length}</span>
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handleCommentSubmit} style={{ marginBottom: '20px' }}>
                            <div style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', overflow: 'hidden',
                                background: 'rgba(255,255,255,0.03)',
                            }}>
                                <textarea
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={2}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                                        background: 'transparent', border: 'none',
                                        outline: 'none', resize: 'none', boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                    }}
                                />
                                <div style={{
                                    display: 'flex', justifyContent: 'flex-end',
                                    padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)',
                                }}>
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '7px 18px', borderRadius: '20px',
                                            background: commentText.trim() ? '#fff' : 'rgba(255,255,255,0.1)',
                                            color: commentText.trim() ? '#000' : 'rgba(255,255,255,0.2)',
                                            border: 'none', cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                                            fontSize: '12px', fontWeight: 800, transition: 'all 0.2s',
                                        }}
                                    >
                                        <FaPaperPlane size={9} /> Post
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Comment List */}
                        {post.comments.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '28px 0',
                                border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px',
                            }}>
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: 0 }}>No comments yet. Be the first to comment!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {post.comments.map((comment, i) => (
                                    <motion.div
                                        key={comment._id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className="group"
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '12px 16px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.08)',
                                                overflow: 'hidden', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {comment.user?.profileImage
                                                    ? <img src={comment.user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.35)' }}>{comment.user?.name?.charAt(0) || 'U'}</span>
                                                }
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{comment.user?.name || 'User'}</span>
                                                        {comment.user?.role === 'admin' && <span style={{ background: '#ff5c00', color: '#fff', fontSize: '8px', fontWeight: 900, padding: '2px 7px', borderRadius: '10px' }}>Admin</span>}
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                    {user?.role === 'admin' && (
                                                        <button onClick={() => handleDeleteComment(comment._id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', padding: 0 }}
                                                            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
                                                        >
                                                            <FaTrash size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7' }}>{renderTextWithLinks(comment.text)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Footer />

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                `}</style>
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

                {/* ── CONTENT SECTION ── */}
                <div className="flex-1 bg-[#0d0d0d] py-12 px-5 md:px-10 lg:px-16">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-full max-w-3xl mx-auto"
                    >
                        {post.content ? (
                            <p className="text-white/75 text-base md:text-[17px] leading-[1.95] font-normal whitespace-pre-line">
                                {renderTextWithLinks(post.content)}
                            </p>
                        ) : (
                            <p className="text-white/20 italic text-sm">No content provided.</p>
                        )}
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
