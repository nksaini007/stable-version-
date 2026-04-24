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
  FaCheckCircle,
  FaBox,
  FaStar
} from "react-icons/fa";
import { motion } from "framer-motion";

const ProfileSection = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-zinc-100 p-8 sm:p-10 space-y-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
    <div className="border-b border-zinc-100 pb-5">
      <h3 className="text-lg font-medium text-zinc-900 uppercase tracking-tight">{title}</h3>
      <p className="text-[11px] text-zinc-400 font-medium tracking-wide mt-1.5">{subtitle}</p>
    </div>
    {children}
  </div>
);

const InputField = ({ label, icon, value, onChange, type = "text", placeholder, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest pl-1">{label}</label>
    <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 ${disabled ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-zinc-50/30 border-zinc-200 hover:border-zinc-300 focus-within:bg-white focus-within:border-zinc-500 focus-within:shadow-[0_0_0_4px_rgba(24,24,27,0.05)] group"}`}>
      <span className={`text-zinc-400 transition-colors ${!disabled && 'group-focus-within:text-zinc-900'}`}>{icon}</span>
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-zinc-900 placeholder:text-zinc-300 !font-medium"
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
    <div className="max-w-4xl mx-auto space-y-8 customer-theme">
      {/* Premium Executive Profile Header */}
      <div className="bg-zinc-950 rounded-2xl p-8 sm:p-12 border border-zinc-800 shadow-2xl relative overflow-hidden group">
         {/* Subtle luxury glow */}
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
         
         <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-8">
            <div className="relative">
               <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center text-zinc-900 text-5xl font-light shadow-xl overflow-hidden cursor-pointer transform group-hover:scale-105 transition-transform duration-500">
                  {user?.name?.charAt(0) || "U"}
               </div>
               <button className="absolute -bottom-4 -right-4 w-12 h-12 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center shadow-2xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-white/20 backdrop-blur-md">
                  <FaCamera size={14} />
               </button>
            </div>
            
            <div className="text-center sm:text-left flex-1 mt-4 sm:mt-0">
               <h2 className="text-3xl font-medium text-white tracking-tight mb-3">{user?.name || "Customer Name"}</h2>
               <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <span className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-lg text-[10px] font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2 border border-zinc-800 shadow-sm">
                     <FaShieldAlt size={12} className="text-zinc-500" /> Verified Account
                  </span>
                  <span className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-lg text-[10px] font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2 border border-zinc-800 shadow-sm">
                     <FaBox size={12} className="text-zinc-500" /> Standard Tier
                  </span>
               </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end self-center pb-2">
               <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mb-1">Member since</p>
               <p className="text-sm font-medium text-zinc-300 tracking-wide">Oct 2024</p>
            </div>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: General Info */}
        <div className="lg:col-span-3 space-y-6">
           <ProfileSection title="General Information" subtitle="Update your basic account details here.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <InputField 
                    label="Full Name" 
                    icon={<FaUser size={12} />} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Enter your name"
                 />
                 <InputField 
                    label="Email Address" 
                    icon={<FaEnvelope size={12} />} 
                    value={formData.email} 
                    disabled={true} 
                    placeholder="email@example.com"
                 />
                 <InputField 
                    label="Phone Number" 
                    icon={<FaMapMarkerAlt size={12} />} 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+91 00000 00000"
                 />
                 <div className="space-y-2">
                    <label className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest pl-1">Theme Preference</label>
                    <div className="bg-zinc-100 p-1.5 rounded-xl flex gap-1 h-[52px]">
                       <button type="button" className="flex-1 h-full bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] rounded-lg text-[10px] font-medium text-zinc-900 uppercase tracking-widest transition-all">Light</button>
                       <button type="button" className="flex-1 h-full text-zinc-400 font-medium text-[10px] uppercase tracking-widest hover:text-zinc-600 transition-colors">Dark</button>
                    </div>
                 </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-zinc-950 text-white rounded-xl font-medium uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 mt-4"
              >
                 {loading ? "Saving..." : "Save Changes"}
              </motion.button>
              {success && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-zinc-700 bg-zinc-50 border border-zinc-200 py-3 rounded-xl text-[11px] font-medium flex items-center gap-2 justify-center uppercase tracking-widest shadow-sm">
                  <FaCheckCircle size={14} className="text-zinc-900" /> {success}
                </motion.p>
              )}
           </ProfileSection>

           {/* Preferences Feature Mock */}
           <ProfileSection title="Notifications" subtitle="Control how we communicate with you.">
              <div className="space-y-4">
                 {[
                   { id: "email_notif", label: "Email Notifications", desc: "Receive order updates via email", icon: <FaEnvelope size={14} /> },
                   { id: "sms_notif", label: "SMS Alerts", desc: "Real-time delivery updates", icon: <FaBell size={14} /> },
                   { id: "promo_notif", label: "Promotions", desc: "News & special offers", icon: <FaStar size={14} /> }
                 ].map(item => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-md transition-all duration-300 group cursor-pointer">
                      <div className="flex gap-4 items-center">
                         <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-all">{item.icon}</div>
                         <div>
                            <p className="text-[12px] font-medium text-zinc-900 tracking-wide">{item.label}</p>
                            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1">{item.desc}</p>
                         </div>
                      </div>
                      <div className="w-11 h-6 bg-zinc-900 rounded-full relative shadow-inner">
                         <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                   </div>
                 ))}
              </div>
           </ProfileSection>
        </div>

        {/* Right Side: Security */}
        <div className="lg:col-span-2 space-y-6">
           <ProfileSection title="Security" subtitle="Keep your account safe.">
              <InputField 
                 label="Current Password" 
                 icon={<FaLock size={12} />} 
                 type="password"
                 value={formData.currentPassword} 
                 onChange={e => setFormData({...formData, currentPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <InputField 
                 label="New Password" 
                 icon={<FaLock size={12} />} 
                 type="password"
                 value={formData.newPassword} 
                 onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <InputField 
                 label="Confirm New Password" 
                 icon={<FaLock size={12} />} 
                 type="password"
                 value={formData.confirmPassword} 
                 onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                 placeholder="••••••••"
              />
              <button type="button" className="w-full py-4 border-2 border-zinc-200 text-zinc-600 rounded-xl font-medium uppercase tracking-widest text-[11px] hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm">
                 Update Password
              </button>
           </ProfileSection>

           {/* Account Danger Zone */}
           <div className="bg-red-50/30 p-8 rounded-2xl border border-red-100 flex flex-col items-center text-center hover:bg-red-50/50 transition-colors">
              <div className="w-12 h-12 bg-red-100/50 text-red-500 rounded-full flex items-center justify-center mb-4"><FaShieldAlt size={18}/></div>
              <h4 className="text-[12px] font-medium text-red-800 uppercase tracking-widest">Delete Account</h4>
              <p className="text-[11px] text-red-500/80 font-medium mt-2 leading-relaxed tracking-wide px-4">Permanently remove all your data. This action is irreversible.</p>
              <button className="mt-6 text-[10px] font-medium text-red-600 uppercase tracking-widest hover:text-red-800 underline underline-offset-4 decoration-red-200 transition-all">Deactivate Account</button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;
