import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaLayerGroup, FaImage, FaListUl, FaTools, FaCube, FaUserTie, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ManagePlans = () => {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [architects, setArchitects] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        planType: "",
        description: "",
        estimatedCost: "",
        area: "",
        features: "",
        facilities: "",
        architectId: "",
        subConstructions: [],
        linkedProducts: [],
        images: []
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [plansRes, catsRes, archRes, prodRes] = await Promise.all([
                API.get("/construction-plans"),
                API.get("/plan-categories"),
                API.get("/users/all?role=architect"), 
                API.get("/products/admin-all")
            ]);
            
            setPlans(plansRes.data.plans || []);
            setCategories(catsRes.data.categories || []);
            setArchitects(archRes.data.users || archRes.data || []);
            setProducts(prodRes.data || []);
        } catch (error) {
            console.error("Scale failure", error);
            toast.error("Failed to sync registry");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
    };

    const addSubConstruction = () => {
        setFormData(prev => ({
            ...prev,
            subConstructions: [...prev.subConstructions, { name: "", cost: 0 }]
        }));
    };

    const removeSubConstruction = (index) => {
        setFormData(prev => ({
            ...prev,
            subConstructions: prev.subConstructions.filter((_, i) => i !== index)
        }));
    };

    const updateSubConstruction = (index, field, value) => {
        const updated = [...formData.subConstructions];
        updated[index][field] = field === 'cost' ? Number(value) : value;
        setFormData(prev => ({ ...prev, subConstructions: updated }));
    };

    const toggleProductLink = (productId) => {
        setFormData(prev => {
            const exists = prev.linkedProducts.includes(productId);
            if (exists) {
                return { ...prev, linkedProducts: prev.linkedProducts.filter(id => id !== productId) };
            } else {
                return { ...prev, linkedProducts: [...prev.linkedProducts, productId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsAwaitingResponse(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                formData.images.forEach(img => data.append('images', img));
            } else if (['subConstructions', 'linkedProducts'].includes(key)) {
                data.append(key, JSON.stringify(formData[key]));
            } else if (key === 'features' || key === 'facilities') {
                const arr = formData[key].split(',').map(s => s.trim()).filter(Boolean);
                data.append(key, JSON.stringify(arr));
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingPlan) {
                await API.put(`/construction-plans/${editingPlan._id}`, data);
                toast.success("Project updated successfully");
            } else {
                await API.post("/construction-plans", data);
                toast.success("New project recorded");
            }
            setShowForm(false);
            setEditingPlan(null);
            resetForm();
            fetchInitialData();
        } catch (error) {
            toast.error("Transmission failed");
        } finally {
            setIsAwaitingResponse(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            category: "",
            planType: "",
            description: "",
            estimatedCost: "",
            area: "",
            features: "",
            facilities: "",
            architectId: "",
            subConstructions: [],
            linkedProducts: [],
            images: []
        });
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title,
            category: plan.category,
            planType: plan.planType,
            description: plan.description,
            estimatedCost: plan.estimatedCost,
            area: plan.area,
            features: plan.features.join(', '),
            facilities: plan.facilities.join(', '),
            architectId: plan.architectId?._id || plan.architectId || "",
            subConstructions: plan.subConstructions || [],
            linkedProducts: plan.linkedProducts?.map(p => p._id || p) || [],
            images: [] // images stay same unless replaced
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Abort this project? This will permanently delete the record.")) return;
        try {
            await API.delete(`/construction-plans/${id}`);
            toast.success("Project aborted");
            fetchInitialData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    return (
        <div className="p-6 md:p-8 bg-[#0B0C10] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-[#1F2833]">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FaLayerGroup className="text-[#66FCF1]" /> Manage Project Plans
                    </h1>
                    <p className="text-sm text-[#8E929C] mt-1 italic">Configure your architectural catalog and dynamic specifications.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setEditingPlan(null); setShowForm(!showForm); }}
                    className="flex items-center gap-2 bg-[#66FCF1] text-[#0B0C10] px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg"
                >
                    {showForm ? <FaTimes /> : <FaPlus />} {showForm ? "Cancel" : "Add Project"}
                </button>
            </header>

            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-[#1A1B1E] border border-[#1F2833] rounded-2xl p-6 md:p-8 mb-10 shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#66FCF1]/5 to-transparent pointer-events-none"></div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#45A29E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <FaListUl className="text-[10px]" /> Core Protocol
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Project Title</label>
                                        <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none" placeholder="e.g. Modern Minimalist Villa" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Category</label>
                                            <select required name="category" value={formData.category} onChange={(e) => {
                                                const newCat = e.target.value;
                                                const selectedCatObj = categories.find(c => c.name === newCat);
                                                const firstPlanType = selectedCatObj?.planTypes?.length > 0 ? selectedCatObj.planTypes[0].name : "";
                                                setFormData(prev => ({ ...prev, category: newCat, planType: firstPlanType }));
                                            }} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none appearance-none">
                                                <option value="" disabled>SELECT CATEGORY</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat.name}>{cat.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Plan Type</label>
                                            <select required name="planType" value={formData.planType} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none appearance-none">
                                                <option value="" disabled>SELECT TYPE</option>
                                                {categories.find(c => c.name === formData.category)?.planTypes?.map((pt) => (
                                                    <option key={pt._id} value={pt.name}>{pt.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost & Details Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#45A29E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <FaTools className="text-[10px]" /> Specifications
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Estimate (₹)</label>
                                            <input required type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none" placeholder="Basic Cost" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Area (Sq Ft)</label>
                                            <input required name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none" placeholder="e.g. 2400 sq.ft." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Lead Architect</label>
                                        <select name="architectId" value={formData.architectId} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none appearance-none">
                                            <option value="">UNASSIGNED</option>
                                            {architects.map((arch) => (
                                                <option key={arch._id} value={arch._id}>{arch.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Project Brief (Description)</label>
                                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none resize-none" placeholder="Detail the architectural vision and scope..."></textarea>
                                    </div>
                                </div>

                                {/* Images & Features Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#45A29E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <FaImage className="text-[10px]" /> Visual Assets
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Gallery Upload</label>
                                        <input type="file" multiple onChange={handleFileChange} className="w-full text-xs text-[#45A29E] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#1F2833] file:text-[#66FCF1] hover:file:bg-white transition-all cursor-pointer" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Key Features (Comma Sep)</label>
                                        <input name="features" value={formData.features} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none" placeholder="Earthquake Resistant, Solar Ready..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#8E929C] uppercase tracking-wider mb-2">Amenities (Comma Sep)</label>
                                        <input name="facilities" value={formData.facilities} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#1F2833] rounded-lg px-4 py-3 text-sm text-white focus:border-[#66FCF1] outline-none" placeholder="Pool, Gym, Garden..." />
                                    </div>
                                </div>
                            </div>

                            {/* Complex Data Mesh */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6 border-t border-[#1F2833]">
                                {/* Add-ons / Sub-Constructions */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-[#45A29E] uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FaTools className="text-[10px]" /> Technical Add-ons
                                        </h3>
                                        <button type="button" onClick={addSubConstruction} className="text-[#66FCF1] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">+ Add Unit</button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.subConstructions.map((sub, index) => (
                                            <div key={index} className="flex gap-3 bg-[#0B0C10] p-3 rounded-lg border border-[#1F2833]">
                                                <input placeholder="Add-on Name" value={sub.name} onChange={(e) => updateSubConstruction(index, 'name', e.target.value)} className="flex-1 bg-transparent text-xs text-white outline-none" />
                                                <input type="number" placeholder="₹ cost" value={sub.cost} onChange={(e) => updateSubConstruction(index, 'cost', e.target.value)} className="w-20 bg-transparent text-xs text-[#66FCF1] outline-none" />
                                                <button type="button" onClick={() => removeSubConstruction(index)} className="text-red-500 hover:text-white transition-all"><FaTrash className="text-[10px]" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Product Links */}
                                <div>
                                    <h3 className="text-xs font-bold text-[#45A29E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <FaCube className="text-[10px]" /> Store Integration
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[180px] overflow-y-auto no-scrollbar pr-2">
                                        {products.map(prod => (
                                            <div 
                                                key={prod._id} 
                                                onClick={() => toggleProductLink(prod._id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.linkedProducts.includes(prod._id) ? 'bg-[#66FCF1]/10 border-[#66FCF1]' : 'bg-[#0B0C10] border-[#1F2833] hover:border-[#45A29E]'}`}
                                            >
                                                <p className="text-[10px] font-bold text-white truncate">{prod.name}</p>
                                                <p className="text-[8px] text-[#45A29E] mt-1 truncate">₹ {prod.pricingTiers?.normal || prod.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 text-right">
                                <button 
                                    disabled={isAwaitingResponse}
                                    type="submit" 
                                    className="bg-[#66FCF1] text-[#0B0C10] px-12 py-3 rounded-lg text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(102,252,241,0.2)]"
                                >
                                    {isAwaitingResponse ? "Broadcasting..." : editingPlan ? "Execute Update" : "Broadcast Project"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-Registry List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <motion.div 
                        layout
                        key={plan._id}
                        className="bg-[#1A1B1E] border border-[#1F2833] rounded-2xl overflow-hidden hover:border-[#45A29E] transition-all group flex flex-col h-full shadow-lg"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-[#0B0C10] text-[#66FCF1] px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest border border-[#1F2833]">
                                    {plan._id.substring(0,8)}
                                </span>
                                <div className="flex gap-3">
                                    <button onClick={() => handleEdit(plan)} className="text-[#8E929C] hover:text-[#66FCF1] transition-all"><FaEdit className="text-xs"/></button>
                                    <button onClick={() => handleDelete(plan._id)} className="text-[#8E929C] hover:text-red-500 transition-all"><FaTrash className="text-xs"/></button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold tracking-tight uppercase group-hover:text-[#66FCF1] transition-colors line-clamp-1 mb-2">{plan.title}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[9px] font-bold text-[#45A29E] uppercase tracking-widest">{plan.category}</span>
                                <FaChevronRight className="text-[8px] text-[#1F2833]" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{plan.planType}</span>
                            </div>
                            <p className="text-[11px] text-[#8E929C] leading-relaxed line-clamp-3 italic">"{plan.description}"</p>
                        </div>
                        <div className="p-6 bg-[#0B0C10]/50 border-t border-[#1F2833] flex justify-between items-center">
                            <div>
                                <p className="text-[7px] font-bold text-[#45A29E] uppercase tracking-widest mb-1">Est. Investment</p>
                                <p className="text-[13px] font-bold text-white tracking-tight">₹{plan.estimatedCost?.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[7px] font-bold text-[#45A29E] uppercase tracking-widest mb-1">Floor Area</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{plan.area}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {loading && plans.length === 0 && (
                <div className="text-center py-40">
                    <div className="w-10 h-10 border-2 border-[#1F2833] border-t-[#66FCF1] rounded-full animate-spin mx-auto mb-4"></div>
                    <span className="text-[9px] font-bold text-[#45A29E] uppercase tracking-[0.5em]">Syncing Central Hub</span>
                </div>
            )}
        </div>
    );
};

export default ManagePlans;
