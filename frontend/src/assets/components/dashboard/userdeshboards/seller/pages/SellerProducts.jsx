import React, { useEffect, useState, useContext } from "react";
import API from "../../../../../api/api";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaImage, FaBox, FaCube, FaCheck } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../../../../../utils/imageUtils";
import { LanguageContext } from "../../../context/LanguageContext";
import { translations } from "../../../translations";
import ARViewer from "../../../../ARViewer";

const SellerProducts = () => {
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        name: "", description: "", price: "", stock: "", category: "", subcategory: "", type: "", brand: "",
        material: "", color: "", dimensions: "", weight: "", warranty: "", origin: "", features: "", care_instructions: "",
        images: [], imageLink: "",
        variants: [],
        arModelUrl: "", arModelScale: "1 1 1", arModelRotation: "0deg 0deg 0deg", arModelFile: null,
        pricingTiers: { architect: "", stinchar: "", normal: "", bulk: [] }
    });

    const fetchProducts = async () => {
        try {
            const { data } = await API.get("/products");
            setProducts(data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await API.get("/categories");
            setCategories(data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setForm({ ...form, images: files, imageLink: "" });
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const resetForm = () => {
        setForm({
            name: "", description: "", price: "", stock: "", category: "", subcategory: "", type: "",
            brand: "", material: "", color: "", dimensions: "", weight: "", warranty: "", origin: "",
            features: "", care_instructions: "", images: [], imageLink: "", variants: [],
            arModelUrl: "", arModelScale: "1 1 1", arModelRotation: "0deg 0deg 0deg", arModelFile: null,
            pricingTiers: { architect: "", stinchar: "", normal: "", bulk: [] }
        });
        setEditing(null); setPreviews([]); setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== undefined) {
                    if (k === 'pricingTiers' || k === 'variants') {
                        formData.append(k, JSON.stringify(v));
                    } else if (k === 'features' && typeof v === 'string') {
                        formData.append(k, v);
                    } else if (k === 'arModelUrl' && !form.arModelFile) {
                        formData.append(k, v);
                    } else if (k === 'arModelFile' && v instanceof File) {
                        formData.append('arModelFile', v);
                    } else if (k === 'images' && Array.isArray(v)) {
                        v.forEach(img => formData.append('images', img));
                    } else if (k !== 'arModelUrl' && k !== 'arModelFile' && k !== 'images') {
                        formData.append(k, v);
                    }
                }
            });
            if (editing) {
                await API.put(`/products/${editing._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            } else {
                await API.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
            }
            resetForm();
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving product");
        }
    };

    const handleEdit = (p) => {
        setForm({
            name: p.name || "", description: p.description || "", price: p.price || "", stock: p.stock || "",
            category: p.category || "", subcategory: p.subcategory || "", type: p.type || "",
            brand: p.brand || "", material: p.material || "", color: p.color || "", dimensions: p.dimensions || "",
            weight: p.weight || "", warranty: p.warranty || "", origin: p.origin || "",
            features: (p.features || []).join(", "), care_instructions: p.care_instructions || "",
            images: [], imageLink: p.images?.[0]?.public_id === 'external' ? p.images[0].url : "",
            variants: p.variants || [],
            arModelUrl: p.arModelUrl || "", arModelScale: p.arModelScale || "1 1 1", arModelRotation: p.arModelRotation || "0deg 0deg 0deg", arModelFile: null,
            pricingTiers: p.pricingTiers || { architect: "", stinchar: "", normal: "", bulk: [] }
        });
        setEditing(p);
        setPreviews(p.images ? p.images.map(img => img.url) : []);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try { await API.delete(`/products/${id}`); fetchProducts(); } catch (err) { alert("Delete failed"); }
    };

    const filtered = products.filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
    
    // Updated Input Class for Knockturnals Style
    const inputCls = "premium-input w-full";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t.products}</h1>
                    <p className="text-[14px] text-gray-500 mt-1">Manage and monitor your product catalog</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[14px] font-bold shadow-lg shadow-orange-900/20 transition-all">
                    {showForm ? <FaTimes /> : <FaPlus />} {showForm ? "Close Form" : "Add New Product"}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="premium-card p-6 md:p-8 animate-in slide-in-from-top duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            {editing ? <FaEdit size={14} /> : <FaPlus size={14} />}
                        </div>
                        {editing ? "Edit Product" : "New Catalog Entry"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Identity</label>
                                <input name="name" required placeholder="Display Name" value={form.name} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Price (₹)</label>
                                    <input name="price" type="number" required placeholder="1,999" value={form.price} onChange={handleChange} className={inputCls} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Stock Level</label>
                                    <input name="stock" type="number" required placeholder="50" value={form.stock} onChange={handleChange} className={inputCls} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea name="description" required placeholder="Tell your customers about this product..." value={form.description} onChange={handleChange} rows={3} className={inputCls} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Main Category</label>
                                <select name="category" value={form.category} required onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })} className={inputCls}>
                                    <option value="" className="bg-[#1a1a1a]">Choose Category</option>
                                    {categories.map((c) => <option key={c.name} value={c.name} className="bg-[#1a1a1a]">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Subcategory</label>
                                <select name="subcategory" value={form.subcategory} required onChange={handleChange} disabled={!form.category} className={inputCls}>
                                    <option value="" className="bg-[#1a1a1a]">Choose Subcategory</option>
                                    {form.category && categories.find((c) => c.name === form.category)?.subcategories?.map((s) => <option key={s.name} value={s.name} className="bg-[#1a1a1a]">{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[["brand", "Brand"], ["material", "Material"], ["color", "Color"], ["dimensions", "Size"]].map(([k, l]) => (
                                <div key={k} className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">{l}</label>
                                    <input name={k} placeholder={l} value={form[k]} onChange={handleChange} className={inputCls} />
                                </div>
                            ))}
                        </div>

                        {/* Pricing Tiers - Styled like Knockturnals sections */}
                        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-6">
                            <h4 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div> B2B & Specialized Pricing (₹)
                            </h4>
                            <div className="grid sm:grid-cols-3 gap-6">
                                {[["architect", "Architect"], ["stinchar", "Partner"], ["normal", "Standard"]].map(([k, l]) => (
                                    <div key={k} className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">{l} Price</label>
                                        <input
                                            type="number"
                                            value={form.pricingTiers[k]}
                                            onChange={(e) => setForm({ ...form, pricingTiers: { ...form.pricingTiers, [k]: e.target.value } })}
                                            className={inputCls}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#262626]">
                            <button type="submit" className="flex-1 py-3 bg-white hover:bg-gray-100 text-black rounded-xl font-bold text-[14px] shadow-lg transition-colors">
                                {editing ? "Save Changes" : "Create Product"}
                            </button>
                            <button type="button" onClick={resetForm} className="flex-1 py-3 bg-[#1a1a1a] border border-[#262626] hover:bg-[#222] text-gray-400 rounded-xl font-bold text-[14px] transition-colors">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Header / Search */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name, category, or ID..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3 bg-[#141414] border border-[#262626] rounded-xl text-white text-[14px] focus:outline-none focus:border-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Table-like List for Professional Dashboard Feel */}
            <div className="premium-card overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-[#262626] text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Category</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-1 text-center">Stock</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24"><div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-gray-500">
                        <FaBox className="text-6xl mx-auto mb-4 opacity-10" />
                        <p className="text-lg font-medium">No results found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#262626]">
                        {filtered.map((p) => (
                            <div key={p._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-[#1a1a1a] transition-colors group">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-[#262626] flex-shrink-0">
                                        <img
                                            src={getOptimizedImage(p.images?.[0]?.url, 200)}
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            {...lazyImageProps}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[15px] font-bold text-white truncate">{p.name}</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate uppercase tracking-tighter">{p._id}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-center">
                                    <span className="px-3 py-1 bg-[#262626] rounded-full text-[11px] font-bold text-gray-400 uppercase tracking-wider">{p.category}</span>
                                </div>
                                <div className="md:col-span-2 text-center text-[15px] font-bold text-white">
                                    ₹{p.price?.toLocaleString()}
                                </div>
                                <div className="md:col-span-1 text-center">
                                    <div className={`text-[12px] font-bold ${p.stock > 10 ? "text-emerald-500" : p.stock > 0 ? "text-amber-500" : "text-red-500"}`}>
                                        {p.stock}
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex items-center justify-end gap-2 text-[18px]">
                                    <button onClick={() => handleEdit(p)} className="p-2 text-gray-500 hover:text-white hover:bg-[#262626] rounded-lg transition-all" title="Edit">
                                        <FaEdit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(p._id)} className="p-2 text-red-900/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProducts;
