import React, { useEffect, useState } from "react";
import API from "../../../../../api/api";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaImage, FaBox } from "react-icons/fa";
import { getOptimizedImage, lazyImageProps } from "../../../../../utils/imageUtils";

const SellerProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        name: "", description: "", price: "", stock: "", category: "", subcategory: "", type: "", brand: "",
        material: "", color: "", dimensions: "", weight: "", warranty: "", origin: "", features: "", care_instructions: "", 
        image: null, imageLink: "",
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
        const file = e.target.files[0];
        setForm({ ...form, image: file });
        if (file) setPreview(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setForm({ 
            name: "", description: "", price: "", stock: "", category: "", subcategory: "", type: "", 
            brand: "", material: "", color: "", dimensions: "", weight: "", warranty: "", origin: "", 
            features: "", care_instructions: "", image: null, imageLink: "",
            pricingTiers: { architect: "", stinchar: "", normal: "", bulk: [] }
        });
        setEditing(null); setPreview(null); setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { 
                if (v !== null && v !== undefined) {
                    if (k === 'pricingTiers') {
                        formData.append(k, JSON.stringify(v));
                    } else if (k === 'features' && typeof v === 'string') {
                        formData.append(k, v);
                    } else {
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
            image: null, imageLink: p.images?.[0]?.public_id === 'external' ? p.images[0].url : "",
            pricingTiers: p.pricingTiers || { architect: "", stinchar: "", normal: "", bulk: [] }
        });
        setEditing(p);
        setPreview(p.images?.[0]?.url ? `${p.images[0].url}` : null);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try { await API.delete(`/products/${id}`); fetchProducts(); } catch (err) { alert("Delete failed"); }
    };

    const filtered = products.filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-300 outline-none bg-white";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                    <FaPlus /> {showForm ? "Close" : "Add Product"}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">{editing ? "Edit Product" : "Add New Product"}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input name="name" required placeholder="Product Name" value={form.name} onChange={handleChange} className={inputCls} />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="price" type="number" required placeholder="Price (₹)" value={form.price} onChange={handleChange} className={inputCls} />
                                <input name="stock" type="number" required placeholder="Stock" value={form.stock} onChange={handleChange} className={inputCls} />
                            </div>
                        </div>
                        <textarea name="description" required placeholder="Description" value={form.description} onChange={handleChange} rows={2} className={inputCls} />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <select name="category" value={form.category} required onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })} className={inputCls}>
                                <option value="">Select Category</option>
                                {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <select name="subcategory" value={form.subcategory} required onChange={handleChange} disabled={!form.category} className={inputCls}>
                                <option value="">Select Subcategory</option>
                                {form.category && categories.find((c) => c.name === form.category)?.subcategories?.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {[["type", "Type"], ["brand", "Brand"], ["material", "Material"], ["color", "Color"], ["dimensions", "Dimensions"], ["weight", "Weight"], ["warranty", "Warranty"], ["origin", "Origin"]].map(([k, l]) => (
                                <input key={k} name={k} placeholder={l} value={form[k]} onChange={handleChange} className={inputCls} />
                            ))}
                        </div>
                        <input name="features" placeholder="Features (comma separated)" value={form.features} onChange={handleChange} className={inputCls} />
                        
                        {/* Pricing Tiers Section */}
                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-4">
                            <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider">Pricing_Tiers (₹)</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-orange-600 block mb-1">ARCHITECT_PRICE</label>
                                    <input 
                                        type="number" 
                                        value={form.pricingTiers.architect} 
                                        onChange={(e) => setForm({...form, pricingTiers: {...form.pricingTiers, architect: e.target.value}})}
                                        className={inputCls} 
                                        placeholder="Architect Price"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-orange-600 block mb-1">STINCHAR_PURCHASE</label>
                                    <input 
                                        type="number" 
                                        value={form.pricingTiers.stinchar} 
                                        onChange={(e) => setForm({...form, pricingTiers: {...form.pricingTiers, stinchar: e.target.value}})}
                                        className={inputCls} 
                                        placeholder="Stinchar Price"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-orange-600 block mb-1">NORMAL_CUSTOMER</label>
                                    <input 
                                        type="number" 
                                        value={form.pricingTiers.normal} 
                                        onChange={(e) => setForm({...form, pricingTiers: {...form.pricingTiers, normal: e.target.value}})}
                                        className={inputCls} 
                                        placeholder="Standard Price"
                                    />
                                </div>
                            </div>

                            {/* Bulk Pricing */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-orange-600 uppercase">Bulk_Pricing_Tiers (Qty vs Price)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setForm({
                                            ...form, 
                                            pricingTiers: {
                                                ...form.pricingTiers, 
                                                bulk: [...form.pricingTiers.bulk, { minQty: "", price: "" }]
                                            }
                                        })}
                                        className="text-[10px] font-bold text-orange-600 hover:underline"
                                    >
                                        + ADD_TIER
                                    </button>
                                </div>
                                {form.pricingTiers.bulk.map((tier, bIdx) => (
                                    <div key={bIdx} className="grid grid-cols-3 gap-3 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                        <input 
                                            type="number" 
                                            placeholder="Min Qty" 
                                            value={tier.minQty} 
                                            onChange={(e) => {
                                                const newBulk = [...form.pricingTiers.bulk];
                                                newBulk[bIdx].minQty = e.target.value;
                                                setForm({...form, pricingTiers: {...form.pricingTiers, bulk: newBulk}});
                                            }}
                                            className={inputCls} 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Price (₹)" 
                                            value={tier.price} 
                                            onChange={(e) => {
                                                const newBulk = [...form.pricingTiers.bulk];
                                                newBulk[bIdx].price = e.target.value;
                                                setForm({...form, pricingTiers: {...form.pricingTiers, bulk: newBulk}});
                                            }}
                                            className={inputCls} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newBulk = form.pricingTiers.bulk.filter((_, i) => i !== bIdx);
                                                setForm({...form, pricingTiers: {...form.pricingTiers, bulk: newBulk}});
                                            }}
                                            className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <textarea name="care_instructions" placeholder="Care Instructions" value={form.care_instructions} onChange={handleChange} rows={2} className={inputCls} />
                        <div className="grid sm:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-medium ml-1">Product Image (File or URL)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                                        <FaImage className="text-orange-500" /> Upload
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                    <input 
                                        name="imageLink" 
                                        placeholder="Or paste Image URL..." 
                                        value={form.imageLink} 
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setForm({ ...form, imageLink: url, image: null });
                                            if (url) setPreview(url);
                                        }} 
                                        className={inputCls} 
                                    />
                                </div>
                            </div>
                            {preview && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                    <img 
                                        src={getOptimizedImage(preview, 200)} 
                                        alt="" 
                                        className="w-full h-full object-cover" 
                                        {...lazyImageProps}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition">{editing ? "Update" : "Add Product"}</button>
                            <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-semibold text-sm transition">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 outline-none bg-white" />
            </div>

            {/* Product List */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400"><FaBox className="text-4xl mx-auto mb-3 opacity-50" /><p>No products found</p></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p) => (
                        <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-40 bg-gray-100 overflow-hidden">
                                <img 
                                    src={getOptimizedImage(p.images?.[0]?.url, 500)} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    {...lazyImageProps}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-800 truncate">{p.name}</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">{p.category} / {p.subcategory}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-orange-600">₹{p.price?.toLocaleString()}</span>
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                        {p.stock > 0 ? `Stock: ${p.stock}` : "Out of Stock"}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => handleEdit(p)} className="flex-1 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-semibold hover:bg-orange-100 transition"><FaEdit className="inline mr-1" />Edit</button>
                                    <button onClick={() => handleDelete(p._id)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"><FaTrash className="inline mr-1" />Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerProducts;
