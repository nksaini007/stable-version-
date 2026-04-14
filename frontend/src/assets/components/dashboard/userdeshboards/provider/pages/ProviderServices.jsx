import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { FaCheck, FaTools, FaSearch, FaBoxOpen, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ProviderServices = () => {
    const { user } = useContext(AuthContext);
    const [allServices, setAllServices] = useState([]);
    const [offeredServices, setOfferedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, profileRes] = await Promise.all([
                API.get("/services"),
                API.get("/users/me")
            ]);
            setAllServices(servicesRes.data);
            setOfferedServices(profileRes.data.offeredServices || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast.error("Failed to sync marketplace nodes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleOfferedService = (serviceId) => {
        if (offeredServices.includes(serviceId)) {
            setOfferedServices(offeredServices.filter(id => id !== serviceId));
        } else {
            setOfferedServices([...offeredServices, serviceId]);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await API.put("/users/me", { offeredServices });
            toast.success("Manifest_Updated // Deployment_Confirmed");
        } catch (err) {
            toast.error("Manifest Update Failure");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const filteredServices = allServices.filter(svc => 
        svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <FaSearch className="text-4xl text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing_Service_Marketplace...</span>
        </div>
    );

    return (
        <div className="space-y-10 font-mono animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 🚀 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Service_Marketplace</h1>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        Status: Catalog_Active // Import_Ready
                    </p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                         <input 
                            type="text" 
                            placeholder="FILTER_CATALOG..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-black text-white uppercase placeholder:text-white/10 focus:border-orange-500/50 outline-none transition-all"
                         />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 text-black text-[10px] font-black uppercase px-8 py-3 rounded-2xl transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? "SYNCING..." : "Confirm_Manifest"}
                    </button>
                </div>
            </div>

            {/* 🚀 Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.length === 0 ? (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <FaBoxOpen className="text-5xl text-white/10 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">No matching service nodes found in catalog</p>
                    </div>
                ) : (
                    filteredServices.map(svc => {
                        const isSelected = offeredServices.includes(svc._id);
                        return (
                            <motion.div
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={svc._id}
                                onClick={() => toggleOfferedService(svc._id)}
                                className={`bg-[#1e293b] rounded-[2.5rem] overflow-hidden border-2 cursor-pointer transition-all duration-500 group relative
                                    ${isSelected ? 'border-orange-500 shadow-2xl shadow-orange-500/10' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="h-48 bg-slate-800 relative overflow-hidden">
                                    {svc.images?.length > 0 ? (
                                        <img src={`${svc.images[0]}`} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-100" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/10">
                                            <FaTools className="text-4xl" />
                                        </div>
                                    )}
                                    
                                    {/* Selection Indicator Overlay */}
                                    <div className={`absolute inset-0 bg-orange-500/10 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>
                                    
                                    <div className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500
                                        ${isSelected ? 'bg-orange-500 text-black scale-100 rotate-0' : 'bg-[#0f172a]/80 text-white/20 scale-90 -rotate-12'}`}>
                                        <FaCheck className="text-sm" />
                                    </div>
                                    
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[9px] font-black text-orange-500 uppercase border border-white/5">
                                        {svc.category}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="min-h-[60px]">
                                        <h3 className="font-black text-white text-[15px] uppercase tracking-tighter leading-none mb-2 group-hover:text-orange-500 transition-colors uppercase italic">{svc.title}</h3>
                                        <p className="text-white/40 text-[9px] font-bold uppercase leading-relaxed line-clamp-2">{svc.description}</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-end pt-4 border-t border-white/5">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Estimated_Rate</p>
                                            <p className="text-xl font-black text-white tracking-tighter">₹{svc.price.toLocaleString()}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                                            <FaInfoCircle size={12} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProviderServices;
