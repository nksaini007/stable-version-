import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { FaCopy, FaShareAlt, FaCheck, FaBuilding, FaQrcode } from "react-icons/fa";
import { motion } from "framer-motion";

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
            // Fallback to copy if Web Share API is not supported (e.g. desktop browsers)
            handleCopy();
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto min-h-screen bg-transparent">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] flex items-center gap-3">
                    <FaBuilding className="text-indigo-600" /> My Digital Office
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Share your professional profile, skills, and portfolio blueprints with clients.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Left Column: Link & Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center"
                >
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                        <FaShareAlt className="text-indigo-600 text-2xl" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Profile Link</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Clients can use this link to view your public profile, portfolio, and easily get in touch with you for new projects.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-8 group">
                        <span className="text-gray-600 font-mono text-sm sm:text-base truncate mr-4 select-all">
                            {publicProfileUrl}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex-shrink-0 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                            title="Copy Link"
                        >
                            {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <FaShareAlt /> Share Profile
                        </button>
                        <a
                            href={publicProfileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-6 py-4 rounded-xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            Preview Profile
                        </a>
                    </div>
                </motion.div>

                {/* Right Column: QR Code */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-xl text-white flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

                    <FaQrcode className="text-white/20 text-6xl absolute top-6 right-6" />

                    <h3 className="text-xl font-bold mb-2 relative z-10">Scan to View</h3>
                    <p className="text-indigo-100 text-sm mb-8 relative z-10">
                        Let clients scan this code instantly from your device.
                    </p>

                    <div className="bg-white p-4 rounded-2xl shadow-inner relative z-10">
                        <QRCodeSVG
                            value={publicProfileUrl}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={false}
                        />
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ArchitectOffice;
