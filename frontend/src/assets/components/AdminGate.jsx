import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaKey, FaUserPlus, FaArrowLeft, FaCheck } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { toast } from "react-toastify";

const AdminGate = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [mode, setMode] = useState("login"); // "login" or "signup"
    const [step, setStep] = useState(1); // 1 = Master Key, 2 = Credentials
    const [adminMasterKey, setAdminMasterKey] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [adminAccessCode, setAdminAccessCode] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerifyMasterKey = (e) => {
        e.preventDefault();
        setError("");
        if (adminMasterKey.length < 6) {
            setError("Invalid master access key format.");
            return;
        }
        setStep(2);
    };

    const handleAdminAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "login") {
                const { data } = await API.post(`/users/x-admin-auth`, {
                    adminKey: adminMasterKey,
                    email,
                    password
                });
                login(data.user, data.token);
                toast.success("Identity Verified. Welcome Admin.");
                navigate("/admin");
            } else {
                // Admin Signup
                const fd = new FormData();
                fd.append("name", name);
                fd.append("email", email);
                fd.append("password", password);
                fd.append("role", "admin");
                fd.append("adminAccessCode", adminAccessCode);

                await API.post("/users/signup", fd);
                toast.success("Admin Registered Successfully! Please Login.");
                setMode("login");
                setStep(1);
                setPassword("");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden font-sans">
            {/* Neural Networking Background Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute inset-0" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-md"
                    >
                        <FaShieldAlt className="text-white text-3xl" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Master Control</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Stinchar Identity Layer — Access Grade 9</p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    
                    {/* Mode Toggle */}
                    <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
                        <button 
                            onClick={() => { setMode("login"); setStep(1); setError(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "login" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
                        >
                            <FaLock className="inline mr-2 mb-0.5" /> Portal Login
                        </button>
                        <button 
                            onClick={() => { setMode("signup"); setStep(1); setError(""); }}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "signup" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
                        >
                            <FaUserPlus className="inline mr-2 mb-0.5" /> Portal Signup
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Form Logic */}
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleVerifyMasterKey} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Universal Key</label>
                                    <div className="relative">
                                        <FaKey className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 text-sm" />
                                        <input
                                            type="password"
                                            value={adminMasterKey}
                                            onChange={(e) => setAdminMasterKey(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all placeholder-gray-700"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all text-xs tracking-[0.2em] uppercase shadow-xl">
                                    Initialize Session
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleAdminAuth} 
                                className="space-y-5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">✓ Key Verified</span>
                                    <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors">Change Key</button>
                                </div>

                                {mode === "signup" && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Identity</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Legal Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-gray-700"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="id@stinchar.gov"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-gray-700"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Encrypted Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-gray-700"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {mode === "signup" && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Token</label>
                                        <input
                                            type="password"
                                            value={adminAccessCode}
                                            onChange={(e) => setAdminAccessCode(e.target.value)}
                                            placeholder="Unique Access Code"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-white/20 transition-all placeholder-gray-700"
                                            required
                                        />
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all text-xs tracking-[0.2em] uppercase shadow-xl mt-4 disabled:opacity-50">
                                    {loading ? "Decrypting..." : mode === "login" ? "Open Portal" : "Issue Credentials"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex items-center justify-between px-2">
                    <button onClick={() => navigate("/")} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                        <FaArrowLeft /> Exit Layer
                    </button>
                    <span className="text-[9px] font-bold text-gray-800 uppercase tracking-[0.3em]">Encrypted Session</span>
                </div>
            </div>
        </div>
    );
};

// Required for motion animations as it was missing from the file
import { motion, AnimatePresence } from "framer-motion";

export default AdminGate;
