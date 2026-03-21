import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import {
    FaStore, FaTruck, FaShieldAlt, FaArrowRight, FaArrowLeft,
    FaCheckCircle, FaTimesCircle, FaCamera, FaHardHat, FaIdCard,
    FaFileInvoiceDollar, FaLandmark, FaFileUpload, FaEnvelope,
    FaPhone, FaLock, FaMapMarkerAlt, FaUser, FaRedo
} from "react-icons/fa";

function PartnerSignup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("seller");

    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "", pincode: "" });
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [verificationDocs, setVerificationDocs] = useState([]);

    const [sellerDetails, setSellerDetails] = useState({ businessName: "", gstNumber: "", panNumber: "", businessAddress: "", businessCategory: "", companyRegistrationNumber: "", tradeLicenseNumber: "", fssaiLicense: "" });
    const [bankDetails, setBankDetails] = useState({ bankAccount: "", ifscCode: "" });
    const [deliveryDetails, setDeliveryDetails] = useState({ vehicleType: "", licenseNumber: "", rcBookNumber: "", deliveryAreaPincode: "" });
    const [providerDetails, setProviderDetails] = useState({ serviceCategory: "", serviceDescription: "", experience: "" });
    const [adminDetails, setAdminDetails] = useState({ adminAccessCode: "" });
    const [architectDetails, setArchitectDetails] = useState({ skills: "", contactInfo: "", coaRegistration: "" });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Email OTP State
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (resendTimer > 0) interval = setInterval(() => setResendTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const lbl = "block text-sm font-semibold text-gray-700 mb-2 ml-1";
    const inp = "w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm text-sm font-medium";

    const roles = [
        { key: "seller", icon: FaStore, title: "Seller", desc: "Sell goods", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", glow: "shadow-emerald-100" },
        { key: "delivery", icon: FaTruck, title: "Delivery", desc: "Logistics", color: "text-blue-700", bg: "bg-blue-50 border-blue-100", glow: "shadow-blue-100" },
        { key: "provider", icon: FaStore, title: "Provider", desc: "Services", color: "text-orange-700", bg: "bg-orange-50 border-orange-100", glow: "shadow-orange-100" },
        { key: "architect", icon: FaHardHat, title: "Architect", desc: "Projects", color: "text-amber-700", bg: "bg-amber-50 border-amber-100", glow: "shadow-amber-100" },
        { key: "admin", icon: FaShieldAlt, title: "Admin", desc: "Platform", color: "text-violet-700", bg: "bg-violet-50 border-violet-100", glow: "shadow-violet-100" },
    ];

    // ── Email OTP Functions ──
    const handleSendOTP = async () => {
        if (!form.email) { setError("Enter your email first"); return; }
        setOtpLoading(true); setError(""); setOtpError(""); setOtpSuccess(false); setOtp(["","","","","",""]);
        try {
            await API.post("/users/send-otp", { email: form.email, type: "email" });
            setShowOtp(true); setResendTimer(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) { setError(err.response?.data?.message || "Failed to send OTP"); }
        finally { setOtpLoading(false); }
    };

    const handleOtpChange = (val, idx) => {
        if (!/^\d*$/.test(val)) return;
        const n = [...otp]; n[idx] = val; setOtp(n); setOtpError("");
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };
    const handleOtpKeyDown = (e, idx) => { if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); };
    const handleOtpPaste = (e) => { e.preventDefault(); const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if(p.length===6){setOtp(p.split(""));otpRefs.current[5]?.focus();} };

    const handleVerifyOTP = async () => {
        const code = otp.join(""); if (code.length !== 6) { setOtpError("Enter all 6 digits"); return; }
        setOtpVerifying(true); setOtpError("");
        try {
            await API.post("/users/verify-otp", { otp: code, type: "email", email: form.email });
            setOtpSuccess(true); setIsEmailVerified(true);
            setTimeout(() => { setShowOtp(false); setOtpSuccess(false); }, 1200);
        } catch (err) { setOtpError(err.response?.data?.message || "Invalid or expired OTP"); }
        finally { setOtpVerifying(false); }
    };

    const handleResend = async () => {
        setResendTimer(60); setOtpError(""); setOtp(["","","","","",""]);
        try { await API.post("/users/send-otp", { email: form.email, type: "email" }); setTimeout(()=>otpRefs.current[0]?.focus(),100); }
        catch { setOtpError("Failed to resend"); }
    };

    // ── Validation ──
    const validateStep1 = () => {
        if (!form.name || !form.email || !form.password || !form.phone || !form.address || !form.pincode) { setError("All fields are required."); return false; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return false; }
        if (!isEmailVerified) { setError("Please verify your email to continue."); return false; }
        setError(""); return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setStep(4);
    };
    const handlePrev = () => { setError(""); setStep(step - 1); };
    const handleDocsChange = (e) => setVerificationDocs(Array.from(e.target.files));
    const handleImageChange = (e) => { const f = e.target.files[0]; setProfileImage(f); if (f) setPreview(URL.createObjectURL(f)); };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true); setError(""); setSuccess(false);
        const fd = new FormData();
        fd.append("name", form.name); fd.append("email", form.email); fd.append("password", form.password);
        fd.append("phone", form.phone); fd.append("address", form.address); fd.append("pincode", form.pincode);
        fd.append("role", role); fd.append("aadhaarNumber", aadhaarNumber);
        if (profileImage) fd.append("profileImage", profileImage);

        if (role === "seller") {
            Object.entries(sellerDetails).forEach(([k, v]) => { if (v) fd.append(k, v); });
            Object.entries(bankDetails).forEach(([k, v]) => { if (v) fd.append(k, v); });
        } else if (role === "delivery") {
            Object.entries(deliveryDetails).forEach(([k, v]) => { if (v) fd.append(k, v); });
        } else if (role === "provider") {
            Object.entries(providerDetails).forEach(([k, v]) => { if (v) fd.append(k, v); });
            verificationDocs.forEach(file => fd.append("verificationDocs", file));
        } else if (role === "admin") {
            fd.append("adminAccessCode", adminDetails.adminAccessCode);
        } else if (role === "architect") {
            Object.entries(architectDetails).forEach(([k, v]) => { if (v) fd.append(k, k === "skills" ? v.split(",").map(s => s.trim()) : v); });
        }

        try {
            await API.post("/users/signup", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) { setError(err.response?.data?.message || "Signup failed"); }
        finally { setIsLoading(false); }
    };

    const stepTitles = ["Identity", "Compliance", "Finance", "Finalize"];
    const stepIcons = [<FaIdCard />, <FaFileInvoiceDollar />, <FaLandmark />, <FaFileUpload />];

    // ── Inline OTP Card ──
    const renderOtpCard = () => (
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            className="mt-3 p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100">
            <div className="text-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-base shadow-lg mx-auto mb-2"><FaShieldAlt /></div>
                <p className="text-xs text-gray-500">Code sent to <span className="font-semibold text-indigo-600">{form.email}</span></p>
            </div>
            <div className="flex justify-center gap-2 mb-3" onPaste={handleOtpPaste}>
                {otp.map((d,i)=>(
                    <input key={i} ref={el=>otpRefs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e=>handleOtpChange(e.target.value,i)} onKeyDown={e=>handleOtpKeyDown(e,i)} onFocus={e=>e.target.select()}
                        className={`w-10 h-12 border-2 rounded-xl text-center text-lg font-bold outline-none transition-all ${otpSuccess?'border-green-400 bg-green-50 text-green-600':otpError?'border-red-300 bg-red-50 text-red-600':'border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
                ))}
            </div>
            {otpError && <p className="text-red-600 text-xs text-center mb-2 flex items-center justify-center gap-1"><FaTimesCircle /> {otpError}</p>}
            {otpSuccess && <p className="text-green-600 text-xs font-bold text-center mb-2 flex items-center justify-center gap-1"><FaCheckCircle /> Verified!</p>}
            <button type="button" onClick={handleVerifyOTP} disabled={otp.some(v=>v==="")||otpVerifying||otpSuccess}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 text-sm">
                {otpVerifying ? "Verifying..." : otpSuccess ? "Done!" : "Verify Code"}
            </button>
            <div className="flex justify-between items-center mt-2.5">
                <button type="button" onClick={()=>{setShowOtp(false);setOtp(["","","","","",""]);setOtpError("");}} className="text-xs text-gray-400 hover:text-gray-600">← Cancel</button>
                {resendTimer > 0 ? <span className="text-xs text-gray-400">Resend in {resendTimer}s</span> : <button type="button" onClick={handleResend} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><FaRedo className="text-[10px]" /> Resend</button>}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -ml-64 -mb-64" />

            <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10 flex flex-col min-h-[700px]">

                {/* Progress */}
                <div className="flex border-b border-gray-100">
                    {stepTitles.map((title, i) => (
                        <div key={i} className="flex-1 relative py-7">
                            <div className={`flex flex-col items-center transition-all duration-500 ${step > i+1 ? 'text-green-500' : step === i+1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 text-base shadow-sm transition-all duration-500 ${step > i+1 ? 'bg-green-50' : step === i+1 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-50'}`}>
                                    {step > i+1 ? <FaCheckCircle /> : stepIcons[i]}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
                            </div>
                            {i < stepTitles.length-1 && (
                                <div className="absolute top-[50px] left-[calc(50%+28px)] w-[calc(100%-56px)] h-[2px] bg-gray-100">
                                    <motion.div initial={{scaleX:0}} animate={{scaleX:step>i+1?1:0}} className="h-full bg-green-500 origin-left" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-8 sm:p-10 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.3}} className="h-full flex flex-col">

                            {/* ── STEP 1: Identity & Email Verification ── */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Partner Identity</h2>
                                        <p className="text-gray-500 text-sm">Choose your role, verify email, and provide basic details.</p>
                                    </div>

                                    {/* Role Selector */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {roles.map(r => (
                                            <button key={r.key} type="button" onClick={() => setRole(r.key)}
                                                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${role === r.key ? `${r.bg} ${r.color} border-transparent shadow-lg ${r.glow} scale-105` : "bg-white border-gray-50 text-gray-400 hover:bg-gray-50"}`}>
                                                <r.icon className={`text-xl mb-1.5 ${role === r.key ? r.color : "text-gray-300"}`} />
                                                <div className="font-bold text-xs">{r.title}</div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Fields Grid */}
                                    <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                        <div className="md:col-span-2">
                                            <label className={lbl}>Full Legal Name <span className="text-red-400">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaUser /></div>
                                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="As per official documents" className={`${inp} pl-12`} required />
                                            </div>
                                        </div>

                                        {/* Email + OTP */}
                                        <div className="md:col-span-2">
                                            <label className={lbl}>Official Email <span className="text-red-400">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaEnvelope /></div>
                                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="name@company.com" className={`${inp} pl-12 pr-28`} required disabled={isEmailVerified || showOtp} />
                                                {isEmailVerified ? (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1.5 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><FaCheckCircle /> Verified</div>
                                                ) : !showOtp && (
                                                    <button type="button" onClick={handleSendOTP} disabled={otpLoading || !form.email}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">
                                                        {otpLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send OTP"}
                                                    </button>
                                                )}
                                            </div>
                                            <AnimatePresence>{showOtp && !isEmailVerified && renderOtpCard()}</AnimatePresence>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className={lbl}>Phone <span className="text-red-400">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaPhone /></div>
                                                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').substring(0,10)})} placeholder="10-digit number" className={`${inp} pl-12`} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lbl}>Password <span className="text-red-400">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaLock /></div>
                                                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 chars" className={`${inp} pl-12`} required minLength={6} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lbl}>Pincode <span className="text-red-400">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaMapMarkerAlt /></div>
                                                <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g,'').substring(0,6)})} placeholder="6-digit Zip" className={`${inp} pl-12`} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lbl}>Full Address <span className="text-red-400">*</span></label>
                                            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Business locality, street" className={inp} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Legal & Compliance ── */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Legal & Compliance</h2>
                                        <p className="text-gray-500 text-sm">Regulatory data for {role.toUpperCase()} verification.</p>
                                    </div>

                                    <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                        <label className={lbl}>Aadhaar Number (12-digit UID)</label>
                                        <input value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g,'').substring(0,12))} placeholder="XXXX XXXX XXXX" className={inp} />
                                    </div>

                                    {role === "seller" && (
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2"><label className={lbl}>Business Name</label><input value={sellerDetails.businessName} onChange={e=>setSellerDetails({...sellerDetails,businessName:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>GSTIN</label><input value={sellerDetails.gstNumber} onChange={e=>setSellerDetails({...sellerDetails,gstNumber:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>PAN</label><input value={sellerDetails.panNumber} onChange={e=>setSellerDetails({...sellerDetails,panNumber:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>Category</label>
                                                <select value={sellerDetails.businessCategory} onChange={e=>setSellerDetails({...sellerDetails,businessCategory:e.target.value})} className={inp}>
                                                    <option value="">Select</option><option value="Hardware">Hardware</option><option value="Materials">Materials</option><option value="Others">Others</option>
                                                </select>
                                            </div>
                                            <div><label className={lbl}>Business Address</label><input value={sellerDetails.businessAddress} onChange={e=>setSellerDetails({...sellerDetails,businessAddress:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>Company Reg. No.</label><input value={sellerDetails.companyRegistrationNumber} onChange={e=>setSellerDetails({...sellerDetails,companyRegistrationNumber:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>Trade License</label><input value={sellerDetails.tradeLicenseNumber} onChange={e=>setSellerDetails({...sellerDetails,tradeLicenseNumber:e.target.value})} className={inp} /></div>
                                        </div>
                                    )}
                                    {role === "delivery" && (
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div><label className={lbl}>Vehicle Type</label><select value={deliveryDetails.vehicleType} onChange={e=>setDeliveryDetails({...deliveryDetails,vehicleType:e.target.value})} className={inp}><option value="">Select</option><option value="Mini Truck">Mini Truck</option><option value="Cargo Van">Cargo Van</option><option value="Bike">Bike</option></select></div>
                                            <div><label className={lbl}>DL Number</label><input value={deliveryDetails.licenseNumber} onChange={e=>setDeliveryDetails({...deliveryDetails,licenseNumber:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>RC Book No.</label><input value={deliveryDetails.rcBookNumber} onChange={e=>setDeliveryDetails({...deliveryDetails,rcBookNumber:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>Delivery Area Pincode</label><input value={deliveryDetails.deliveryAreaPincode} onChange={e=>setDeliveryDetails({...deliveryDetails,deliveryAreaPincode:e.target.value.replace(/\D/g,'').substring(0,6)})} className={inp} /></div>
                                        </div>
                                    )}
                                    {role === "provider" && (
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div><label className={lbl}>Service Category</label><input value={providerDetails.serviceCategory} onChange={e=>setProviderDetails({...providerDetails,serviceCategory:e.target.value})} placeholder="e.g. Electrician" className={inp} /></div>
                                            <div><label className={lbl}>Years Experience</label><input value={providerDetails.experience} onChange={e=>setProviderDetails({...providerDetails,experience:e.target.value})} placeholder="e.g. 5 Years" className={inp} /></div>
                                            <div className="md:col-span-2"><label className={lbl}>Description</label><textarea value={providerDetails.serviceDescription} onChange={e=>setProviderDetails({...providerDetails,serviceDescription:e.target.value})} rows={3} className={inp} /></div>
                                        </div>
                                    )}
                                    {role === "architect" && (
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2"><label className={lbl}>CoA Registration</label><input value={architectDetails.coaRegistration} onChange={e=>setArchitectDetails({...architectDetails,coaRegistration:e.target.value})} placeholder="CA/YYYY/XXXXX" className={inp} /></div>
                                            <div className="md:col-span-2"><label className={lbl}>Skills (comma-separated)</label><input value={architectDetails.skills} onChange={e=>setArchitectDetails({...architectDetails,skills:e.target.value})} placeholder="AutoCAD, Revit, etc." className={inp} /></div>
                                            <div className="md:col-span-2"><label className={lbl}>Contact Info</label><input value={architectDetails.contactInfo} onChange={e=>setArchitectDetails({...architectDetails,contactInfo:e.target.value})} placeholder="Additional contact" className={inp} /></div>
                                        </div>
                                    )}
                                    {role === "admin" && (
                                        <div className="p-5 bg-violet-50/50 rounded-2xl border border-violet-100">
                                            <label className={lbl}>Admin Access Code</label>
                                            <input type="password" value={adminDetails.adminAccessCode} onChange={e=>setAdminDetails({...adminDetails,adminAccessCode:e.target.value})} className={inp} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── STEP 3: Banking ── */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="mb-4 text-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-100 shadow-sm"><FaLandmark /></div>
                                        <h2 className="text-2xl font-bold text-gray-900">Banking & Finance</h2>
                                        <p className="text-gray-500 text-sm">Where you'll receive payouts.</p>
                                    </div>
                                    {["seller","provider","architect"].includes(role) ? (
                                        <div className="grid md:grid-cols-2 gap-5 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                            <div><label className={lbl}>Bank Account No.</label><input type="password" value={bankDetails.bankAccount} onChange={e=>setBankDetails({...bankDetails,bankAccount:e.target.value})} className={inp} /></div>
                                            <div><label className={lbl}>IFSC Code</label><input value={bankDetails.ifscCode} onChange={e=>setBankDetails({...bankDetails,ifscCode:e.target.value})} className={inp} /></div>
                                            <div className="md:col-span-2 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest p-3 bg-white/80 rounded-xl border border-gray-100">🔒 Encrypted & Secure</div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium">No financial details required for this role.<br />Proceed to the final step.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── STEP 4: Finalize ── */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Finalization</h2>
                                        <p className="text-gray-500 text-sm">Upload profile photo and documents.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center relative group overflow-hidden">
                                            <div className="w-24 h-24 mx-auto rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-3 group-hover:border-indigo-400 transition shadow-sm">
                                                {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <FaCamera className="text-2xl text-gray-300" />}
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Photo</div>
                                        </div>
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-center">
                                            <div className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Official Documents</div>
                                            <input type="file" multiple accept=".pdf,image/*" className="w-full text-xs text-gray-500 file:mr-3 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" onChange={handleDocsChange} />
                                            {verificationDocs.length > 0 && <div className="mt-3 text-[10px] font-black uppercase text-indigo-600">✓ {verificationDocs.length} docs ready</div>}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
                                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex shrink-0 items-center justify-center text-white text-sm shadow-md"><FaShieldAlt /></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-indigo-900">Final Check</h4>
                                            <p className="text-xs text-indigo-700/70 mt-0.5">By submitting, you agree to our terms. Your data will be reviewed by the Stinchar team.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            <AnimatePresence>
                                {error && <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-5 flex items-start gap-2.5 bg-red-50/50 border border-red-100 p-3.5 rounded-2xl text-red-800 text-sm font-medium"><FaTimesCircle className="mt-0.5 shrink-0" /> {error}</motion.div>}
                                {success && <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} className="mt-5 flex items-center gap-2.5 bg-green-50/50 border border-green-100 p-3.5 rounded-2xl text-green-800 text-sm font-medium"><FaCheckCircle className="shrink-0" /> Application submitted! Redirecting...</motion.div>}
                            </AnimatePresence>

                            {/* Buttons */}
                            <div className="mt-auto pt-8 flex gap-3">
                                {step > 1 && <button type="button" onClick={handlePrev} className="flex-1 h-13 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition flex items-center justify-center gap-2"><FaArrowLeft className="text-xs" /> Back</button>}
                                {step < 4 ? (
                                    <button type="button" onClick={handleNext} className="flex-[2] h-13 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition active:scale-[0.98] flex items-center justify-center gap-2">Next Stage <FaArrowRight className="text-xs" /></button>
                                ) : (
                                    <button type="button" onClick={handleSubmit} disabled={isLoading||success} className="flex-[2] h-13 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isLoading ? "Submitting..." : "Submit Application"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 text-center z-20">
                <p className="text-sm text-gray-500">
                    Customer? <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-800 mx-1">Sign Up</Link> •
                    Already registered? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 mx-1">Log In</Link>
                </p>
            </div>
        </div>
    );
}

export default PartnerSignup;
