import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaLayerGroup, FaPlusSquare, FaUserTie, FaBoxOpen } from "react-icons/fa";

const ManagePlans = () => {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [architects, setArchitects] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        subCategory: "",
        description: "",
        estimatedCost: 0,
        area: "",
        features: "",
        facilities: "",
        subConstructions: [], // Array of {name, cost}
        linkedProducts: [], // Array of product IDs
        architectId: "",
        isActive: true
    });

    const [tempSubCon, setTempSubCon] = useState({ name: "", cost: 0 });
    const [imageFiles, setImageFiles] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [token]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [plansRes, catsRes, archRes, prodRes] = await Promise.all([
                API.get("/construction-plans"),
                API.get("/plan-categories"),
                API.get("/users/all?role=architect"), 
                API.get("/products") // Assuming /products returns all products
            ]);
            
            setPlans(plansRes.data.plans || []);
            setCategories(catsRes.data.categories || []);
            setArchitects(Array.isArray(archRes.data) ? archRes.data : archRes.data.users || []);
            setAllProducts(Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || []);
        } catch (error) {
            console.error("Failed to load management data", error);
            // toast.error("Some data failed to load");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === "checkbox" ? checked : value 
        });
    };

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const addSubConstruction = () => {
        if (!tempSubCon.name) return;
        setFormData(prev => ({
            ...prev,
            subConstructions: [...prev.subConstructions, { ...tempSubCon }]
        }));
        setTempSubCon({ name: "", cost: 0 });
    };

    const removeSubConstruction = (index) => {
        setFormData(prev => ({
            ...prev,
            subConstructions: prev.subConstructions.filter((_, i) => i !== index)
        }));
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

        const submitData = new FormData();
        submitData.append("title", formData.title);
        submitData.append("category", formData.category);
        submitData.append("subCategory", formData.subCategory || formData.planType);
        submitData.append("planType", formData.subCategory || formData.planType);
        submitData.append("description", formData.description);
        submitData.append("estimatedCost", formData.estimatedCost);
        submitData.append("area", formData.area);
        submitData.append("architectId", formData.architectId);
        submitData.append("isActive", formData.isActive);

        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== "");
        submitData.append("features", JSON.stringify(featuresArray));

        const facilitiesArray = formData.facilities.split(',').map(f => f.trim()).filter(f => f !== "");
        submitData.append("facilities", JSON.stringify(facilitiesArray));

        submitData.append("subConstructions", JSON.stringify(formData.subConstructions));
        submitData.append("linkedProducts", JSON.stringify(formData.linkedProducts));

        imageFiles.forEach(file => {
            submitData.append("images", file);
        });

        try {
            if (editingId) {
                await API.put(`/construction-plans/${editingId}`, submitData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Plan updated successfully!");
            } else {
                await API.post("/construction-plans", submitData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success("Plan created successfully!");
            }

            setShowModal(false);
            resetForm();
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save plan");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await API.delete(`/construction-plans/${id}`);
            toast.success("Plan deleted successfully!");
            fetchInitialData();
        } catch (error) {
            toast.error("Failed to delete plan");
        }
    };

    const openEditModal = (plan) => {
        setFormData({
            title: plan.title,
            category: plan.category,
            subCategory: plan.subCategory || plan.planType || "",
            description: plan.description,
            estimatedCost: plan.estimatedCost || 0,
            area: plan.area,
            features: plan.features?.join(", ") || "",
            facilities: plan.facilities?.join(", ") || "",
            subConstructions: plan.subConstructions || [],
            linkedProducts: plan.linkedProducts?.map(p => typeof p === 'object' ? p._id : p) || [],
            architectId: plan.architectId?._id || plan.architectId || "",
            isActive: plan.isActive !== undefined ? plan.isActive : true
        });
        setImageFiles([]); 
        setEditingId(plan._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            category: categories.length > 0 ? categories[0].name : "",
            subCategory: categories.length > 0 && categories[0].planTypes?.length > 0 ? categories[0].planTypes[0].name : "",
            description: "",
            estimatedCost: 0,
            area: "",
            features: "",
            facilities: "",
            subConstructions: [],
            linkedProducts: [],
            architectId: "",
            isActive: true
        });
        setImageFiles([]);
        setEditingId(null);
    };

    return (
        <div className="p-6 md:p-8 bg-[#0B0C10] min-h-screen text-[#C5C6C7]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">MANAGE <span className="text-[#66FCF1]">PROJECT PLANS</span></h1>
                    <p className="text-[#8E929C] mt-1 font-light tracking-wide italic">Technical Registry Protocol v2.4</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-[#66FCF1] text-[#0B0C10] hover:bg-[#45A29E] px-6 py-3 rounded-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(102,252,241,0.2)]"
                >
                    <FaPlus /> INITIALIZE NEW PLAN
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-1 bg-[#1F2833] overflow-hidden relative">
                        <div className="absolute inset-y-0 bg-[#66FCF1] animate-loading-bar w-1/3"></div>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.4em] text-[#45A29E] uppercase">Syncing Active Archive</span>
                </div>
            ) : (
                <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-sm overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0B0C10] text-[#45A29E] text-[10px] uppercase tracking-[0.2em] border-b border-[#2A2B2F]">
                                    <th className="p-6 font-bold">Plan Identifier</th>
                                    <th className="p-6 font-bold">Category Mesh</th>
                                    <th className="p-6 font-bold hidden md:table-cell">Metrics</th>
                                    <th className="p-6 font-bold">Status</th>
                                    <th className="p-6 font-bold text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2B2F]">
                                {plans.map((plan) => (
                                    <tr key={plan._id} className="hover:bg-[#121212] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-sm bg-[#0B0C10] flex-shrink-0 overflow-hidden border border-[#2A2B2F] group-hover:border-[#66FCF1] transition-all">
                                                    {plan.images && plan.images.length > 0 ? (
                                                        <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#1F2833]"><FaImage className="text-2xl" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white tracking-tight uppercase">{plan.title}</p>
                                                    <p className="text-[10px] text-[#45A29E] font-mono mt-1">ID: {plan._id.substring(0,8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="px-3 py-0.5 border border-[#45A29E] text-[#66FCF1] rounded-none text-[9px] font-bold uppercase tracking-wider">{plan.category}</span>
                                                <span className="text-[10px] text-[#8E929C] font-light lowercase italic tracking-wide">{plan.subCategory || plan.planType}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden md:table-cell">
                                            <p className="text-white text-xs font-bold">{plan.area}</p>
                                            <p className="text-[10px] text-[#45A29E] font-mono mt-0.5">₹{plan.estimatedCost?.toLocaleString()}</p>
                                        </td>
                                        <td className="p-6">
                                            {plan.isActive ? 
                                                <span className="text-[9px] font-bold text-[#66FCF1] uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#66FCF1] animate-pulse"></span> Active</span> :
                                                <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500/60"></span> Latent</span>
                                            }
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => openEditModal(plan)} className="p-2.5 text-white/40 hover:text-[#66FCF1] bg-[#0B0C10] hover:bg-[#1F2833] rounded-sm transition-all border border-[#2A2B2F]"><FaEdit /></button>
                                                <button onClick={() => handleDelete(plan._id)} className="p-2.5 text-white/40 hover:text-red-500 bg-[#0B0C10] hover:bg-[#1F2833] rounded-sm transition-all border border-[#2A2B2F]"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Comprehensive Detail Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-[#0B0C10]/90 backdrop-blur-md p-4">
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="px-8 py-6 border-b border-[#2A2B2F] flex justify-between items-center bg-[#0B0C10]">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-[0.2em] uppercase">{editingId ? "Modify Configuration" : "Initialize Component"}</h2>
                                <p className="text-[9px] text-[#45A29E] uppercase tracking-widest mt-1">Registry Access Level: Admin / High Intensity</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-[#C5C6C7] hover:text-[#66FCF1] bg-[#1F2833] p-2.5 rounded-sm transition-all border border-[#2A2B2F]"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            {/* Section: Base Parameters */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-[#2A2B2F] pb-2 mb-4">
                                    <FaLayerGroup className="text-[#66FCF1] text-xs" />
                                    <h3 className="text-[10px] font-bold text-[#45A29E] uppercase tracking-[0.3em]">Core Specifications</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Protocol Title</label>
                                        <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none transition-all rounded-none" placeholder="DESIGN IDENTIFIER" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">System Mesh</label>
                                            <select required name="category" value={formData.category} onChange={(e) => {
                                                const newCat = e.target.value;
                                                const selectedCatObj = categories.find(c => c.name === newCat);
                                                const firstPlanType = selectedCatObj?.planTypes?.length > 0 ? selectedCatObj.planTypes[0].name : "";
                                                setFormData(prev => ({ ...prev, category: newCat, subCategory: firstPlanType }));
                                            }} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none transition-all rounded-none appearance-none">
                                                <option value="" disabled>SELECT MESH</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat.name}>{cat.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Sub-Protocol</label>
                                            <select required name="subCategory" value={formData.subCategory} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none transition-all rounded-none appearance-none">
                                                <option value="" disabled>SELECT TYPE</option>
                                                {categories.find(c => c.name === formData.category)?.planTypes?.map((pt) => (
                                                    <option key={pt._id} value={pt.name}>{pt.name.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Spatial Magnitude</label>
                                        <input required type="text" name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none transition-all rounded-none font-mono" placeholder="UNIT / MAGNITUDE" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Base Valuation (₹)</label>
                                        <input required type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none transition-all rounded-none font-mono" />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Sub-Constructions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-b border-[#2A2B2F] pb-2 mb-4">
                                    <FaPlusSquare className="text-[#66FCF1] text-xs" />
                                    <h3 className="text-[10px] font-bold text-[#45A29E] uppercase tracking-[0.3em]">Module Extensions (Add-ons)</h3>
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[8px] font-bold text-[#45A29E] uppercase tracking-widest">Module Name</label>
                                        <input type="text" value={tempSubCon.name} onChange={(e) => setTempSubCon({...tempSubCon, name: e.target.value})} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-[10px] px-3 py-2.5 outline-none" placeholder="e.g. SOLAR ARRAY" />
                                    </div>
                                    <div className="w-32 space-y-1.5">
                                        <label className="text-[8px] font-bold text-[#45A29E] uppercase tracking-widest">Cost</label>
                                        <input type="number" value={tempSubCon.cost} onChange={(e) => setTempSubCon({...tempSubCon, cost: e.target.value})} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-[10px] px-3 py-2.5 outline-none font-mono" />
                                    </div>
                                    <button type="button" onClick={addSubConstruction} className="bg-[#1F2833] hover:bg-[#66FCF1] hover:text-[#0B0C10] text-white px-4 py-2.5 border border-[#2A2B2F] transition-all text-xs font-bold uppercase">Inject</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {formData.subConstructions.map((sc, i) => (
                                        <div key={i} className="bg-[#0B0C10] border border-[#66FCF1]/30 px-3 py-2 flex items-center gap-3 animate-fade-in group">
                                            <span className="text-[9px] font-bold text-white uppercase">{sc.name}</span>
                                            <span className="text-[9px] font-mono text-[#45A29E]">₹{parseInt(sc.cost)?.toLocaleString()}</span>
                                            <button type="button" onClick={() => removeSubConstruction(i)} className="text-red-500/50 hover:text-red-500"><FaTimes className="text-[10px]" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Links & Assignments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-[#2A2B2F] pb-2 mb-4">
                                        <FaUserTie className="text-[#66FCF1] text-xs" />
                                        <h3 className="text-[10px] font-bold text-[#45A29E] uppercase tracking-[0.3em]">Architectural Audit</h3>
                                    </div>
                                    <select name="architectId" value={formData.architectId} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none appearance-none">
                                        <option value="">SYSTEM ASSIGNMENT (AUTO)</option>
                                        {architects.map(arch => (
                                            <option key={arch._id} value={arch._id}>{arch.name?.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-[#2A2B2F] pb-2 mb-4">
                                        <FaBoxOpen className="text-[#66FCF1] text-xs" />
                                        <h3 className="text-[10px] font-bold text-[#45A29E] uppercase tracking-[0.3em]">Linked Inventory</h3>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto bg-[#0B0C10] border border-[#2A2B2F] p-4 divide-y divide-[#1F2833] custom-scrollbar">
                                        {allProducts.map(prod => (
                                            <div key={prod._id} className="py-2.5 flex items-center justify-between">
                                                <span className="text-[10px] text-[#C5C6C7] tracking-tight uppercase">{prod.name}</span>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.linkedProducts.includes(prod._id)} 
                                                    onChange={() => toggleProductLink(prod._id)}
                                                    className="w-4 h-4 rounded-none border-[#2A2B2F] bg-[#1F2833] checked:bg-[#66FCF1]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tags & Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Technical Features</label>
                                    <input type="text" name="features" value={formData.features} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none" placeholder="FEATURE1, FEATURE2..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Site Facilities</label>
                                    <input type="text" name="facilities" value={formData.facilities} onChange={handleInputChange} className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none" placeholder="FACILITY1, FACILITY2..." />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Technical Briefing</label>
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-[#0B0C10] border border-[#2A2B2F] text-white text-xs px-4 py-3.5 focus:border-[#66FCF1] outline-none resize-none leading-relaxed" placeholder="FULL SYSTEM OVERVIEW..."></textarea>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest">Media Uplink (Technical Views)</label>
                                    <div className="relative group">
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="bg-[#0B0C10] border border-[#2A2B2F] group-hover:border-[#66FCF1]/50 border-dashed py-10 flex flex-col items-center justify-center gap-2 transition-all">
                                            <FaImage className="text-[#1F2833] text-2xl group-hover:text-[#66FCF1]/20" />
                                            <span className="text-[8px] font-bold text-[#45A29E] uppercase tracking-[0.2em]">{imageFiles.length > 0 ? `${imageFiles.length} FILES STAGED` : "READY FOR UPLINK"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-40 flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-[#8E929C] uppercase tracking-widest mb-1 text-center">Status Toggle</label>
                                    <label className="relative inline-flex items-center justify-center cursor-pointer">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only peer" />
                                        <div className="w-24 h-10 bg-[#0B0C10] border border-[#2A2B2F] peer-checked:border-[#66FCF1] transition-all flex items-center px-1">
                                            <div className={`w-8 h-8 rounded-none transition-all ${formData.isActive ? 'translate-x-14 bg-[#66FCF1]' : 'bg-[#1F2833]'}`}></div>
                                            <span className={`absolute text-[8px] font-bold uppercase transition-all ${formData.isActive ? 'left-4 opacity-100 text-[#66FCF1]' : 'right-4 opacity-100 text-[#45A29E]'}`}>
                                                {formData.isActive ? "ONLINE" : "SILENT"}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-10 flex justify-end gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 font-bold text-[#45A29E] uppercase tracking-widest text-[10px] hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="bg-[#66FCF1] text-[#0B0C10] px-10 py-4 font-bold uppercase tracking-[0.2em] text-[10px] shadow-[0_0_20px_rgba(102,252,241,0.1)] hover:bg-white transition-all">
                                    {editingId ? "COMMIT CHANGES" : "PUBLISH PROTOCOL"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes loading-bar {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s infinite linear;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #0B0C10;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1F2833;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #66FCF1;
                }
            ` }} />
        </div>
    );
};

export default ManagePlans;
