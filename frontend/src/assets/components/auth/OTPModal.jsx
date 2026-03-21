import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaShieldAlt } from "react-icons/fa";
import API from "../../api/api";

const OTPModal = ({ isOpen, onClose, type, value, onVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    try {
      const otpString = otp.join("");
      const payload = { 
        otp: otpString, 
        type: type,
        [type === "email" ? "email" : "phone"]: value 
      };
      
      const response = await API.post("/users/verify-otp", payload);
      setSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setError("");
    try {
      const payload = { 
        type: type,
        [type === "email" ? "email" : "phone"]: value 
      };
      await API.post("/users/send-otp", payload);
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 relative"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="p-8 relative">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-gray-100/50 rounded-full transition text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mx-auto mb-4">
              <FaShieldAlt />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Verification</h3>
            <p className="text-sm text-gray-500 mt-2 px-6">
              Enter the 6-digit code sent to <br/>
              <span className="font-semibold text-indigo-600">{value}</span>
            </p>
          </div>

          <div className="flex justify-between gap-2.5 mb-8">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-full aspect-square border-2 border-gray-200 rounded-2xl text-center text-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 bg-white/50"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !data && e.target.previousSibling) {
                    e.target.previousSibling.focus();
                  }
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3 text-red-600 text-sm font-medium bg-red-50/50 backdrop-blur-sm p-4 rounded-2xl border border-red-100"
              >
                <FaExclamationCircle className="shrink-0" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 flex items-center gap-3 text-green-600 text-sm font-medium bg-green-50/50 backdrop-blur-sm p-4 rounded-2xl border border-green-100"
              >
                <FaCheckCircle className="shrink-0" /> Verified Successfully!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={otp.some(v => v === "") || isLoading || success}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 h-14"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : "Verify now"}
          </button>

          <div className="mt-8 text-center">
            <div className="inline-block p-1 px-4 bg-gray-50/50 rounded-full border border-gray-100">
              <p className="text-sm text-gray-600">
                Didn't receive code? {timer > 0 ? (
                  <span className="text-gray-400 font-medium ml-1 flex items-center gap-1.5 inline-flex">
                    <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
                    Resend in {timer}s
                  </span>
                ) : (
                  <button onClick={handleResend} className="text-indigo-600 font-bold hover:text-indigo-800 ml-1 transition">Resend Now</button>
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPModal;
