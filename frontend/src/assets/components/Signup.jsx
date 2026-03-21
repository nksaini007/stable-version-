import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaArrowRight, FaCheckCircle, FaTimesCircle, FaCamera,
  FaShieldAlt, FaEnvelope, FaPhone, FaLock,
  FaMapMarkerAlt, FaArrowLeft, FaRedo
} from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "", pincode: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // OTP State
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ── Send Email OTP ──
  const handleSendOTP = async () => {
    if (!form.email) { setError("Please enter your email first"); return; }
    setOtpLoading(true);
    setError("");
    setOtpError("");
    setOtpSuccess(false);
    setOtp(["", "", "", "", "", ""]);
    try {
      await API.post("/users/send-otp", { email: form.email, type: "email" });
      setShowOtp(true);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP Input ──
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n); setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); otpRefs.current[5]?.focus(); }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setOtpError("Enter all 6 digits"); return; }
    setOtpVerifying(true); setOtpError("");
    try {
      await API.post("/users/verify-otp", { otp: code, type: "email", email: form.email });
      setOtpSuccess(true);
      setIsEmailVerified(true);
      setTimeout(() => { setShowOtp(false); setOtpSuccess(false); }, 1200);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired OTP");
    } finally { setOtpVerifying(false); }
  };

  const handleResend = async () => {
    setResendTimer(60); setOtpError(""); setOtp(["","","","","",""]);
    try {
      await API.post("/users/send-otp", { email: form.email, type: "email" });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setOtpError("Failed to resend"); }
  };

  const nextStep = () => {
    if (step === 1 && !isEmailVerified) { setError("Please verify your email to continue."); return; }
    if (step === 2 && (!form.name || !form.password)) { setError("Name and password are required."); return; }
    if (step === 2 && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setStep(step + 1);
  };
  const prevStep = () => { setError(""); setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(""); setSuccess(false);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("role", "customer");
      if (form.phone) fd.append("phone", form.phone);
      if (form.address) fd.append("address", form.address);
      if (form.pincode) fd.append("pincode", form.pincode);
      if (profileImage) fd.append("profileImage", profileImage);
      await API.post("/users/signup", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally { setIsLoading(false); }
  };

  const steps = [
    { title: "Verify", icon: <FaShieldAlt /> },
    { title: "Details", icon: <FaUser /> },
    { title: "Finish", icon: <FaCheckCircle /> },
  ];
  const inputCls = "w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm text-sm font-medium";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10">
        {/* Progress */}
        <div className="flex border-b border-gray-100">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 relative py-6">
              <div className={`flex flex-col items-center transition-all duration-500 ${step > i+1 ? 'text-green-500' : step === i+1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 text-sm shadow-sm transition-all duration-500 ${step > i+1 ? 'bg-green-50' : step === i+1 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-50'}`}>
                  {step > i+1 ? <FaCheckCircle /> : s.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
              </div>
              {i < steps.length-1 && (
                <div className="absolute top-[44px] left-[calc(50%+25px)] w-[calc(100%-50px)] h-[2px] bg-gray-100">
                  <motion.div initial={{scaleX:0}} animate={{scaleX: step>i+1?1:0}} className="h-full bg-green-500 origin-left" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.3}}>
              <form onSubmit={step===3 ? handleSubmit : e=>e.preventDefault()}>

                {/* ── STEP 1: Email Verification ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Email Verification</h2>
                      <p className="text-gray-500 text-sm">Verify your email to create your account.</p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address <span className="text-red-400">*</span></label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaEnvelope /></div>
                        <input name="email" type="email" placeholder="name@example.com" className={`${inputCls} pl-12 pr-28`} onChange={handleChange} value={form.email} disabled={isEmailVerified || showOtp} />
                        {isEmailVerified ? (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1.5 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><FaCheckCircle /> Verified</div>
                        ) : !showOtp && (
                          <button type="button" onClick={handleSendOTP} disabled={otpLoading || !form.email}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">
                            {otpLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send OTP"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline OTP */}
                    <AnimatePresence>
                      {showOtp && !isEmailVerified && (
                        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                          className="p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-3xl border border-indigo-100">
                          <div className="text-center mb-4">
                            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg mx-auto mb-2"><FaShieldAlt /></div>
                            <h4 className="font-bold text-gray-900 text-sm">Enter Verification Code</h4>
                            <p className="text-xs text-gray-500 mt-1">6-digit code sent to <span className="font-semibold text-indigo-600">{form.email}</span></p>
                          </div>
                          <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                            {otp.map((d,i)=>(
                              <input key={i} ref={el=>otpRefs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                                onChange={e=>handleOtpChange(e.target.value,i)} onKeyDown={e=>handleOtpKeyDown(e,i)} onFocus={e=>e.target.select()}
                                className={`w-11 h-13 border-2 rounded-xl text-center text-lg font-bold outline-none transition-all ${otpSuccess?'border-green-400 bg-green-50 text-green-600':otpError?'border-red-300 bg-red-50 text-red-600':'border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`} />
                            ))}
                          </div>
                          {otpError && <p className="text-red-600 text-xs font-medium text-center mb-3 flex items-center justify-center gap-1"><FaTimesCircle /> {otpError}</p>}
                          {otpSuccess && <p className="text-green-600 text-xs font-bold text-center mb-3 flex items-center justify-center gap-1"><FaCheckCircle /> Verified!</p>}
                          <button type="button" onClick={handleVerifyOTP} disabled={otp.some(v=>v==="")||otpVerifying||otpSuccess}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 text-sm">
                            {otpVerifying ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</> : otpSuccess ? <><FaCheckCircle /> Done!</> : "Verify Code"}
                          </button>
                          <div className="flex justify-between items-center mt-3">
                            <button type="button" onClick={()=>{setShowOtp(false);setOtp(["","","","","",""]);setOtpError("");}} className="text-xs text-gray-400 hover:text-gray-600 font-medium">← Cancel</button>
                            {resendTimer > 0 ? <span className="text-xs text-gray-400">Resend in {resendTimer}s</span> : <button type="button" onClick={handleResend} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"><FaRedo className="text-[10px]" /> Resend</button>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Phone (optional, no OTP) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaPhone /></div>
                        <input name="phone" placeholder="10-digit mobile number" className={`${inputCls} pl-12`} onChange={handleChange} value={form.phone} maxLength={10} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Personal Details ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="mb-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-3 relative">
                        <div className="w-full h-full rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden">
                          {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <FaCamera className="text-xl text-indigo-400" />}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition active:scale-90">
                          <FaCamera className="text-xs" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                      <p className="text-gray-500 text-sm">Tell us about yourself</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Name <span className="text-red-400">*</span></label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaUser /></div>
                        <input name="name" placeholder="John Doe" className={`${inputCls} pl-12`} onChange={handleChange} value={form.name} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password <span className="text-red-400">*</span></label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaLock /></div>
                        <input name="password" type="password" placeholder="••••••••" className={`${inputCls} pl-12`} onChange={handleChange} value={form.password} required minLength={6} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5 ml-1 uppercase font-bold tracking-wider">Minimum 6 characters</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Location & Submit ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Location</h2>
                      <p className="text-gray-500 text-sm">Help us connect you to local services.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Pincode</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaMapMarkerAlt /></div>
                        <input name="pincode" placeholder="e.g. 110001" className={`${inputCls} pl-12`} onChange={handleChange} value={form.pincode} maxLength={6} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Address</label>
                      <textarea name="address" placeholder="Street, building, locality" className={`${inputCls} h-28 resize-none`} onChange={handleChange} value={form.address} />
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-3">
                      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex shrink-0 items-center justify-center text-white text-sm shadow-md"><FaShieldAlt /></div>
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900">Ready to Go</h4>
                        <p className="text-xs text-indigo-700/70 mt-0.5">By creating an account, you agree to our terms.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <AnimatePresence>
                  {error && <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-5 flex items-start gap-2.5 bg-red-50/50 border border-red-200 p-3.5 rounded-2xl text-red-800 text-sm font-medium"><FaTimesCircle className="mt-0.5 shrink-0" /> {error}</motion.div>}
                  {success && <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} className="mt-5 flex items-center gap-2.5 bg-green-50/50 border border-green-200 p-3.5 rounded-2xl text-green-800 text-sm font-medium"><FaCheckCircle className="shrink-0" /> Account created! Redirecting...</motion.div>}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && <button type="button" onClick={prevStep} className="flex-1 h-13 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2"><FaArrowLeft className="text-xs" /> Back</button>}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} className="flex-[2] h-13 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition active:scale-[0.98] flex items-center justify-center gap-2">Next <FaArrowRight className="text-xs" /></button>
                  ) : (
                    <button type="submit" disabled={isLoading||success} className="flex-[2] h-13 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading ? <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Create Account <FaCheckCircle /></>}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 ml-1">Sign In</Link></p>
            <p className="text-sm text-gray-500">Want to be a Partner? <Link to="/partner-signup" className="text-emerald-600 font-bold hover:text-emerald-800 ml-1">Partner Signup</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
