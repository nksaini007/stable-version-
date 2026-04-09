import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import Nev from "./Nev";

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/services/${id}`);
                setService(res.data);
            } catch (err) {
                console.error(err);
                setError("Unable to load service parameters.");
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setSubmitting(true);
            await API.post("/bookings", {
                serviceId: service._id,
                date: bookingDate,
                time: bookingTime
            });
            alert("Booking Confirmed Successfully. Navigate to dashboard to view.");
            navigate("/services");
        } catch (err) {
            console.error(err);
            alert("System Error: Failed to secure booking.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#e5e5e5] font-mono flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-black border-t-[#3b82f6] animate-spin mb-4"></div>
                    <span className="text-xs font-black tracking-widest uppercase">FETCHING_SERVICE_DATA...</span>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[#e5e5e5] font-mono flex items-center justify-center p-8">
                <div className="max-w-2xl bg-[#ff5c00] border-4 border-black text-black px-10 py-12 shadow-[15px_15px_0px_#000] text-center font-black uppercase tracking-widest">
                    <span className="text-5xl block mb-6">⚠️</span>
                    <span className="text-3xl">SERVICE_FAULT</span> <br/>
                    <span className="text-sm mt-4 block opacity-80">{error || "DATA_NOT_FOUND"}</span>
                    <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-black text-white hover:bg-white hover:text-black transition-all">
                        RETURN_TO_PREVIOUS
                    </button>
                </div>
            </div>
        );
    }

    const mainImage = service.images?.[0] || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800";

    return (
        <div className="min-h-screen bg-[#e5e5e5] font-mono text-black relative flex flex-col">
            <Nev />
            <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-24 md:py-32 flex flex-col items-center lg:items-start lg:flex-row gap-12">
                
                {/* Visual Data Module */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/2 flex flex-col gap-6"
                >
                    <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-xs font-black tracking-widest uppercase hover:text-[#3b82f6] transition-colors mb-4">
                        <FaArrowLeft /> [ RETURN_TO_SEARCH ]
                    </button>

                    <div className="bg-white border-4 border-black shadow-[15px_15px_0px_#000] p-4 relative">
                        <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest z-10 border-b-4 border-l-4 border-black">
                            REF: {service._id.slice(-6).toUpperCase()}
                        </div>
                        <img src={mainImage} alt={service.title} className="w-full h-[400px] md:h-[600px] object-cover border-4 border-black border-dashed opacity-90 grayscale-[0.2]" />
                    </div>

                    {service.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {service.images.slice(1, 5).map((img, idx) => (
                                <img key={idx} src={img} alt={`service-${idx}`} className="w-full aspect-square object-cover border-2 border-black hover:border-[#3b82f6] transition-colors cursor-pointer" />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Operations Module */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/2 flex flex-col"
                >
                    <div className="bg-white border-4 border-black shadow-[15px_15px_0px_#000] p-8 md:p-12 h-full flex flex-col">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#3b82f6] mb-6">
                            <FaShieldAlt /> SERVICE_CATEGORY: {service.category}
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-heading leading-none uppercase tracking-tighter mb-6">
                            {service.title}
                        </h1>

                        <div className="bg-black/5 p-6 border-l-4 border-black mb-8 text-black/70 text-sm leading-relaxed uppercase tracking-widest">
                            // {service.description}
                        </div>

                        <div className="text-4xl md:text-5xl font-heading text-black mb-10 pb-10 border-b-4 border-black border-dashed">
                            ₹{service.price.toLocaleString()} <span className="text-sm font-mono opacity-50 uppercase tracking-widest">// ESTIMATED_FEE</span>
                        </div>

                        {/* Booking Form Interface */}
                        <form onSubmit={handleBooking} className="flex flex-col gap-6 mt-auto">
                            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                <FaCalendarAlt className="text-[#3b82f6]" /> BOOKING_MODULE
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">SELECT_DATE</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={new Date().toISOString().split('T')[0]} 
                                        value={bookingDate} 
                                        onChange={e => setBookingDate(e.target.value)}
                                        className="border-2 border-black px-4 py-3 bg-white focus:outline-none focus:border-[#3b82f6] font-black"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">SELECT_TIME</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={bookingTime} 
                                        onChange={e => setBookingTime(e.target.value)}
                                        className="border-2 border-black px-4 py-3 bg-white focus:outline-none focus:border-[#3b82f6] font-black"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full mt-4 bg-black text-white font-black uppercase tracking-widest py-5 border-2 border-black hover:bg-[#3b82f6] hover:text-black transition-all disabled:opacity-50"
                            >
                                {submitting ? "PROCESSING_TRANSACTION..." : "INITIATE_BOOKING_SEQUENCE"}
                            </button>
                        </form>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ServiceDetails;
