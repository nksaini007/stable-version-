import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../../api/api";
import Nev from "../Nev";
import { AuthContext } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt, FaEnvelope, FaChevronLeft, FaShareAlt,
    FaSpinner, FaTools, FaCheckCircle, FaStar, FaPhone,
    FaRegCalendarAlt, FaShieldAlt
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
    const [activeTab, setActiveTab] = useState("services");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get(`/users/provider/${id}`);
                setProvider(data.provider);
                setServices(data.services);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load provider profile");
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
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center space-y-4">
                <FaSpinner className="text-4xl text-orange-500 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Accessing_Provider_Node...</span>
            </div>
        );
    }

    if (error || !provider) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-8">
                <FaTools className="text-5xl text-white/10 mb-6" />
                <h2 className="text-2xl font-black mb-2 uppercase italic">Offline_Node</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center max-w-md mb-8">{error || "This service node is currently inactive or unreachable."}</p>
                <button onClick={() => navigate("/")} className="px-8 py-3 bg-orange-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">Return_Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-mono pb-32">
            <Nev />

            {/* Header Mobile Control */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                    <FaChevronLeft size={14} />
                </button>
            </div>

            {/* Hero Section */}
            <div className="pt-24 md:pt-32 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-[#1e293b] rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <FaShieldAlt className="text-9xl" />
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            {/* Profile Image */}
                            <div className="relative group">
                                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl bg-[#0f172a]">
                                    {provider.profileImage ? (
                                        <img src={provider.profileImage} alt={provider.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10 italic">
                                            {provider.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-[#1e293b] text-black">
                                    <FaCheckCircle />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">{provider.name}</h1>
                                        <span className="inline-flex px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20 w-max mx-auto md:mx-0">
                                            Verified_Pro
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">
                                        Expert {provider.serviceCategory} • {provider.experience || '3+'} Years Exp.
                                    </p>
                                </div>

                                <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto md:mx-0">
                                    {provider.bio || `Professional ${provider.serviceCategory} expert providing high-quality solutions across the Stinchar ecosystem.`}
                                </p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                                   <div className="flex items-center gap-2">
                                       <FaStar className="text-orange-500 text-sm" />
                                       <span className="text-sm font-black text-white">4.9 <span className="text-white/20 text-[10px] ml-1">(120+ Reviews)</span></span>
                                   </div>
                                   <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
                                   <div className="flex items-center gap-2">
                                       <FaCheckCircle className="text-emerald-500 text-sm" />
                                       <span className="text-sm font-black text-white">500+ <span className="text-white/20 text-[10px] ml-1">Jobs Done</span></span>
                                   </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <button onClick={() => window.open(`tel:${provider.phone}`)} className="flex-1 md:flex-none px-10 py-4 bg-white text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-colors flex items-center justify-center gap-3">
                                        <FaPhone /> Contact_Direct
                                    </button>
                                    <button onClick={handleShare} className="flex-1 md:flex-none px-10 py-4 bg-white/5 border border-white/10 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                                        <FaShareAlt /> Share_Node
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-12 flex border-b border-white/5">
                        {['services', 'biography'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                                    activeTab === tab ? "text-orange-500" : "text-white/20"
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="py-12">
                        <AnimatePresence mode="wait">
                            {activeTab === 'services' && (
                                <motion.div 
                                    key="services"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {services.map(svc => (
                                        <Link to={`/service/${svc._id}`} key={svc._id} className="bg-[#1e293b] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/50 transition-all duration-500 shadow-2xl">
                                            <div className="h-44 bg-slate-800 relative overflow-hidden">
                                                {svc.images?.[0] ? (
                                                    <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition duration-700" />
                                                ) : (
                                                   <div className="w-full h-full flex items-center justify-center text-white/5"><FaTools size={40} /></div>
                                                )}
                                                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full text-[8px] font-black text-orange-500 uppercase border border-white/5">
                                                    {svc.category}
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <h3 className="text-sm font-black text-white group-hover:text-orange-500 transition-colors uppercase italic leading-tight">{svc.title}</h3>
                                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                    <span className="text-xs font-black text-white">₹{svc.price.toLocaleString()}</span>
                                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 group-hover:gap-3 transition-all">
                                                        Hire_Now <FaRegCalendarAlt />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'biography' && (
                                <motion.div 
                                    key="bio"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-[#1e293b] border border-white/5 rounded-[3rem] p-10 space-y-12"
                                >
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Introduction_Stream</h4>
                                        <p className="text-white/60 leading-[1.8] text-sm md:text-base font-mono">
                                            {provider.bio || `${provider.name} is a certified Stinchar professional with extensive experience in the ${provider.serviceCategory} sector. Known for precision, reliability, and technical excellence.`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Node_Logistics</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 bg-[#0f172a] p-5 rounded-2xl border border-white/5">
                                                    <FaMapMarkerAlt className="text-orange-500" />
                                                    <div>
                                                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Base_Loc</p>
                                                        <p className="text-xs font-black text-white">{provider.location?.city || "Available Pan India"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-[#0f172a] p-5 rounded-2xl border border-white/5">
                                                    <FaEnvelope className="text-orange-500" />
                                                    <div>
                                                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">Network_Access</p>
                                                        <p className="text-xs font-black text-white truncate max-w-[150px]">{provider.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Skills_Manifest</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {provider.skills?.length > 0 ? provider.skills.map(skill => (
                                                    <span key={skill} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white/40">
                                                        {skill}
                                                    </span>
                                                )) : (
                                                    ['Precision', 'Industrial Scale', 'Expert Solutions'].map(s => (
                                                        <span key={s} className="px-5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-white/40">
                                                            {s}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicServiceProfile;
