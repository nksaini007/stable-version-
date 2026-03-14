import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaBuilding
} from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    pincode: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

      await axios.post(`/api/users/signup`, formData, {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-gray-100 bg-gray-50/50">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm mb-4">
            <FaBuilding className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h1>
          <p className="text-sm text-gray-500 mt-2">Sign up as a customer and join the platform.</p>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center mb-2">
              <div className="text-center">
                <label className="relative cursor-pointer group block">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden group-hover:border-indigo-400 group-hover:bg-indigo-100 transition">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaCamera className="text-xl text-indigo-400" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <span className="block text-xs font-medium text-gray-500 mt-2">Upload Profile Photo</span>
              </div>
            </div>

            {/* Basic Fields */}
            <div>
              <label className={labelClasses}>Full Name</label>
              <input name="name" placeholder="John Doe" className={inputClasses} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Email Address</label>
                <input name="email" type="email" placeholder="name@company.com" className={inputClasses} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelClasses}>Password</label>
                <input name="password" type="password" placeholder="••••••••" className={inputClasses} onChange={handleChange} required minLength={6} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Phone Number (Optional)</label>
                <input name="phone" placeholder="10-digit number" className={inputClasses} onChange={handleChange} maxLength={10} />
              </div>
              <div>
                <label className={labelClasses}>Pincode / Zip</label>
                <input name="pincode" placeholder="e.g. 110001" className={inputClasses} onChange={handleChange} maxLength={6} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Full Address</label>
              <input name="address" placeholder="Street layout, building number, locality" className={inputClasses} onChange={handleChange} />
            </div>

            {/* Messages */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 p-3.5 rounded-lg text-red-800 text-sm font-medium">
                  <FaTimesCircle className="mt-0.5 shrink-0" /> {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-green-50 border border-green-200 p-3.5 rounded-lg text-green-800 text-sm font-medium">
                  <FaCheckCircle className="mt-0.5 shrink-0" /> Account created successfully! Redirecting...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-11 gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>Sign Up <FaArrowRight /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center bg-gray-50 -mx-8 -mb-8 p-6 border-t border-gray-100 flex flex-col gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Already have an account? <span className="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</span>
            </Link>
            <div className="w-2/3 h-px bg-gray-200 mx-auto my-1"></div>
            <p className="text-xs text-gray-500">
              Looking to sell, deliver, or provide services?<br />
              <Link to="/partner-signup" className="text-indigo-600 font-semibold hover:text-indigo-800 mt-1 inline-block">
                Partner Registration &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
