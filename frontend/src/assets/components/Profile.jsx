import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaEdit, FaCalendarAlt,
  FaCamera, FaSave, FaTimes, FaLock, FaStore, FaTruck, FaShieldAlt,
  FaCog, FaSpinner, FaFacebook, FaInstagram, FaTwitter, FaLinkedin,
  FaChevronRight, FaRegHandshake, FaToolbox, FaGlobe, FaUniversity,
  FaCreditCard, FaFileContract, FaLink
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import Nev from "./Nev";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [locationData, setLocationData] = useState({ lat: "", lng: "", city: "" });
  const [citySearch, setCitySearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        pincode: user.pincode || "",
        aadhaarNumber: user.aadhaarNumber || "",
        businessName: user.businessName || "",
        gstNumber: user.gstNumber || "",
        panNumber: user.panNumber || "",
        companyRegistrationNumber: user.companyRegistrationNumber || "",
        tradeLicenseNumber: user.tradeLicenseNumber || "",
        fssaiLicense: user.fssaiLicense || "",
        businessAddress: user.businessAddress || "",
        businessCategory: user.businessCategory || "",
        bankAccount: user.bankAccount || "",
        ifscCode: user.ifscCode || "",
        vehicleType: user.vehicleType || "",
        licenseNumber: user.licenseNumber || "",
        rcBookNumber: user.rcBookNumber || "",
        deliveryAreaPincode: user.deliveryAreaPincode || "",
        skills: user.skills ? user.skills.join(", ") : "",
        contactInfo: user.contactInfo || "",
        coaRegistration: user.coaRegistration || "",
        serviceCategoryId: user.serviceCategoryId || "",
        serviceSubCategoryId: user.serviceSubCategoryId || "",
        serviceDescription: user.serviceDescription || "",
        experience: user.experience || "",
        storeDescription: user.storeDescription || "",
        supportPhone: user.supportPhone || "",
        supportEmail: user.supportEmail || "",
        businessType: user.businessType || "",
        socialLinks: user.socialLinks || { facebook: "", instagram: "", twitter: "", linkedin: "" },
      });
      setLocationData({
        lat: user.location?.lat || "",
        lng: user.location?.lng || "",
        city: user.location?.city || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchServiceCats = async () => {
      try {
        const { data } = await API.get("/service-categories");
        setServiceCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServiceCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm({
        ...form,
        [parent]: { ...form[parent], [child]: value }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "profile") {
      setNewImage(file);
      if (file) setImagePreview(URL.createObjectURL(file));
    } else if (type === "banner") {
      setNewBanner(file);
      if (file) setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setMsg({ text: "Geolocation is not supported.", type: "error" });
      return;
    }
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await resp.json();
          const cityName = data.address?.city || data.address?.town || data.address?.village || "";
          setLocationData({ lat: latitude, lng: longitude, city: cityName });
          setCitySearch(data.display_name.split(",").slice(0, 2).join(","));
        } catch (e) {
          setLocationData({ lat: latitude, lng: longitude, city: "" });
        } finally {
          setSearching(false);
        }
      },
      () => {
        setSearching(false);
        setMsg({ text: "GPS Access Denied.", type: "error" });
      }
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "socialLinks") formData.append(k, JSON.stringify(v));
        else if (v !== undefined && v !== null) formData.append(k, v);
      });
      if (newImage) formData.append("profileImage", newImage);
      if (newBanner) formData.append("shopBanner", newBanner);
      if (locationData.lat) {
        formData.append("location[lat]", locationData.lat);
        formData.append("location[lng]", locationData.lng);
        formData.append("location[city]", locationData.city);
      }
      const { data } = await API.put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setMsg({ text: "Identity Synchronization Complete", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Sync Failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const roleMeta = {
    customer: { icon: <FaUser />, label: "Global Resident", color: "blue" },
    seller: { icon: <FaStore />, label: "Certified Merchant", color: "emerald" },
    delivery: { icon: <FaTruck />, label: "Logistics Partner", color: "orange" },
    admin: { icon: <FaShieldAlt />, label: "System Architect", color: "purple" },
    architect: { icon: <FaGlobe />, label: "Design Professional", color: "cyan" },
    provider: { icon: <FaRegHandshake />, label: "Service Specialist", color: "amber" },
  };
  const rm = roleMeta[user?.role] || roleMeta.customer;

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => { setActiveTab(id); setMsg({ text: "", type: "" }); }}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 relative group overflow-hidden ${
        activeTab === id ? "text-white bg-blue-600 shadow-xl shadow-blue-500/20" : "text-white/40 hover:text-white"
      }`}
    >
      <span className={activeTab === id ? "text-white scale-110" : "text-white/20 group-hover:text-blue-400 group-hover:scale-110 transition-transform"}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
      {activeTab === id && <motion.div layoutId="tab-active" className="absolute left-0 w-1 h-1/2 bg-white rounded-r-full" />}
    </button>
  );

  const InfoCard = ({ title, icon, children, className = "" }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-blue-400">
          {icon}
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );

  const InputField = ({ label, name, value, type = "text", placeholder, icon, ...props }) => (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">
          {icon}
        </div>
        <input
          name={name} value={value} type={type} onChange={handleChange} placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
          {...props}
        />
      </div>
    </div>
  );

  const profileImg = imagePreview || (user?.profileImage ? `${user.profileImage}` : null);
  const bannerImg = bannerPreview || (user?.shopBanner ? `${user.shopBanner}` : null);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E2E8F0] flex flex-col md:flex-row font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden md:flex w-72 lg:w-80 bg-[#0D0D0D] border-r border-white/5 flex-col fixed h-screen z-50">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#050505] font-black italic">S</div>
            <span className="text-2xl font-black text-white tracking-tighter">STINCHAR</span>
          </Link>
          
          <nav className="flex flex-col gap-4">
            <TabButton id="overview" label="Core Intelligence" icon={<FaUser />} />
            <TabButton id="settings" label="Identity Tuning" icon={<FaCog />} />
            <TabButton id="security" label="Quantum Access" icon={<FaLock />} />
          </nav>
        </div>
        
        <div className="mt-auto p-10">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Session Node</p>
             <p className="text-xs font-bold truncate">{user?.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 lg:ml-80 transition-all">
        {/* Mobile Top Nav */}
        <div className="md:hidden sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-3xl border-b border-white/5 p-4 z-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-black">S</div>
            <span className="text-sm font-black">STINCHAR</span>
          </div>
          <button onClick={() => setActiveTab(activeTab === "overview" ? "settings" : "overview")} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
             <FaCog className="text-white" />
          </button>
        </div>

        {/* Global Notifications */}
        <AnimatePresence>
          {msg.text && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full backdrop-blur-2xl border flex items-center gap-4 shadow-2xl ${
                msg.type === "error" ? "bg-red-500/20 border-red-500/30" : "bg-emerald-500/20 border-emerald-500/30"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === "error" ? "bg-red-500/40" : "bg-emerald-500/40"}`}>
                {msg.type === "error" ? <FaTimes size={12}/> : <FaShieldAlt size={12}/>}
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{msg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Massive Hero Section */}
        <section className="relative h-64 md:h-96 w-full overflow-hidden">
           {bannerImg ? (
             <img src={bannerImg} className="w-full h-full object-cover grayscale opacity-40 hover:grayscale-0 transition-all duration-1000" alt="Banner" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-[#1A1B1E] to-[#0D0D0D]"></div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
           
           <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col md:flex-row items-center md:items-end gap-10">
              <div className="relative group">
                <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2.5rem] bg-[#050505] border-8 border-[#050505] shadow-2xl overflow-hidden ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105">
                  {profileImg ? <img src={profileImg} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center bg-white/5"><FaUser size={40} className="text-white/10" /></div>}
                </div>
                {activeTab === "settings" && (
                  <label className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl border border-white/20 hover:scale-110 transition-all">
                    <FaCamera className="text-white" />
                    <input type="file" className="hidden" onChange={(e) => handleImageChange(e, "profile")} />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left pb-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase">{user?.name || "ANONYMOUS"}</h1>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-current opacity-60 tracking-widest`}>
                    {rm.label}
                  </span>
                </div>
                <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl italic">"{user?.bio || "Architecting digital realities in total minimalism."}"</p>
              </div>

              <div className="pb-4 hidden lg:block">
                 <div className="flex gap-4">
                   <div className="bg-white/5 backdrop-blur-xl px-10 py-6 rounded-3xl border border-white/10 text-center">
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Status</p>
                     <p className="text-lg font-black text-emerald-400">ACTIVE</p>
                   </div>
                   <div className="bg-white/5 backdrop-blur-xl px-10 py-6 rounded-3xl border border-white/10 text-center">
                     <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Index</p>
                     <p className="text-lg font-black text-blue-400">{user?.role?.toUpperCase()}</p>
                   </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Dynamic Content Switching */}
        <div className="max-w-[1600px] mx-auto p-6 md:p-16">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column - Core Info */}
                  <div className="lg:col-span-8 space-y-10">
                    <InfoCard title="Identity Meta" icon={<FaUser />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Digital Address</p><p className="text-xl font-bold">{user?.email}</p></div>
                        <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Telecom Interface</p><p className="text-xl font-bold">{user?.phone || "Disconnected"}</p></div>
                        <div className="md:col-span-2"><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Physical Anchor</p><p className="text-white/70">{user?.address || "No address assigned"} {user?.pincode ? `[ Grid: ${user.pincode} ]` : ""}</p></div>
                      </div>
                    </InfoCard>

                    {/* Specialized Engine Sections */}
                    {user?.role === "seller" && (
                      <InfoCard title="Commerce Engine" icon={<FaStore />}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Business Handle</p><p className="text-xl font-bold">{user.businessName}</p></div>
                            <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Regulatory Segment</p><p className="text-xl font-bold">{user.gstNumber}</p></div>
                            <div className="md:col-span-2"><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Entity Description</p><p className="text-white/60 italic">{user.storeDescription}</p></div>
                         </div>
                      </InfoCard>
                    )}

                    {user?.role === "architect" && (
                      <InfoCard title="Design Schematics" icon={<FaGlobe />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Architecture License</p><p className="text-xl font-bold">{user.coaRegistration}</p></div>
                          <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Technical Arsenal</p><div className="flex flex-wrap gap-2">{user.skills?.map(s => <span key={s} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-bold">{s}</span>)}</div></div>
                        </div>
                      </InfoCard>
                    )}

                    {user?.role === "provider" && (
                        <InfoCard title="Specialist Core" icon={<FaToolbox />}>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                              <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Domain</p><p className="text-xl font-bold">{user.serviceCategory}</p></div>
                              <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Expertise</p><p className="text-xl font-bold">{user.serviceSubCategory}</p></div>
                              <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Market Tenure</p><p className="text-xl font-bold">{user.experience} Years</p></div>
                              <div className="md:col-span-3"><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Capability Description</p><p className="text-white/60 italic">{user.serviceDescription}</p></div>
                           </div>
                        </InfoCard>
                    )}

                    {user?.role === "delivery" && (
                      <InfoCard title="Logistics Vector" icon={<FaTruck />}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Vehicle Signature</p><p className="text-xl font-bold uppercase">{user.vehicleType}</p></div>
                          <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">License ID</p><p className="text-xl font-bold">{user.licenseNumber}</p></div>
                          <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Operational Grid</p><p className="text-xl font-bold">{user.deliveryAreaPincode}</p></div>
                        </div>
                      </InfoCard>
                    )}
                  </div>

                  {/* Right Column - Compliance & Location */}
                  <div className="lg:col-span-4 space-y-10">
                    <InfoCard title="Global Positioning" icon={<FaMapMarkerAlt />}>
                       <div className="h-64 rounded-3xl overflow-hidden grayscale brightness-50 contrast-125 mb-8 border border-white/10 group-hover:grayscale-0 transition-all duration-700">
                          {user?.location?.lat && (
                            <MapContainer center={[user.location.lat, user.location.lng]} zoom={11} style={{ height: "100%", width: "100%" }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[user.location.lat, user.location.lng]} />
                            </MapContainer>
                          )}
                       </div>
                       <div className="flex justify-between items-center px-4">
                         <div><p className="text-[10px] font-bold text-white/20 mb-1">GRID COORDINATES</p><p className="text-sm font-black tracking-tighter text-blue-400">{user?.location?.lat || "0.00"}, {user?.location?.lng || "0.00"}</p></div>
                         <div className="text-right"><p className="text-[10px] font-bold text-white/20 mb-1">LOCALITY</p><p className="text-sm font-black tracking-tighter uppercase">{user?.location?.city || "Unknown Node"}</p></div>
                       </div>
                    </InfoCard>

                    <InfoCard title="Compliance Ledger" icon={<FaShieldAlt />}>
                       <div className="space-y-6">
                          <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-xs text-white/30 font-bold uppercase tracking-widest">KYC Status</span><span className="text-xs font-black text-emerald-400">VERIFIED</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-xs text-white/30 font-bold uppercase tracking-widest">Aadhaar Interface</span><span className="text-xs font-black">•••• {user?.aadhaarNumber?.slice(-4) || "MISSING"}</span></div>
                          {user?.panNumber && <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-xs text-white/30 font-bold uppercase tracking-widest">Tax Identity</span><span className="text-xs font-black">{user.panNumber}</span></div>}
                          {user?.role !== "customer" && <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-xs text-white/30 font-bold uppercase tracking-widest">Banking Node</span><span className="text-xs font-black text-blue-400">ENCRYPTED</span></div>}
                       </div>
                    </InfoCard>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <form onSubmit={handleSave} className="space-y-16">
                  {/* Persona Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <InfoCard title="Identity Calibration" icon={<FaUser />} className="lg:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <InputField label="Assigned Handle" name="name" value={form.name} icon={<FaUser />} />
                        <InputField label="Telecom Connect" name="phone" value={form.phone} icon={<FaPhone />} />
                        <InputField label="Global Matrix (Email)" name="email" value={user?.email} icon={<FaEnvelope />} disabled className="opacity-50 cursor-not-allowed" />
                        <div className="md:col-span-2 lg:col-span-3">
                           <InputField label="Identity Narrative (Bio)" name="bio" value={form.bio} icon={<FaEdit />} placeholder="A brief manifesto or professional summary..." />
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard title="Spatial Targeting" icon={<FaMapMarkerAlt />}>
                       <div className="space-y-8">
                          <div className="flex gap-4">
                             <input type="text" value={citySearch} onChange={e => setCitySearch(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm" placeholder="Sync city or address..." />
                             <button type="button" onClick={handleUseGPS} className="bg-blue-600 px-6 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                                {searching ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
                             </button>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <InputField label="Coordinate X (Lat)" value={locationData.lat} disabled />
                            <InputField label="Coordinate Y (Lng)" value={locationData.lng} disabled />
                            <div className="col-span-2"><InputField label="Identified Sector (City)" value={locationData.city} readOnly /></div>
                          </div>
                       </div>
                    </InfoCard>

                    <InfoCard title="Address Infrastructure" icon={<FaMapMarkerAlt />}>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="md:col-span-2"><InputField label="Street Logic" name="address" value={form.address} icon={<FaMapMarkerAlt />} /></div>
                          <InputField label="Grid Index (Pincode)" name="pincode" value={form.pincode} icon={<FaMapMarkerAlt />} />
                       </div>
                    </InfoCard>
                  </div>

                  {/* Role Specific Expansion - Professional Engine */}
                  {user?.role !== "customer" && (
                    <InfoCard title="Professional System Configuration" icon={<FaToolbox />}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                          {user?.role === "seller" && (
                            <>
                              <InputField label="Merchant Title" name="businessName" value={form.businessName} icon={<FaStore />} />
                              <div className="space-y-2">
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Entity Logic</label>
                                <select name="businessType" value={form.businessType} onChange={handleChange} className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none">
                                   <option value="" className="bg-[#050505]">Select Type</option>
                                   <option value="Individual" className="bg-[#050505]">Individual Interface</option>
                                   <option value="Partnership" className="bg-[#050505]">Consortium</option>
                                   <option value="Company" className="bg-[#050505]">Corporate Entity</option>
                                </select>
                              </div>
                              <InputField label="Merchant Category" name="businessCategory" value={form.businessCategory} icon={<FaToolbox />} />
                              <div className="md:col-span-2 lg:col-span-3">
                                <InputField label="Commercial Manifest (Description)" name="storeDescription" value={form.storeDescription} icon={<FaEdit />} />
                              </div>
                              <InputField label="Support Interface (Phone)" name="supportPhone" value={form.supportPhone} icon={<FaPhone />} />
                              <InputField label="Support Protocol (Email)" name="supportEmail" value={form.supportEmail} icon={<FaEnvelope />} />
                            </>
                          )}
                          
                          {user?.role === "architect" && (
                            <>
                              <InputField label="Professional Registry (COA)" name="coaRegistration" value={form.coaRegistration} icon={<FaShieldAlt />} />
                              <InputField label="Contact Interface" name="contactInfo" value={form.contactInfo} icon={<FaLink />} />
                              <div className="md:col-span-2 lg:col-span-3">
                                <InputField label="Skill-based Arsenal (Separated by Commas)" name="skills" value={form.skills} icon={<FaEdit />} />
                              </div>
                            </>
                          )}

                          {user?.role === "provider" && (
                            <>
                              <InputField label="Primary Domain" name="serviceCategory" value={form.serviceCategory} icon={<FaToolbox />} />
                              <InputField label="Secondary Expertise" name="serviceSubCategory" value={form.serviceSubCategory} icon={<FaToolbox />} />
                              <InputField label="Market Tenure (Years)" name="experience" value={form.experience} icon={<FaCalendarAlt />} />
                              <div className="md:col-span-2 lg:col-span-3">
                                <InputField label="Service Specification" name="serviceDescription" value={form.serviceDescription} icon={<FaEdit />} />
                              </div>
                            </>
                          )}

                          {user?.role === "delivery" && (
                             <>
                               <InputField label="Logistics Unit (Vehicle)" name="vehicleType" value={form.vehicleType} icon={<FaTruck />} />
                               <InputField label="Regulatory Permit (License)" name="licenseNumber" value={form.licenseNumber} icon={<FaShieldAlt />} />
                               <InputField label="Unit Registry (RC Number)" name="rcBookNumber" value={form.rcBookNumber} icon={<FaFileContract />} />
                               <InputField label="Operational Grid (Pincode)" name="deliveryAreaPincode" value={form.deliveryAreaPincode} icon={<FaMapMarkerAlt />} />
                             </>
                          )}
                       </div>
                    </InfoCard>
                  )}

                  {/* Compliance & Banking Engine - Data Rich Sections */}
                  <InfoCard title="Compliance & Monetary Infrastructure" icon={<FaShieldAlt />}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        <InputField label="Universal ID (Aadhaar)" name="aadhaarNumber" value={form.aadhaarNumber} icon={<FaShieldAlt />} />
                        {(user?.role === "seller" || user?.role === "admin") && (
                          <>
                            <InputField label="GST System ID" name="gstNumber" value={form.gstNumber} icon={<FaFileContract />} />
                            <InputField label="Tax Nexus (PAN)" name="panNumber" value={form.panNumber} icon={<FaFileContract />} />
                            <InputField label="Corporate Registry Index" name="companyRegistrationNumber" value={form.companyRegistrationNumber} icon={<FaFileContract />} />
                            <InputField label="Trade Authorization ID" name="tradeLicenseNumber" value={form.tradeLicenseNumber} icon={<FaFileContract />} />
                            <InputField label="Food Safety Protocol (FSSAI)" name="fssaiLicense" value={form.fssaiLicense} icon={<FaFileContract />} />
                          </>
                        )}
                        {user?.role !== "customer" && (
                          <>
                            <InputField label="Banking Core (Account)" name="bankAccount" value={form.bankAccount} icon={<FaUniversity />} />
                            <InputField label="Inter-Bank Protocol (IFSC)" name="ifscCode" value={form.ifscCode} icon={<FaCreditCard />} />
                          </>
                        )}
                     </div>
                  </InfoCard>

                  {/* Social Grid Protocol */}
                  {user?.role === "seller" && (
                    <InfoCard title="Network Connectivity" icon={<FaLink />}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                          <InputField label="Facebook Node" name="socialLinks.facebook" value={form.socialLinks?.facebook} icon={<FaFacebook />} />
                          <InputField label="Instagram Node" name="socialLinks.instagram" value={form.socialLinks?.instagram} icon={<FaInstagram />} />
                          <InputField label="Twitter Node" name="socialLinks.twitter" value={form.socialLinks?.twitter} icon={<FaTwitter />} />
                          <InputField label="LinkedIn Node" name="socialLinks.linkedin" value={form.socialLinks?.linkedin} icon={<FaLinkedin />} />
                       </div>
                    </InfoCard>
                  )}

                  {/* Persistence Hub */}
                  <div className="flex flex-col md:flex-row justify-end items-center gap-8 pt-10 border-t border-white/5">
                    <button type="button" onClick={() => setActiveTab("overview")} className="text-white/30 hover:text-white text-xs font-black uppercase tracking-widest transition-all">Cancel Synchronization</button>
                    <button type="submit" disabled={saving} className="w-full md:w-auto bg-white text-black px-16 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4">
                       {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                       {saving ? "SYNCING..." : "DEPLOY CHANGES"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto py-20">
                <InfoCard title="Access Key Rotation" icon={<FaLock />}>
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     setSaving(true);
                     try {
                        await API.put("/users/me/password", pwForm);
                        setMsg({ text: "Passkey Updated Successfully", type: "success" });
                        setPwForm({ currentPassword: "", newPassword: "" });
                     } catch (err) {
                        setMsg({ text: err.response?.data?.message || "Rotation Failed", type: "error" });
                     } finally { setSaving(false); }
                   }} className="space-y-10">
                      <InputField label="Current Protocol Key" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} icon={<FaLock />} placeholder="••••••••" />
                      <InputField label="New Protocol Key" type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} icon={<FaLock />} placeholder="••••••••" />
                      <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-blue-500 transition-all disabled:opacity-50">
                         {saving ? "RE-ENCRYPTING..." : "COMMIT ROTATION"}
                      </button>
                   </form>
                </InfoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-[#0D0D0D]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] shadow-2xl z-50 flex justify-between gap-1">
            {[
              { id: "overview", icon: <FaUser />, label: "Node" },
              { id: "settings", icon: <FaCog />, label: "Tune" },
              { id: "security", icon: <FaLock />, label: "Crypt" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl gap-1 transition-all ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-white/20"}`}
              >
                {tab.icon}
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
        </div>
      </main>
      
      {/* Decorative Grid Overlays */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-50">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>
    </div>
  );
};

export default Profile;
