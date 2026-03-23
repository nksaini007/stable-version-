import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { 
    FaTrash, FaCheckCircle, FaTimesCircle, FaCheck, FaBan, FaStore, FaTools, 
    FaLayerGroup as FaLayerIcon 
} from "react-icons/fa";
import AdminServiceCategoryDashboard from "../../../AdminServiceCategoryDashboard";
import { toast } from "react-toastify";

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        price: ""
    });
    const [images, setImages] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Category management
    const [serviceCategories, setServiceCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [activeTab, setActiveTab] = useState("services"); // new tab system

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await API.get("/services/admin/all");
            setServices(res.data);
        } catch (err) {
            console.error("Failed to fetch services:", err);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get("/service-categories");
            setServiceCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch service categories", err);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("category", formData.category); // display name
            data.append("price", formData.price);
            data.append("serviceCategoryId", selectedCategoryId);
            data.append("serviceSubCategoryId", formData.subCategoryId);

            if (images) {
                for (let i = 0; i < images.length; i++) {
                    data.append("images", images[i]);
                }
            }

            await API.post("/services", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Service created successfully!");
            setShowModal(false);
            setFormData({ title: "", description: "", category: "", price: "" });
            setImages(null);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create service");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await API.put(`/services/${id}`, { isActive: !currentStatus });
            toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchServices();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const deleteService = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await API.delete(`/services/${id}`);
            toast.success("Service deleted");
            fetchServices();
        } catch (err) {
            toast.error("Failed to delete service");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#8E929C]">Loading services...</div>;

    const currentCategory = serviceCategories.find(c => c._id === selectedCategoryId);

    return (
        <div className="space-y-6">
            <div className="flex border-b border-[#2A2B2F] mb-6">
                <button
                    onClick={() => setActiveTab("services")}
                    className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'services' ? 'border-orange-500 text-orange-600 bg-orange-50/30' : 'border-transparent text-[#8E929C] hover:text-gray-200'}`}
                >
                    <FaTools className="inline mr-2" /> All Services
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'categories' ? 'border-orange-500 text-orange-600 bg-orange-50/30' : 'border-transparent text-[#8E929C] hover:text-gray-200'}`}
                >
                    <FaLayerIcon className="inline mr-2" /> Manage Hierarchies
                </button>
            </div>

            {activeTab === "categories" ? (
                <AdminServiceCategoryDashboard />
            ) : (
                <>
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Service Management</h1>
                    <p className="text-sm text-[#8E929C] mt-1">Manage and track all platform services.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold  transition"
                    >
                        + Add Service
                    </button>
                    <div className="flex items-center gap-2 text-sm bg-[#1A1B1E] border border-[#2A2B2F] px-4 py-2 rounded-xl  border border-[#2A2B2F]">
                        <span className="font-bold text-white">{services.length}</span> Total Services
                    </div>
                </div>
            </div>

            <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl  border border-[#2A2B2F] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#121212] border-b border-[#2A2B2F] text-[#8E929C]">
                            <tr>
                                <th className="px-6 py-4 font-semibold hidden md:table-cell">Thumbnail</th>
                                <th className="px-6 py-4 font-semibold">Service Title</th>
                                <th className="px-6 py-4 font-semibold">Price</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[#8E929C]">
                                        No services found.
                                    </td>
                                </tr>
                            ) : (
                                services.map(svc => (
                                    <tr key={svc._id} className="hover:bg-[#121212]/50 transition">
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="w-16 h-12 rounded bg-[#121212] overflow-hidden flex items-center justify-center">
                                                {svc.images?.length > 0 ? (
                                                    <img src={`${svc.images[0]}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaTools className="text-gray-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{svc.title}</p>
                                            <p className="text-xs text-blue-500 font-medium">{svc.category}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            ₹{svc.price}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${svc.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                                {svc.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                                {svc.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => toggleStatus(svc._id, svc.isActive)}
                                                className={`p-2 rounded-lg border transition ${svc.isActive ? "bg-[#1A1B1E] border border-[#2A2B2F] border-orange-200 text-orange-500 hover:bg-orange-50" : "bg-[#1A1B1E] border border-[#2A2B2F] border-green-200 text-green-500 hover:bg-green-50"}`}
                                                title={svc.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {svc.isActive ? <FaBan /> : <FaCheck />}
                                            </button>
                                            <button
                                                onClick={() => deleteService(svc._id)}
                                                className="p-2 rounded-lg bg-[#1A1B1E] border border-[#2A2B2F] border border-red-200 text-red-500 hover:bg-red-50 transition"
                                                title="Delete Service"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Service Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl w-full max-w-lg overflow-hidden ">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-[#121212]">
                            <h3 className="font-bold text-lg text-white">Add New Service</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-red-500"><FaTimesCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-orange-400 focus:ring-0 outline-none" placeholder="E.g. Standard Home Cleaning" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-orange-400 focus:ring-0 outline-none" rows="3" placeholder="Describe what the service includes"></textarea>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Category</label>
                                    <select 
                                        required 
                                        value={selectedCategoryId} 
                                        onChange={e => {
                                            const cat = serviceCategories.find(c => c._id === e.target.value);
                                            setSelectedCategoryId(e.target.value);
                                            setFormData({ ...formData, category: cat?.name || "", subCategoryId: "" });
                                        }} 
                                        className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-orange-400 focus:ring-0 outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        {serviceCategories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Subcategory</label>
                                    <select 
                                        required 
                                        value={formData.subCategoryId} 
                                        onChange={e => setFormData({ ...formData, subCategoryId: e.target.value })} 
                                        className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-orange-400 focus:ring-0 outline-none"
                                        disabled={!selectedCategoryId}
                                    >
                                        <option value="">Select Sub</option>
                                        {currentCategory?.subcategories?.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">Price (₹)</label>
                                    <input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border-2 border-[#2A2B2F] p-2.5 rounded-xl focus:border-orange-400 focus:ring-0 outline-none" placeholder="999" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-1">Service Images</label>
                                <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full text-sm text-[#8E929C] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition" />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold mt-4 transition disabled:opacity-50">
                                {submitting ? "Creating..." : "Create Service"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default ServiceManagement;
