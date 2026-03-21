import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaArrowRight, FaCheckCircle, FaTimesCircle, FaCamera,
  FaBuilding, FaShieldAlt, FaEnvelope, FaPhone, FaLock,
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
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState("");
  const [otpMode, setOtpMode] = useState(""); // "email" | "phone" | ""
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // ── Send OTP ──
  const handleSendOTP = async (type) => {
    const value = type === "email" ? form.email : form.phone;
    if (!value) { setError(`Please enter your ${type} first`); return; }
    // Phone OTP requires email to be verified first (code is sent to email)
    if (type === "phone" && !isEmailVerified) {
      setError("Please verify your email first. Phone verification code will be sent to your email.");
      return;
    }
    setOtpLoading(type);
    setError("");
    setOtpError("");
    setOtpSuccess(false);
    setOtp(["", "", "", "", "", ""]);
    try {
      // For phone, also send email so backend can deliver OTP via email
      const payload = type === "phone"
        ? { phone: value, email: form.email, type }
        : { email: value, type };
      await API.post("/users/send-otp", payload);
      setOtpMode(type);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to send ${type} OTP`);
    } finally {
      setOtpLoading("");
    }
  };

  // ── OTP Input Handling ──
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) { setOtpError("Please enter all 6 digits"); return; }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const payload = {
        otp: otpString,
        type: otpMode,
        [otpMode === "email" ? "email" : "phone"]: otpMode === "email" ? form.email : form.phone,
      };
      await API.post("/users/verify-otp", payload);
      setOtpSuccess(true);
      if (otpMode === "email") setIsEmailVerified(true);
      if (otpMode === "phone") setIsPhoneVerified(true);
      setTimeout(() => {
        setOtpMode("");
        setOtp(["", "", "", "", "", ""]);
        setOtpSuccess(false);
      }, 1500);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    setResendTimer(60);
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const value = otpMode === "email" ? form.email : form.phone;
      await API.post("/users/send-otp", { [otpMode]: value, type: otpMode });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setOtpError("Failed to resend OTP");
    }
  };

  const nextStep = () => {
    if (step === 1 && !isEmailVerified) {
      setError("Please verify your email to continue.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => { setError(""); setStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", "customer");
      if (form.phone) formData.append("phone", form.phone);
      if (form.address) formData.append("address", form.address);
      if (form.pincode) formData.append("pincode", form.pincode);
      if (profileImage) formData.append("profileImage", profileImage);
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

  const steps = [
    { title: "Verify", icon: <FaShieldAlt /> },
    { title: "Details", icon: <FaUser /> },
    { title: "Finish", icon: <FaCheckCircle /> },
  ];

  const inputClasses = "w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 shadow-sm text-sm font-medium";

  // ── OTP Input Card (Inline) ──
  const renderOtpCard = () => {
    if (!otpMode) return null;
    const targetValue = otpMode === "email" ? form.email : form.phone;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        className="mt-5 p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-3xl border border-indigo-100 shadow-inner"
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg mx-auto mb-3">
            <FaShieldAlt />
          </div>
          <h4 className="font-bold text-gray-900 text-base">Enter Verification Code</h4>
          <p className="text-xs text-gray-500 mt-1">
            {otpMode === "phone" ? (
              <>Code for <span className="font-semibold text-emerald-600">{targetValue}</span> sent to your <span className="font-semibold text-indigo-600">email</span></>
            ) : (
              <>6-digit code sent to <span className="font-semibold text-indigo-600">{targetValue}</span></>
            )}
          </p>
        </div>

        {/* 6 OTP Input Boxes */}
        <div className="flex justify-center gap-2.5 mb-5" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, i)}
              onKeyDown={(e) => handleOtpKeyDown(e, i)}
              onFocus={(e) => e.target.select()}
              className={`w-12 h-14 border-2 rounded-2xl text-center text-xl font-bold outline-none transition-all duration-200 ${
                otpSuccess
                  ? "border-green-400 bg-green-50 text-green-600"
                  : otpError
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white/80 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              }`}
            />
          ))}
        </div>

        {/* Error / Success */}
        <AnimatePresence mode="wait">
          {otpError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-red-600 text-xs font-medium text-center mb-4 flex items-center justify-center gap-1.5">
              <FaTimesCircle /> {otpError}
            </motion.p>
          )}
          {otpSuccess && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-green-600 text-xs font-bold text-center mb-4 flex items-center justify-center gap-1.5">
              <FaCheckCircle /> Verified Successfully!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerifyOTP}
          disabled={otp.some((v) => v === "") || otpVerifying || otpSuccess}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
        >
          {otpVerifying ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</>
          ) : otpSuccess ? (
            <><FaCheckCircle /> Verified!</>
          ) : (
            "Verify Code"
          )}
        </button>

        {/* Resend & Cancel Row */}
        <div className="flex justify-between items-center mt-4">
          <button type="button" onClick={() => { setOtpMode(""); setOtp(["","","","","",""]); setOtpError(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition">
            ← Cancel
          </button>
          {resendTimer > 0 ? (
            <span className="text-xs text-gray-400 font-medium">Resend in {resendTimer}s</span>
          ) : (
            <button type="button" onClick={handleResend}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1">
              <FaRedo className="text-[10px]" /> Resend Code
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -ml-64 -mb-64"></div>

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative z-10">

        {/* Progress Bar */}
        <div className="flex border-b border-gray-100">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 relative py-6">
              <div className={`flex flex-col items-center transition-all duration-500 ${step > i + 1 ? 'text-green-500' : step === i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 text-sm shadow-sm transition-all duration-500 ${step > i + 1 ? 'bg-green-50 border-green-100' : step === i + 1 ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                  {step > i + 1 ? <FaCheckCircle /> : s.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-[44px] left-[calc(50%+25px)] w-[calc(100%-50px)] h-[2px] bg-gray-100">
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: step > i + 1 ? 1 : 0 }} className="h-full bg-green-500 origin-left"></motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>

                {/* ── STEP 1: Verification ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h2>
                      <p className="text-gray-500 text-sm">Verify your email to secure your account.</p>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <FaEnvelope />
                        </div>
                        <input name="email" type="email" placeholder="name@company.com"
                          className={`${inputClasses} pl-12 pr-28`}
                          onChange={handleChange} value={form.email}
                          disabled={isEmailVerified || otpMode === "email"} />
                        {isEmailVerified ? (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1.5 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                            <FaCheckCircle /> Verified
                          </div>
                        ) : otpMode !== "email" ? (
                          <button type="button" onClick={() => handleSendOTP("email")}
                            disabled={otpLoading === "email" || !form.email}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">
                            {otpLoading === "email" ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : "Send OTP"}
                          </button>
                        ) : null}
                      </div>
                      {/* Inline OTP Card for Email */}
                      <AnimatePresence>{otpMode === "email" && renderOtpCard()}</AnimatePresence>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <FaPhone />
                        </div>
                        <input name="phone" placeholder="10-digit mobile number"
                          className={`${inputClasses} pl-12 pr-28`}
                          onChange={handleChange} value={form.phone}
                          maxLength={10}
                          disabled={isPhoneVerified || otpMode === "phone"} />
                        {isPhoneVerified ? (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1.5 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                            <FaCheckCircle /> Verified
                          </div>
                        ) : otpMode !== "phone" ? (
                          <button type="button" onClick={() => handleSendOTP("phone")}
                            disabled={otpLoading === "phone" || !form.phone}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50">
                            {otpLoading === "phone" ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : "Send OTP"}
                          </button>
                        ) : null}
                      </div>
                      <AnimatePresence>{otpMode === "phone" && renderOtpCard()}</AnimatePresence>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Personal Details ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="mb-8 text-center">
                      <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div className="w-full h-full rounded-3xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden">
                          {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <FaCamera className="text-2xl text-indigo-400" />}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition active:scale-90">
                          <FaCamera className="text-sm" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Your Identity</h2>
                      <p className="text-gray-500 text-sm">Tell us a bit about yourself.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Name</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaUser /></div>
                        <input name="name" placeholder="John Doe" className={`${inputClasses} pl-12`} onChange={handleChange} value={form.name} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Create Password</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaLock /></div>
                        <input name="password" type="password" placeholder="••••••••" className={`${inputClasses} pl-12`} onChange={handleChange} value={form.password} required minLength={6} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 ml-1 uppercase font-bold tracking-wider">At least 6 characters</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Location & Submit ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Details</h2>
                      <p className="text-gray-500 text-sm">Help us connect you to local services.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Pincode / Zip</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"><FaMapMarkerAlt /></div>
                        <input name="pincode" placeholder="e.g. 110001" className={`${inputClasses} pl-12`} onChange={handleChange} value={form.pincode} maxLength={6} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Full Address</label>
                      <textarea name="address" placeholder="Street, building, locality" className={`${inputClasses} h-32 resize-none`} onChange={handleChange} value={form.address}></textarea>
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 mt-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex shrink-0 items-center justify-center text-white text-sm shadow-md"><FaShieldAlt /></div>
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900">Ready to Go</h4>
                        <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">By creating an account, you agree to our terms. Your data is protected.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error / Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-6 flex items-start gap-3 bg-red-50/50 border border-red-200 p-4 rounded-2xl text-red-800 text-sm font-medium">
                      <FaTimesCircle className="mt-0.5 shrink-0" /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex items-center gap-3 bg-green-50/50 border border-green-200 p-4 rounded-2xl text-green-800 text-sm font-medium">
                      <FaCheckCircle className="shrink-0" /> Account created! Redirecting...
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-10">
                  {step > 1 && (
                    <button type="button" onClick={prevStep} className="flex-1 h-14 rounded-2xl border-2 border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <FaArrowLeft className="text-xs" /> Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep}
                      className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      Next Step <FaArrowRight className="text-xs" />
                    </button>
                  ) : (
                    <button type="submit" disabled={isLoading || success}
                      className="flex-[2] h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      {isLoading ? (
                        <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                      ) : (
                        <>Create Account <FaCheckCircle /></>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 ml-1 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
