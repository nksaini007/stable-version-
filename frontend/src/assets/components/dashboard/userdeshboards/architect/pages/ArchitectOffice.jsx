import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { FaCopy, FaShareAlt, FaCheck, FaBuilding, FaQrcode, FaExternalLinkAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ArchitectOffice = () => {
    const { user } = useContext(AuthContext);
    const [copied, setCopied] = useState(false);

    // Fallback if user data is missing
    const architectId = user?._id || "unknown";

    // Construct the absolute URL to their public profile
    const publicProfileUrl = `${window.location.origin}/architect/${architectId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(publicProfileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${user?.name || "Architect"}'s Professional Profile`,
                    text: 'Check out my architecture portfolio and services on Stinchar!',
                    url: publicProfileUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="p-6 md:p-12 text-white min-h-screen bg-[#080808] font-sans selection:bg-white/10">
            {/* Header Area */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-white opacity-20"></span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Communication Portal</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">Digital Office</h1>
                <p className="text-gray-500 mt-4 text-sm tracking-widest uppercase max-w-2xl leading-relaxed">
                    Deploy your professional identity across the network. Unified portfolio access for prospective clients.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left: Share Card */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="xl:col-span-7 bg-[#121214] rounded-[2.5rem] border border-white/[0.03] p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/[0.02] transition-all duration-1000"></div>
                    
                    <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-xl">
                        <FaShareAlt className="text-gray-500 group-hover:text-white transition-colors" size={24} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Profile Credentials</h2>
                    <p className="text-[11px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed mb-12 max-w-lg">
                        Your public interface allows clients to synchronize with your portfolio, verified credentials, and active project history.
                    </p>

                    <div className="bg-[#0C0C0C] border border-white/[0.03] rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center justify-between mb-12 group/link hover:border-white/10 transition-all duration-500">
                        <span className="text-gray-400 font-mono text-sm truncate mr-4 select-all mb-4 sm:mb-0 w-full sm:w-auto">
                            {publicProfileUrl}
                        </span>
                        <button onClick={handleCopy}
                            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                                copied ? "bg-white text-black border-white" : "bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.05]"
                            }`}>
                            {copied ? <FaCheck size={14} /> : <FaCopy size={16} />}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleShare}
                            className="flex-1 px-8 py-5 bg-white text-black rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                            <FaShareAlt size={12} /> Broadcast Link
                        </button>
                        <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 px-8 py-5 bg-[#121214] border border-white/[0.05] text-white rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.03] transition-all duration-500 flex items-center justify-center gap-3">
                            <FaExternalLinkAlt size={10} className="opacity-40" /> Preview Node
                        </a>
                    </div>
                </motion.div>

                {/* Right: QR Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                    className="xl:col-span-5 bg-[#121214] border border-white/[0.03] rounded-[2.5rem] p-12 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
                    
                    <FaQrcode className="text-white/[0.03] text-9xl absolute -top-10 -right-10 group-hover:rotate-12 transition-all duration-1000" />

                    <div className="text-center mb-10">
                        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Direct Scan Access</h3>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">Instant terminal sync</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_0_100px_rgba(255,255,255,0.05)] relative group-hover:scale-105 transition-all duration-700">
                        <QRCodeSVG
                            value={publicProfileUrl}
                            size={240}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={false}
                        />
                        <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                            <span className="bg-[#0C0C0C] border border-white/[0.05] text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full text-gray-500">Stinchar Verified</span>
                        </div>
                    </div>

                    <p className="mt-12 text-[9px] text-gray-800 font-bold uppercase tracking-[0.2em] max-w-[200px] text-center leading-relaxed">
                        Physical meeting protocol: Present QR for immediate portfolio transmission
                    </p>
                </motion.div>
            </div>
            
            {/* Legend / Status */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-20 pt-10 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex gap-10">
                    <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></span>
                        <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest text-[9px] text-gray-700 font-bold uppercase tracking-widest">Profile Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[9px] text-gray-700 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-20"></span>
                            SSL Encryption: Secure
                        </div>
                    </div>
                </div>
                <p className="text-[9px] text-gray-800 font-bold uppercase tracking-[0.2em]">Office Terminal v2.0.4 - Premium Redesign</p>
            </motion.div>
        </div>
    );
};

export default ArchitectOffice;
