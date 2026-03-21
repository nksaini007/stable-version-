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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <FaShieldAlt />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">OTP Verification</h3>
              <p className="text-xs text-gray-500">Enter the code sent to {value}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
            <FaTimes />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                name="otp"
                maxLength="1"
                className="w-12 h-14 border border-gray-300 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                <FaExclamationCircle /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100">
                <FaCheckCircle /> Verification Successful!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={otp.some(v => v === "") || isLoading || success}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive code? {timer > 0 ? (
                <span className="text-gray-400 font-medium ml-1">Resend in {timer}s</span>
              ) : (
                <button onClick={handleResend} className="text-indigo-600 font-bold hover:text-indigo-800 ml-1">Resend Now</button>
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPModal;
