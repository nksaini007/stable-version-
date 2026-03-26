import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLayerGroup } from "react-icons/fa";
import { motion } from "framer-motion";
import API from "../../api/api";

const AdminServiceCategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [subName, setSubName] = useState("");
  const [subImage, setSubImage] = useState(null);
  const [editingSub, setEditingSub] = useState({
    catId: null,
    subId: null,
    name: "",
    image: null,
  });

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/service-categories");
      setCategories(data);
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
        await API.put(`/service-categories/${editingCategoryId}`, formData);
        setEditingCategoryId(null);
      } else {
        await API.post("/service-categories", formData);
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
    await API.delete(`/service-categories/${id}`);
    fetchCategories();
  };

  const handleEditCategory = (cat) => {
    setCategoryName(cat.name);
    setEditingCategoryId(cat._id);
  };

  // ================= SUBCATEGORY =================
  const handleAddSubcategory = async (catId) => {
    if (!subName.trim()) return alert("Subcategory name required");

    const formData = new FormData();
    formData.append("name", subName);
    if (subImage) formData.append("subcategoryImage", subImage);

    await API.post(`/service-categories/${catId}/subcategories`, formData);
    setSubName("");
    setSubImage(null);
    fetchCategories();
  };

  const handleEditSubcategory = (catId, sub) => {
    setEditingSub({ catId, subId: sub._id, name: sub.name, image: null });
  };

  const handleSaveSubcategory = async () => {
    const { catId, subId, name, image } = editingSub;
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("subcategoryImage", image);

    await API.put(`/service-categories/${catId}/subcategories/${subId}`, formData);
    setEditingSub({ catId: null, subId: null, name: "", image: null });
    fetchCategories();
  };

  const handleDeleteSubcategory = async (catId, subId) => {
    if (!window.confirm("Delete subcategory?")) return;
    await API.delete(`/service-categories/${catId}/subcategories/${subId}`);
    fetchCategories();
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${img}`;
  };

  return (
    <div className="bg-[#121212] min-h-screen py-6 px-4">
      <div className="flex items-center gap-3 mb-8">
        <FaLayerGroup className="text-blue-500 text-2xl" />
        <h2 className="text-xl font-bold text-white">Service Category Hub</h2>
      </div>

      {/* ADD CATEGORY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1B1E] rounded-2xl p-6 mb-10 border border-[#2A2B2F]"
      >
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6 px-1">
          {editingCategoryId ? "Update Service Category" : "Draft New Service Category"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Category name (e.g. Home Cleaning)"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="flex-1 p-4 bg-[#121212] border border-[#2A2B2F] rounded-xl text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />

          <input
            type="file"
            onChange={(e) => setCategoryImage(e.target.files[0])}
            className="border border-[#2A2B2F] bg-[#121212] rounded-xl p-3 text-xs text-[#8E929C]"
          />

          <button
            onClick={handleAddOrEditCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-blue-500/10"
          >
            {editingCategoryId ? <FaSave /> : <FaPlus />}
            {editingCategoryId ? "Save" : "Create"}
          </button>

          {editingCategoryId && (
            <button
              onClick={() => {
                setCategoryName("");
                setEditingCategoryId(null);
                setCategoryImage(null);
              }}
              className="bg-[#2A2B2F] hover:bg-[#323338] text-white px-5 py-4 rounded-xl transition"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </motion.div>

      {/* CATEGORY GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl p-6 shadow-sm flex flex-col hover:border-blue-500/20 transition-colors group">

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {cat.image && (
                  <img src={getImageUrl(cat.image)} alt="" className="w-16 h-16 rounded-2xl object-cover border border-[#2A2B2F]" />
                )}
                <div>
                    <h4 className="font-bold text-lg text-white capitalize tracking-tight">{cat.name}</h4>
                    <p className="text-xs text-[#8E929C]">{cat.subcategories?.length || 0} Subcategories</p>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditCategory(cat)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* ADD / EDIT SUB */}
            <div className="bg-[#121212] p-5 rounded-2xl mb-6 border border-[#2A2B2F]">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4 px-1">
                {editingSub.catId === cat._id ? "Adjusting Subcategory" : "Draft Subcategory"}
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subcategory name"
                  value={editingSub.catId === cat._id ? editingSub.name : subName}
                  onChange={(e) =>
                    editingSub.catId === cat._id
                      ? setEditingSub({ ...editingSub, name: e.target.value })
                      : setSubName(e.target.value)
                  }
                  className="w-full p-3 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />

                <div className="flex gap-3 items-center">
                    <input
                        type="file"
                        onChange={(e) =>
                        editingSub.catId === cat._id
                            ? setEditingSub({ ...editingSub, image: e.target.files[0] })
                            : setSubImage(e.target.files[0])
                        }
                        className="flex-1 text-[10px] text-[#6B7280] file:hidden"
                    />

                    {editingSub.catId === cat._id ? (
                        <div className="flex gap-2">
                            <button onClick={handleSaveSubcategory} className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition">
                            <FaSave />
                            </button>
                            <button onClick={() => setEditingSub({ catId: null, subId: null, name: "", image: null })} className="bg-[#2A2B2F] text-white p-2.5 rounded-xl">
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => handleAddSubcategory(cat._id)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold text-xs uppercase tracking-tighter">
                        <FaPlus className="inline mr-1" /> Add
                        </button>
                    )}
                </div>
              </div>
            </div>

            {/* SUB LIST */}
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-48 p-1">
              {cat.subcategories?.map((sub) => (
                <div key={sub._id} className="bg-[#121212] border border-[#2A2B2F] px-4 py-2 rounded-2xl text-xs flex gap-3 items-center shadow-sm group hover:border-blue-500/40 transition-colors">
                  {sub.image && <img src={getImageUrl(sub.image)} className="w-6 h-6 rounded-lg object-cover border border-[#2A2B2F]" />}
                  <span className="font-medium text-[#8E929C] group-hover:text-blue-400 transition-colors">{sub.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <button onClick={() => handleEditSubcategory(cat._id, sub)} className="text-blue-500 hover:scale-110 transition-transform">
                        <FaEdit size={12} />
                    </button>
                    <button onClick={() => handleDeleteSubcategory(cat._id, sub._id)} className="text-red-500 hover:scale-110 transition-transform">
                        <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cat.subcategories.length === 0 && <p className="text-[10px] text-[#6B7280] italic px-1">No services listed yet</p>}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminServiceCategoryDashboard;
