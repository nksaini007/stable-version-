import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaChevronLeft, FaRulerCombined, FaTag, FaCheckCircle, 
    FaComments, FaTimes, FaTools, FaBuilding, FaUserTie, 
    FaShoppingBag, FaPlusCircle, FaDraftingCompass, FaGem 
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import Nev from "./Nev";
import Footer from "./Footer";

const ProjectPlanDetails = () => {
    const { id } = useParams();
    const { token, user } = useContext(AuthContext);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Custom Requirement Modal State
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [requirementText, setRequirementText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await API.get(`/construction-plans/${id}`);
                const fetchedPlan = res.data.plan;
                setPlan(fetchedPlan);
                // Set Dynamic Title
                if (fetchedPlan?.title) {
                    document.title = `${fetchedPlan.title} | Stinchar Construction & Infrastructure`;
                }
            } catch (error) {
                console.error("Failed to fetch plan details", error);
                toast.error("Error loading plan details");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();

        // Cleanup: Reset title when leaving page
        return () => {
            document.title = "Stinchar | Building, Construction & Infrastructure Ecosystem";
        };
    }, [id]);

    const handleWhatsAppConnect = () => {
        const message = `Hello Neeraj! I am interested in the Project Plan: ${plan.title}. Please provide more details regarding its customization and cost.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/916377011413?text=${encodedMessage}`, '_blank');
    };

    const handleSubmitRequirement = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please log in to submit requirements.");
            return;
        }

        try {
            setSubmitting(true);
            await API.post(
                "/custom-plans",
                {
                    basePlanId: id,
                    requirements: requirementText,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Requirements submitted! Our team will assign an architect shortly.");
            setShowCustomModal(false);
            setRequirementText("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit requirement");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white pt-32 flex justify-center">
            <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
    );

    if (!plan) return <div className="min-h-screen text-center pt-40">Plan not found</div>;

    return (
        <div className="bg-[#FAF9F6] min-h-screen font-sans selection:bg-[#C5A059]/10 selection:text-[#C5A059] overflow-hidden relative">
            <Nev />

            {/* Subtle Grid Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
                 style={{ backgroundImage: 'radial-gradient(#1A1B1E 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            <main className="relative z-10 pt-24 pb-16 px-4 md:px-10">
                <div className="max-w-[1600px] mx-auto">
                    <button 
                        onClick={() => window.history.back()}
                        className="group flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 hover:text-[#1A1B1E] transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-[#1A1B1E] transition-colors">
                            <FaChevronLeft className="text-[7px]" />
                        </div>
                        return to archive
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Image Slider Area */}
                        <div className="lg:col-span-8 space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-white border border-white shadow-[0_15px_60px_rgba(0,0,0,0.05)] relative p-2"
                            >
                                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-50">
                                    {plan.images && plan.images.length > 0 ? (
                                        <img src={plan.images[activeImage]} alt={plan.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex justify-center items-center text-gray-200">
                                            <FaBuilding className="text-9xl opacity-20" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="absolute top-8 left-8 flex items-center gap-2">
                                    <div className="bg-white/80 backdrop-blur-md border border-white px-4 py-1.5 rounded-full shadow-lg">
                                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#1A1B1E]">
                                            {plan.category} <span className="text-[#C5A059]">/</span> {plan.subCategory || "Master"}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {plan.images?.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 shadow-sm ${activeImage === idx ? "border-[#C5A059] scale-105" : "border-white opacity-40 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-[0_15px_60px_rgba(0,0,0,0.03)] border border-white">
                            <div className="flex items-center gap-3 mb-5">
                                <FaGem className="text-[#C5A059] text-[10px]" />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Premium Blueprint</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-black text-[#1A1B1E] tracking-tighter mb-4 leading-none lowercase">
                                {plan.title}
                            </h1>
                            
                            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-50">
                                <span className="px-3 py-1 bg-[#FAF9F6] text-[#C5A059] text-[8px] font-black uppercase tracking-widest rounded-full border border-gray-50">Active Spec</span>
                                <span className="px-3 py-1 bg-[#FAF9F6] text-gray-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-gray-50">STN-LX-{id.substring(0,4).toUpperCase()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-gray-50">
                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm border border-gray-50">
                                        <FaRulerCombined className="text-[#C5A059] text-[9px]" />
                                    </div>
                                    <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest mb-1">Total Area</p>
                                    <p className="text-lg font-black text-[#1A1B1E]">{plan.area}</p>
                                </div>
                                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-gray-50">
                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm border border-gray-50">
                                        <FaTag className="text-[#C5A059] text-[9px]" />
                                    </div>
                                    <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest mb-1">Estimated Value</p>
                                    <p className="text-lg font-black text-[#1A1B1E]">₹{plan.estimatedCost?.toLocaleString()}</p>
                                </div>
                            </div>

                            <p className="text-gray-500 text-xs leading-relaxed mb-8 font-medium">
                                {plan.description}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowCustomModal(true)}
                                    className="group w-full bg-[#1A1B1E] text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#1A1B1E]/10"
                                >
                                    <FaPlusCircle className="text-[#C5A059] group-hover:text-white transition-colors" /> Request Alterations
                                </button>
                                <button 
                                    onClick={handleWhatsAppConnect}
                                    className="w-full bg-[#25D366] text-white border border-[#128C7E] h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                                >
                                    <FaComments className="text-white" /> Query on WhatsApp
                                </button>
                                <button className="w-full bg-white text-[#1A1B1E] border border-gray-100 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm">
                                    <FaDraftingCompass className="text-gray-300" /> Consult Architects
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* DETAILED MODULAR INFORMATION */}
            <section className="relative z-10 py-16">
                <div className="max-w-[1600px] mx-auto px-4 md:px-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        
                        {/* Main Technical Column */}
                        <div className="lg:col-span-8 relative">
                            {/* Vertical Structural Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#C5A059]/40 via-gray-100 to-transparent hidden md:block"></div>

                            <div className="space-y-16">
                                {/* 01. Technical Specs */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="relative pl-0 md:pl-20"
                                >
                                    <div className="absolute left-0 top-0 hidden md:flex w-12 h-12 rounded-full bg-white border border-[#C5A059]/20 items-center justify-center text-[10px] font-black text-[#C5A059] shadow-sm z-10">01</div>
                                    
                                    <div className="bg-white rounded-[2.5rem] p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)] group hover:shadow-[0_20px_60px_rgba(197,160,89,0.05)] transition-all duration-500">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-10 h-10 rounded-xl bg-[#1A1B1E] flex items-center justify-center shadow-lg">
                                                <FaDraftingCompass className="text-[#C5A059] text-sm" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-[#1A1B1E] tracking-tight lowercase">Technical.<span className="text-[#C5A059]">Specs</span></h2>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">core structural ledger</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {plan.features?.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-transparent hover:border-[#C5A059]/10 rounded-xl transition-all group/item">
                                                    <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 text-[9px]">
                                                        <FaCheckCircle />
                                                    </div>
                                                    <span className="text-[12px] font-bold text-gray-600 group-hover/item:text-[#1A1B1E]">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 02. Signature Amenities */}
                                {plan.facilities?.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="relative pl-0 md:pl-20"
                                    >
                                        <div className="absolute left-0 top-0 hidden md:flex w-12 h-12 rounded-full bg-white border border-[#C5A059]/20 items-center justify-center text-[10px] font-black text-[#C5A059] shadow-sm z-10">02</div>
                                        
                                        <div className="bg-[#FAF9F6] rounded-[2.5rem] p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A059]/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-[#C5A059]/10 transition-all"></div>
                                            
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="w-10 h-10 rounded-xl bg-[#1A1B1E] flex items-center justify-center shadow-lg">
                                                        <FaBuilding className="text-[#C5A059] text-sm" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xl font-black text-[#1A1B1E] tracking-tight lowercase">Signature.<span className="text-[#C5A059]">Amenities</span></h2>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">luxury lifestyle integrations</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {plan.facilities.map((fac, i) => (
                                                        <div key={i} className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl text-center group/card hover:bg-white transition-all shadow-sm">
                                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 group-hover/card:scale-105 transition-transform shadow-sm">
                                                                <FaPlusCircle className="text-gray-300 text-xs group-hover/card:text-[#C5A059]" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover/card:text-[#1A1B1E]">{fac}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 03. Structural Add-ons */}
                                {plan.subConstructions?.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="relative pl-0 md:pl-20"
                                    >
                                        <div className="absolute left-0 top-0 hidden md:flex w-12 h-12 rounded-full bg-white border border-[#C5A059]/20 items-center justify-center text-[10px] font-black text-[#C5A059] shadow-sm z-10">03</div>
                                        
                                        <div className="bg-white rounded-[2.5rem] p-10 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)]">
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="w-10 h-10 rounded-xl bg-[#1A1B1E] flex items-center justify-center shadow-lg">
                                                    <FaTools className="text-[#C5A059] text-sm" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-black text-[#1A1B1E] tracking-tight lowercase">Structural.<span className="text-[#C5A059]">Add-ons</span></h2>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">optional adaptations</p>
                                                </div>
                                            </div>
                                            <div className="grid gap-4">
                                                {plan.subConstructions.map((sc, i) => (
                                                    <div key={i} className="flex items-center justify-between p-6 bg-gray-50 border border-transparent hover:border-[#C5A059]/10 rounded-2xl transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1B1E] group-hover:bg-[#1A1B1E] group-hover:text-[#C5A059] transition-all shadow-sm">
                                                                <FaBuilding className="text-base" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-black text-[#1A1B1E] tracking-tight">{sc.name}</h4>
                                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{sc.description || "Auxiliary Unit"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-lg font-black text-[#1A1B1E]">₹{sc.cost?.toLocaleString()}</span>
                                                            <span className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">Mat + Labor Est.</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Architect & Store Products Sidebar */}
                        <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-32">
                            {/* Architect Section */}
                            {plan.architectId && (
                                <div className="bg-[#1A1B1E] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#C5A059]/30 p-1 bg-white/5 shadow-inner">
                                                <img src={plan.architectId.profileImage || "https://static.vecteezy.com/system/resources/previews/005/544/718/original/yesterday-concept-icon-past-events-recollection-flashback-idea-thin-line-illustration-history-bygone-times-time-passing-isolated-outline-drawing-editable-stroke-vector.jpg"} alt="Architect" className="w-full h-full object-cover rounded-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#C5A059] mb-1">Lead Architect</p>
                                                <h4 className="text-xl font-black text-white tracking-tight lowercase">{plan.architectId.name}</h4>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium mb-6">
                                            {plan.architectId.bio || "Crafting sustainable and modern architectural landmarks."}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.architectId.skills?.slice(0,3).map((s,i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-[#C5A059] border border-white/5">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <FaUserTie className="absolute -bottom-8 -right-8 text-[10rem] text-white opacity-[0.02]" />
                                </div>
                            )}

                            {/* Linked Products Carousel */}
                            {plan.linkedProducts?.length > 0 && (
                                <div className="bg-white rounded-3xl p-8 border border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-[#1A1B1E]">Inventory Reference</h3>
                                        <FaShoppingBag className="text-[#C5A059] text-[10px]" />
                                    </div>
                                    <div className="space-y-6">
                                        {plan.linkedProducts.slice(0,3).map((prod, i) => (
                                            <Link to={`/product/${prod._id}`} key={i} className="flex items-center gap-4 group p-1.5 rounded-xl hover:bg-[#FAF9F6] transition-colors">
                                                <div className="w-14 h-14 bg-[#FAF9F6] rounded-xl overflow-hidden flex-shrink-0 p-1 shadow-sm">
                                                    <img src={prod.images?.[0]?.url} alt={prod.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h5 className="text-[11px] font-black text-[#1A1B1E] line-clamp-1 lowercase">{prod.name}</h5>
                                                    <p className="text-[10px] font-black text-[#C5A059]">₹{prod.price}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <button className="w-full mt-8 py-4 bg-[#FAF9F6] border border-gray-50 rounded-xl text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-[#1A1B1E] hover:bg-gray-100 transition-all">
                                        Exploration Gallery
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CUSTOM REQUIREMENT MODAL */}
            <AnimatePresence>
                {showCustomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCustomModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-[#1A1B1E] tracking-tighter lowercase">record.<span className="text-[#C5A059]">requirements</span></h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Reference: {plan.title}</p>
                                    </div>
                                    <button onClick={() => setShowCustomModal(false)} className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1A1B1E] transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitRequirement} className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#1A1B1E] uppercase tracking-widest mb-4">Specified Modifications</label>
                                        <textarea
                                            required
                                            rows="6"
                                            value={requirementText}
                                            onChange={(e) => setRequirementText(e.target.value)}
                                            className="w-full bg-[#FAF9F6] border border-gray-100 rounded-[2rem] px-8 py-6 outline-none focus:ring-4 focus:ring-[#C5A059]/5 focus:border-[#C5A059]/30 resize-none text-sm text-[#1A1B1E] leading-relaxed font-medium transition-all"
                                            placeholder="Example: Install a high-efficiency HVAC system, integrate smart lighting in the primary living space, and specify Italian travertine for the master bath surfaces."
                                        ></textarea>
                                    </div>

                                    <div className="p-6 bg-[#C5A059]/5 rounded-[2rem] border border-[#C5A059]/10">
                                        <p className="text-[11px] text-[#C5A059] font-bold leading-relaxed lowercase">
                                            <strong>Note:</strong> upon submission, our core architectural team will analyze your requirements and assign a specialized lead to finalize the designated blueprint.
                                        </p>
                                    </div>

                                    <div className="flex gap-6">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCustomModal(false)} 
                                            className="h-16 flex-1 rounded-[1.5rem] bg-white border border-gray-100 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#FAF9F6] transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={submitting} 
                                            className="h-16 flex-1 rounded-[1.5rem] bg-[#1A1B1E] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#1A1B1E]/10 hover:bg-[#C5A059] transition-all flex items-center justify-center gap-3"
                                        >
                                            {submitting ? "Processing..." : "Submit Proposal"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default ProjectPlanDetails;
