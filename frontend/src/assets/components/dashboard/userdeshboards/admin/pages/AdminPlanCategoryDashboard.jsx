import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLayerGroup } from "react-icons/fa";
import { motion } from "framer-motion";
import API from "../../../../../api/api";

const AdminPlanCategoryDashboard = () => {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [categoryImage, setCategoryImage] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    // Subcategory (Plan Types) State
    const [typeName, setTypeName] = useState("");
    const [typeImage, setTypeImage] = useState(null);
    const [editingType, setEditingType] = useState({ catId: null, typeId: null, name: "", image: null });

    // ================= FETCH =================
    const fetchCategories = async () => {
        try {
            const { data } = await API.get("/plan-categories");
            setCategories(data.categories || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ================= CATEGORY =================
    const handleAddOrEditCategory = async () => {
        if (!categoryName.trim()) return alert("Category name required");

        const formData = new FormData();
        formData.append("name", categoryName);
        if (categoryImage) formData.append("categoryImage", categoryImage);

        try {
            if (editingCategoryId) {
                await API.put(`/plan-categories/${editingCategoryId}`, formData);
                setEditingCategoryId(null);
            } else {
                await API.post("/plan-categories", formData);
            }
            setCategoryName("");
            setCategoryImage(null);
            fetchCategories();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await API.delete(`/plan-categories/${id}`);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditCategory = (cat) => {
        setCategoryName(cat.name);
        setEditingCategoryId(cat._id);
    };

    // ================= PLAN TYPES (SUBCATEGORY) =================
    const handleAddPlanType = async (categoryId) => {
        if (!typeName.trim()) return alert("Plan type name required");

        const formData = new FormData();
        formData.append("name", typeName);
        if (typeImage) formData.append("subcategoryImage", typeImage);

        try {
            await API.post(`/plan-categories/${categoryId}/plan-types`, formData);
            setTypeName("");
            setTypeImage(null);
            fetchCategories();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleEditPlanType = (catId, pType) => {
        setEditingType({ catId, typeId: pType._id, name: pType.name, image: null });
    };

    const handleSavePlanType = async () => {
        const { catId, typeId, name, image } = editingType;
        if (!name.trim()) return;

        const formData = new FormData();
        formData.append("name", name);
        if (image) formData.append("subcategoryImage", image);

        try {
            await API.put(`/plan-categories/${catId}/plan-types/${typeId}`, formData);
            setEditingType({ catId: null, typeId: null, name: "", image: null });
            fetchCategories();
        } catch (err) {
            alert("Operation failed");
        }
    };

    const handleDeletePlanType = async (catId, typeId) => {
        if (!window.confirm("Delete plan type?")) return;
        try {
            await API.delete(`/plan-categories/${catId}/plan-types/${typeId}`);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http")) return img;
        return `${img}`;
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FaLayerGroup className="text-blue-400" /> Manage Plan Categories
                    </h1>
                    <p className="text-[#8E929C] mt-1">
                        Create and manage categories for Construction & Architectural Plans
                    </p>
                </div>

                {/* ADD CATEGORY */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F] rounded-2xl p-6  mb-10"
                >
                    <h2 className="text-xl font-semibold text-white mb-4">
                        {editingCategoryId ? "Edit Category" : "Add New Category"}
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Category name e.g., Modern Villa"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="flex-1 p-3 border border-[#2A2B2F] rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                        />

                        <input
                            type="file"
                            onChange={(e) => setCategoryImage(e.target.files[0])}
                            className="border border-[#2A2B2F] rounded-xl p-2 bg-[#121212] text-sm"
                        />

                        <button
                            onClick={handleAddOrEditCategory}
                            className="bg-white text-black hover:bg-gray-200 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2  font-medium transition-colors"
                        >
                            {editingCategoryId ? <FaSave /> : <FaPlus />}
                            {editingCategoryId ? "Save Changes" : "Create"}
                        </button>

                        {editingCategoryId && (
                            <button
                                onClick={() => {
                                    setCategoryName("");
                                    setEditingCategoryId(null);
                                    setCategoryImage(null);
                                }}
                                className="bg-[#121212] text-[#8E929C] hover:bg-[#2A2B2F] px-4 py-3 rounded-xl transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* CATEGORY GRID */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={cat._id}
                            className="bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F] rounded-2xl p-5  hover: transition- flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {cat.image ? (
                                        <img src={getImageUrl(cat.image)} alt={cat.name} className="w-14 h-14 rounded-xl object-cover bg-[#121212]" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-300">
                                            <FaLayerGroup className="text-2xl" />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-white">{cat.name}</h3>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleEditCategory(cat)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            {/* PLAN TYPES START */}
                            <div className="mt-4 pt-4 border-t border-[#2A2B2F]">
                                {/* ADD / EDIT PLAN TYPE */}
                                <div className="bg-blue-50/50 p-3 rounded-xl mb-3 border border-blue-100">
                                    <input
                                        type="text"
                                        placeholder="Plan Type e.g., Modern Villa"
                                        value={editingType.catId === cat._id ? editingType.name : typeName}
                                        onChange={(e) =>
                                            editingType.catId === cat._id
                                                ? setEditingType({ ...editingType, name: e.target.value })
                                                : setTypeName(e.target.value)
                                        }
                                        className="w-full mb-2 p-2.5 border border-blue-100 rounded-lg text-sm outline-none focus:border-blue-300"
                                    />

                                    <input
                                        type="file"
                                        onChange={(e) =>
                                            editingType.catId === cat._id
                                                ? setEditingType({ ...editingType, image: e.target.files[0] })
                                                : setTypeImage(e.target.files[0])
                                        }
                                        className="w-full mb-2 text-xs"
                                    />

                                    {editingType.catId === cat._id ? (
                                        <div className="flex gap-2">
                                            <button onClick={handleSavePlanType} className="bg-green-600 text-white px-3 py-1.5 text-sm font-medium rounded-lg flex-1 flex justify-center items-center gap-1">
                                                <FaSave /> Save
                                            </button>
                                            <button onClick={() => setEditingType({ catId: null, typeId: null, name: "", image: null })} className="bg-[#2A2B2F] text-gray-200 px-3 py-1.5 text-sm font-medium rounded-lg flex-1 flex justify-center items-center gap-1">
                                                <FaTimes /> Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleAddPlanType(cat._id)} className="bg-white text-black px-3 py-1.5 text-sm font-medium rounded-lg w-full flex justify-center items-center gap-1">
                                            <FaPlus /> Add Plan Type
                                        </button>
                                    )}
                                </div>

                                {/* PLAN TYPES LIST */}
                                <div className="flex flex-wrap gap-2">
                                    {cat.planTypes && cat.planTypes.map((type) => (
                                        <div key={type._id} className="bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex gap-2 items-center border border-blue-100">
                                            {type.name}
                                            <button onClick={() => handleEditPlanType(cat._id, type)} className="text-blue-500 hover:text-blue-700">
                                                <FaEdit className="text-xs" />
                                            </button>
                                            <button onClick={() => handleDeletePlanType(cat._id, type._id)} className="text-red-500 hover:text-red-700">
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!cat.planTypes || cat.planTypes.length === 0) && (
                                        <p className="text-xs text-[#6B7280] italic">No plan types added yet.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {categories.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F] text-[#8E929C]">
                            No categories found. Start by creating one above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPlanCategoryDashboard;
