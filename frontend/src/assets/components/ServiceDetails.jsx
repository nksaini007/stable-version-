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
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="mt-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Processing...</span>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-8">
                <div className="max-w-md bg-white border border-slate-100 p-12 text-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Data Error</h2>
                    <p className="mt-2 text-slate-400 font-medium text-xs mb-8 uppercase tracking-widest">{error || "Retrieval failed"}</p>
                    <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
                        Return
                    </button>
                </div>
            </div>
        );
    }

    const mainImage = service.images?.[0] || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800";

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 flex flex-col pt-24 pb-20">
            <Nev />
            <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-start">
                
                {/* Visual Data Module */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full lg:w-3/5 flex flex-col gap-6"
                >
                    <button onClick={() => navigate(-1)} className="self-start flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-colors">
                        <FaArrowLeft size={8} /> Service Directory
                    </button>

                    <div className="bg-white border border-slate-100 p-2 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur px-4 py-1.5 text-[9px] font-bold text-white uppercase tracking-widest z-10">
                            REF: {service._id.slice(-6).toUpperCase()}
                        </div>
                        <img 
                            src={mainImage} 
                            alt={service.title} 
                            className="w-full h-[450px] md:h-[550px] object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                    </div>

                    {service.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {service.images.slice(1, 5).map((img, idx) => (
                                <div key={idx} className="border border-slate-100 overflow-hidden group cursor-pointer aspect-square">
                                    <img src={img} alt={`service-${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Operations Module */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-2/5 flex flex-col"
                >
                    <div className="bg-white border border-slate-100 p-8 md:p-10 h-full flex flex-col">
                        <div className="inline-flex items-center gap-2 mb-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <FaShieldAlt size={10} /> {service.category}
                        </div>
                        
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 mb-6 uppercase">
                            {service.title}
                        </h1>

                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 border-l-2 border-slate-100 pl-6 italic">
                            {service.description}
                        </p>

                        <div className="mb-10">
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Fee parameters</div>
                            <div className="text-4xl font-bold text-slate-900">
                                ₹{service.price.toLocaleString()}
                            </div>
                        </div>

                        {/* Booking Form Interface */}
                        <form onSubmit={handleBooking} className="flex flex-col gap-8 mt-auto pt-8 border-t border-slate-50">
                            <div className="space-y-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Appointment Request</h3>
                                <p className="text-slate-400 text-[11px] font-medium">Select target window for personnel deployment.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pl-1">Target Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={new Date().toISOString().split('T')[0]} 
                                        value={bookingDate} 
                                        onChange={e => setBookingDate(e.target.value)}
                                        className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 pl-1">Commencement</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={bookingTime} 
                                        onChange={e => setBookingTime(e.target.value)}
                                        className="w-full bg-white border border-slate-200 px-4 py-3 outline-none transition-all font-bold text-xs text-slate-700 focus:border-slate-900"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white font-bold uppercase tracking-widest py-5 text-[10px] hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {submitting ? "Processing..." : "Secure Appointment"}
                            </button>
                        </form>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ServiceDetails;
