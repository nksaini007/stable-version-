import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { 
    FaMoneyBillWave, FaTruck, FaRocket, FaSave, 
    FaPercentage, FaCheckCircle, FaExclamationTriangle,
    FaSync
} from "react-icons/fa";
import { AuthContext } from "../../../../../context/AuthContext";


export default function AdminPricingControl() {
    const { token } = useContext(AuthContext);
    const [settings, setSettings] = useState({
        platformCommissionRate: 2,
        isDeliveryFree: false,
        adAutoActivate: false,
        minCartValue: 500,
        maxCartValue: 50000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/config/admin");
            if (data.settings) {
                setSettings({
                    platformCommissionRate: data.settings.platformCommissionRate ?? 2,
                    isDeliveryFree: data.settings.isDeliveryFree ?? false,
                    adAutoActivate: data.settings.adAutoActivate ?? false,
                    minCartValue: data.settings.minCartValue ?? 500,
                    maxCartValue: data.settings.maxCartValue ?? 50000
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await API.put("/config/settings", { settings });
            setMessage({ type: "success", text: "Settings updated successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update settings." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <FaSync className="text-[#6B7280] animate-spin text-3xl" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#8E929C] flex items-center gap-3">
                    <FaMoneyBillWave className="text-[#6B7280]" /> Platform Pricing Control
                </h1>
                <p className="text-[#6B7280] mt-2">Manage commissions, delivery fees, and automation settings.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    message.type === "success" 
                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                    {message.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span className="font-semibold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Commission Setting */}
                <div className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 backdrop-blur-md rounded-3xl p-6 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                        <FaPercentage size={20} />
                    </div>
                    <h3 className="text-[#8E929C] font-bold text-lg mb-1">Platform Commission</h3>
                    <p className="text-[#6B7280] text-xs mb-6">Percentage fee taken from every seller sale.</p>
                    
                    <div className="relative">
                        <input 
                            type="number" 
                            step="0.1"
                            value={settings.platformCommissionRate}
                            onChange={(e) => setSettings({...settings, platformCommissionRate: Number(e.target.value)})}
                            className="w-full bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-2xl px-5 py-4 text-[#8E929C] font-black text-2xl focus:outline-none focus:border-white/50 transition-all"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold text-xl">%</span>
                    </div>
                </div>

                {/* Delivery Setting */}
                <div className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 backdrop-blur-md rounded-3xl p-6 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 mb-5 group-hover:scale-110 transition-transform">
                        <FaTruck size={20} />
                    </div>
                    <h3 className="text-[#8E929C] font-bold text-lg mb-1">Free Delivery</h3>
                    <p className="text-[#6B7280] text-xs mb-6">Enable to zero out all delivery charges platform-wide.</p>
                    
                    <div className="flex items-center justify-between bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-2xl px-5 py-4">
                        <span className="text-[#8E929C] font-bold">Status: {settings.isDeliveryFree ? "FREE" : "PAID"}</span>
                        <button 
                            onClick={() => setSettings({...settings, isDeliveryFree: !settings.isDeliveryFree})}
                            className={`w-14 h-7 rounded-full transition-all relative ${settings.isDeliveryFree ? "bg-green-500" : "bg-gray-700"}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-[#1A1B1E] border border-[#2A2B2F] transition-all ${settings.isDeliveryFree ? "left-8" : "left-1"}`} />
                        </button>
                    </div>
                </div>

                {/* Ad Activation Setting */}
                <div className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 backdrop-blur-md rounded-3xl p-6 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                        <FaRocket size={20} />
                    </div>
                    <h3 className="text-[#8E929C] font-bold text-lg mb-1">Instant Ad Launch</h3>
                    <p className="text-[#6B7280] text-xs mb-6">If enabled, ads activate immediately without payment/approval.</p>
                    
                    <div className="flex items-center justify-between bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-2xl px-5 py-4">
                        <span className="text-[#8E929C] font-bold">{settings.adAutoActivate ? "INSTANT" : "MANUAL"}</span>
                        <button 
                            onClick={() => setSettings({...settings, adAutoActivate: !settings.adAutoActivate})}
                            className={`w-14 h-7 rounded-full transition-all relative ${settings.adAutoActivate ? "bg-purple-500" : "bg-gray-700"}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-[#1A1B1E] border border-[#2A2B2F] transition-all ${settings.adAutoActivate ? "left-8" : "left-1"}`} />
                        </button>
                    </div>
                </div>

                {/* Min Order Value Setting */}
                <div className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 backdrop-blur-md rounded-3xl p-6 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                        <FaMoneyBillWave size={20} />
                    </div>
                    <h3 className="text-[#8E929C] font-bold text-lg mb-1">Min Order for Direct Purchase</h3>
                    <p className="text-[#6B7280] text-xs mb-6">Orders below this amount will require a quotation review.</p>
                    
                    <div className="relative">
                        <input 
                            type="number" 
                            value={settings.minCartValue}
                            onChange={(e) => setSettings({...settings, minCartValue: Number(e.target.value)})}
                            className="w-full bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-2xl px-5 py-4 text-[#8E929C] font-black text-2xl focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold text-xl ml-[-15px]">₹</span>
                    </div>
                </div>

                {/* Max Order Value Setting */}
                <div className="bg-[#1A1B1E] border border-[#2A2B2F]/[0.03] border border-white/5 backdrop-blur-md rounded-3xl p-6 hover:border-white/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                        <FaRocket size={20} />
                    </div>
                    <h3 className="text-[#8E929C] font-bold text-lg mb-1">Max Order for Direct Purchase</h3>
                    <p className="text-[#6B7280] text-xs mb-6">Orders above this amount will trigger a mandatory quotation request.</p>
                    
                    <div className="relative">
                        <input 
                            type="number" 
                            value={settings.maxCartValue}
                            onChange={(e) => setSettings({...settings, maxCartValue: Number(e.target.value)})}
                            className="w-full bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-2xl px-5 py-4 text-[#8E929C] font-black text-2xl focus:outline-none focus:border-pink-500/50 transition-all"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280] font-bold text-xl ml-[-15px]">₹</span>
                    </div>
                </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-400 hover:to-gray-300 text-white px-8 py-4 rounded-3xl font-black text-lg transition-all -[0_10px_30px_rgba(59,130,246,0.3)] hover:-[0_15px_40px_rgba(59,130,246,0.5)] active:scale-95 disabled:opacity-50"
                >
                    {saving ? <FaSync className="animate-spin" /> : <FaSave />}
                    {saving ? "Saving Changes..." : "Save Configuration"}
                </button>
            </div>

            {/* Note Section */}
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6 mt-8 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <FaExclamationTriangle />
                </div>
                <div>
                    <h4 className="text-orange-400 font-bold mb-1">Impact Warning</h4>
                    <p className="text-[#6B7280] text-sm">Changing these values will affect all future transactions and campaigns immediately. Existing ad campaigns and ongoing orders will not be retrospectively changed.</p>
                </div>
            </div>
        </div>
    );
}
