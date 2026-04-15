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
    //  REGULAR POST — Magazine Style Layout
    // ============================================================
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

                <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,92,0,0.18)', border: '1px solid rgba(255,92,0,0.35)',
                    color: '#ff5c00', fontSize: '9px', fontWeight: 900,
                    letterSpacing: '0.18em', padding: '4px 10px', borderRadius: '20px',
                    textTransform: 'uppercase', flexShrink: 0,
                }}>
                    <span style={{ width: 6, height: 6, background: '#ff5c00', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                    Post
                </span>

                <h1 style={{
                    flex: 1, fontSize: '15px', fontWeight: 800,
                    color: 'rgba(255,255,255,0.88)', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                }}>
                    {post.title}
                </h1>
            </div>

            {/* ── IMAGE SECTION — Full image visible with blurred BG ── */}
            {post.image && (
                <div style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '420px',
                    maxHeight: '560px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000',
                }}>
                    {/* Blurred background */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${post.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(28px) brightness(0.35)',
                        transform: 'scale(1.1)',
                    }} />
                    {/* Actual image — full visible, not cropped */}
                    <motion.img
                        src={post.image}
                        alt={post.title}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            maxWidth: '100%',
                            maxHeight: '560px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '4px',
                        }}
                    />
                </div>
            )}

            {/* ── ARTICLE CONTENT SECTION ── */}
            <div style={{
                flex: 1,
                background: '#111',
                borderTop: post.image ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.45 }}
                    style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}
                >
                    {/* Big title inside content */}
                    <h2 style={{
                        fontSize: '28px', fontWeight: 900,
                        color: 'rgba(255,255,255,0.92)', margin: '0 0 20px 0',
                        lineHeight: '1.3', letterSpacing: '-0.02em',
                    }}>
                        {post.title}
                    </h2>

                    {/* Author + Date */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        marginBottom: '32px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            overflow: 'hidden', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {post.author?.profileImage
                                ? <img src={post.author.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{post.author?.name?.charAt(0) || 'A'}</span>
                            }
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{post.author?.name || 'Admin'}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '1px' }}>
                                {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Post Body */}
                    {post.content ? (
                        <p style={{
                            color: 'rgba(255,255,255,0.68)',
                            fontSize: '16.5px',
                            lineHeight: '2',
                            fontWeight: 400,
                            whiteSpace: 'pre-line',
                            margin: 0,
                            letterSpacing: '0.01em',
                        }}>
                            {renderTextWithLinks(post.content)}
                        </p>
                    ) : (
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>No content provided.</p>
                    )}
                </motion.div>
            </div>

            {/* ── ACTION BUTTONS — Like / Comment / Share ── */}
            <div style={{
                background: '#141414',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                padding: '18px 24px',
            }}>
                <div style={{
                    maxWidth: '720px', margin: '0 auto',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px',
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
                        onClick={() => document.getElementById('post-comments')?.scrollIntoView({ behavior: 'smooth' })}
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

            {/* ── COMMENT SECTION ── */}
            <div id="post-comments" style={{
                background: '#0e0e0e',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '24px',
            }}>
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <FaCommentDots size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Comments</span>
                        <span style={{
                            fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                            background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px',
                        }}>{post.comments.length}</span>
                    </div>

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
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
};

export default SinglePost;

