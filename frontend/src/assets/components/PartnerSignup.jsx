import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import {
    FaStore,
    FaTruck,
    FaShieldAlt,
    FaArrowRight,
    FaArrowLeft,
    FaCheckCircle,
    FaTimesCircle,
    FaCamera,
    FaHardHat,
    FaBuilding,
    FaIdCard,
    FaFileInvoiceDollar,
    FaLandmark,
    FaFileUpload,
    FaEnvelope,
    FaPhone,
    FaLock,
    FaMapMarkerAlt,
    FaUser
} from "react-icons/fa";
import OTPModal from "./auth/OTPModal";

function PartnerSignup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("seller");

    // Core details
    const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "", pincode: "" });

    // Legal & Shared Details
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [verificationDocs, setVerificationDocs] = useState([]);

    // Role-specific states
    const [sellerDetails, setSellerDetails] = useState({ businessName: "", gstNumber: "", panNumber: "", businessAddress: "", businessCategory: "", companyRegistrationNumber: "", tradeLicenseNumber: "", fssaiLicense: "" });
    const [bankDetails, setBankDetails] = useState({ bankAccount: "", ifscCode: "" });
    const [deliveryDetails, setDeliveryDetails] = useState({ vehicleType: "", licenseNumber: "", rcBookNumber: "", deliveryAreaPincode: "" });
    const [providerDetails, setProviderDetails] = useState({ serviceCategory: "", serviceDescription: "", experience: "" });
    const [adminDetails, setAdminDetails] = useState({ adminAccessCode: "" });
    const [architectDetails, setArchitectDetails] = useState({ skills: "", contactInfo: "", coaRegistration: "" });

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: "", value: "" });
    const [otpLoading, setOtpLoading] = useState(""); 

    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2 ml-1";
    const inputClasses = "w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm text-sm font-medium";

    const roles = [
        { key: "seller", icon: FaStore, title: "Seller", desc: "Sell goods", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", ring: "ring-emerald-500", glow: "shadow-emerald-100" },
        { key: "delivery", icon: FaTruck, title: "Delivery", desc: "Logistics", color: "text-blue-700", bg: "bg-blue-50 border-blue-100", ring: "ring-blue-500", glow: "shadow-blue-100" },
        { key: "provider", icon: FaStore, title: "Provider", desc: "Services", color: "text-orange-700", bg: "bg-orange-50 border-orange-100", ring: "ring-orange-500", glow: "shadow-orange-100" },
        { key: "architect", icon: FaHardHat, title: "Architect", desc: "Projects", color: "text-amber-700", bg: "bg-amber-50 border-amber-100", ring: "ring-amber-500", glow: "shadow-amber-100" },
        { key: "admin", icon: FaShieldAlt, title: "Admin", desc: "Platform", color: "text-violet-700", bg: "bg-violet-50 border-violet-100", ring: "ring-violet-500", glow: "shadow-violet-100" },
    ];

    const validateStep1 = () => {
        if (!form.name || !form.email || !form.password || !form.phone || !form.address || !form.pincode) {
            setError("All basic fields are required.");
            return false;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
        if (!isEmailVerified || !isPhoneVerified) {
            setError("Please verify both email and phone number to continue.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSendOTP = async (type) => {
        const value = type === "email" ? form.email : form.phone;
        if (!value) {
            setError(`Please enter a valid ${type} first`);
            return;
        }
        setOtpLoading(type);
        setError("");
        try {
            await API.post("/users/send-otp", { [type]: value, type });
            setModal({ isOpen: true, type, value });
        } catch (err) {
            setError(err.response?.data?.message || `Failed to send ${type} OTP`);
        } finally {
            setOtpLoading("");
        }
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setStep(4);
    };

    const handlePrev = () => {
        setError("");
        setStep(step - 1);
    };

    const handleDocsChange = (e) => {
        setVerificationDocs(Array.from(e.target.files));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("phone", form.phone);
        formData.append("address", form.address);
        formData.append("pincode", form.pincode);
        formData.append("role", role);
        formData.append("aadhaarNumber", aadhaarNumber);
        if (profileImage) formData.append("profileImage", profileImage);

        if (role === "seller") {
            Object.entries(sellerDetails).forEach(([k, v]) => { if (v) formData.append(k, v); });
            Object.entries(bankDetails).forEach(([k, v]) => { if (v) formData.append(k, v); });
        } else if (role === "delivery") {
            Object.entries(deliveryDetails).forEach(([k, v]) => { if (v) formData.append(k, v); });
        } else if (role === "provider") {
            Object.entries(providerDetails).forEach(([k, v]) => { if (v) formData.append(k, v); });
            verificationDocs.forEach(file => formData.append("verificationDocs", file));
        } else if (role === "admin") {
            formData.append("adminAccessCode", adminDetails.adminAccessCode);
        } else if (role === "architect") {
            Object.entries(architectDetails).forEach(([k, v]) => {
                if (v) formData.append(k, k === "skills" ? v.split(",").map(s => s.trim()) : v);
            });
        }

        try {
            await API.post(`/users/signup`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    const stepTitles = ["Identity", "Compliance", "Finance", "Finalize"];
    const stepIcons = [<FaIdCard />, <FaFileInvoiceDollar />, <FaLandmark />, <FaFileUpload />];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -ml-64 -mb-64"></div>

            <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10 flex flex-col min-h-[700px]">

                <div className="flex border-b border-gray-100">
                    {stepTitles.map((title, i) => (
                        <div key={i} className="flex-1 relative py-8">
                            <div className={`flex flex-col items-center transition-all duration-500 ${step > i + 1 ? 'text-green-500' : step === i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 text-lg shadow-sm transition-all duration-500 ${step > i + 1 ? 'bg-green-50 border-green-100' : step === i + 1 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                                    {step > i + 1 ? <FaCheckCircle /> : stepIcons[i]}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
                            </div>
                            {i < stepTitles.length - 1 && (
                                <div className="absolute top-[52px] left-[calc(50%+30px)] w-[calc(100%-60px)] h-[2px] bg-gray-100">
                                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: step > i + 1 ? 1 : 0 }} className="h-full bg-green-500 origin-left"></motion.div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-10 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="h-full flex flex-col">
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="mb-8 font-sans">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Identity</h2>
                                        <p className="text-gray-500 text-sm">Choose your professional role and provide basic details.</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {roles.map((r) => (
                                            <button key={r.key} type="button" onClick={() => setRole(r.key)}
                                                className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${role === r.key
                                                    ? `${r.bg} ${r.color} border-transparent shadow-lg ${r.glow} scale-105`
                                                    : "bg-white border-gray-50 text-gray-400 hover:bg-gray-50 hover:border-gray-100"
                                                    }`}
                                            >
                                                <r.icon className={`text-2xl mb-2 ${role === r.key ? r.color : "text-gray-300"}`} />
                                                <div className="font-bold text-xs">{r.title}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>Full Legal Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaUser /></div>
                                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="As per official documents" className={`${inputClasses} pl-12`} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Official Email</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaEnvelope /></div>
                                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" className={`${inputClasses} pl-12 pr-28`} required disabled={isEmailVerified} />
                                                {!isEmailVerified ? (
                                                    <button type="button" onClick={() => handleSendOTP("email")} disabled={otpLoading === "email"} className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                                        {otpLoading === "email" ? "..." : "Verify"}
                                                    </button>
                                                ) : (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-2 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><FaCheckCircle /> Verified</div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Primary Phone</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaPhone /></div>
                                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit number" className={`${inputClasses} pl-12 pr-28`} required disabled={isPhoneVerified} />
                                                {!isPhoneVerified ? (
                                                    <button type="button" onClick={() => handleSendOTP("phone")} disabled={otpLoading === "phone"} className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                                        {otpLoading === "phone" ? "..." : "Verify"}
                                                    </button>
                                                ) : (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-2 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><FaCheckCircle /> Verified</div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaLock /></div>
                                                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 chars" className={`${inputClasses} pl-12`} required minLength={6} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Area Pincode</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaMapMarkerAlt /></div>
                                                <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit Zip" className={`${inputClasses} pl-12`} required />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>Full Address</label>
                                            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Business locality, street details" className={inputClasses} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal & Compliance</h2>
                                        <p className="text-gray-500 text-sm">Regulatory data required for {role.toUpperCase()} verification.</p>
                                    </div>

                                    <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100">
                                        <label className={labelClasses}>Aadhaar Number (12-digit UID)</label>
                                        <input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').substring(0, 12))} placeholder="Enter your Aadhaar UID" className={inputClasses} required />
                                    </div>

                                    {role === "seller" && (
                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div className="md:col-span-2"><label className={labelClasses}>Business Name</label><input value={sellerDetails.businessName} onChange={(e) => setSellerDetails({ ...sellerDetails, businessName: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>GSTIN</label><input value={sellerDetails.gstNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, gstNumber: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>PAN</label><input value={sellerDetails.panNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, panNumber: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>Category</label>
                                                <select value={sellerDetails.businessCategory} onChange={(e) => setSellerDetails({ ...sellerDetails, businessCategory: e.target.value })} className={inputClasses} required>
                                                    <option value="">Select Category</option><option value="Hardware">Hardware</option><option value="Materials">Materials</option><option value="Others">Others</option>
                                                </select>
                                            </div>
                                            <div><label className={labelClasses}>Business Address</label><input value={sellerDetails.businessAddress} onChange={(e) => setSellerDetails({ ...sellerDetails, businessAddress: e.target.value })} className={inputClasses} required /></div>
                                        </div>
                                    )}

                                    {role === "delivery" && (
                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div><label className={labelClasses}>Vehicle</label><select value={deliveryDetails.vehicleType} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, vehicleType: e.target.value })} className={inputClasses} required><option value="">Select Vehicle</option><option value="Mini Truck">Mini Truck</option><option value="Cargo Van">Cargo Van</option></select></div>
                                            <div><label className={labelClasses}>DL Number</label><input value={deliveryDetails.licenseNumber} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, licenseNumber: e.target.value })} className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>RC Book No.</label><input value={deliveryDetails.rcBookNumber} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, rcBookNumber: e.target.value })} className={inputClasses} required /></div>
                                        </div>
                                    )}

                                    {role === "provider" && (
                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div><label className={labelClasses}>Trade Category</label><input value={providerDetails.serviceCategory} onChange={(e) => setProviderDetails({ ...providerDetails, serviceCategory: e.target.value })} placeholder="e.g. Electrician" className={inputClasses} required /></div>
                                            <div><label className={labelClasses}>Years Exp.</label><input value={providerDetails.experience} onChange={(e) => setProviderDetails({ ...providerDetails, experience: e.target.value })} placeholder="e.g. 5 Years" className={inputClasses} required /></div>
                                            <div className="md:col-span-2"><label className={labelClasses}>Description</label><textarea value={providerDetails.serviceDescription} onChange={(e) => setProviderDetails({ ...providerDetails, serviceDescription: e.target.value })} rows={3} className={inputClasses} required></textarea></div>
                                        </div>
                                    )}

                                    {role === "architect" && (
                                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                                            <div className="md:col-span-2"><label className={labelClasses}>CoA Registration</label><input value={architectDetails.coaRegistration} onChange={(e) => setArchitectDetails({ ...architectDetails, coaRegistration: e.target.value })} placeholder="CA/YYYY/XXXXX" className={inputClasses} required /></div>
                                            <div className="md:col-span-2"><label className={labelClasses}>Skills</label><input value={architectDetails.skills} onChange={(e) => setArchitectDetails({ ...architectDetails, skills: e.target.value })} placeholder="AutoCAD, Revit, etc." className={inputClasses} required /></div>
                                        </div>
                                    )}

                                    {role === "admin" && (
                                        <div className="p-6 bg-violet-50/50 rounded-3xl border border-violet-100">
                                            <label className={labelClasses}>Admin Access Code</label>
                                            <input type="password" value={adminDetails.adminAccessCode} onChange={(e) => setAdminDetails({ ...adminDetails, adminAccessCode: e.target.value })} className={inputClasses} required />
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8">
                                    <div className="mb-8 text-center pt-8 font-sans">
                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100 shadow-sm"><FaLandmark /></div>
                                        <h2 className="text-2xl font-bold text-gray-900">Banking & Finance</h2>
                                        <p className="text-gray-500 text-sm">Where you'll receive your payouts.</p>
                                    </div>

                                    {(role === "seller" || role === "provider" || role === "architect") ? (
                                        <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                            <div><label className={labelClasses}>Bank Account No.</label><input type="password" value={bankDetails.bankAccount} onChange={(e) => setBankDetails({ ...bankDetails, bankAccount: e.target.value })} className={inputClasses} required={role === "seller"} /></div>
                                            <div><label className={labelClasses}>IFSC Code</label><input value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} className={inputClasses} required={role === "seller"} /></div>
                                            <div className="md:col-span-2 p-4 bg-white/80 rounded-2xl border border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Encrypted & Secure Vault Storage</div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium">No financial details required for this role.<br/>Proceeed to final step.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8">
                                    <div className="mb-8 font-sans">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalization</h2>
                                        <p className="text-gray-500 text-sm">Upload proof of identity and business license.</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8 text-center relative group overflow-hidden">
                                            <div className="w-28 h-28 mx-auto rounded-[2rem] bg-white border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-4 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 transition duration-500 shadow-sm">
                                                {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <FaCamera className="text-3xl text-gray-300" />}
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity Profile Photo</div>
                                        </div>

                                        <div className="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8 flex flex-col justify-center">
                                            <div className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-4">Official Paperwork</div>
                                            <input type="file" multiple accept=".pdf,image/*" className="w-full text-xs text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" onChange={handleDocsChange} />
                                            {verificationDocs.length > 0 && <div className="mt-4 text-[10px] font-black uppercase text-indigo-600">✓ {verificationDocs.length} DOCS READY</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 mt-8">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex shrink-0 items-center justify-center text-white text-sm shadow-md"><FaShieldAlt /></div>
                                        <div><h4 className="text-sm font-bold text-indigo-900">Final Security Check</h4><p className="text-xs text-indigo-700/70 mt-1 font-sans">By submitting, you agree to our terms. Your data will be audited by the Stinchar team.</p></div>
                                    </div>
                                </div>
                            )}

                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="mt-6 flex items-start gap-3 bg-red-50/50 border border-red-100 p-4 rounded-3xl text-red-800 text-sm font-medium">
                                        <FaTimesCircle className="mt-0.5 shrink-0" /> {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 flex items-center gap-3 bg-green-50/50 border border-green-100 p-4 rounded-3xl text-green-800 text-sm font-medium">
                                        <FaCheckCircle className="shrink-0" /> Application Audit Pending...
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-auto pt-10 flex gap-4 font-sans">
                                {step > 1 && (
                                    <button type="button" onClick={handlePrev} className="flex-1 h-14 rounded-[1.5rem] border-2 border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                        <FaArrowLeft className="text-xs" /> Back
                                    </button>
                                )}
                                {step < 4 ? (
                                    <button type="button" onClick={handleNext} className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        Next Stage <FaArrowRight className="text-xs" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSubmit} disabled={isLoading || success} className="flex-[2] h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        {isLoading ? "Auditing Details..." : "Finalize & Submit"}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <OTPModal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} type={modal.type} value={modal.value} onVerified={() => {
                if (modal.type === "email") setIsEmailVerified(true);
                if (modal.type === "phone") setIsPhoneVerified(true);
            }} />
        </div>
    );
}

export default PartnerSignup;
