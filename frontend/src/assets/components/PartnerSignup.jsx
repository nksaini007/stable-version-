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
    FaPhone
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
    const [otpLoading, setOtpLoading] = useState(""); // "email" or "phone"

    const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

    const roles = [
        { key: "seller", icon: FaStore, title: "Seller", desc: "Sell goods", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", ring: "ring-emerald-500" },
        { key: "delivery", icon: FaTruck, title: "Delivery", desc: "Logistics", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", ring: "ring-blue-500" },
        { key: "provider", icon: FaStore, title: "Provider", desc: "Services", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", ring: "ring-orange-500" },
        { key: "architect", icon: FaHardHat, title: "Architect", desc: "Projects", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", ring: "ring-yellow-500" },
        { key: "admin", icon: FaShieldAlt, title: "Admin", desc: "Platform", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", ring: "ring-violet-500" },
    ];

    // --- Validation Logic ---
    const validateStep1 = () => {
        if (!form.name || !form.email || !form.password || !form.phone || !form.address || !form.pincode) {
            setError("All basic fields are required.");
            return false;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
        if (!/^\d{10}$/.test(form.phone)) {
            setError("Phone number must be exactly 10 digits.");
            return false;
        }
        if (!isEmailVerified || !isPhoneVerified) {
            setError("Please verify both your email and phone number via OTP.");
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
        if (type === "phone" && !/^\d{10}$/.test(value)) {
            setError("Phone number must be exactly 10 digits.");
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

    const validateStep2 = () => {
        // Aadhaar validation (Global)
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            setError("Aadhaar Number must be exactly 12 digits.");
            return false;
        }

        if (role === "seller") {
            const { businessName, gstNumber, panNumber, businessAddress, businessCategory } = sellerDetails;
            if (!businessName || !gstNumber || !panNumber || !businessAddress || !businessCategory) {
                setError("All Seller Business details are required.");
                return false;
            }
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
                setError("Invalid PAN Format (e.g. ABCDE1234F)");
                return false;
            }
            if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase())) {
                setError("Invalid GSTIN Format.");
                return false;
            }
        } else if (role === "delivery") {
            const { vehicleType, licenseNumber, rcBookNumber, deliveryAreaPincode } = deliveryDetails;
            if (!vehicleType || !licenseNumber || !rcBookNumber || !deliveryAreaPincode) {
                setError("All delivery compliance fields are required.");
                return false;
            }
            if (!/^\d{6}$/.test(deliveryAreaPincode)) {
                setError("Pincode must be 6 digits.");
                return false;
            }
        } else if (role === "provider") {
            if (!providerDetails.serviceCategory || !providerDetails.experience || !providerDetails.serviceDescription) {
                setError("All provider fields are required.");
                return false;
            }
        } else if (role === "admin") {
            if (!adminDetails.adminAccessCode) {
                setError("Admin access code is strictly required.");
                return false;
            }
        } else if (role === "architect") {
            if (!architectDetails.skills || !architectDetails.coaRegistration) {
                setError("Council of Architecture (CoA) Registration and Skills are required.");
                return false;
            }
        }

        setError("");
        return true;
    };

    const validateStep3 = () => {
        if (role === "seller") {
            if (!bankDetails.bankAccount || !bankDetails.ifscCode) {
                setError("Bank details are mandatory for sellers.");
                return false;
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode.toUpperCase())) {
                setError("Invalid IFSC Code format.");
                return false;
            }
        }
        setError("");
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
        else if (step === 3 && validateStep3()) setStep(4);
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

        // Final validations depending on role
        if (role === "seller" && !validateStep3()) return;

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
            setError(err.response?.data?.message || err.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation Step Config
    const maxSteps = 4;
    const progress = (step / maxSteps) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans overflow-x-hidden">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">

                {/* Header & Progress */}
                <div className="p-8 pb-6 text-center border-b border-gray-100 bg-gray-50/50 relative">
                    <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm mb-4">
                        <FaBuilding className="text-white text-xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner Registration</h1>
                    <p className="text-sm text-gray-500 mt-2">Professional onboarding for registered entities.</p>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
                        <motion.div
                            className="h-full bg-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeInOut", duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* ================== STEP 1: BASIC INFO ================== */}
                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2"><FaIdCard className="text-indigo-500" /> Step 1: Identity & Role</h2>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>Select Professional Identity</label>
                                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                                {roles.map((r) => (
                                                    <button key={r.key} type="button" onClick={() => setRole(r.key)}
                                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${role === r.key
                                                            ? `${r.bg} ${r.color} ring-1 ${r.ring} shadow-sm`
                                                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <r.icon className={`text-xl mb-1.5 ${role === r.key ? r.color : "text-gray-400"}`} />
                                                        <div className="font-semibold text-xs tracking-wide">{r.title}</div>
                                                        <div className={`text-[10px] mt-0.5 ${role === r.key ? r.color : "text-gray-400"} opacity-80`}>{r.desc}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                            <div>
                                                <label className={labelClasses}>Full Legal Name</label>
                                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="As per official documents" className={inputClasses} required />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Official Email Address</label>
                                                <div className="relative">
                                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" className={`${inputClasses} pr-20`} required disabled={isEmailVerified} />
                                                    {!isEmailVerified ? (
                                                        <button type="button" onClick={() => handleSendOTP("email")} disabled={otpLoading === "email"} className="absolute right-2 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
                                                            {otpLoading === "email" ? "..." : "Verify"}
                                                        </button>
                                                    ) : (
                                                        <div className="absolute right-2 top-2 text-green-600">
                                                            <FaCheckCircle />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Account Password</label>
                                                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" className={inputClasses} required minLength={6} />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Primary Phone Number</label>
                                                <div className="relative">
                                                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile number" className={`${inputClasses} pr-20`} required disabled={isPhoneVerified} />
                                                    {!isPhoneVerified ? (
                                                        <button type="button" onClick={() => handleSendOTP("phone")} disabled={otpLoading === "phone"} className="absolute right-2 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
                                                            {otpLoading === "phone" ? "..." : "Verify"}
                                                        </button>
                                                    ) : (
                                                        <div className="absolute right-2 top-2 text-green-600">
                                                            <FaCheckCircle />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={labelClasses}>Complete Residential/Primary Address</label>
                                                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street layout, building number, locality" className={inputClasses} required />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Locality Pincode / Zip</label>
                                                <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit Area code" className={inputClasses} required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================== STEP 2: COMPLIANCE & LEGAL ================== */}
                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2"><FaFileInvoiceDollar className="text-indigo-500" /> Step 2: Compliance & Legal Information</h2>
                                            <p className="text-sm text-gray-500 mt-1">Strict regulatory information based on your selected role ({role.toUpperCase()}).</p>
                                        </div>

                                        <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                                            <label className={labelClasses}>Aadhaar Number (Global Compliance)</label>
                                            <input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').substring(0, 12))} placeholder="12-digit Aadhaar UID" className={inputClasses} required />
                                            <p className="text-xs text-gray-500 mt-1.5">Mandatory identity verification for all partners on the platform.</p>
                                        </div>

                                        {role === "seller" && (
                                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Registered Business Name</label>
                                                    <input value={sellerDetails.businessName} onChange={(e) => setSellerDetails({ ...sellerDetails, businessName: e.target.value })} placeholder="Company Ltd. / Enterprise Name" className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>GSTIN Number</label>
                                                    <input value={sellerDetails.gstNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, gstNumber: e.target.value })} placeholder="15-character GSTIN (e.g. 07AAAAA0000A1Z5)" className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>PAN Number</label>
                                                    <input value={sellerDetails.panNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, panNumber: e.target.value })} placeholder="10-character PAN (e.g. ABCDE1234F)" className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Company Registration No. (CIN/LLPIN)</label>
                                                    <input value={sellerDetails.companyRegistrationNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, companyRegistrationNumber: e.target.value })} placeholder="Optional for proprietorships" className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Trade License Number / FSSAI (If applicable)</label>
                                                    <input value={sellerDetails.tradeLicenseNumber} onChange={(e) => setSellerDetails({ ...sellerDetails, tradeLicenseNumber: e.target.value })} placeholder="Municipal Trade License" className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Business Category</label>
                                                    <select value={sellerDetails.businessCategory} onChange={(e) => setSellerDetails({ ...sellerDetails, businessCategory: e.target.value })} className={inputClasses} required>
                                                        <option value="" disabled>Select Category</option>
                                                        <option value="Hardware">Hardware & Tools</option>
                                                        <option value="Construction Materials">Construction Materials</option>
                                                        <option value="Plumbing">Plumbing & Sanitary</option>
                                                        <option value="Electricals">Electricals</option>
                                                        <option value="Others">Others</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Official Business Address</label>
                                                    <input value={sellerDetails.businessAddress} onChange={(e) => setSellerDetails({ ...sellerDetails, businessAddress: e.target.value })} placeholder="As per GST/Trade License" className={inputClasses} required />
                                                </div>
                                            </div>
                                        )}

                                        {role === "delivery" && (
                                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                                <div>
                                                    <label className={labelClasses}>Vehicle Type</label>
                                                    <select value={deliveryDetails.vehicleType} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, vehicleType: e.target.value })} className={inputClasses} required>
                                                        <option value="" disabled>Select Vehicle</option>
                                                        <option value="Mini Truck">Mini Truck (e.g. Tata Ace)</option>
                                                        <option value="Cargo Van">Cargo Van</option>
                                                        <option value="Two Wheeler">Two Wheeler (Bike/Scooter)</option>
                                                        <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Commercial Driving License (DL)</label>
                                                    <input value={deliveryDetails.licenseNumber} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, licenseNumber: e.target.value })} placeholder="DL Number" className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Vehicle RC Book Number</label>
                                                    <input value={deliveryDetails.rcBookNumber} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, rcBookNumber: e.target.value })} placeholder="Vehicle Registration No." className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Primary Service Pincode</label>
                                                    <input value={deliveryDetails.deliveryAreaPincode} onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryAreaPincode: e.target.value.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit Pincode" className={inputClasses} required />
                                                </div>
                                            </div>
                                        )}

                                        {role === "provider" && (
                                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                                <div>
                                                    <label className={labelClasses}>Primary Trade / Service Category</label>
                                                    <input value={providerDetails.serviceCategory} onChange={(e) => setProviderDetails({ ...providerDetails, serviceCategory: e.target.value })} placeholder="e.g. Electrician, Plumber, Mason" className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Years of Professional Experience</label>
                                                    <input value={providerDetails.experience} onChange={(e) => setProviderDetails({ ...providerDetails, experience: e.target.value })} placeholder="e.g. 5 Years" className={inputClasses} required />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Detailed Service Description</label>
                                                    <textarea value={providerDetails.serviceDescription} onChange={(e) => setProviderDetails({ ...providerDetails, serviceDescription: e.target.value })} rows={3} placeholder="Describe the scope of services you offer." className={inputClasses} required></textarea>
                                                </div>
                                            </div>
                                        )}

                                        {role === "architect" && (
                                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Council of Architecture (CoA) Registration</label>
                                                    <input value={architectDetails.coaRegistration} onChange={(e) => setArchitectDetails({ ...architectDetails, coaRegistration: e.target.value })} placeholder="CA/YYYY/XXXXX Format" className={inputClasses} required />
                                                    <p className="text-xs text-gray-500 mt-1">Mandatory verification credential for licensed architects.</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Core Technical Skills</label>
                                                    <input value={architectDetails.skills} onChange={(e) => setArchitectDetails({ ...architectDetails, skills: e.target.value })} placeholder="Comma separated (e.g. AutoCAD, Revit, 3ds Max, V-Ray)" className={inputClasses} required />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClasses}>Office / Secondary Contact Information</label>
                                                    <input value={architectDetails.contactInfo} onChange={(e) => setArchitectDetails({ ...architectDetails, contactInfo: e.target.value })} placeholder="Office phone, address, or website link" className={inputClasses} />
                                                </div>
                                            </div>
                                        )}

                                        {role === "admin" && (
                                            <div className="bg-violet-50/50 border border-violet-100 p-6 rounded-xl pt-4">
                                                <label className={labelClasses}>System Administrator Access Code</label>
                                                <input type="password" value={adminDetails.adminAccessCode} onChange={(e) => setAdminDetails({ ...adminDetails, adminAccessCode: e.target.value })} placeholder="High-level security clearance code" className={inputClasses} required />
                                                <p className="text-xs text-violet-700 mt-2">Only submit if authorized by IT infrastructure division.</p>
                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* ================== STEP 3: FINANCIAL & BANKING ================== */}
                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2"><FaLandmark className="text-indigo-500" /> Step 3: Financial Details</h2>
                                            {role !== "seller" && <p className="text-sm text-gray-500 mt-1">Not strictly required for {role} role at signup. You may skip this step.</p>}
                                        </div>

                                        {(role === "seller" || role === "provider" || role === "architect") ? (
                                            <div className="grid md:grid-cols-2 gap-6 bg-indigo-50/30 border border-indigo-100 p-6 rounded-xl">
                                                <div>
                                                    <label className={labelClasses}>Bank Account Number</label>
                                                    <input type="password" value={bankDetails.bankAccount} onChange={(e) => setBankDetails({ ...bankDetails, bankAccount: e.target.value })} placeholder="Current/Savings Account No." className={inputClasses} required={role === "seller"} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>IFSC Code</label>
                                                    <input value={bankDetails.ifscCode} onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })} placeholder="11-character alphanumeric code" className={inputClasses} required={role === "seller"} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-xs text-indigo-700 font-medium bg-indigo-50 p-3 rounded border border-indigo-200">
                                                        Note: Financial details are encrypted and securely vaulted. Payouts will be processed directly to this registered bank account.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                                <FaLandmark className="mx-auto text-4xl text-gray-300 mb-4" />
                                                <p className="text-gray-500">No primary financial details needed right now.<br />Click Next to proceed to final review.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ================== STEP 4: PORTFOLIO & UPLOADS ================== */}
                                {step === 4 && (
                                    <div className="space-y-8">
                                        <div className="text-center mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2"><FaFileUpload className="text-indigo-500" /> Step 4: Documents & Final Review</h2>
                                            <p className="text-sm text-gray-500 mt-1">Upload verified documentation to finalize your partner application.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Profile Upload */}
                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                                                <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Entity Profile Logo</label>
                                                <label className="relative cursor-pointer group block w-max mx-auto">
                                                    <div className="w-28 h-28 mx-auto rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-indigo-400 group-hover:bg-indigo-50 transition shadow-sm">
                                                        {preview ? (
                                                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FaCamera className="text-3xl text-gray-300 group-hover:text-indigo-400 transition" />
                                                        )}
                                                    </div>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                </label>
                                                <p className="text-xs text-gray-500 mt-3">Upload a clean, high-resolution logo or professional headshot.</p>
                                            </div>

                                            {/* Verification Docs */}
                                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-center">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Verification Paperwork</label>
                                                <p className="text-xs text-gray-500 mb-4">Required: Copy of Aadhaar, PAN, GST Certificate, DL, RC Book, or CoA Registration depending on your selected role.</p>
                                                <input type="file" multiple accept=".pdf,image/*" className="w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer border border-gray-300 bg-white rounded-lg shadow-sm" onChange={handleDocsChange} />
                                                {verificationDocs.length > 0 && (
                                                    <div className="mt-3 text-xs text-emerald-600 font-medium">✓ {verificationDocs.length} document(s) attached.</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
                                            By submitting this application, you attest that all legal documents, licenses, and business details provided are legitimate and current. Your account will be held for Admin moderation and verification.
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Status Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-start gap-3 bg-red-50 border border-red-200 p-3.5 rounded-lg text-red-800 text-sm font-medium mt-6">
                                <FaTimesCircle className="mt-0.5 shrink-0" /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 bg-green-50 border border-green-200 p-3.5 rounded-lg text-green-800 text-sm font-medium mt-6">
                                <FaCheckCircle className="mt-0.5 shrink-0" /> Application submitted successfully for audit. Redirecting...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Controls */}
                    <div className="pt-6 mt-8 border-t border-gray-200 flex justify-between items-center">
                        <button type="button" onClick={handlePrev} disabled={step === 1 || isLoading} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                            <FaArrowLeft /> Back
                        </button>

                        {step < maxSteps ? (
                            <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition flex items-center gap-2">
                                Next Step <FaArrowRight />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting Legal Data...
                                    </>
                                ) : (
                                    <>Finalize Registration <FaCheckCircle /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <OTPModal 
                isOpen={modal.isOpen} 
                onClose={() => setModal({ ...modal, isOpen: false })} 
                type={modal.type} 
                value={modal.value} 
                onVerified={() => {
                    if (modal.type === "email") setIsEmailVerified(true);
                    if (modal.type === "phone") setIsPhoneVerified(true);
                }}
            />
        </div>
    );
}

export default PartnerSignup;
