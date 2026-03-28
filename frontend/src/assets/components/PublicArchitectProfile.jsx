import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import Nev from "./Nev";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaEnvelope, FaChevronLeft, FaShareAlt,
    FaSpinner, FaShieldAlt, FaGlobe, FaTools, FaBuilding
} from "react-icons/fa";

const PublicArchitectProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [architect, setArchitect] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("portfolio");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get(`/users/architect/${id}`);
                setArchitect(data.architect);
                setPortfolio(data.portfolio);
                setFollowersCount(data.architect.followersCount || 0);

                if (user) {
                    try {
                        const statusRes = await API.get(`/follow/${id}/status`);
                        setIsFollowing(statusRes.data.isFollowing);
                    } catch (e) { /* ignore */ }
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load architect profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user) return navigate("/login");
        setFollowLoading(true);
        try {
            if (isFollowing) {
                const res = await API.delete(`/follow/${id}`);
                setIsFollowing(false);
                setFollowersCount(res.data.followersCount);
            } else {
                const res = await API.post(`/follow/${id}`);
                setIsFollowing(true);
                setFollowersCount(res.data.followersCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `${architect?.name} - Architect`, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !architect) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8">
                <FaBuilding className="text-5xl text-white/10 mb-6" />
                <h2 className="text-2xl font-black mb-2">Architect Not Found</h2>
                <p className="text-white/40 text-center max-w-md mb-8">{error || "This profile doesn't exist."}</p>
                <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white text-black rounded-full text-sm font-black">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 md:pb-16">
            <Nev />

            {/* Mobile Back Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10">
                    <FaChevronLeft size={14} />
                </button>
            </div>

            {/* Profile Header */}
            <div className="pt-4 md:pt-24 px-0 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col items-center text-center pt-8 pb-6 px-6">
                        {/* Avatar */}
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#1A1B1E] shadow-2xl mb-5 bg-[#1A1B1E]">
                            {architect.profileImage ? (
                                <img
                                    src={architect.profileImage.startsWith('http') ? architect.profileImage : architect.profileImage}
                                    alt={architect.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10">
                                    {architect.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Verification */}
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{architect.name}</h1>
                            {architect.coaRegistration && (
                                <span title="COA Verified" className="text-blue-400"><FaShieldAlt size={16} /></span>
                            )}
                        </div>
                        <p className="text-white/30 text-xs mb-6">Architect • Stinchar Professional</p>

                        {/* Follow Button */}
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`px-10 py-3 rounded-full text-sm font-black transition-all duration-300 mb-8 ${
                                isFollowing
                                    ? "bg-[#1A1B1E] border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                                    : "bg-white text-black hover:bg-white/90"
                            }`}
                        >
                            {followLoading ? <FaSpinner className="animate-spin" /> : isFollowing ? "Following" : "Follow"}
                        </button>

                        {/* Stats */}
                        <div className="flex items-center gap-10 md:gap-16">
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{architect.projectCount || portfolio.length}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Projects</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{followersCount}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{architect.followingCount || 0}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Following</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/10 px-4 md:px-0 mt-4">
                        {['portfolio', 'about'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                                    activeTab === tab ? "text-white" : "text-white/20"
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="arch-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === "portfolio" && (
                            <motion.div
                                key="portfolio"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {portfolio.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <FaBuilding className="text-4xl text-white/10 mb-4" />
                                        <p className="text-white/30 text-sm font-bold">No public projects yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] md:gap-1 mt-[2px] md:mt-1">
                                        {portfolio.map(work => (
                                            <Link
                                                to={`/project-showcase/${work._id}`}
                                                key={work._id}
                                                className="relative group aspect-square bg-[#1A1B1E] overflow-hidden"
                                            >
                                                {work.images?.[0] ? (
                                                    <img
                                                        src={work.images[0].startsWith('http') ? work.images[0] : work.images[0]}
                                                        alt={work.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FaBuilding className="text-3xl text-white/10" />
                                                    </div>
                                                )}

                                                {/* Overlay on hover / always on mobile */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <p className="text-xs font-bold line-clamp-1">{work.title}</p>
                                                    <p className="text-[10px] text-white/50 font-bold">{work.category}</p>
                                                </div>

                                                {/* Category Badge */}
                                                <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-xl rounded-lg text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {work.category?.split(" ")[0]}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "about" && (
                            <motion.div
                                key="about"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6 md:p-10 space-y-10"
                            >
                                {/* Bio */}
                                {architect.bio && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Biography</h4>
                                        <p className="text-white/70 leading-relaxed">{architect.bio}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {architect.skills?.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Specializations</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {architect.skills.map((skill, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Professional Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {architect.location?.city && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaMapMarkerAlt className="text-blue-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Location</p>
                                                <p className="text-sm font-bold">{architect.location.city}</p>
                                            </div>
                                        </div>
                                    )}
                                    {architect.coaRegistration && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaShieldAlt className="text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">COA Registration</p>
                                                <p className="text-sm font-bold">{architect.coaRegistration}</p>
                                            </div>
                                        </div>
                                    )}
                                    {architect.contactInfo && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaEnvelope className="text-purple-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Contact</p>
                                                <p className="text-sm font-bold">{architect.contactInfo}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Share */}
                                <button onClick={handleShare} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                    <FaShareAlt /> Share Profile
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PublicArchitectProfile;
