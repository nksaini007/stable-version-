import React, { useState, useRef, useEffect } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

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

    const inp = "w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors";
    const lbl = "block text-xs font-semibold text-gray-500 mb-2";

    const roles = [
        { key: "seller", title: "Seller" },
        { key: "delivery", title: "Delivery" },
        { key: "provider", title: "Provider" },
        { key: "architect", title: "Architect" },
        { key: "admin", title: "Admin" },
    ];

    const renderOtpCard = () => (
        <div className="mt-2 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md">
            <p className="text-xs text-gray-400 mb-3 text-center">Verify code sent to {form.email}</p>
            <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((d,i)=>(
                    <input key={i} ref={el=>otpRefs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e=>handleOtpChange(e.target.value,i)} onKeyDown={e=>handleOtpKeyDown(e,i)} onFocus={e=>e.target.select()}
                        className={`w-10 h-12 bg-[#121212] border ${otpSuccess ? 'border-green-500' : otpError ? 'border-red-500' : 'border-[#333]'} rounded-md text-center text-white focus:outline-none focus:border-gray-500 transition-colors`} />
                ))}
            </div>
            {otpError && <p className="text-red-400 text-xs text-center mb-3">{otpError}</p>}
            <button type="button" onClick={handleVerifyOTP} disabled={otp.some(v=>v==="")||otpVerifying||otpSuccess}
                className="w-full bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3 hover:bg-white transition-colors mb-2 disabled:opacity-50">
                {otpVerifying ? "Verifying..." : otpSuccess ? "Verified!" : "Verify Code"}
            </button>
            <div className="flex justify-between items-center px-1">
                <button type="button" onClick={()=>{setShowOtp(false);setOtp(["","","","","",""]);setOtpError("");}} className="text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                <button type="button" onClick={handleResend} disabled={resendTimer>0} className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50">{resendTimer>0 ? `Resend in ${resendTimer}s`:`Resend`}</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-white py-12">
            <div className="w-full max-w-md flex flex-col">
                <button type="button" onClick={() => navigate(-1)} className="self-start text-gray-400 hover:text-white mb-8 text-sm tracking-wide transition-colors">
                    Back
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Partner Application</h1>
                    <p className="text-sm text-gray-400 mt-1.5">
                        {step === 1 ? 'Identity & Contact' : step === 2 ? 'Compliance Details' : step === 3 ? 'Banking Information' : 'Final Review'}
                    </p>
                </div>

                <div className="flex items-center mb-8 gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
                    ))}
                </div>

                <form className="flex flex-col gap-5">
                    
                    {step === 1 && (
                        <>
                            <div>
                                <label className={lbl}>Select Category <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {roles.map(r => (
                                        <button key={r.key} type="button" onClick={() => setRole(r.key)} className={`p-3 rounded-md border text-xs font-medium transition-colors ${role === r.key ? 'bg-white text-black border-white' : 'bg-[#1A1A1A] text-gray-400 border-[#2A2A2A] hover:bg-[#2A2A2A]'}`}>
                                            {r.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Legal Name *" className={inp} required />
                            </div>

                            <div className="flex flex-col">
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Business Email *" className={inp} required disabled={isEmailVerified || showOtp} />
                                {isEmailVerified ? (
                                    <p className="text-green-400 text-xs mt-2 text-center">Email Verified ✓</p>
                                ) : !showOtp && (
                                    <button type="button" onClick={handleSendOTP} disabled={otpLoading || !form.email} className="w-full bg-[#2A2A2A] text-white font-medium text-sm rounded-md py-3.5 mt-2 hover:bg-[#333] transition-colors disabled:opacity-50">
                                        {otpLoading ? "Sending OTP..." : "Send OTP"}
                                    </button>
                                )}
                                {showOtp && !isEmailVerified && renderOtpCard()}
                            </div>

                            <div className="flex flex-col">
                                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').substring(0,10)})} placeholder="10-digit Phone *" className={inp} required />
                            </div>
                            <div className="flex flex-col">
                                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password (Min. 6) *" className={inp} required minLength={6} />
                            </div>
                            <div className="flex flex-col">
                                <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g,'').substring(0,6)})} placeholder="Locality Pincode *" className={inp} required />
                            </div>
                            <div className="flex flex-col">
                                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full Business Address *" className={`${inp} h-20 resize-none`} required />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="flex flex-col">
                                <input value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g,'').substring(0,12))} placeholder="Aadhaar Number (Optional)" className={inp} />
                            </div>

                            {role === "seller" && (
                                <>
                                    <input value={sellerDetails.businessName} onChange={e=>setSellerDetails({...sellerDetails,businessName:e.target.value})} placeholder="Business Name" className={inp} />
                                    <input value={sellerDetails.gstNumber} onChange={e=>setSellerDetails({...sellerDetails,gstNumber:e.target.value})} placeholder="GSTIN" className={inp} />
                                    <input value={sellerDetails.panNumber} onChange={e=>setSellerDetails({...sellerDetails,panNumber:e.target.value})} placeholder="PAN" className={inp} />
                                    <select value={sellerDetails.businessCategory} onChange={e=>setSellerDetails({...sellerDetails,businessCategory:e.target.value})} className={`${inp} text-gray-300`}>
                                        <option value="">Select Category</option><option value="Hardware">Hardware</option><option value="Materials">Materials</option><option value="Others">Others</option>
                                    </select>
                                    <input value={sellerDetails.businessAddress} onChange={e=>setSellerDetails({...sellerDetails,businessAddress:e.target.value})} placeholder="Business Operations Address" className={inp} />
                                    <input value={sellerDetails.companyRegistrationNumber} onChange={e=>setSellerDetails({...sellerDetails,companyRegistrationNumber:e.target.value})} placeholder="Company Reg. No." className={inp} />
                                    <input value={sellerDetails.tradeLicenseNumber} onChange={e=>setSellerDetails({...sellerDetails,tradeLicenseNumber:e.target.value})} placeholder="Trade License" className={inp} />
                                </>
                            )}

                            {role === "delivery" && (
                                <>
                                    <select value={deliveryDetails.vehicleType} onChange={e=>setDeliveryDetails({...deliveryDetails,vehicleType:e.target.value})} className={`${inp} text-gray-300`}><option value="">Select Vehicle</option><option value="Mini Truck">Mini Truck</option><option value="Cargo Van">Cargo Van</option><option value="Bike">Bike</option></select>
                                    <input value={deliveryDetails.licenseNumber} onChange={e=>setDeliveryDetails({...deliveryDetails,licenseNumber:e.target.value})} placeholder="DL Number" className={inp} />
                                    <input value={deliveryDetails.rcBookNumber} onChange={e=>setDeliveryDetails({...deliveryDetails,rcBookNumber:e.target.value})} placeholder="RC Book No." className={inp} />
                                    <input value={deliveryDetails.deliveryAreaPincode} onChange={e=>setDeliveryDetails({...deliveryDetails,deliveryAreaPincode:e.target.value.replace(/\D/g,'').substring(0,6)})} placeholder="Delivery Area Pincode" className={inp} />
                                </>
                            )}

                            {role === "provider" && (
                                <>
                                    <input value={providerDetails.serviceCategory} onChange={e=>setProviderDetails({...providerDetails,serviceCategory:e.target.value})} placeholder="Service Category (e.g. Electrician)" className={inp} />
                                    <input value={providerDetails.experience} onChange={e=>setProviderDetails({...providerDetails,experience:e.target.value})} placeholder="Years Experience (e.g. 5 Years)" className={inp} />
                                    <textarea value={providerDetails.serviceDescription} onChange={e=>setProviderDetails({...providerDetails,serviceDescription:e.target.value})} placeholder="Service Description" rows={3} className={`${inp} h-24 resize-none`} />
                                </>
                            )}

                            {role === "architect" && (
                                <>
                                    <input value={architectDetails.coaRegistration} onChange={e=>setArchitectDetails({...architectDetails,coaRegistration:e.target.value})} placeholder="CoA Registration (CA/YYYY/XXXXX)" className={inp} />
                                    <input value={architectDetails.skills} onChange={e=>setArchitectDetails({...architectDetails,skills:e.target.value})} placeholder="Skills (comma-separated)" className={inp} />
                                    <input value={architectDetails.contactInfo} onChange={e=>setArchitectDetails({...architectDetails,contactInfo:e.target.value})} placeholder="Additional Contact Info" className={inp} />
                                </>
                            )}

                            {role === "admin" && (
                                <>
                                    <input type="password" value={adminDetails.adminAccessCode} onChange={e=>setAdminDetails({...adminDetails,adminAccessCode:e.target.value})} placeholder="Admin Access Code" className={inp} />
                                </>
                            )}
                        </>
                    )}

                    {step === 3 && (
                        <>
                            {["seller","provider","architect"].includes(role) ? (
                                <>
                                    <input type="password" value={bankDetails.bankAccount} onChange={e=>setBankDetails({...bankDetails,bankAccount:e.target.value})} placeholder="Bank Account No." className={inp} />
                                    <input value={bankDetails.ifscCode} onChange={e=>setBankDetails({...bankDetails,ifscCode:e.target.value})} placeholder="IFSC Code" className={inp} />
                                    <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest mt-2">Data is encrypted & secure</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-8">No financial details required for this role.</p>
                            )}
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center overflow-hidden mb-3 relative hover:border-gray-500 transition-colors">
                                    {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">Logotype</span>}
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Business Photo</span>
                            </div>

                            <div className="flex flex-col">
                                <label className={lbl}>Verified Documents</label>
                                <input type="file" multiple accept=".pdf,image/*" className={`${inp} p-3 text-xs file:bg-[#2A2A2A] file:text-white file:border-none file:px-3 file:py-1.5 file:rounded-sm file:mr-3 file:cursor-pointer`} onChange={handleDocsChange} />
                                {verificationDocs.length > 0 && <span className="text-xs text-green-400 mt-2">✓ {verificationDocs.length} documents attached</span>}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-4">
                                <input type="checkbox" id="terms" required className="w-4 h-4 rounded-sm bg-[#1A1A1A] border border-[#333] accent-white cursor-pointer" />
                                <label htmlFor="terms" className="text-xs text-gray-400 select-none cursor-pointer">
                                I confirm the details provided are accurate.
                                </label>
                            </div>
                        </>
                    )}

                    {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
                    {success && <p className="text-green-400 text-xs text-center mt-2">Application submitted! Redirecting...</p>}

                    <div className="flex gap-3 mt-6">
                        {step > 1 && (
                            <button type="button" onClick={handlePrev} className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium text-sm rounded-md py-3.5 hover:bg-[#2A2A2A] transition-colors">
                                Back
                            </button>
                        )}
                        {step < 4 ? (
                            <button type="button" onClick={handleNext} className="flex-[2] bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 hover:bg-white transition-colors">
                                Next Step
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={isLoading||success} className="flex-[2] bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 hover:bg-white transition-colors disabled:opacity-50">
                                {isLoading ? "Submitting..." : "Submit Application"}
                            </button>
                        )}
                    </div>
                </form>

                <div className="flex items-center my-8">
                    <hr className="flex-1 border-[#2A2A2A]" />
                    <span className="px-4 text-xs text-gray-500">or</span>
                    <hr className="flex-1 border-[#2A2A2A]" />
                </div>

                <div className="text-center text-xs text-gray-400 space-y-2 flex flex-col">
                    <span>Already an approved partner? <Link to="/login" className="text-white hover:underline transition-all ml-1">Log In</Link></span>
                    <span>Just want services? <Link to="/signup" className="text-white hover:underline transition-all ml-1">Customer Signup</Link></span>
                </div>
            </div>
        </div>
    );
}

export default PartnerSignup;
