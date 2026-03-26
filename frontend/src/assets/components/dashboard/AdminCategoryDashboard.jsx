// import React, { useEffect, useState } from "react";
// import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLayerGroup } from "react-icons/fa";
// import API from "../../api/api";
// import Nev from "../Nev";
// import { motion } from "framer-motion";

// const AdminCategoryDashboard = () => {
//   const [categories, setCategories] = useState([]);
//   const [categoryName, setCategoryName] = useState("");
//   const [categoryImage, setCategoryImage] = useState(null);
//   const [editingCategoryId, setEditingCategoryId] = useState(null);
//   const [subName, setSubName] = useState("");
//   const [subImage, setSubImage] = useState(null);
//   const [editingSub, setEditingSub] = useState({ catId: null, subId: null, name: "", image: null });

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const { data } = await API.get("/categories");
//       setCategories(data);
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // --- CRUD Operations ---
//   const handleAddOrEditCategory = async () => {
//     if (!categoryName.trim()) return alert("Category name is required");
//     const formData = new FormData();
//     formData.append("name", categoryName);
//     if (categoryImage) formData.append("categoryImage", categoryImage);

//     try {
//       if (editingCategoryId) {
//         await API.put(`/categories/${editingCategoryId}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         setEditingCategoryId(null);
//       } else {
//         await API.post("/categories", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }
//       setCategoryName("");
//       setCategoryImage(null);
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       alert("Operation failed.");
//     }
//   };

//   const handleDeleteCategory = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this category?")) return;
//     try {
//       await API.delete(`/categories/${id}`);
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       alert("Deletion failed.");
//     }
//   };

//   const handleEditCategory = (cat) => {
//     setCategoryName(cat.name);
//     setEditingCategoryId(cat._id);
//   };

//   const handleAddSubcategory = async (categoryId) => {
//     if (!subName.trim()) return alert("Subcategory name is required");
//     const formData = new FormData();
//     formData.append("name", subName);
//     if (subImage) formData.append("subcategoryImage", subImage);
//     try {
//       await API.post(`/categories/${categoryId}/subcategories`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setSubName("");
//       setSubImage(null);
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       alert("Subcategory creation failed.");
//     }
//   };

//   const handleSaveSubcategory = async () => {
//     const { catId, subId, name, image } = editingSub;
//     if (!name.trim()) return alert("Subcategory name is required");

//     const formData = new FormData();
//     formData.append("name", name);
//     if (image) formData.append("subcategoryImage", image);

//     try {
//       await API.put(`/categories/${catId}/subcategories/${subId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setEditingSub({ catId: null, subId: null, name: "", image: null });
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       alert("Subcategory update failed.");
//     }
//   };

//   const handleDeleteSubcategory = async (catId, subId) => {
//     if (!window.confirm("Delete this subcategory?")) return;
//     try {
//       await API.delete(`/categories/${catId}/subcategories/${subId}`);
//       fetchCategories();
//     } catch (err) {
//       console.error(err);
//       alert("Subcategory deletion failed.");
//     }
//   };

//   const handleEditSubcategory = (catId, sub) => {
//     setEditingSub({ catId, subId: sub._id, name: sub.name, image: null });
//   };

//   const getImageUrl = (img) => {
//     if (!img) return null;
//     if (img.startsWith("http")) return img;
//     if (img.startsWith("/uploads")) return `${img}`;
//     return `/uploads/categories/${img}`;
//   };

//   return (
//     <>
     
//       <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] text-gray-200 py-16 px-6 relative overflow-hidden">
//         {/* Background Glow */}
//         <div className="absolute inset-0 -z-10">
//           <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[180px] animate-pulse"></div>
//           <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[180px] animate-pulse"></div>
//         </div>

//         <div className="max-w-7xl mx-auto">
//           {/* Title */}
//           <div className="text-center mb-12">
//             <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
//               <FaLayerGroup /> Admin Category Control
//             </h1>
//             <p className="text-gray-400 mt-2 text-lg">
//               Manage your product categories and subcategories with style.
//             </p>
//           </div>

//           {/* Add/Edit Category Form */}
//           <motion.div
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
//           >
//             <h2 className="text-2xl font-semibold text-orange-400 mb-6">
//               {editingCategoryId ? "Edit Category" : "Create New Category"}
//             </h2>
//             <div className="flex flex-col sm:flex-row gap-4 items-center">
//               <input
//                 type="text"
//                 placeholder="Category name"
//                 value={categoryName}
//                 onChange={(e) => setCategoryName(e.target.value)}
//                 className="flex-1 p-3 rounded-xl bg-[#121212] border border-[#2b2b2b] text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-400 outline-none transition-all"
//               />

//               {/* Fixed File Input */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setCategoryImage(e.target.files[0])}
//                 className="file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 file:cursor-pointer bg-[#121212] border border-[#2b2b2b] text-gray-400 rounded-xl p-1.5 w-full sm:w-auto"
//               />

