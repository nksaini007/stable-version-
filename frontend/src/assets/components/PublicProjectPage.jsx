import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import { motion } from "framer-motion";
import {
    FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaMoneyBillWave,
    FaListUl, FaCubes, FaUser, FaPhone, FaEnvelope, FaArrowLeft,
    FaCheckCircle, FaExclamationTriangle, FaHardHat
} from "react-icons/fa";
import logo from "../logo.png";

const PublicProjectPage = () => {
    const { id } = useParams();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        fetchWork();
    }, [id]);

    const fetchWork = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/architect-works/public/${id}`);
            setWork(res.data.work);
        } catch (err) {
            setError(err.response?.data?.message || "Project not found or not publicly available.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <FaExclamationTriangle className="text-4xl text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Project Not Available</h1>
                <p className="text-gray-400 mb-8">{error}</p>
                <Link to="/" className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-colors">
                    Go to Homepage
                </Link>
            </motion.div>
        </div>
    );


    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white">
            {/* Top Bar */}
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        <FaArrowLeft /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Stinchar Logo" className="h-6 w-auto object-contain" />
                        <span className="text-sm font-bold text-white">Stinchar</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                    {/* Hero Image Gallery */}
                    {work.images && work.images.length > 0 && (
                        <div className="mb-10">
                            <div className="relative rounded-3xl overflow-hidden bg-[#1e293b] border border-white/10 shadow-2xl" style={{ height: "clamp(300px, 50vw, 500px)" }}>
                                <img
                                    src={work.images[activeImage].startsWith('http') ? work.images[activeImage] : `${work.images[activeImage]}`}
                                    alt={work.title}
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c]/80 via-transparent to-transparent"></div>

                                {/* Category badge */}
                                <div className="absolute top-6 left-6">
                                    <span className="px-4 py-2 bg-indigo-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg">
                                        {work.category}
                                    </span>
                                </div>

                                {/* Progress badge */}
                                <div className="absolute top-6 right-6">
                                    <span className="px-4 py-2 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-lg">
                                        {work.progress}% Complete
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnail strip */}
                            {work.images.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {work.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage
                                                ? "border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                                : "border-white/10 opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={img.startsWith('http') ? img : `${img}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column — Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Title + Description */}
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-4 leading-tight">
                                    {work.title}
                                </h1>

                                {work.location && (
                                    <p className="text-gray-400 flex items-center gap-2 mb-6 text-sm">
                                        <FaMapMarkerAlt className="text-indigo-400" /> {work.location}
                                    </p>
                                )}

                                <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                                    {work.description}
                                </p>
                            </div>

                            {/* Project Details Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {work.estimatedCost && (
                                    <div className="bg-[#1e293b]/60 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors">
                                        <FaMoneyBillWave className="text-emerald-400 text-lg mb-3" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Est. Cost</p>
                                        <p className="text-lg font-bold text-white">{work.estimatedCost}</p>
                                    </div>
                                )}
                                {work.area && (
                                    <div className="bg-[#1e293b]/60 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors">
                                        <FaRulerCombined className="text-blue-400 text-lg mb-3" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Area</p>
                                        <p className="text-lg font-bold text-white">{work.area}</p>
                                    </div>
                                )}
                                <div className="bg-[#1e293b]/60 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors">
                                    <FaCheckCircle className="text-indigo-400 text-lg mb-3" />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Progress</p>
                                    <p className="text-lg font-bold text-white">{work.progress}%</p>
                                    <div className="w-full bg-[#0f172a] rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: `${work.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            {work.features && work.features.length > 0 && (
                                <div className="bg-[#1e293b]/40 border border-white/10 rounded-3xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <FaListUl className="text-indigo-400" /> Features
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {work.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-[#0f172a]/50 px-4 py-3 rounded-xl border border-white/5">
                                                <FaCheckCircle className="text-emerald-400 text-sm shrink-0" />
                                                <span className="text-sm text-gray-300">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Materials Used */}
                            {work.materialsUsed && work.materialsUsed.length > 0 && (
                                <div className="bg-[#1e293b]/40 border border-white/10 rounded-3xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <FaCubes className="text-amber-400" /> Materials Used
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {work.materialsUsed.map((m, i) => (
                                            <span key={i} className="px-4 py-2 bg-amber-500/10 text-amber-300 text-sm font-medium rounded-xl border border-amber-500/20">
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column — Architect Info */}
                        <div className="space-y-6">
                            {work.architectInfo && (
                                <div className="bg-gradient-to-br from-[#1e293b] to-[#1e293b]/60 border border-white/10 rounded-3xl p-6 sticky top-24">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Architect</h2>

                                    <div className="flex items-center gap-4 mb-6">
                                        {work.architectInfo.profileImage ? (
                                            <img
                                                src={`${work.architectInfo.profileImage}`}
                                                alt={work.architectInfo.name}
                                                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                                {work.architectInfo.name?.charAt(0) || "A"}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{work.architectInfo.name}</h3>
                                            <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Licensed Architect</p>
                                        </div>
                                    </div>

                                    {work.architectInfo.bio && (
                                        <p className="text-sm text-gray-400 leading-relaxed mb-6 border-t border-white/5 pt-6">
                                            {work.architectInfo.bio}
                                        </p>
                                    )}

                                    <div className="space-y-3">
                                        {work.architectInfo.email && (
                                            <a href={`mailto:${work.architectInfo.email}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-indigo-300 transition-colors bg-[#0f172a]/50 px-4 py-3 rounded-xl border border-white/5 hover:border-indigo-500/30">
                                                <FaEnvelope className="text-indigo-400" /> {work.architectInfo.email}
                                            </a>
                                        )}
                                        {work.architectInfo.phone && (
                                            <a href={`tel:${work.architectInfo.phone}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-indigo-300 transition-colors bg-[#0f172a]/50 px-4 py-3 rounded-xl border border-white/5 hover:border-indigo-500/30">
                                                <FaPhone className="text-indigo-400" /> {work.architectInfo.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Date published */}
                            <div className="bg-[#1e293b]/40 border border-white/10 rounded-2xl p-5 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Published</p>
                                <p className="text-sm text-white font-medium">
                                    {new Date(work.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 py-8 mt-12">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-widest">
                        Powered by <span className="text-indigo-400">Stinchar</span> — Construction Management Platform
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicProjectPage;
