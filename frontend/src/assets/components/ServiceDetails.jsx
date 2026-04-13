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
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="mt-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Synchronizing Data...</span>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
                <div className="max-w-xl bg-white rounded-[3rem] p-16 shadow-[0_30px_60px_rgba(0,0,0,0.04)] text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <span className="text-4xl">!</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">SERVICE UNAVAILABLE</h2>
                    <p className="mt-4 text-slate-400 font-light text-lg mb-10">{error || "The requested service parameters could not be retrieved."}</p>
                    <button onClick={() => navigate(-1)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
                        Return to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const mainImage = service.images?.[0] || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800";

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative flex flex-col pt-24 pb-20">
            <Nev />
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16 items-start">
                
                {/* Visual Data Module */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full lg:w-1/2 flex flex-col gap-8 sticky top-32"
                >
                    <button onClick={() => navigate(-1)} className="self-start group flex items-center gap-3 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 hover:text-orange-600 transition-colors">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Search results
                    </button>

                    <div className="bg-white rounded-[3.5rem] p-4 shadow-[0_40px_100px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                        <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] z-10 rounded-2xl shadow-xl">
                            ID: {service._id.slice(-6).toUpperCase()}
                        </div>
                        <img 
                            src={mainImage} 
                            alt={service.title} 
                            className="w-full h-[500px] md:h-[650px] object-cover rounded-[2.8rem] transition-transform duration-1000 group-hover:scale-105" 
                        />
                    </div>

                    {service.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-4 px-2">
                            {service.images.slice(1, 5).map((img, idx) => (
                                <div key={idx} className="rounded-2xl overflow-hidden shadow-sm group cursor-pointer aspect-square">
                                    <img src={img} alt={`service-${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Operations Module */}
                <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-1/2 flex flex-col"
                >
                    <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.04)] p-10 md:p-16 h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full blur-[80px]"></div>
                        
                        <div className="inline-flex items-center gap-2 mb-8 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                            <FaShieldAlt /> {service.category}
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-[900] leading-[1.1] tracking-tight text-slate-900 mb-8 uppercase">
                            {service.title}
                        </h1>

                        <div className="text-slate-500 text-lg font-light leading-relaxed mb-10 italic border-l-2 border-orange-200 pl-8">
                            "{service.description}"
                        </div>

                        <div className="mb-12">
                            <div className="text-sm font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Estimated Investment</div>
                            <div className="text-5xl md:text-6xl font-[900] text-slate-900">
                                ₹{service.price.toLocaleString()}
                            </div>
                        </div>

                        {/* Booking Form Interface */}
                        <form onSubmit={handleBooking} className="flex flex-col gap-10 mt-auto pt-10 border-t border-slate-50">
                            <div className="space-y-2">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Configure Appointment</h3>
                                <p className="text-slate-400 text-sm font-light">Select your preferred window for service execution.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Execution Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={new Date().toISOString().split('T')[0]} 
                                        value={bookingDate} 
                                        onChange={e => setBookingDate(e.target.value)}
                                        className="w-full bg-slate-50 px-6 py-5 rounded-[1.8rem] focus:ring-8 focus:ring-orange-50 outline-none transition-all font-bold text-slate-700 border-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Commencement Time</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={bookingTime} 
                                        onChange={e => setBookingTime(e.target.value)}
                                        className="w-full bg-slate-50 px-6 py-5 rounded-[1.8rem] focus:ring-8 focus:ring-orange-50 outline-none transition-all font-bold text-slate-700 border-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="group w-full bg-slate-900 text-white font-[900] uppercase tracking-[0.3em] py-6 rounded-[2rem] shadow-2xl hover:bg-orange-600 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4 text-xs"
                            >
                                {submitting ? "SECURING_SLOT..." : (
                                    <>
                                        Authorize Booking <FaCalendarAlt className="group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ServiceDetails;
