import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaChevronLeft, FaShareAlt, FaSpinner, FaTools, 
    FaCheckCircle, FaStar, FaPhone, FaHome, FaSearch, 
    FaCalendarCheck, FaUser, FaRegBookmark
} from "react-icons/fa";
import { toast } from "react-toastify";

const PublicServiceProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [provider, setProvider] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get(`/users/provider/${id}`);
                setProvider(data.provider);
                setServices(data.services);
            } catch (err) {
                console.error("Profile_Fetch_Error:", err);
                const msg = err.response?.data?.message || err.response?.data?.error || "Failed to load provider profile manifest.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `${provider?.name} - Service Provider`, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Profile link copied!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
                <FaSpinner className="text-4xl text-white/20 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Initialising_Elite_Node...</span>
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white font-mono relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                    <div className="w-20 h-20 border-2 border-red-500/20 flex items-center justify-center rounded-full mb-8 relative group">
                        <div className="absolute inset-0 bg-red-500/5 rounded-full animate-pulse group-hover:bg-red-500/10 transition-colors"></div>
                        <FaTools className="text-3xl text-red-500/40 group-hover:text-red-500/60 transition-all" />
                    </div>
                    
                    <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter text-red-500/80">Offline_Link_Error</h2>
                    
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-10 w-full">
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 leading-none">Diagnostic_Output:</p>
                        <p className="text-sm font-bold text-white/70 leading-relaxed uppercase">
                            {error || "Unknown system failure: Specified service node is unreachable."}
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/')} 
                        className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-500 transition-all shadow-[8px_8px_0px_rgba(255,255,255,0.1)]"
                    >
                        Return_to_Central_Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-slate-100 font-sans pb-32 overflow-x-hidden selection:bg-white selection:text-black">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
                >
                    <FaChevronLeft size={20} />
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={handleShare}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
                    >
                        <FaShareAlt size={18} />
                    </button>
                </div>
            </nav>

            {/* Profile Content */}
            <div className="pt-24 px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center">
                {/* Profile Image Centered */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-8"
                >
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-[6px] border-[#1a1a1a] shadow-2xl bg-slate-900">
                        {provider.profileImage ? (
                            <img src={provider.profileImage} alt={provider.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10 uppercase">
                                {provider.name?.charAt(0)}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Identity Block */}
                <div className="text-center space-y-2 mb-10">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">{provider.name}</h1>
                        <FaCheckCircle className="text-blue-500 text-xl md:text-2xl mt-1" />
                    </div>
                    <p className="text-white/40 text-[13px] font-medium tracking-wide lowercase">
                        @{provider.name?.replace(/\s+/g, '').toLowerCase()} • <span className="opacity-60">{provider.serviceCategory || "Verified Provider"}</span>
                    </p>
                </div>

                {/* Action Button */}
                <div className="w-full max-w-[200px] mb-12">
                     <button 
                        onClick={() => window.open(`tel:${provider.phone}`)}
                        className="w-full py-3.5 bg-[#1a1a1a] text-white rounded-full text-[13px] font-bold hover:bg-[#2a2a2a] transition-all"
                    >
                        Connect Now
                    </button>
                </div>

                {/* Stats Row */}
                <div className="w-full grid grid-cols-4 gap-2 border-y border-white/5 py-8 mb-12">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{provider.jobsDone || 0}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mt-1">Jobs Done</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{services.length}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mt-1">Services</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{provider.followingCount || 0}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mt-1">Following</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{provider.followersCount || 0}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold mt-1">Followers</p>
                    </div>
                </div>

                {/* Services Masonry Grid */}
                <div className="w-full">
                    <div className="grid grid-cols-2 gap-3 pb-20">
                        {services.map((svc, idx) => (
                            <motion.div 
                                key={svc._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative rounded-3xl overflow-hidden group ${idx % 3 === 0 ? 'row-span-2' : ''}`}
                            >
                                <Link to={`/service/${svc._id}`} className="block h-full w-full">
                                    <div className={`w-full ${idx % 3 === 0 ? 'h-[400px]' : 'h-[200px]'} bg-neutral-900`}>
                                        {svc.images?.[0] ? (
                                            <img 
                                                src={svc.images[0]} 
                                                alt={svc.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/5 uppercase font-black text-2xl">
                                                {svc.title?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                        <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">{svc.title}</h3>
                                        <p className="text-[10px] text-white/40 font-bold mt-1">₹{svc.price.toLocaleString()}</p>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FaChevronLeft className="text-white text-[10px] rotate-180" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Navigation Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-xs">
                <div className="bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 py-3 px-6 rounded-full flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <Link to="/" className="text-white/40 hover:text-white transition-colors">
                        <FaHome size={18} />
                    </Link>
                    <Link to="/services" className="text-white/40 hover:text-white transition-colors">
                        <FaSearch size={18} />
                    </Link>
                    <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5">
                        <span className="text-xl">+</span>
                    </button>
                    <Link to="/dashboard" className="text-white/40 hover:text-white transition-colors relative">
                        <FaCalendarCheck size={16} />
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    </Link>
                    <Link to="/profile" className="text-white/40 hover:text-white transition-colors">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
                            {user?.profileImage ? (
                                <img src={user.profileImage} className="w-full h-full object-cover" />
                            ) : (
                                <FaUser size={10} className="m-auto mt-1" />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicServiceProfile;
