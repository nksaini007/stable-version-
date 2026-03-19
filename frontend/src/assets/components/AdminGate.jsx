import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const AdminGate = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = enter key, 2 = enter credentials
    const [adminKey, setAdminKey] = useState("");
    const [keyValid, setKeyValid] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validateKey = (e) => {
        e.preventDefault();
        setError("");
        // Key format: at least 8 chars
        if (adminKey.length < 6) {
            setError("Invalid access key");
            return;
        }
        setKeyValid(true);
        setStep(2);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await API.post(
                `/users/x-admin-auth`,
                { adminKey, email, password }
            );
            login(data.user, data.token);
            navigate("/admin");
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-900/10 rounded-full blur-3xl animate-pulse delay-1000" />
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                        <FaShieldAlt className="text-white text-2xl" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-wider">SECURE PORTAL</h1>
                    <p className="text-gray-500 text-sm mt-1 tracking-widest uppercase">Admin Access Only</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-2 justify-center mb-6">
                    {[1, 2].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]" : "bg-white/5 text-gray-500"}`}>
                                {s}
                            </div>
                            {s < 2 && <div className={`h-0.5 w-12 transition-all ${step >= 2 ? "bg-red-600" : "bg-white/10"}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* STEP 1: Master Key */}
                    {step === 1 && (
                        <form onSubmit={validateKey} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Master Access Key
                                </label>
                                <div className="relative">
                                    <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                                    <input
                                        type="password"
                                        value={adminKey}
                                        onChange={(e) => setAdminKey(e.target.value)}
                                        placeholder="Enter master access key"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 focus:bg-white/8 transition-all placeholder-gray-600"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.01] transition-all text-sm tracking-wider uppercase"
                            >
                                Verify Key
                            </button>
                        </form>
                    )}

                    {/* STEP 2: Admin Credentials */}
                    {step === 2 && (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center mb-4">
                                ✓ Access key verified
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@stinchar.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder-gray-600"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder-gray-600"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setStep(1); setError(""); }}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-sm hover:bg-white/10 transition-all">
                                    Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-sm disabled:opacity-60">
                                    {loading ? "Authenticating..." : <><FaLock className="inline mr-2" />Login</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    This page is not publicly accessible. Unauthorized access attempts are logged.
                </p>
            </div>
        </div>
    );
};

export default AdminGate;
