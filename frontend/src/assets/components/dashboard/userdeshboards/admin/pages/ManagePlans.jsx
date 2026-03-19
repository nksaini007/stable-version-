import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes } from "react-icons/fa";

const ManagePlans = () => {
    const { token } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        planType: "",
        description: "",
        estimatedCost: "",
        area: "",
        features: "", // Comma separated list for ease of input
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchPlans();
        fetchCategories();
    }, [token]);

    const fetchCategories = async () => {
        try {
            const res = await API.get("/plan-categories");
            setCategories(res.data.categories || []);
        } catch (error) {
            console.error("Failed to load plan categories", error);
        }
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await API.get("/construction-plans");
            setPlans(res.data.plans);
        } catch (error) {
            toast.error("Failed to load construction plans");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        submitData.append("title", formData.title);
        submitData.append("category", formData.category);
        submitData.append("planType", formData.planType);
        submitData.append("description", formData.description);
        submitData.append("estimatedCost", formData.estimatedCost);
        submitData.append("area", formData.area);

        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f !== "");
        submitData.append("features", JSON.stringify(featuresArray));

        imageFiles.forEach(file => {
            submitData.append("images", file);
        });

        try {
            if (editingId) {
                await API.put(`/construction-plans/${editingId}`, submitData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
                toast.success("Plan updated successfully!");
            } else {
                await API.post("/construction-plans", submitData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
                toast.success("Plan created successfully!");
            }

            setShowModal(false);
            resetForm();
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save plan");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await API.delete(`/construction-plans/${id}`);
            toast.success("Plan deleted successfully!");
            fetchPlans();
        } catch (error) {
            toast.error("Failed to delete plan");
        }
    };

    const openEditModal = (plan) => {
        setFormData({
            title: plan.title,
            category: plan.category,
            planType: plan.planType || "",
            description: plan.description,
            estimatedCost: plan.estimatedCost,
            area: plan.area,
            features: plan.features.join(", "),
        });
        setImageFiles([]); // Reset file input when editing (existing images will be replaced if new ones added)
        setEditingId(plan._id);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            category: categories.length > 0 ? categories[0].name : "",
            planType: categories.length > 0 && categories[0].planTypes?.length > 0 ? categories[0].planTypes[0].name : "",
            description: "",
            estimatedCost: "",
            area: "",
            features: "",
        });
        setImageFiles([]);
        setEditingId(null);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manage Project Plans</h1>
                    <p className="text-gray-500 mt-1">Create and manage the architectural plans catalog for customers.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
                >
                    <FaPlus /> Add New Plan
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-5 font-semibold">Plan Details</th>
                                    <th className="p-5 font-semibold">Category</th>
                                    <th className="p-5 font-semibold hidden md:table-cell">Area / Cost</th>
                                    <th className="p-5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {plans.map((plan) => (
                                    <tr key={plan._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                    {plan.images && plan.images.length > 0 ? (
                                                        <img src={plan.images[0]} alt={plan.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FaImage className="text-2xl" /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{plan.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{plan.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{plan.category}</span>
                                                {plan.planType && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium border border-gray-200">{plan.planType}</span>}
                                            </div>
                                        </td>
                                        <td className="p-5 hidden md:table-cell">
                                            <p className="font-medium text-gray-800">{plan.area}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">{plan.estimatedCost}</p>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(plan)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><FaEdit /></button>
                                                <button onClick={() => handleDelete(plan._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-gray-500">No project plans available. Click "Add New Plan" to create one.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Plan" : "Create New Plan"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" placeholder="e.g. Modern Villa" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select required name="category" value={formData.category} onChange={(e) => {
                                        const newCat = e.target.value;
                                        const selectedCatObj = categories.find(c => c.name === newCat);
                                        const firstPlanType = selectedCatObj?.planTypes?.length > 0 ? selectedCatObj.planTypes[0].name : "";
                                        setFormData(prev => ({ ...prev, category: newCat, planType: firstPlanType }));
                                    }} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white">
                                        <option value="" disabled>Select a Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Type</label>
                                    <select required name="planType" value={formData.planType} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-white">
                                        <option value="" disabled>Select a Plan Type</option>
                                        {categories.find(c => c.name === formData.category)?.planTypes?.map((pt) => (
                                            <option key={pt._id} value={pt.name}>{pt.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Area</label>
                                    <input required type="text" name="area" value={formData.area} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" placeholder="e.g. 2,500 sq ft or 300 sq mt" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Cost Label</label>
                                    <input required type="text" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" placeholder="e.g. Starting from ₹50 Lakhs" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm resize-none" placeholder="Detailed overview of the blueprint/design..."></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Key Features (Comma Separated)</label>
                                <input type="text" name="features" value={formData.features} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm" placeholder="e.g. 4 Bedrooms, Open Kitchen, Swimming Pool" />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple features using commas.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Plan Images</label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm bg-gray-50 hover:bg-white cursor-pointer" />
                                <p className="text-xs text-gray-500 mt-1">You can select multiple images. Supported formats: JPG, PNG, WEBP.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
                                    {editingId ? "Save Changes" : "Publish Plan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePlans;
