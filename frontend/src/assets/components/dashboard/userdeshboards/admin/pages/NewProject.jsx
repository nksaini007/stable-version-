import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { 
    FaChevronLeft, FaHardHat, FaMapMarkerAlt, FaCalendarAlt, 
    FaUserAstronaut, FaTasks, FaCheckCircle, FaProjectDiagram,
    FaExclamationCircle, FaCube
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const NewProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Data for dropdowns
    const [architects, setArchitects] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        type: "House",
        description: "",
        location: "",
        estimatedCost: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        architectId: "",
        customerId: "",
        planId: "",
        phases: [
            { name: "Initial Planning", status: "In Progress", description: "Design validation and site inspection." },
            { name: "Excavation", status: "Pending", description: "Ground leveling and trenching." },
            { name: "Foundation", status: "Pending", description: "Concrete pouring and structural base." }
        ]
    });

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [archRes, userRes, planRes] = await Promise.all([
                    API.get("/users/all?role=architect"),
                    API.get("/users/all?role=customer"),
                    API.get("/construction-plans")
                ]);
                setArchitects(archRes.data.users || archRes.data || []);
                setCustomers(userRes.data.users || userRes.data || []);
                setPlans(planRes.data.plans || []);
            } catch (error) {
                console.error("Meta sync failure", error);
            }
        };
        fetchMeta();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addPhase = () => {
        setFormData(prev => ({
            ...prev,
            phases: [...prev.phases, { name: "", status: "Pending", description: "" }]
        }));
    };

    const updatePhase = (index, field, value) => {
        const updated = [...formData.phases];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, phases: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/construction-projects/project", formData);
            toast.success("New Project Node Initialized Successfully");
            navigate("/admin/projects");
        } catch (error) {
            toast.error("Protocol initialization failed");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Project Designation</label>
                                <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest" placeholder="E.G. VILLA SYNERGY" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Structural Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest">
                                    {["House", "Building", "Apartment", "Cricket Stadium", "Commercial Project", "Other"].map(t => (
                                        <option key={t} value={t}>{t.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Operational Location</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                                <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl pl-14 pr-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest" placeholder="CITY, STATE, GRID-REGION" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Project Scope Brief</label>
                            <textarea required name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest h-32 resize-none" placeholder="DETAIL THE MISSION SCOPE..." />
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Projected CapEx (₹)</label>
                                <input required type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none font-bold tracking-widest" placeholder="ESTIMATED TOTAL BUDGET" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Operational Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest">
                                    {["Low", "Medium", "High", "Critical"].map(p => (
                                        <option key={p} value={p}>{p.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Deployment Date</label>
                                <input required type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none font-bold tracking-widest" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Target Completion</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none font-bold tracking-widest" />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Assigned Lead Architect</label>
                                <select name="architectId" value={formData.architectId} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest">
                                    <option value="">SCANNING FOR AGENTS...</option>
                                    {architects.map(arch => (
                                        <option key={arch._id} value={arch._id}>{arch.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Client Beneficiary</label>
                                <select name="customerId" value={formData.customerId} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest">
                                    <option value="">SEARCHING REGISTRY...</option>
                                    {customers.map(user => (
                                        <option key={user._id} value={user._id}>{user.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Blueprint Source (Optional)</label>
                            <select name="planId" value={formData.planId} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-zinc-800 rounded-xl px-6 py-4 text-sm text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest">
                                <option value="">NO LINKED BLUEPRINT</option>
                                {plans.map(p => (
                                    <option key={p._id} value={p._id}>{p.title.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Project Roadmap Phases</h3>
                            <button type="button" onClick={addPhase} className="text-cyan-500 text-[9px] font-bold uppercase tracking-widest">+ Inject Milestone</button>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                            {formData.phases.map((phase, idx) => (
                                <div key={idx} className="bg-[#0B0C10] border border-zinc-800 p-6 rounded-2xl relative">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <input value={phase.name} onChange={e => updatePhase(idx, 'name', e.target.value)} className="bg-transparent border-b border-zinc-800 text-xs text-white font-bold outline-none focus:border-cyan-500 transition-all uppercase tracking-widest" placeholder="PHASE NAME" />
                                        <select value={phase.status} onChange={e => updatePhase(idx, 'status', e.target.value)} className="bg-transparent border-b border-zinc-800 text-[10px] text-cyan-500 outline-none uppercase font-bold tracking-widest">
                                            <option value="Pending">PENDING</option>
                                            <option value="In Progress">IN PROGRESS</option>
                                            <option value="Completed">COMPLETED</option>
                                        </select>
                                    </div>
                                    <textarea value={phase.description} onChange={e => updatePhase(idx, 'description', e.target.value)} className="w-full bg-black/40 border border-zinc-900 rounded-lg p-3 text-[10px] text-zinc-500 outline-none h-16 resize-none uppercase font-bold tracking-widest" placeholder="PHASE OBJECTIVES..." />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-10 bg-[#0B0C10] min-h-screen">
            <header className="flex items-center gap-6 mb-12">
                <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-[#1A1B1E] border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-cyan-500 hover:scale-110 transition-all shadow-xl active:scale-95">
                    <FaChevronLeft className="text-xs" />
                </button>
                <div>
                     <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Initialize <span className="text-cyan-500">Project</span></h1>
                     <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-3">Registry / Operation: Gen-Alpha</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="bg-[#1A1B1E] border border-zinc-800 rounded-[40px] p-10 shadow-3xl overflow-hidden relative">
                    {/* Visual Art Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[120px] rounded-full"></div>
                    
                    {/* Progress Indicator */}
                    <div className="flex justify-between items-center mb-16 relative">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2 z-0"></div>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${step >= s ? 'bg-cyan-500 border-cyan-400 text-[#0B0C10] shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-[#1A1B1E] border-zinc-800 text-zinc-600'}`}>
                                <span className="text-xs font-black">{s}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {renderStep()}

                        <div className="mt-16 flex justify-between items-center pt-8 border-t border-zinc-900/50">
                            <button 
                                type="button"
                                disabled={step === 1}
                                onClick={() => setStep(step - 1)}
                                className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${step === 1 ? 'opacity-0' : 'text-zinc-500 hover:text-white'}`}
                            >
                                <FaChevronLeft /> Backtrack
                            </button>
                            
                            {step < 4 ? (
                                <button 
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    className="bg-white text-[#0B0C10] px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-cyan-500 transition-all shadow-xl active:scale-95"
                                >
                                    Proceed Phase
                                </button>
                            ) : (
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-cyan-500 text-[#0B0C10] px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Initializing..." : "Finalize Deployment"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8 flex justify-center gap-10">
                    <div className="flex items-center gap-3">
                        <FaProjectDiagram className="text-cyan-500/30 text-xs" />
                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest leading-loose">Automated Phase Mapping Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserAstronaut className="text-cyan-500/30 text-xs" />
                        <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest leading-loose">Role-Based Permission Handshake Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewProject;
