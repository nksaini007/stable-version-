import React, { useState, useRef, useEffect } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

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
  const [otpToken, setOtpToken] = useState(null);
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

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setOtpError("Enter all 6 digits"); return; }
    setOtpVerifying(true); setOtpError("");
    try {
      const res = await API.post("/users/verify-otp", { otp: code, type: "email", email: form.email });
      setOtpToken(res.data.otpToken);
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
    if (step === 1 && !form.phone) { setError("Phone number is strictly required."); return; }
    if (step === 1 && form.phone.length < 10) { setError("Please enter a valid 10-digit phone number."); return; }
    if (step === 2 && (!form.name || !form.password)) { setError("Name and password are required."); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (step === 2 && !passwordRegex.test(form.password)) { setError("Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char."); return; }
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
      if (otpToken) fd.append("otpToken", otpToken);
      await API.post("/users/signup", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally { setIsLoading(false); }
  };

  const inputCls = "w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors";

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-sm flex flex-col">
        <button type="button" onClick={() => navigate(-1)} className="self-start text-gray-400 hover:text-white mb-8 text-sm tracking-wide transition-colors">
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1.5">{step === 1 ? 'Verify your email' : step === 2 ? 'Your Details' : 'Location & Finish'}</p>
        </div>

        <div className="flex items-center mb-8 gap-2">
           <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
           <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
           <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
        </div>

        <form onSubmit={step===3 ? handleSubmit : e=>e.preventDefault()} className="flex flex-col gap-4">
          
          {step === 1 && (
            <>
              <div className="flex flex-col">
                <input name="email" type="email" placeholder="Email Address *" value={form.email} onChange={handleChange} disabled={isEmailVerified || showOtp} required className={inputCls} />
              </div>
              
              {!showOtp && !isEmailVerified && (
                <button type="button" onClick={handleSendOTP} disabled={otpLoading || !form.email} className="w-full bg-[#2A2A2A] text-white font-medium text-sm rounded-md py-3.5 mt-2 hover:bg-[#333] transition-colors disabled:opacity-50">
                   {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              )}

              {showOtp && !isEmailVerified && (
                 <div className="mt-2 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md">
                    <p className="text-xs text-gray-400 mb-3 text-center">Verify 6-digit code sent to {form.email}</p>
                    <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                      {otp.map((d,i)=>(
                        <input key={i} ref={el=>otpRefs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={d}
                               onChange={e=>handleOtpChange(e.target.value,i)} onKeyDown={e=>handleOtpKeyDown(e,i)} onFocus={e=>e.target.select()}
                               className={`w-10 h-12 bg-[#121212] border ${otpSuccess ? 'border-green-500' : otpError ? 'border-red-500' : 'border-[#333]'} rounded-md text-center text-white focus:outline-none focus:border-gray-500 transition-colors`} />
                      ))}
                    </div>
                    {otpError && <p className="text-red-400 text-xs text-center mb-3">{otpError}</p>}
                    <button type="button" onClick={handleVerifyOTP} disabled={otp.some(v=>v==="")||otpVerifying||otpSuccess} className="w-full bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3 hover:bg-white transition-colors mb-2 disabled:opacity-50">
                       {otpVerifying ? "Verifying..." : otpSuccess ? "Verified!" : "Verify Code"}
                    </button>
                    <div className="flex justify-between items-center px-1">
                      <button type="button" onClick={()=>{setShowOtp(false);setOtp(["","","","","",""]);setOtpError("");}} className="text-xs text-gray-500 hover:text-white transition-colors">Cancel</button>
                      <button type="button" onClick={handleResend} disabled={resendTimer>0} className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50">{resendTimer>0 ? `Resend in ${resendTimer}s`:`Resend`}</button>
                    </div>
                 </div>
              )}

              {isEmailVerified && (
                <p className="text-green-400 text-xs text-center mt-2">Email Verified ✓</p>
              )}

              <div className="flex flex-col mt-2">
                <input name="phone" placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g,'').substring(0,10)})} maxLength={10} required className={inputCls} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col mb-4 items-center">
                 <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center overflow-hidden mb-2 relative hover:border-gray-500 transition-colors">
                    {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">Avatar</span>}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                 </div>
                 <span className="text-xs text-gray-500">Profile Photo (Optional)</span>
              </div>
              <div className="flex flex-col">
                <input name="name" type="text" placeholder="Full Name *" value={form.name} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="flex flex-col">
                <input name="password" type="password" placeholder="Strong Password (Min 8 chars, 1 Uppercase, 1 Symbol) *" value={form.password} onChange={handleChange} required minLength={8} className={inputCls} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col">
                <input name="pincode" type="text" placeholder="Pincode" value={form.pincode} onChange={handleChange} maxLength={6} className={inputCls} />
              </div>
              <div className="flex flex-col">
                <textarea name="address" placeholder="Full Address" value={form.address} onChange={handleChange} className={`${inputCls} h-24 resize-none`} />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input type="checkbox" id="terms" required className="w-4 h-4 rounded-sm bg-[#1A1A1A] border border-[#333] accent-white cursor-pointer" />
                <label htmlFor="terms" className="text-xs text-gray-400 select-none cursor-pointer">
                  I agree to Terms & Conditions
                </label>
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
          {success && <p className="text-green-400 text-xs text-center mt-2">Account created! Redirecting...</p>}

          <div className="flex gap-3 mt-4">
            {step > 1 && (
               <button type="button" onClick={prevStep} className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-white font-medium text-sm rounded-md py-3.5 hover:bg-[#2A2A2A] transition-colors">
                 Back
               </button>
            )}
            {step < 3 ? (
               <button type="button" onClick={nextStep} className="flex-[2] bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 hover:bg-white transition-colors">
                 Next Step
               </button>
            ) : (
               <button type="submit" disabled={isLoading||success} className="flex-[2] bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 hover:bg-white transition-colors disabled:opacity-50">
                 {isLoading ? "Processing..." : "Sign Up"}
               </button>
            )}
          </div>
        </form>

        <div className="flex items-center my-8">
          <hr className="flex-1 border-[#2A2A2A]" />
          <span className="px-4 text-xs text-gray-500">or</span>
          <hr className="flex-1 border-[#2A2A2A]" />
        </div>

        <div className="text-center text-xs text-gray-400 flex flex-col gap-3">
          <p>Already have an account? <Link to="/login" className="text-white hover:underline transition-all ml-1">Sign In</Link></p>
          <p>Want to be a Partner? <Link to="/partner-signup" className="text-white hover:underline transition-all ml-1">Partner Signup</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
