import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaChevronLeft, FaRulerCombined, FaTag, FaCheckCircle, 
    FaComments, FaTimes, FaTools, FaBuilding, FaUserTie, 
    FaShoppingBag, FaPlusCircle, FaDraftingCompass 
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
                setPlan(res.data.plan);
            } catch (error) {
                console.error("Failed to fetch plan details", error);
                toast.error("Error loading plan details");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [id]);

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
        <div className="bg-[#FAF9F6] min-h-screen font-sans selection:bg-slate-200">
            <Nev />

            {/* TOP IMAGE GALLERY HERO */}
            <section className="pt-24 lg:pt-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/project-plans" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-8 transition-colors">
                        <FaChevronLeft className="text-[8px]" /> Return to Archive
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Image Slider Area */}
                        <div className="lg:col-span-8 space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl relative"
                            >
                                {plan.images && plan.images.length > 0 ? (
                                    <img src={plan.images[activeImage]} alt={plan.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center text-slate-300">
                                        <FaBuilding className="text-9xl opacity-20" />
                                    </div>
                                )}
                                
                                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">
                                        {plan.category} / {plan.subCategory || "Modern"}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {plan.images?.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 shadow-md ${activeImage === idx ? "border-slate-800 scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    >
                                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats Sidebar */}
                        <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
                                {plan.title}
                            </h1>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full">Available</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full">Ref: STIN-{id.substring(0,4).toUpperCase()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <FaRulerCombined className="text-slate-400 mb-2" />
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Area</p>
                                    <p className="text-lg font-bold text-slate-900">{plan.area}</p>
                                </div>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <FaTag className="text-slate-400 mb-2" />
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Cost</p>
                                    <p className="text-lg font-bold text-slate-900">₹{plan.estimatedCost?.toLocaleString()}</p>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                {plan.description}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowCustomModal(true)}
                                    className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                                >
                                    <FaPlusCircle /> Request Changes
                                </button>
                                <button className="w-full bg-white text-slate-700 border border-slate-200 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                    <FaComments /> Talk to Team
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DETAILED INFORMATION */}
            <section className="py-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Features & Add-ons */}
                        <div className="lg:col-span-8 space-y-16">
                            {/* Features Grid */}
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <FaDraftingCompass className="text-slate-900" />
                                    <h2 className="text-xl font-bold tracking-tight">Technical Specifications</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {plan.features?.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl">
                                            <FaCheckCircle className="text-emerald-500 text-xs" />
                                            <span className="text-sm font-medium text-slate-700">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Facilities (Amenities) */}
                            {plan.facilities?.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight mb-8">World-Class Facilities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {plan.facilities.map((fac, i) => (
                                            <div key={i} className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-[2rem] text-center group hover:border-slate-300 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-100">
                                                    <FaPlusCircle className="text-slate-400 text-xs" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{fac}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-Constructions (Add-ons) */}
                            {plan.subConstructions?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-8">
                                        <FaTools className="text-slate-900" />
                                        <h2 className="text-xl font-bold tracking-tight">Strategic Add-ons</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {plan.subConstructions.map((sc, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                                        <FaBuilding />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">{sc.name}</h4>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{sc.description || "Sub-construction"}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-sm font-bold text-slate-900">₹{sc.cost?.toLocaleString()}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Est. Material + Labor</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Architect & Store Products Sidebar */}
                        <div className="lg:col-span-4 space-y-12">
                            {/* Architect Section */}
                            {plan.architectId && (
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
                                                <img src={plan.architectId.profileImage || "https://static.vecteezy.com/system/resources/previews/005/544/718/original/yesterday-concept-icon-past-events-recollection-flashback-idea-thin-line-illustration-history-bygone-times-time-passing-isolated-outline-drawing-editable-stroke-vector.jpg"} alt="Architect" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Lead Architect</p>
                                                <h4 className="text-lg font-bold">{plan.architectId.name}</h4>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                                            {plan.architectId.bio || "Crafting sustainable and modern architectural landmarks."}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.architectId.skills?.slice(0,3).map((s,i) => (
                                                <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-[8px] font-bold uppercase tracking-widest text-slate-200">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <FaUserTie className="absolute -bottom-6 -right-6 text-9xl text-white opacity-[0.03]" />
                                </div>
                            )}

                            {/* Linked Products Carousel */}
                            {plan.linkedProducts?.length > 0 && (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-bold uppercase tracking-widest">Store Inventory</h3>
                                        <FaShoppingBag className="text-slate-400 text-xs" />
                                    </div>
                                    <div className="space-y-6">
                                        {plan.linkedProducts.slice(0,3).map((prod, i) => (
                                            <Link to={`/product/${prod._id}`} key={i} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                                                <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img src={prod.images?.[0]?.url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{prod.name}</h5>
                                                    <p className="text-[10px] font-bold text-emerald-600">₹{prod.price}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <button className="w-full mt-8 py-3 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50">
                                        View Full Catalog
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
                                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Record Requirements</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {plan.title}</p>
                                    </div>
                                    <button onClick={() => setShowCustomModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                        <FaTimes />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitRequirement} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Your Specific Changes</label>
                                        <textarea
                                            required
                                            rows="6"
                                            value={requirementText}
                                            onChange={(e) => setRequirementText(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 resize-none text-sm text-slate-600 leading-relaxed font-normal"
                                            placeholder="Example: Need to install a 5KW solar panel system, add a custom glass roof for the parking area, and change the marble flooring to Italian granite."
                                        ></textarea>
                                    </div>

                                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                        <p className="text-[10px] text-amber-900/70 font-medium leading-relaxed">
                                            <strong>Note:</strong> After submission, our technical team will review your requirements and assign a specialized architect to finalize your custom blueprint.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCustomModal(false)} 
                                            className="h-14 flex-1 rounded-2xl bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all font-sans"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={submitting} 
                                            className="h-14 flex-1 rounded-2xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
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
