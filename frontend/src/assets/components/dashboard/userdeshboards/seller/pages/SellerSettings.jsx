import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../../context/AuthContext";
import API from "../../../../../api/api";
import { 
    FaStore, FaImage, FaMapMarkerAlt, FaPhone, FaEnvelope, 
    FaGlobe, FaCheckCircle, FaSave, FaFacebook, FaInstagram, 
    FaTwitter, FaLinkedin, FaClock, FaCalendarAlt 
} from "react-icons/fa";

const SellerSettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [previews, setPreviews] = useState({ profileImage: null, shopBanner: null });

    const [form, setForm] = useState({
        businessName: "", tagline: "", storeDescription: "", businessAddress: "",
        supportPhone: "", supportEmail: "", businessType: "", businessCategory: "",
        storePolicies: "", returnPolicy: "", shippingInfo: "", workingHours: "",
        socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
        profileImage: null, shopBanner: null
    });

    useEffect(() => {
        if (user) {
            setForm({
                businessName: user.businessName || "",
                tagline: user.tagline || "",
                storeDescription: user.storeDescription || "",
                businessAddress: user.businessAddress || "",
                supportPhone: user.supportPhone || "",
                supportEmail: user.supportEmail || "",
                businessType: user.businessType || "",
                businessCategory: user.businessCategory || "",
                storePolicies: user.storePolicies || "",
                returnPolicy: user.returnPolicy || "",
                shippingInfo: user.shippingInfo || "",
                workingHours: user.workingHours || "",
                socialLinks: user.socialLinks || { facebook: "", instagram: "", twitter: "", linkedin: "" },
                profileImage: null,
                shopBanner: null
            });
            setPreviews({
                profileImage: user.profileImage || null,
                shopBanner: user.shopBanner || null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setForm(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files[0]) {
            setForm(prev => ({ ...prev, [name]: files[0] }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key === "socialLinks") {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null) {
                formData.append(key, value);
            }
        });

        try {
            const { data } = await API.put("/users/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUser(data.user);
            setMessage({ type: "success", text: "Shop Profile Updated Successfully!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "premium-input w-full";
    const labelCls = "text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Shop Settings</h1>
                <p className="text-[14px] text-gray-500 mt-1">Configure your public business profile and store policies</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                    message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                    <FaCheckCircle /> {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                {/* Branding Section */}
                <div className="premium-card p-6 md:p-8 space-y-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaStore className="text-orange-500" /> Store Branding
                    </h3>

                    <div className="space-y-6">
                        {/* Banner Upload */}
                        <div className="space-y-2">
                            <label className={labelCls}>Shop Banner</label>
                            <label className="relative block h-48 md:h-64 rounded-2xl overflow-hidden cursor-pointer group border border-[#262626] bg-[#0a0a0a]">
                                {previews.shopBanner ? (
                                    <img src={previews.shopBanner} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                        <FaImage size={40} className="mb-2" />
                                        <p className="text-xs uppercase font-bold tracking-widest">Upload 1920x400 Banner</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-sm font-bold bg-[#1a1a1a] px-4 py-2 rounded-xl border border-white/10 shadow-2xl">Change Banner</span>
                                </div>
                                <input type="file" name="shopBanner" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Profile Image / Logo */}
                            <div className="shrink-0 space-y-2">
                                <label className={labelCls}>Shop Logo</label>
                                <label className="relative block w-32 h-32 rounded-full overflow-hidden cursor-pointer group border-4 border-[#141414] shadow-2xl bg-[#0a0a0a]">
                                    {previews.profileImage ? (
                                        <img src={previews.profileImage} alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                            <FaStore size={32} />
                                        </div>
                                    )}
                                    <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>

                            {/* Basic Identity */}
                            <div className="flex-1 grid md:grid-cols-2 gap-6 w-full">
                                <div className="space-y-2">
                                    <label className={labelCls}>Business Name</label>
                                    <input name="businessName" value={form.businessName} onChange={handleChange} className={inputCls} placeholder="e.g. Modern Furnishings" />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Shop Tagline</label>
                                    <input name="tagline" value={form.tagline} onChange={handleChange} className={inputCls} placeholder="e.g. Luxury meets affordability" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className={labelCls}>Store Description</label>
                                    <textarea name="storeDescription" value={form.storeDescription} onChange={handleChange} rows={3} className={inputCls} placeholder="Briefly describe your business..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact & Location */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="premium-card p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaPhone className="text-emerald-500" /> Support Contact
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className={labelCls}>Customer Support Email</label>
                                <input name="supportEmail" value={form.supportEmail} onChange={handleChange} className={inputCls} placeholder="support@yourshop.com" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelCls}>Customer Support Phone</label>
                                <input name="supportPhone" value={form.supportPhone} onChange={handleChange} className={inputCls} placeholder="+91 XXXX-XXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelCls}>Business Address</label>
                                <textarea name="businessAddress" value={form.businessAddress} onChange={handleChange} rows={2} className={inputCls} placeholder="Complete shop address..." />
                            </div>
                        </div>
                    </div>

                    <div className="premium-card p-6 md:p-8 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FaClock className="text-amber-500" /> Business Operations
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className={labelCls}>Working Hours</label>
                                <input name="workingHours" value={form.workingHours} onChange={handleChange} className={inputCls} placeholder="e.g. Mon-Sat: 10AM - 8PM" />
                            </div>
                            <div className="space-y-2">
                                <label className={labelCls}>Established (Year)</label>
                                <input name="established" type="date" value={form.established ? form.established.substring(0,10) : ""} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className={labelCls}>Business Type</label>
                                    <select name="businessType" value={form.businessType} onChange={handleChange} className={inputCls}>
                                        <option value="" className="bg-[#1a1a1a]">Select Type</option>
                                        <option value="Individual" className="bg-[#1a1a1a]">Individual</option>
                                        <option value="Partnership" className="bg-[#1a1a1a]">Partnership</option>
                                        <option value="Company" className="bg-[#1a1a1a]">Company</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelCls}>Category</label>
                                    <input name="businessCategory" value={form.businessCategory} onChange={handleChange} className={inputCls} placeholder="Retailer / Wholesaler" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policies Section */}
                <div className="premium-card p-6 md:p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" /> Store Policies
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className={labelCls}>Return & Refund Policy</label>
                            <textarea name="returnPolicy" value={form.returnPolicy} onChange={handleChange} rows={5} className={inputCls} placeholder="Detail your refund and return terms..." />
                        </div>
                        <div className="space-y-2">
                            <label className={labelCls}>Shipping & Delivery Info</label>
                            <textarea name="shippingInfo" value={form.shippingInfo} onChange={handleChange} rows={5} className={inputCls} placeholder="Provide details about delivery timelines..." />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="premium-card p-6 md:p-8 space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FaGlobe className="text-purple-500" /> Social Presence
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FaFacebook className="text-[#1877F2]" /> Facebook</label>
                            <input name="socialLinks.facebook" value={form.socialLinks.facebook} onChange={handleChange} className={inputCls} placeholder="Link" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FaInstagram className="text-[#E4405F]" /> Instagram</label>
                            <input name="socialLinks.instagram" value={form.socialLinks.instagram} onChange={handleChange} className={inputCls} placeholder="Link" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FaTwitter className="text-[#1DA1F2]" /> Twitter</label>
                            <input name="socialLinks.twitter" value={form.socialLinks.twitter} onChange={handleChange} className={inputCls} placeholder="Link" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FaLinkedin className="text-[#0A66C2]" /> LinkedIn</label>
                            <input name="socialLinks.linkedin" value={form.socialLinks.linkedin} onChange={handleChange} className={inputCls} placeholder="Link" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="sticky bottom-8 z-40 bg-[#141414]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                    <div className="hidden md:block">
                        <p className="text-xs text-gray-400 font-medium">Verify all details before committing changes</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button type="button" onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors">Discard</button>
                        <button type="submit" disabled={loading} className="flex-1 md:w-48 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 disabled:opacity-50 transition-all">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FaSave /> Save Profile</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SellerSettings;
