import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { FaCommentDots, FaShareAlt, FaPaperPlane, FaTrash, FaArrowLeft, FaCrosshairs, FaRegClock, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Nev from './Nev';
import Footer from './Footer';

// --- Pixel Heart Icon (Matching Feed) ---
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
                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff5c00] hover:underline transition-colors break-all"
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
        window.scrollTo(0, 0);
    }, [id]);

    const fetchPost = async () => {
        try {
            const { data } = await API.get(`/posts/${id}`);
            setPost(data);
        } catch (error) {
            console.error("Error loading post", error);
            toast.error("Packet Loss: Post Not Found.");
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) return toast.info("LOGON_REQUIRED::SCTR_AUTH");
        try {
            const isLiked = post.likes.includes(user._id);
            setPost({
                ...post,
                likes: isLiked ? post.likes.filter(id => id !== user._id) : [...post.likes, user._id]
            });
            await API.put(`/posts/${post._id}/like`);
        } catch (error) {
            fetchPost();
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.info("LOGON_REQUIRED::SCTR_AUTH");
        if (!commentText.trim()) return;

        try {
            const { data: updatedComments } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
            setPost({ ...post, comments: updatedComments });
            setCommentText("");
            toast.success("Entry Sequenced.");
        } catch (error) {
            toast.error("Transmission Error.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("PURGE_ENTRY::ARE_YOU_SURE?")) return;
        try {
            const { data: updatedComments } = await API.delete(`/posts/${post._id}/comment/${commentId}`);
            setPost({ ...post, comments: updatedComments });
            toast.success("Log Entry Purged.");
        } catch (error) {
            toast.error("Purge Error.");
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link Cached to Clipboard.");
        }).catch(() => toast.error("Cache Error."));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#e5e5e5] flex flex-col justify-center items-center gap-4 font-mono tech-grid relative overflow-hidden">
                <div className="scanline"></div>
                <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin"></div>
                <p className="text-black font-black uppercase text-[10px] tracking-widest mt-2">ACCESSING_DATA_STREAM...</p>
            </div>
        );
    }

    if (!post) return null;

    const isLikedByMe = user && post.likes.includes(user._id);

    return (
        <div className="bg-[#e5e5e5] min-h-screen flex flex-col font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative overflow-hidden">
            <Nev />
            <div className="scanline"></div>

            {/* Main Content Area: Adjusted for Mobile Edge-to-Edge */}
            <div className="flex-1 max-w-6xl mx-auto py-0 lg:py-24 px-0 lg:px-8 w-full relative z-10">
                
                {/* Back Control: Desktop Only Hidden on mobile for cleaner look as Nav provides it */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 hidden lg:block"
                >
                    <button
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-3 text-black/40 hover:text-[#ff5c00] font-black text-[10px] uppercase tracking-widest transition-all group"
                    >
                        <div className="w-8 h-8 border-2 border-black/10 flex items-center justify-center group-hover:border-[#ff5c00] transition-colors">
                            <FaArrowLeft />
                        </div>
                        RETURN_TO_MAIN_FED
                    </button>
                </motion.div>

                {/* Mobile Back Button (Float) */}
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
                    {/* Industrial Decals (Desktop Only on borders) */}
                    <div className="hidden lg:block corner-decal decal-tl border-black"></div>
                    <div className="hidden lg:block corner-decal decal-tr border-black"></div>
                    <div className="hidden lg:block corner-decal decal-bl border-black"></div>
                    <div className="hidden lg:block corner-decal decal-br border-black opacity-30"></div>

                    {/* Left Column: Visual Manifest (Full Header on Mobile) */}
                    {post.image && (
                        <div className="w-full lg:w-[60%] lg:min-h-[400px] bg-[#0f172a] border-b-2 lg:border-b-0 lg:border-r-2 border-black flex items-center justify-center relative group overflow-hidden">
                            <img
                                src={`${post.image}`}
                                alt={post.title}
                                className="w-full h-auto lg:h-full object-contain lg:p-4 group-hover:scale-[1.05] transition-transform duration-1000"
                            />
                            {/* Technical Overlay */}
                            <div className="absolute top-4 left-4 text-[7px] font-black text-white/20 uppercase tracking-[0.4em]">IMG_SCTR::00{post._id.slice(-4)}</div>
                            <div className="absolute top-4 right-4 bg-white/5 backdrop-blur-md px-2 py-1 border border-white/10 text-[6px] font-black text-white/40 uppercase tracking-widest">ENCRYPTED_SIGNAL_V2.1</div>
                            <div className="absolute bottom-4 right-4 flex gap-1">
                                {[...Array(6)].map((_, i) => <div key={i} className={`w-1 h-4 ${i % 2 === 0 ? 'bg-[#ff5c00]/40' : 'bg-white/10'}`}></div>)}
                            </div>
                        </div>
                    )}

                    {/* Right Column: Information Stream */}
                    <div className={`w-full flex flex-col ${post.image ? 'lg:w-[40%]' : 'w-full'} bg-white relative`}>
                        <div className="flex-1 overflow-y-auto scrollbar-tech pb-32 lg:pb-24">
                            
                            {/* Author Node (Sticky for easy ID) */}
                            <div className="px-6 lg:px-8 py-6 border-b-2 border-black/5 bg-white/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-black flex items-center justify-center font-heading text-lg lg:text-xl bg-black text-white shrink-0 overflow-hidden">
                                        {post.author?.profileImage ? (
                                            <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                        ) : (
                                            post.author?.name?.charAt(0).toUpperCase() || "S"
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-black text-black text-[9px] lg:text-[10px] uppercase tracking-tighter leading-none">{post.author?.name || "SYS_OPERATOR"}</h4>
                                        <div className="flex items-center gap-2 mt-1 opacity-40">
                                            <FaRegClock size={8} />
                                            <span className="text-[7px] lg:text-[7px] font-black uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[6px] font-black text-black/20 uppercase tracking-widest hidden sm:block">NODE_LINK::OK</span>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>

                            {/* Main Content Payload */}
                            <div className="px-6 lg:px-8 py-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-[2px] bg-[#ff5c00]"></div>
                                        <div className="text-[8px] font-black text-[#ff5c00] uppercase tracking-[0.3em]">
                                            SCTR_DATA_SCAN::00{post._id.slice(-2)}
                                        </div>
                                    </div>
                                    <h1 className="text-xl lg:text-3xl font-heading font-black text-black uppercase tracking-tighter leading-tight italic">{post.title}</h1>
                                </div>
                                
                                <div className="text-black/80 text-xs lg:text-sm font-bold uppercase leading-loose tracking-wide whitespace-pre-line border-l-4 border-black/10 pl-5 py-2">
                                    {renderTextWithLinks(post.content)}
                                </div>
                            </div>

                            {/* Interaction Hub (Optimized spacing for mobile) */}
                            <div className="px-6 lg:px-8 py-6 flex items-center justify-between border-y-2 border-black/5 bg-[#fbfbfb]">
                                <div className="flex items-center gap-6 lg:gap-8">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-3 group/hub"
                                    >
                                        <div className={`transition-all ${isLikedByMe ? "text-[#ff5c00]" : "text-black opacity-20 group-hover/hub:opacity-100"}`}>
                                            <PixelHeart filled={isLikedByMe} />
                                        </div>
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

                                <button onClick={handleShare} className="w-10 h-10 border-2 border-black/10 flex items-center justify-center text-black/30 hover:text-[#ff5c00] hover:border-[#ff5c00] transition-all hover:bg-black hover:scale-105 active:scale-95">
                                    <FaShareAlt size={14} />
                                </button>
                            </div>

                            {/* Discussion Ledger */}
                            <div className="px-6 lg:px-8 py-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                                        <div className="w-2 h-2 bg-[#ff5c00] rotate-45"></div>
                                        COMM_LOG_ENTRIES
                                    </h3>
                                    <div className="h-[2px] flex-1 mx-6 bg-black/5"></div>
                                </div>

                                <div className="space-y-8">
                                    {post.comments.length === 0 ? (
                                        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-3xl bg-black/[0.02]">
                                            <FaCrosshairs className="text-black/10 mb-5" size={32} />
                                            <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] text-center px-8">Awaiting_Terminal_Initial_Signal...</p>
                                        </div>
                                    ) : (
                                        post.comments.map(comment => (
                                            <div key={comment._id} className="relative group/comment flex gap-4 lg:gap-6 animate-in slide-in-from-left duration-500">
                                                <div className="w-10 h-10 border-2 border-black/10 flex items-center justify-center font-black text-xs text-black/30 bg-black/[0.03] shrink-0 overflow-hidden">
                                                    {comment.user?.profileImage ? (
                                                        <img src={`${comment.user.profileImage}`} alt="user" className="w-full h-full object-cover" />
                                                    ) : (
                                                        comment.user?.name?.charAt(0).toUpperCase() || "U"
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[10px] font-black text-black uppercase tracking-tight leading-none">{comment.user?.name || "LOG_USER"}</p>
                                                            {comment.user?.role === 'admin' && (
                                                                <span className="bg-[#ff5c00] text-black text-[6px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">SYS_OPERATOR</span>
                                                            )}
                                                        </div>
                                                        {user?.role === 'admin' && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                className="text-black/10 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-black/70 leading-relaxed uppercase bg-black/[0.04] p-4 border-l-3 border-[#ff5c00]/30 rounded-r-xl">
                                                        {renderTextWithLinks(comment.text)}
                                                    </div>
                                                    <div className="flex items-center justify-between opacity-30">
                                                        <p className="text-[7px] font-black uppercase tracking-[0.2em]">{new Date(comment.createdAt).toLocaleDateString()} @ {new Date(comment.createdAt).toLocaleTimeString()}</p>
                                                        <span className="text-[9px] font-barcode">LOG_ID_5521</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Connection Input Hub (Stick to bottom, adjusted for mobile) */}
                        <div className="fixed lg:absolute bottom-0 inset-x-0 p-4 lg:p-8 bg-white/95 backdrop-blur-xl border-t-2 border-black z-40 lg:z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none">
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-4 max-w-5xl mx-auto">
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        placeholder="TRANSMIT_DATA_LOG..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full bg-black/5 border-2 border-black/10 px-6 py-4 text-[10px] lg:text-[11px] font-black outline-none focus:border-black focus:bg-white transition-all uppercase placeholder:text-black/20"
                                    />
                                    <div className="absolute top-0 right-0 w-12 h-[3px] bg-[#ff5c00] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#ff5c00] transition-all disabled:opacity-20 translate-y-[-2px] shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                >
                                    <FaPaperPlane size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            {/* Standard Footer */}
            <div className="mt-20 lg:mt-0">
                <Footer />
            </div>
        </div>
    );
};

export default SinglePost;
