import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaBuilding, FaCheckCircle, FaTools } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "";

const PublicArchitectProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [architect, setArchitect] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`${API}/api/users/architect/${id}`);
                setArchitect(data.architect);
                setPortfolio(data.portfolio);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load architect profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !architect) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">{error || "Profile not found"}</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* 1. Header Banner */}
            <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-700 relative">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* 2. Main Profile Card */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">

                    {/* Avatar */}
                    <div className="flex-shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-20">
                        <img
                            src={architect.profileImage ? `${API}${architect.profileImage}` : "https://via.placeholder.com/200?text=Architect"}
                            alt={architect.name}
                            className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                    {architect.name}
                                    {architect.coaRegistration && (
                                        <span title="COA Registered" className="text-blue-500 text-xl"><FaCheckCircle /></span>
                                    )}
                                </h1>
                                <p className="text-orange-600 font-medium text-lg mt-1">Professional Architect</p>
                            </div>

                            <button
                                onClick={() => window.location.href = `mailto:${architect.contactInfo || ""}`}
                                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition shadow-md"
                            >
                                Hire this Architect
                            </button>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-y-3 gap-x-6 text-gray-600 justify-center md:justify-start">
                            {architect.location?.city && (
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    <span>{architect.location.city}</span>
                                </div>
                            )}
                            {architect.contactInfo && ( // Basic fallback if email/phone combo is requested
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-gray-400" />
                                    <span>{architect.contactInfo}</span>
                                </div>
                            )}
                            {architect.coaRegistration && (
                                <div className="flex items-center gap-2">
                                    <FaBuilding className="text-gray-400" />
                                    <span>COA: {architect.coaRegistration}</span>
                                </div>
                            )}
                        </div>

                        <p className="mt-6 text-gray-700 leading-relaxed max-w-3xl">
                            {architect.bio || "No biography provided by this architect."}
                        </p>

                        {/* Skills */}
                        {architect.skills && architect.skills.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                                <FaTools className="text-gray-400 mt-1 mr-1" />
                                {architect.skills.map((skill, idx) => (
                                    <span key={idx} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium border border-orange-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Portfolio Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Featured Portfolio</h2>

                {portfolio.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="text-gray-400 mb-4 text-5xl flex justify-center"><FaBuilding /></div>
                        <h3 className="text-lg font-medium text-gray-900">No public projects yet</h3>
                        <p className="text-gray-500 mt-1">This architect hasn't published any portfolio items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolio.map((work) => (
                            <div
                                key={work._id}
                                onClick={() => navigate(`/project-showcase/${work._id}`)}
                                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            >
                                <div className="h-56 overflow-hidden relative">
                                    <img
                                        src={work.images?.[0] ? (work.images[0].startsWith('http') ? work.images[0] : `${API}${work.images[0]}`) : "https://via.placeholder.com/600x400?text=Project"}
                                        alt={work.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow border border-white/20">
                                        {work.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">{work.title}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <FaMapMarkerAlt className="mr-1" /> {work.location || "Location not specified"}
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                                        {work.description}
                                    </p>

                                    {work.area && work.estimatedCost && (
                                        <div className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div><span className="font-semibold text-gray-900">Area:</span> {work.area}</div>
                                            <div><span className="font-semibold text-gray-900">Budget:</span> {work.estimatedCost}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicArchitectProfile;