//               <div className="flex gap-2">
//                 <button
//                   onClick={handleAddOrEditCategory}
//                   className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all"
//                 >
//                   {editingCategoryId ? <><FaSave /> Save</> : <><FaPlus /> Add</>}
//                 </button>
//                 {editingCategoryId && (
//                   <button
//                     onClick={() => {
//                       setCategoryName("");
//                       setEditingCategoryId(null);
//                       setCategoryImage(null);
//                     }}
//                     className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
//                   >
//                     <FaTimes /> Cancel
//                   </button>
//                 )}
//               </div>
//             </div>
//           </motion.div>

//           {/* Category Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
//             {categories.map((cat) => (
//               <motion.div
//                 key={cat._id}
//                 whileHover={{ scale: 1.02 }}
//                 className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-lg hover:shadow-orange-400/20 transition-all duration-300 flex flex-col"
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex items-center gap-3">
//                     {cat.image && (
//                       <img
//                         src={getImageUrl(cat.image)}
//                         alt={cat.name}
//                         className="w-14 h-14 object-cover rounded-2xl border border-orange-500/30"
//                       />
//                     )}
//                     <h3 className="text-xl font-semibold capitalize text-white">{cat.name}</h3>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEditCategory(cat)}
//                       className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-full text-yellow-400"
//                     >
//                       <FaEdit />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteCategory(cat._id)}
//                       className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full text-red-400"
//                     >
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Subcategory Add/Edit Form */}
//                 <div className="bg-black/40 rounded-xl p-4 border border-white/10 mb-4">
//                   <p className="text-sm text-gray-400 mb-2 font-medium">
//                     {editingSub.catId === cat._id ? "Edit Subcategory" : "Add Subcategory"}
//                   </p>
//                   <div className="flex flex-wrap gap-2 items-center">
//                     <input
//                       type="text"
//                       placeholder="Subcategory Name"
//                       value={editingSub.catId === cat._id ? editingSub.name : subName}
//                       onChange={(e) =>
//                         editingSub.catId === cat._id
//                           ? setEditingSub({ ...editingSub, name: e.target.value })
//                           : setSubName(e.target.value)
//                       }
//                       className="flex-1 p-2.5 rounded-lg bg-[#121212] border border-[#2b2b2b] text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-400 outline-none"
//                     />

//                     {/* Fixed Subcategory File Input */}
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) =>
//                         editingSub.catId === cat._id
//                           ? setEditingSub({ ...editingSub, image: e.target.files[0] })
//                           : setSubImage(e.target.files[0])
//                       }
//                       className="file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 file:cursor-pointer bg-[#121212] border border-[#2b2b2b] text-gray-400 rounded-lg p-1 w-full sm:w-auto"
//                     />

//                     {editingSub.catId === cat._id ? (
//                       <>
//                         <button
//                           onClick={handleSaveSubcategory}
//                           className="p-2 bg-green-600 hover:bg-green-500 rounded-lg"
//                         >
//                           <FaSave />
//                         </button>
//                         <button
//                           onClick={() => setEditingSub({ catId: null, subId: null, name: "", image: null })}
//                           className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
//                         >
//                           <FaTimes />
//                         </button>
//                       </>
//                     ) : (
//                       <button
//                         onClick={() => handleAddSubcategory(cat._id)}
//                         className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
//                       >
//                         <FaPlus />
//                       </button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Subcategory List */}
//                 <div className="flex flex-wrap gap-2 mt-auto max-h-40 overflow-y-auto">
//                   {cat.subcategories.length > 0 ? (
//                     cat.subcategories.map((sub) => (
//                       <div
//                         key={sub._id}
//                         className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm text-gray-300"
//                       >
//                         {sub.image && (
//                           <img
//                             src={getImageUrl(sub.image)}
//                             alt={sub.name}
//                             className="w-5 h-5 rounded-full object-cover"
//                           />
//                         )}
//                         <span className="capitalize">{sub.name}</span>
//                         <button
//                           onClick={() => handleEditSubcategory(cat._id, sub)}
//                           className="text-yellow-400 hover:text-yellow-300"
//                         >
//                           <FaEdit className="w-3 h-3" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteSubcategory(cat._id, sub._id)}
//                           className="text-red-400 hover:text-red-300"
//                         >
//                           <FaTimes className="w-3 h-3" />
//                         </button>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-500 text-sm italic">No subcategories yet.</p>
//                   )}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminCategoryDashboard;
import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaLayerGroup } from "react-icons/fa";
import { motion } from "framer-motion";
import { getOptimizedImage } from "../../utils/imageUtils";
import API from "../../api/api";
import Nev from "../Nev";

