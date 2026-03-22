import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP State
  const [otpLoading, setOtpLoading] = useState(false);
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
    if (!email) { setError("Please enter your email"); return; }
    setOtpLoading(true); setError(""); setOtpError(""); setOtpSuccess(false); setOtp(["","","","","",""]);
    try {
      await API.post("/users/send-otp", { email, type: "email" });
      setStep(2);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code");
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
      await API.post("/users/verify-otp", { otp: code, type: "email", email });
      setOtpSuccess(true);
      setTimeout(() => { setStep(3); setOtpSuccess(false); }, 1000);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired code");
    } finally { setOtpVerifying(false); }
  };

  const handleResend = async () => {
    setResendTimer(60); setOtpError(""); setOtp(["","","","","",""]);
    try {
      await API.post("/users/send-otp", { email, type: "email" });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setOtpError("Failed to resend"); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsLoading(true); setError("");
    try {
      await API.post("/users/reset-password", { email, newPassword });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-sm flex flex-col">
        <button type="button" onClick={() => navigate(-1)} className="self-start text-gray-400 hover:text-white mb-8 text-sm tracking-wide transition-colors">
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            {step === 1 ? "Enter your email to receive a code" : step === 2 ? "Verify your email" : "Create new password"}
          </p>
        </div>

        <div className="flex items-center mb-8 gap-2">
           <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
           <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
           <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-[#F3F4F6]' : 'bg-[#2A2A2A]'}`} />
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button 
              type="button" 
              onClick={handleSendOTP} 
              disabled={otpLoading || !email}
              className="w-full bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 mt-2 hover:bg-white transition-colors disabled:opacity-50"
            >
              {otpLoading ? "Sending Code..." : "Send Reset Code"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md">
              <p className="text-xs text-gray-400 mb-3 text-center">Enter 6-digit code sent to {email}</p>
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
                <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-white transition-colors">Change Email</button>
                <button type="button" onClick={handleResend} disabled={resendTimer>0} className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-50">{resendTimer>0 ? `Resend in ${resendTimer}s`:`Resend`}</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="New Password (Min 6 chars)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 mt-2 hover:bg-white transition-colors disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="flex items-center my-8">
          <hr className="flex-1 border-[#2A2A2A]" />
          <span className="px-4 text-xs text-gray-500">or</span>
          <hr className="flex-1 border-[#2A2A2A]" />
        </div>

        <p className="text-center text-xs text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="text-white hover:underline transition-all">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
