import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaEdit, FaCalendarAlt,
  FaCamera, FaSave, FaTimes, FaLock, FaStore, FaTruck, FaShieldAlt,
  FaCog, FaSpinner, FaFacebook, FaInstagram, FaTwitter, FaLinkedin,
  FaChevronRight, FaRegHandshake, FaToolbox, FaGlobe
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

  const [changingPw, setChangingPw] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });

  // Location state
  const [locationData, setLocationData] = useState({ lat: "", lng: "", city: "" });
  
  // Service Categories for Providers
  const [serviceCategories, setServiceCategories] = useState([]);

  // Search location by city name using OpenStreetMap Nominatim
  const [citySearch, setCitySearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setMsg({ text: "Geolocation is not supported by your browser.", type: "error" });
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await resp.json();
          const cityName = data.address?.city || data.address?.town || data.address?.village || "";
          
          setLocationData({
            lat: latitude,
            lng: longitude,
            city: cityName,
          });
          setCitySearch(data.display_name.split(",").slice(0, 2).join(","));
          setMsg({ text: "Location detected successfully!", type: "success" });
        } catch (e) {
          setLocationData({ lat: latitude, lng: longitude, city: "" });
          setMsg({ text: "Location detected, but failed to find city name.", type: "warning" });
        } finally {
          setSearching(false);
          setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        }
      },
      (error) => {
        setSearching(false);
        setMsg({ text: "Unable to retrieve your location. Please check permissions.", type: "error" });
        setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      }
    );
  };

  const MapEvents = () => {
    const map = useMap();
    useMapEvents({
      click(e) {
        handleReverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    useEffect(() => {
      if (locationData.lat && locationData.lng) {
        map.setView([locationData.lat, locationData.lng], 13);
      }
    }, [locationData.lat, locationData.lng, map]);

    return null;
  };

  const handleReverseGeocode = async (lat, lng) => {
    setSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await resp.json();
      const cityName = data.address?.city || data.address?.town || data.address?.village || "";
      setLocationData({ lat, lng, city: cityName });
      setCitySearch(data.display_name.split(",").slice(0, 2).join(","));
    } catch (e) {
      setLocationData({ ...locationData, lat, lng });
    } finally {
      setSearching(false);
    }
  };

  const handleSearchLocation = async () => {
    const query = citySearch.trim() || form.address?.trim();
    if (!query) {
      setMsg({ text: "Please enter a city or address to search.", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      return;
    }
    setSearching(true);
    setSearchResults([]);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      const results = await resp.json();
      if (results.length === 0) {
        setMsg({ text: "No locations found. Try a different search term.", type: "error" });
        setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      } else {
        setSearchResults(results);
      }
    } catch (e) {
      console.error("Location search failed:", e);
      setMsg({ text: "Location search failed. Check your internet connection.", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (result) => {
    const cityName = result.address?.city || result.address?.town || result.address?.village ||
      result.display_name.split(",")[0] || "";
    setLocationData({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city: cityName,
    });
    setCitySearch(result.display_name.split(",").slice(0, 2).join(","));
    setSearchResults([]);
    setMsg({ text: `Location set: ${cityName}`, type: "success" });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { 
        if (k === "socialLinks") {
          formData.append(k, JSON.stringify(v));
        } else if (v !== undefined && v !== null) {
          formData.append(k, v); 
        }
      });
      if (newImage) formData.append("profileImage", newImage);
      if (newBanner) formData.append("shopBanner", newBanner);

      if (locationData.lat && locationData.lng) {
        formData.append("location[lat]", locationData.lat);
        formData.append("location[lng]", locationData.lng);
        formData.append("location[city]", locationData.city);
      }

      const { data } = await API.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      setMsg({ text: "Profile updated successfully.", type: "success" });
      setNewImage(null);
      setNewBanner(null);
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || err.response?.data?.error || "Update failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      await API.put("/users/me/password", pwForm);
      setMsg({ text: "Password changed successfully.", type: "success" });
      setPwForm({ currentPassword: "", newPassword: "" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Password change failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const profileImg = imagePreview || (user?.profileImage ? `${user.profileImage}` : null);
  const bannerImg = bannerPreview || (user?.shopBanner ? `${user.shopBanner}` : null);

  const roleMeta = {
    customer: { icon: <FaUser />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Customer" },
    seller: { icon: <FaStore />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Seller" },
    delivery: { icon: <FaTruck />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Delivery" },
    admin: { icon: <FaShieldAlt />, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Administrator" },
    architect: { icon: <FaGlobe />, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", label: "Architect" },
    provider: { icon: <FaRegHandshake />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Service Provider" },
  };

  const rm = roleMeta[user?.role] || roleMeta.customer;
  
  const inputClasses = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm";
  const labelClasses = "block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider";

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaUser /> },
    { id: "settings", label: "Edit Profile", icon: <FaCog /> },
    { id: "security", label: "Security", icon: <FaLock /> },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E2E8F0] flex flex-col font-sans selection:bg-blue-500/30">
      <Nev />
      
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-12 mt-16">
        
        {/* Profile Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/5 group"
        >
          {/* Banner Area */}
          <div className="h-48 md:h-64 relative bg-[#1A1B1E]">
            {bannerImg ? (
              <img src={bannerImg} alt="Banner" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A1B1E] via-[#0D0D0D] to-[#1A1B1E]"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent"></div>
          </div>

          {/* User Info Overlap */}
          <div className="px-6 md:px-12 pb-8 flex flex-col md:flex-row items-center md:items-end justify-between -mt-12 md:-mt-20 relative z-10 transition-all">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="relative group/avatar">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-4 border-[#0D0D0D] bg-[#1A1B1E] shadow-2xl overflow-hidden flex items-center justify-center relative ring-1 ring-white/10 group-hover/avatar:ring-blue-500/50 transition-all duration-300">
                  {profileImg ? (
                    <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-5xl text-white/10" />
                  )}
                </div>
                {activeTab === "settings" && (
                  <div className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-lg shadow-lg border border-white/20 transform scale-0 group-hover/avatar:scale-100 transition-transform cursor-pointer">
                    <FaCamera size={14} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{user?.name || "Global Resident"}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border ${rm.bg} ${rm.color}`}>
                    {rm.icon} {rm.label}
                  </span>
                </div>
                <p className="text-white/60 text-sm md:text-lg max-w-xl line-clamp-2 md:line-clamp-none font-medium">
                  {user?.bio || "Minimalism is the ultimate sophistication."}
                </p>
              </div>
            </div>

            <div className="mt-8 md:mt-0 flex gap-3">
              <button 
                onClick={() => setActiveTab("settings")}
                className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all flex items-center gap-2"
              >
                <FaEdit size={14} className="text-blue-400" />
                Edit Account
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:overflow-visible relative z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMsg({ text: "", type: "" }); }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 relative group ${
                    activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span className={`transition-colors duration-300 ${activeTab === tab.id ? "text-white" : "text-white/20 group-hover:text-blue-400"}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="tab-active" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"></motion.div>
                  )}
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Main Content Pane */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Global Notifications */}
            <AnimatePresence>
              {msg.text && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`mb-8 p-4 rounded-2xl flex items-center gap-4 border backdrop-blur-md shadow-xl ${
                    msg.type === "error" 
                    ? "bg-red-500/10 border-red-500/30 text-red-200" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                    }`}
                >
                  <div className={`p-2 rounded-lg ${msg.type === "error" ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                    {msg.type === "error" ? <FaTimes /> : <FaShieldAlt />}
                  </div>
                  <div className="text-sm font-bold tracking-wide uppercase">{msg.text}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl p-8 md:p-12 relative"
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                      Identity & Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-3xl hover:border-blue-500/30 transition-all">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Digital Address</p>
                        <p className="text-lg font-bold truncate">{user?.email}</p>
                        <FaEnvelope className="text-blue-500/30 ml-auto -mt-4" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-3xl hover:border-blue-500/30 transition-all">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Telecom Connect</p>
                        <p className="text-lg font-bold">{user?.phone || "Not Linked"}</p>
                        <FaPhone className="text-emerald-500/30 ml-auto -mt-4" />
                      </div>
                      <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-3xl hover:border-blue-500/30 transition-all">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Loyalty Since</p>
                        <p className="text-lg font-bold">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A"}
                        </p>
                        <FaCalendarAlt className="text-purple-500/30 ml-auto -mt-4" />
                      </div>
                    </div>
                  </div>

                  {user?.location?.lat && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                        Geographic Anchor
                      </h3>
                      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="p-8 pb-4">
                          <p className="text-2xl font-black">{user.location.city || "Coordinates Set"}</p>
                          <p className="text-white/40 text-sm mt-1">{user.location.lat}, {user.location.lng}</p>
                        </div>
                        <div className="h-48 w-full bg-[#1A1B1E] relative grayscale hover:grayscale-0 transition-all duration-500">
                           <MapContainer
                              center={[user.location.lat, user.location.lng]}
                              zoom={10}
                              style={{ height: "100%", width: "100%" }}
                              scrollWheelZoom={false}
                              dragging={false}
                              zoomControl={false}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[user.location.lat, user.location.lng]} />
                            </MapContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Professional Context Card */}
                  {user?.role !== "customer" && (
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl">
                          {rm.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-black text-white mb-4">Professional Ecosystem</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {user?.role === "seller" && (
                              <>
                                <div><p className={labelClasses}>Business Authority</p><p className="text-lg font-bold">{user.businessName}</p></div>
                                <div><p className={labelClasses}>Regulatory ID</p><p className="text-lg font-bold uppercase">{user.gstNumber || "Unverified"}</p></div>
                                <div className="md:col-span-2"><p className={labelClasses}>Global Narrative</p><p className="text-white/70 italic">{user.storeDescription || "No description provided."}</p></div>
                              </>
                            )}
                            {user?.role === "architect" && (
                              <>
                                <div><p className={labelClasses}>Professional License</p><p className="text-lg font-bold">{user.coaRegistration}</p></div>
                                <div><p className={labelClasses}>Specialized Arsenal</p><div className="flex flex-wrap gap-2">{user.skills.map(s => <span key={s} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/10">{s}</span>)}</div></div>
                              </>
                            )}
                            {user?.role === "provider" && (
                              <>
                                <div><p className={labelClasses}>Core Domain</p><p className="text-lg font-bold">{user.serviceCategory}</p></div>
                                <div><p className={labelClasses}>Specialization</p><p className="text-lg font-bold">{user.serviceSubCategory}</p></div>
                                <div><p className={labelClasses}>Market Tenure</p><p className="text-lg font-bold">{user.experience} Global Cycles</p></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <form onSubmit={handleSave} className="space-y-12">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-black text-white">Refine Identity</h2>
                    <FaCog className="text-blue-500 text-2xl opacity-20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Media Assets */}
                    <div className="space-y-6 md:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                      <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Visual Branding</h4>
                      <div className="flex flex-wrap gap-8">
                        <div>
                          <p className={labelClasses}>Portrait Upload</p>
                          <div className="group relative w-24 h-24">
                            <div className="w-full h-full rounded-2xl bg-[#0D0D0D] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                              {profileImg ? <img src={profileImg} className="w-full h-full object-cover" /> : <FaUser className="text-white/10" />}
                            </div>
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all rounded-2xl">
                              <FaCamera className="text-white" />
                              <input type="file" className="hidden" onChange={(e) => handleImageChange(e, "profile")} />
                            </label>
                          </div>
                        </div>
                        {user?.role === "seller" && (
                          <div className="flex-1">
                            <p className={labelClasses}>Commercial Banner</p>
                            <label className="block w-full h-24 rounded-2xl bg-[#0D0D0D] border-2 border-dashed border-white/20 hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden group">
                              {bannerImg ? <img src={bannerImg} className="w-full h-full object-cover opacity-30" /> : null}
                              <div className="absolute inset-0 flex items-center justify-center gap-3">
                                <FaCamera className="text-white/20 group-hover:text-blue-400" />
                                <span className="text-white/20 font-black uppercase text-[10px] tracking-widest">Update Banner</span>
                              </div>
                              <input type="file" className="hidden" onChange={(e) => handleImageChange(e, "banner")} />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Standard Inputs */}
                    <div className="md:col-span-2 space-y-8">
                       <h4 className="text-sm font-black text-emerald-400 uppercase tracking-[0.2em]">Personal Manifest</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClasses}>Full Legal Name</label><input name="name" value={form.name} onChange={handleChange} className={inputClasses} placeholder="John Doe" /></div>
                        <div><label className={labelClasses}>Digital Tether (Phone)</label><input name="phone" value={form.phone} onChange={handleChange} className={inputClasses} placeholder="+91 XXXX XXX XXX" /></div>
                        <div className="md:col-span-2"><label className={labelClasses}>Identity Narrative (Bio)</label><textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className={inputClasses + " resize-none"} placeholder="Write your professional story..." /></div>
                        <div><label className={labelClasses}>Street Infrastructure</label><input name="address" value={form.address} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Locality Index (Pincode)</label><input name="pincode" value={form.pincode} onChange={handleChange} className={inputClasses} /></div>
                       </div>
                    </div>

                    {/* Location Intelligence Section */}
                    <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                          <FaMapMarkerAlt className="text-blue-500/10 text-8xl" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                          <div>
                            <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Universal Positioning</h4>
                            <p className="text-white/40 text-xs">Sync your physical location with our global spatial grid.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleUseGPS}
                            disabled={searching}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                          >
                            <FaMapMarkerAlt /> 
                            {searching ? "Detecting..." : "Sync GPS Core"}
                          </button>
                        </div>

                        {/* Integrated Map */}
                        <div className="w-full h-80 rounded-3xl border border-white/10 overflow-hidden mb-10 shadow-inner relative z-0">
                           <MapContainer
                                center={[locationData.lat || 20.5937, locationData.lng || 78.9629]}
                                zoom={locationData.lat ? 13 : 5}
                                style={{ height: "100%", width: "100%", filter: "invert(90%) hue-rotate(180deg) brightness(1.2)" }}
                              >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapEvents />
                                {locationData.lat && locationData.lng && (
                                  <Marker
                                    position={[locationData.lat, locationData.lng]}
                                    draggable={true}
                                    eventHandlers={{
                                      dragend: (e) => {
                                        const marker = e.target;
                                        const { lat, lng } = marker.getLatLng();
                                        handleReverseGeocode(lat, lng);
                                      },
                                    }}
                                  />
                                )}
                              </MapContainer>
                        </div>

                        {/* Search & Results */}
                        <div className="relative mb-8 z-20">
                          <div className="flex gap-4">
                            <div className="relative flex-1">
                              <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                              <input
                                type="text"
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchLocation(); } }}
                                className={inputClasses + " pl-12"}
                                placeholder="Search city or specific grid location..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleSearchLocation}
                              disabled={searching}
                              className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                            >
                               {searching ? <FaSpinner className="animate-spin" /> : "Search Grid"}
                            </button>
                          </div>

                          <AnimatePresence>
                            {searchResults.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute z-60 w-full mt-4 bg-[#1A1B1E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-3xl"
                              >
                                {searchResults.map((result, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectLocation(result)}
                                    className="w-full text-left px-6 py-4 hover:bg-white/5 transition border-b border-white/5 last:border-b-0 group"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                                        <FaMapMarkerAlt className="text-white/20 group-hover:text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white">{result.display_name.split(",").slice(0, 3).join(",")}</p>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Full Coordinate Path</p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-white/5">
                              <label className={labelClasses}>Locality Segment</label>
                              <input value={locationData.city} onChange={(e) => setLocationData({ ...locationData, city: e.target.value })} className="w-full bg-transparent border-none p-0 text-white font-bold focus:ring-0" placeholder="City" />
                            </div>
                            <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-white/5">
                              <label className={labelClasses}>Lat Grid</label>
                              <input value={locationData.lat} className="w-full bg-transparent border-none p-0 text-white/50 font-bold focus:ring-0 cursor-default" readOnly />
                            </div>
                            <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-white/5">
                              <label className={labelClasses}>Long Grid</label>
                              <input value={locationData.lng} className="w-full bg-transparent border-none p-0 text-white/50 font-bold focus:ring-0 cursor-default" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Final Action Hub */}
                    <div className="md:col-span-2 pt-12 flex flex-col md:flex-row justify-end items-center gap-6">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab("overview")} 
                        className="text-white/40 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
                      >
                        Abort Changes
                      </button>
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="w-full md:w-auto px-12 py-5 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {saving ? "Transmitting..." : "Apply Identity Shift"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="max-w-xl mx-auto py-12">
                   <div className="text-center mb-16">
                     <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">
                       <FaLock className="text-blue-500" />
                     </div>
                     <h2 className="text-3xl font-black text-white mb-4">Encryption Logic</h2>
                     <p className="text-white/40 font-medium">Update your cryptographic access tokens regularly.</p>
                   </div>

                   <form onSubmit={handlePasswordChange} className="space-y-8">
                      <div>
                        <label className={labelClasses}>Current Access Key</label>
                        <input type="password" required className={inputClasses} value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" />
                      </div>
                      <div>
                        <label className={labelClasses}>New Access Key</label>
                        <input type="password" required className={inputClasses} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="••••••••" />
                      </div>

                      <div className="pt-8">
                        <button 
                          type="submit" 
                          disabled={saving} 
                          className="w-full py-5 rounded-3xl bg-white text-[#0D0D0D] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                          {saving ? "Re-Encrypting..." : "Finalize Key Update"}
                        </button>
                      </div>
                   </form>

                   <div className="mt-20 p-8 border border-white/5 bg-white/[0.02] rounded-[2rem]">
                      <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FaShieldAlt /> Protocol Security
                      </h4>
                      <p className="text-xs text-white/30 leading-relaxed font-medium">
                        Stinchar utilizes end-to-end encryption for all session tokens. 
                        Changing your password will terminate all active background sessions for your security.
                      </p>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Futuristic Social Links Footer Section (Only in Overview) */}
      {activeTab === "overview" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto w-full px-4 md:px-8 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <a href={user?.socialLinks?.facebook} target="_blank" className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-blue-600/10 hover:text-blue-500 hover:border-blue-500/30 transition-all grayscale opacity-50 hover:grayscale-0 hover:opacity-100"><FaFacebook /></a>
             <a href={user?.socialLinks?.instagram} target="_blank" className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-pink-600/10 hover:text-pink-500 hover:border-pink-500/30 transition-all grayscale opacity-50 hover:grayscale-0 hover:opacity-100"><FaInstagram /></a>
             <a href={user?.socialLinks?.twitter} target="_blank" className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-sky-600/10 hover:text-sky-500 hover:border-sky-500/30 transition-all grayscale opacity-50 hover:grayscale-0 hover:opacity-100"><FaTwitter /></a>
             <a href={user?.socialLinks?.linkedin} target="_blank" className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-blue-700/10 hover:text-blue-700 hover:border-blue-700/30 transition-all grayscale opacity-50 hover:grayscale-0 hover:opacity-100"><FaLinkedin /></a>
          </div>
        </motion.div>
      )}

      {/* Floating Action Hint */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          to="/dashboard" 
          className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all text-white group"
        >
          <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};

export default Profile;
