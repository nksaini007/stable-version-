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
import { Helmet } from 'react-helmet-async';
import Nev from './Nev';


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
    const { slug } = useParams();
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

    useEffect(() => { fetchPost(); window.scrollTo(0, 0); }, [slug]);

    const fetchPost = async () => {
        try {
            // Check if it's an ID (24 chars hex) or a Slug
            const isId = /^[0-9a-fA-F]{24}$/.test(slug);
            const endpoint = isId ? `/posts/${slug}` : `/posts/slug/${slug}`;
            
            const { data } = await API.get(endpoint);
            setPost(data);
        } catch (err) {
            console.error("Fetch Error:", err);
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

    // Dynamic Meta Tags & Structured Data
    const pageTitle = `${post.title} | Stinchar Community`;
    const pageDesc = post.metaDescription || post.content?.substring(0, 155).replace(/<[^>]*>?/gm, '') || "Explore construction and design insights on Stinchar.";
    const pageUrl = `${window.location.origin}/community/post/${post.slug || post._id}`;
    const pageImg = post.image || "https://stinchar.com/default-preview.jpg";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": post.isBlog ? "BlogPosting" : "Article",
        "headline": post.title,
        "image": [pageImg],
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt,
        "author": [{
            "@type": "Person",
            "name": post.author?.name || "Stinchar Expert",
            "url": `${window.location.origin}/architect/${post.author?._id}`
        }]
    };

    const SEO = (
        <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDesc} />
            <link rel="canonical" href={pageUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDesc} />
            <meta property="og:image" content={pageImg} />
            <meta property="og:url" content={pageUrl} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDesc} />
            <meta name="twitter:image" content={pageImg} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );

    // ============================================================
    //  BLOG POST — New Layout: Title Top → Full Iframe → Actions → Comments
    // ============================================================
    if (post.isBlog) {
        return (
            <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', flexDirection: 'column' }}>
                {SEO}
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

                {/* ── MINI FOOTER ── */}
                <div style={{
                    background: '#0a0a0a',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '14px 24px',
                    textAlign: 'center',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 500, letterSpacing: '0.06em' }}>
                        © {new Date().getFullYear()} Stinchar · All Rights Reserved
                    </span>
                </div>

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
    // Dynamic TOC parsing
    const tocItems = [];
    if (post.content) {
        const headingRegex = /<(h[23])>(.*?)<\/h[23]>/g;
        let match;
        while ((match = headingRegex.exec(post.content)) !== null) {
            const tag = match[1];
            const text = match[2].replace(/<[^>]*>?/gm, ''); // Clean HTML
            const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            tocItems.push({ id, text, level: tag === 'h2' ? 0 : 1 });
        }
    }

    // Inject IDs into content for TOC scrolling
    const contentWithIds = post.content?.replace(/<(h[23])>(.*?)<\/h[23]>/g, (match, tag, text) => {
        const id = text.replace(/<[^>]*>?/gm, '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        return `<${tag} id="${id}">${text}</${tag}>`;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', flexDirection: 'column' }}>
            {SEO}
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
                        color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                        padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s',
                        textTransform: 'uppercase', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
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
                    color: '#fff', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                }}>
                    {post.title}
                </h1>
            </div>

            {/* ── IMAGE SECTION ── */}
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
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${post.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(28px) brightness(0.35)',
                        transform: 'scale(1.1)',
                    }} />
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

            {/* ── TWO-COLUMN CONTENT LAYOUT ── */}
            <div style={{
                flex: 1,
                background: '#111',
                borderTop: post.image ? '1px solid rgba(255,255,255,0.06)' : 'none',
                padding: '60px 0'
            }}>
                <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 300px) minmax(0, 720px) minmax(0, 50px)', gap: '60px' }}>
                    
                    {/* LEFT SIDEBAR (TOC + SHARE) */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {tocItems.length > 0 && (
                            <div className="toc-container">
                                <h4 className="toc-title">Table of Contents</h4>
                                <nav>
                                    {tocItems.map((item, idx) => (
                                        <a key={idx} href={`#${item.id}`} className="toc-item" style={{ paddingLeft: item.level * 20 }}>
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Share Post</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[ FaCommentDots, FaShareAlt ].map((Icon, i) => (
                                    <button key={i} onClick={i===1 ? handleShare : () => document.getElementById('post-comments')?.scrollIntoView({ behavior: 'smooth' })} style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Icon size={14} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.45 }}
                    >
                        {/* Breadcrumbs */}
                        <div className="post-breadcrumbs">
                            <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
                            <span className="breadcrumb-sep">&gt;</span>
                            <span className="breadcrumb-link" onClick={() => navigate('/community')}>Community</span>
                            {post.category && (
                                <>
                                    <span className="breadcrumb-sep">&gt;</span>
                                    <span className="breadcrumb-link">{post.category}</span>
                                </>
                            )}
                            <span className="breadcrumb-sep">&gt;</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{post.title}</span>
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontSize: '36px', fontWeight: 900,
                            color: '#fff', margin: '0 0 24px 0',
                            lineHeight: '1.2', letterSpacing: '-0.03em',
                        }}>
                            {post.title}
                        </h2>

                        {/* Author + Date */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            marginBottom: '40px',
                            paddingBottom: '32px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: '50%',
                                background: 'rgba(124,58,237,0.15)',
                                border: '1px solid rgba(124,58,237,0.3)',
                                overflow: 'hidden', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {post.author?.profileImage
                                    ? <img src={post.author.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontSize: '14px', fontWeight: 900, color: '#a78bfa' }}>{post.author?.name?.charAt(0) || 'A'}</span>
                                }
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>{post.author?.name || 'Stinchar Expert'}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Post Body */}
                        {post.content ? (
                            <div 
                                className="rich-text-content"
                                dangerouslySetInnerHTML={{ __html: contentWithIds }}
                            />
                        ) : (
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>No content provided.</p>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div style={{
                background: '#141414',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                padding: '24px',
            }}>
                <div style={{
                    maxWidth: '860px', margin: '0 auto',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                }}>
                    <button onClick={handleLike} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 0', background: isLikedByMe ? 'rgba(255,92,0,0.15)' : 'transparent', border: isLikedByMe ? '1px solid rgba(255,92,0,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', color: isLikedByMe ? '#ff5c00' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 800 }}>
                        <PixelHeart filled={isLikedByMe} />
                        <span>{post.likes.length} Likes</span>
                    </button>
                    <button onClick={() => document.getElementById('post-comments')?.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 800 }}>
                        <FaCommentDots size={14} />
                        <span>{post.comments.length} Comments</span>
                    </button>
                    <button onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 800 }}>
                        <FaShareAlt size={14} />
                        <span>Share</span>
                    </button>
                </div>
            </div>

            {/* ── COMMENT SECTION ── */}
            <div id="post-comments" style={{ background: '#0e0e0e', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
                <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <FaCommentDots size={16} style={{ color: '#ff5c00' }} />
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Discussion</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '20px' }}>{post.comments.length}</span>
                    </div>

                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '32px' }}>
                        <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                            <textarea placeholder="Add your thoughts..." value={commentText} onChange={(e) => setCommentText(e.target.value)} rows={3} style={{ width: '100%', padding: '20px', fontSize: '14px', color: '#fff', background: 'transparent', border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.6' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button type="submit" disabled={!commentText.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '30px', background: commentText.trim() ? '#fff' : 'rgba(255,255,255,0.1)', color: commentText.trim() ? '#000' : 'rgba(255,255,255,0.2)', border: 'none', cursor: commentText.trim() ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 900, transition: 'all 0.2s' }}>
                                    <FaPaperPlane size={11} /> Post Comment
                                </button>
                            </div>
                        </div>
                    </form>

                    {post.comments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0, fontWeight: 500 }}>No comments yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {post.comments.map((comment, i) => (
                                <motion.div key={comment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {comment.user?.profileImage ? <img src={comment.user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{comment.user?.name?.charAt(0) || 'U'}</span>}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{comment.user?.name || 'User'}</span>
                                                    {comment.user?.role === 'admin' && <span style={{ background: '#ff5c00', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '3px 10px', borderRadius: '12px' }}>MODERATOR</span>}
                                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{new Date(comment.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDeleteComment(comment._id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>{renderTextWithLinks(comment.text)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MINI FOOTER ── */}
            <div style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.08em' }}>© {new Date().getFullYear()} STINCHAR · DESIGNING THE FUTURE</span>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                html { scroll-behavior: smooth; }
            `}</style>
        </div>
    );
};

export default SinglePost;

