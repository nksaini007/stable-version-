import React, { useState, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import API from "../../../../../api/api";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaShieldAlt, 
  FaBell, 
  FaMapMarkerAlt, 
  FaCamera,
  FaCheckCircle
} from "react-icons/fa";
import { motion } from "framer-motion";

const ProfileSection = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
    <div>
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>
      <p className="text-sm text-gray-400 font-medium">{subtitle}</p>
    </div>
    {children}
  </div>
);

const InputField = ({ label, icon, value, onChange, type = "text", placeholder, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${disabled ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/5 group"}`}>
      <span className={`text-gray-400 ${!disabled && 'group-focus-within:text-orange-500'}`}>{icon}</span>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-800 placeholder:text-gray-300 placeholder:font-medium"
      />
    </div>
  </div>
);

const CustomerProfile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call for now or integrate with real endpoint if exists
      // await API.put("/users/profile", formData);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
         <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white/10 overflow-hidden cursor-pointer">
                  {user?.name?.charAt(0) || "U"}
               </div>
               <button className="absolute bottom-2 right-2 w-10 h-10 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                  <FaCamera size={16} />
               </button>
            </div>
            <div className="text-center sm:text-left">
               <h2 className="text-3xl sm:text-4xl font-black mb-2">{user?.name || "Customer Name"}</h2>
               <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                     <FaShieldAlt className="text-orange-400" /> Account Verified
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/5">
                     <FaBox className="text-indigo-400" /> Buyer Rank
                  </span>
               </div>
               <p className="text-gray-400 mt-4 text-sm font-medium opacity-80 uppercase tracking-widest">Member since Oct 2024</p>
            </div>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-3 space-y-8">
           <ProfileSection title="General Information" subtitle="Update your basic account details here.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <InputField 
                    label="Full Name" 
                    icon={<FaUser />} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter your name"
                 />
                 <InputField 
                    label="Email Address" 
                    icon={<FaEnvelope />} 
                    value={formData.email} 
                    disabled={true} 
                    placeholder="email@example.com"
                 />
                 <InputField 
                    label="Phone Number" 
                    icon={<FaMapMarkerAlt />} 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+91 00000 00000"
                 />
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Theme Preference</label>
                    <div className="bg-gray-50 p-2 rounded-2xl flex gap-2">
                       <button type="button" className="flex-1 py-1.5 bg-white shadow-sm rounded-xl text-xs font-black text-gray-900 uppercase tracking-tight">Light</button>
                       <button type="button" className="flex-1 py-1.5 text-gray-400 font-bold text-xs uppercase tracking-tight">Dark</button>
                    </div>
                 </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2"
              >
                 {loading ? "Saving..." : "Save Changes"}
              </motion.button>
              {success && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 text-sm font-bold flex items-center gap-2 justify-center">
                  <FaCheckCircle /> {success}
                </motion.p>
              )}
           </ProfileSection>

           {/* Preferences Feature Mock */}
           <ProfileSection title="Notifications" subtitle="Control how we communicate with you.">
              <div className="space-y-4">
                 {[
                   { id: "email_notif", label: "Email Notifications", desc: "Receive order updates via email", icon: <FaEnvelope /> },
                   { id: "sms_notif", label: "SMS Alerts", desc: "Real-time delivery updates", icon: <FaBell /> },
                   { id: "promo_notif", label: "Promotions", desc: "News & special offers", icon: <FaStar /> }
                 ].map(item => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">{item.icon}</div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{item.desc}</p>
                         </div>
                      </div>
                      <div className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer">
                         <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                   </div>
                 ))}
              </div>
           </ProfileSection>
        </div>

        {/* Right Side: Security */}
        <div className="lg:col-span-2 space-y-8">
           <ProfileSection title="Security" subtitle="Keep your account safe.">
              <InputField 
                 label="Current Password" 
                 icon={<FaLock />} 
                 type="password"
                 value={formData.currentPassword} 
                 onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <InputField 
                 label="New Password" 
                 icon={<FaLock />} 
                 type="password"
                 value={formData.newPassword} 
                 onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <InputField 
                 label="Confirm New Password" 
                 icon={<FaLock />} 
                 type="password"
                 value={formData.confirmPassword} 
                 onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <button type="button" className="w-full py-4 border-2 border-orange-500 text-orange-600 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-orange-50 transition-all">
                 Update Password
              </button>
           </ProfileSection>

           {/* Account Danger Zone */}
           <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4"><FaShieldAlt size={20}/></div>
              <h4 className="text-lg font-black text-red-900 uppercase tracking-tight">Delete Account</h4>
              <p className="text-xs text-red-500/80 font-bold font-medium mt-1 leading-relaxed">Permanently remove all your data. This action is irreversible.</p>
              <button className="mt-6 text-xs font-black text-red-600 uppercase tracking-[0.2em] hover:underline transition-all">DEACTIVATE ACCOUNT</button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;
