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

            <div className="flex-1 max-w-6xl mx-auto py-12 md:py-24 px-4 sm:px-6 w-full relative z-10">
                
                {/* Back Control */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
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

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border-2 border-black shadow-[15px_15px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col min-h-[70vh] relative ${post.image ? 'lg:flex-row' : 'max-w-4xl mx-auto'}`}
                >
                    {/* Industrial Decals */}
                    <div className="corner-decal decal-tl border-black"></div>
                    <div className="corner-decal decal-tr border-black"></div>
                    <div className="corner-decal decal-bl border-black"></div>
                    <div className="corner-decal decal-br border-black opacity-30"></div>

                    {/* Left Column: Visual Manifest */}
                    {post.image && (
                        <div className="w-full lg:w-[60%] bg-[#0f172a] border-b-2 lg:border-b-0 lg:border-r-2 border-black flex items-center justify-center relative group min-h-[400px]">
                            <img
                                src={`${post.image}`}
                                alt={post.title}
                                className="w-full h-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 text-[7px] font-black text-white/20 uppercase tracking-[0.4em]">IMG_SCTR::00{post._id.slice(-4)}</div>
                            <div className="absolute bottom-4 right-4 flex gap-1">
                                {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-3 bg-white/10"></div>)}
                            </div>
                        </div>
                    )}

                    {/* Right Column: Information Stream */}
                    <div className={`w-full flex flex-col ${post.image ? 'lg:w-[40%]' : 'w-full'} bg-white relative`}>
                        <div className="flex-1 overflow-y-auto scrollbar-tech pb-24">
                            
                            {/* Author Node */}
                            <div className="px-8 py-6 border-b-2 border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-heading text-xl bg-black text-white">
                                        {post.author?.profileImage ? (
                                            <img src={`${post.author.profileImage}`} alt="author" className="w-full h-full object-cover" />
                                        ) : (
                                            post.author?.name?.charAt(0).toUpperCase() || "S"
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-black text-black text-[10px] uppercase tracking-tighter leading-none">{post.author?.name || "SYS_OPERATOR"}</h4>
                                        <div className="flex items-center gap-2 mt-1 opacity-40">
                                            <FaRegClock size={8} />
                                            <span className="text-[7px] font-black uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()} // {new Date(post.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>

                            {/* Main Content Payload */}
                            <div className="px-8 py-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-[#ff5c00] opacity-50 uppercase tracking-[0.3em]">
                                        <FaGlobe /> Data_Payload_00{post._id.slice(-2)}
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-heading font-black text-black uppercase tracking-tighter leading-tight italic">{post.title}</h1>
                                </div>
                                
                                <div className="text-black/70 text-xs md:text-sm font-bold uppercase leading-relaxed tracking-wide whitespace-pre-line border-l-4 border-black/5 pl-6 py-2">
                                    {renderTextWithLinks(post.content)}
                                </div>
                            </div>

                            {/* Interaction Hub */}
                            <div className="px-8 py-6 flex items-center justify-between border-y-2 border-black/5 bg-[#f8f8f8]">
                                <div className="flex items-center gap-8">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-3 group/hub"
                                    >
                                        <div className={`transition-all ${isLikedByMe ? "text-[#ff5c00]" : "text-black opacity-20 group-hover/hub:opacity-100"}`}>
                                            <PixelHeart filled={isLikedByMe} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black text-black/20 uppercase tracking-widest">ENDORSE</span>
                                            <span className={`text-[10px] font-black leading-none ${isLikedByMe ? "text-[#ff5c00]" : "text-black"}`}>{post.likes.length}._</span>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="text-black opacity-20"><FaCommentDots size={18} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-black text-black/20 uppercase tracking-widest">TRAFFIC</span>
                                            <span className="text-[10px] font-black text-black leading-none">{post.comments.length}._</span>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleShare} className="w-10 h-10 border-2 border-black/5 flex items-center justify-center text-black/20 hover:text-[#ff5c00] hover:border-[#ff5c00] transition-all">
                                    <FaShareAlt size={14} />
                                </button>
                            </div>

                            {/* Discussion Ledger */}
                            <div className="px-8 py-10 space-y-8">
                                <h3 className="text-[10px] font-black text-black/30 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full"></div>
                                    COMM_LOG_BUFFER
                                </h3>

                                <div className="space-y-6">
                                    {post.comments.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-2xl">
                                            <FaCrosshairs className="text-black/5 mb-4" size={30} />
                                            <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.4em]">Waiting_for_Connection_Init...</p>
                                        </div>
                                    ) : (
                                        post.comments.map(comment => (
                                            <div key={comment._id} className="relative group/comment flex gap-5 animate-in slide-in-from-left duration-500">
                                                <div className="w-10 h-10 border-2 border-black/5 flex items-center justify-center font-black text-xs text-black/20 bg-black/5 shrink-0 overflow-hidden">
                                                    {comment.user?.profileImage ? (
                                                        <img src={`${comment.user.profileImage}`} alt="user" className="w-full h-full object-cover" />
                                                    ) : (
                                                        comment.user?.name?.charAt(0).toUpperCase() || "U"
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[9px] font-black text-black uppercase tracking-tight">{comment.user?.name || "LOG_USER"}</p>
                                                            {comment.user?.role === 'admin' && (
                                                                <span className="bg-[#ff5c00] text-black text-[6px] font-black px-1 py-0.5 rounded tracking-widest uppercase">SYS_ADMIN</span>
                                                            )}
                                                        </div>
                                                        {user?.role === 'admin' && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                className="text-black/10 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all p-1"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-black/60 leading-relaxed uppercase bg-black/5 p-3 border-l-2 border-black/10">
                                                        {renderTextWithLinks(comment.text)}
                                                    </p>
                                                    <p className="text-[6px] font-black text-black/20 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()} @ {new Date(comment.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Connection Input Hub */}
                        <div className="absolute bottom-0 inset-x-0 p-8 bg-white border-t-2 border-black z-30">
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-4">
                                <div className="flex-1 relative group">
                                    <input
                                        type="text"
                                        placeholder="INITIATE_DATA_ENCRYPTION..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="w-full bg-black/5 border-2 border-black/5 px-6 py-4 text-[10px] font-black outline-none focus:border-black transition-all uppercase placeholder:text-black/10"
                                    />
                                    <div className="absolute top-0 right-0 w-8 h-[2px] bg-black opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#ff5c00] transition-all disabled:opacity-20 translate-y-[-1px] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[2px]"
                                >
                                    <FaPaperPlane size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default SinglePost;
