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
    <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-md">
      <div className="flex items-center gap-3 mb-8">
        <FaLayerGroup className="text-orange-500 text-2xl" />
        <h2 className="text-xl font-bold text-gray-800">Service Category Management</h2>
      </div>

      {/* ADD CATEGORY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50/50 rounded-xl p-6 mb-10 border border-orange-100"
      >
        <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4">
          {editingCategoryId ? "Edit Service Category" : "Add New Service Category"}
        </h3>

        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Category name (e.g. Home Cleaning)"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="flex-1 p-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <input
            type="file"
            onChange={(e) => setCategoryImage(e.target.files[0])}
            className="border border-orange-200 rounded-xl p-2 bg-white text-sm"
          />

          <button
            onClick={handleAddOrEditCategory}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition shadow-sm"
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
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </motion.div>

      {/* CATEGORY GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col hover:border-orange-200 transition">

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {cat.image && (
                  <img src={getImageUrl(cat.image)} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                )}
                <div>
                    <h4 className="font-bold text-lg text-gray-800 capitalize">{cat.name}</h4>
                    <p className="text-xs text-gray-500">{cat.subcategories?.length || 0} Subcategories</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleEditCategory(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* ADD / EDIT SUB */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                {editingSub.catId === cat._id ? "Editing Subcategory" : "Add Subcategory"}
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subcategory name"
                  value={editingSub.catId === cat._id ? editingSub.name : subName}
                  onChange={(e) =>
                    editingSub.catId === cat._id
                      ? setEditingSub({ ...editingSub, name: e.target.value })
                      : setSubName(e.target.value)
                  }
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-orange-400 outline-none"
                />

                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        onChange={(e) =>
                        editingSub.catId === cat._id
                            ? setEditingSub({ ...editingSub, image: e.target.files[0] })
                            : setSubImage(e.target.files[0])
                        }
                        className="flex-1 text-xs file:hidden"
                    />

                    {editingSub.catId === cat._id ? (
                        <div className="flex gap-1">
                            <button onClick={handleSaveSubcategory} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition shadow-sm">
                            <FaSave />
                            </button>
                            <button onClick={() => setEditingSub({ catId: null, subId: null, name: "", image: null })} className="bg-gray-300 text-gray-700 p-2 rounded-lg">
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => handleAddSubcategory(cat._id)} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition shadow-sm font-bold text-sm">
                        <FaPlus /> Add
                        </button>
                    )}
                </div>
              </div>
            </div>

            {/* SUB LIST */}
            <div className="flex flex-wrap gap-2 overflow-y-auto max-h-40 p-1">
              {cat.subcategories?.map((sub) => (
                <div key={sub._id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-sm flex gap-3 items-center shadow-sm group hover:border-orange-300 transition">
                  {sub.image && <img src={getImageUrl(sub.image)} className="w-5 h-5 rounded-md object-cover" />}
                  <span className="font-medium text-gray-700">{sub.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEditSubcategory(cat._id, sub)} className="text-blue-500 hover:scale-110">
                        <FaEdit size={12} />
                    </button>
                    <button onClick={() => handleDeleteSubcategory(cat._id, sub._id)} className="text-red-500 hover:scale-110">
                        <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cat.subcategories.length === 0 && <p className="text-xs text-gray-400 italic">No subcategories yet</p>}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminServiceCategoryDashboard;