const AdminCategoryDashboard = () => {
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
      const { data } = await API.get("/categories");
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
        await API.put(`/categories/${editingCategoryId}`, formData);
        setEditingCategoryId(null);
      } else {
        await API.post("/categories", formData);
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
    await API.delete(`/categories/${id}`);
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

    await API.post(`/categories/${catId}/subcategories`, formData);
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

    await API.put(`/categories/${catId}/subcategories/${subId}`, formData);
    setEditingSub({ catId: null, subId: null, name: "", image: null });
    fetchCategories();
  };

  const handleDeleteSubcategory = async (catId, subId) => {
    if (!window.confirm("Delete subcategory?")) return;
    await API.delete(`/categories/${catId}/subcategories/${subId}`);
    fetchCategories();
  };


  return (
    <>
     

      <div className="min-h-screen bg-[#121212] py-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* TITLE */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent flex items-left justify-center gap-3">
              <FaLayerGroup /> Product Category Explorer
            </h1>
            <p className="text-[#8E929C] mt-2">
              Manage categories & subcategories
            </p>
          </div>

          {/* ADD CATEGORY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl p-6 shadow-sm mb-10"
          >
            <h2 className="text-sm font-bold text-blue-400 capitalize mb-4">
              {editingCategoryId ? "Edit Category" : "Add Category"}
            </h2>

            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="flex-1 p-3 bg-[#121212] border border-[#2A2B2F] rounded-lg text-white"
              />

                className="border border-[#2A2B2F] bg-[#121212] rounded-lg p-2 text-[#8E929C] text-sm"

              <button
                onClick={handleAddOrEditCategory}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                {editingCategoryId ? <FaSave /> : <FaPlus />}
                {editingCategoryId ? "Save" : "Add"}
              </button>

              {editingCategoryId && (
                <button
                  onClick={() => {
                    setCategoryName("");
                    setEditingCategoryId(null);
                  }}
                  className="bg-[#2A2B2F] text-white px-4 py-3 rounded-lg hover:bg-[#323338]"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </motion.div>

          {/* CATEGORY GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl p-5 shadow-sm flex flex-col hover:border-blue-500/30 transition-colors">

                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {cat.image && (
                      <img src={getOptimizedImage(cat.image)} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#2A2B2F]" />
                    )}
                    <h3 className="font-bold text-lg capitalize text-white">{cat.name}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleEditCategory(cat)} className="text-blue-600">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* ADD / EDIT SUB */}
                <div className="bg-[#121212] p-4 rounded-xl mb-4 border border-[#2A2B2F]">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase mb-3 px-1">{editingSub.catId === cat._id ? "Editing Sub" : "Add Subcategory"}</p>
                  <input
                    type="text"
                    placeholder="Subcategory name"
                    value={editingSub.catId === cat._id ? editingSub.name : subName}
                    onChange={(e) =>
                      editingSub.catId === cat._id
                        ? setEditingSub({ ...editingSub, name: e.target.value })
                        : setSubName(e.target.value)
                    }
                    className="w-full mb-3 p-2.5 bg-[#1A1B1E] border border-[#2A2B2F] rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) =>
                        editingSub.catId === cat._id
                          ? setEditingSub({ ...editingSub, image: e.target.files[0] })
                          : setSubImage(e.target.files[0])
                      }
                      className="flex-1 text-[10px] text-[#6B7280]"
                    />

                    {editingSub.catId === cat._id ? (
                      <div className="flex gap-1">
                        <button onClick={handleSaveSubcategory} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700">
                          <FaSave />
                        </button>
                        <button onClick={() => setEditingSub({ catId: null, subId: null, name: "", image: null })} className="bg-[#2A2B2F] text-white p-2 rounded-lg">
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleAddSubcategory(cat._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold">
                        <FaPlus size={12}/>
                      </button>
                    )}
                  </div>
                </div>

                {/* SUB LIST */}
                <div className="flex flex-wrap gap-2 mt-auto p-1">
                  {cat.subcategories.map((sub) => (
                    <div key={sub._id} className="bg-[#121212] border border-[#2A2B2F] px-3 py-1.5 rounded-xl text-xs text-[#8E929C] flex gap-2 items-center hover:border-blue-500/50 transition-colors group">
                      {sub.image && (
                        <img src={getOptimizedImage(sub.image)} alt="" className="w-5 h-5 rounded-md object-cover" />
                      )}
                      <span className="flex-1">{sub.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditSubcategory(cat._id, sub)} className="text-blue-400 hover:text-blue-300">
                          <FaEdit size={12}/>
                        </button>
                        <button onClick={() => handleDeleteSubcategory(cat._id, sub._id)} className="text-red-400 hover:text-red-300">
                          <FaTimes size={12}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {cat.subcategories.length === 0 && <p className="text-[10px] text-[#6B7280] italic">No subcategories yet</p>}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCategoryDashboard;
