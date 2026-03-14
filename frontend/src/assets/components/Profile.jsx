import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaEdit, FaCalendarAlt,
  FaCamera, FaSave, FaTimes, FaLock, FaStore, FaTruck, FaShieldAlt,
  FaClipboardList, FaCog, FaSpinner
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import Nev from "./Nev";
import { Link } from "react-router-dom";

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
  const [bookings, setBookings] = useState([]);

  // Location state
  const [locationData, setLocationData] = useState({ lat: "", lng: "", city: "" });

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
      });
      setLocationData({
        lat: user.location?.lat || "",
        lng: user.location?.lng || "",
        city: user.location?.city || "",
      });

      if (user.role === "customer" && activeTab === "bookings") {
        API.get("/bookings/my-bookings").then(res => setBookings(res.data)).catch(console.error);
      }
    }
  }, [user, activeTab]);

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

  // Search location by city name using OpenStreetMap Nominatim (works on HTTP)
  const [citySearch, setCitySearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

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
    setMsg({ text: `Location set: ${cityName} (${parseFloat(result.lat).toFixed(4)}, ${parseFloat(result.lon).toFixed(4)})`, type: "success" });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (newImage) formData.append("profileImage", newImage);
      if (newBanner) formData.append("shopBanner", newBanner);

      // Send location as JSON fields
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
    customer: { icon: <FaUser />, color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
    seller: { icon: <FaStore />, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
    delivery: { icon: <FaTruck />, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    admin: { icon: <FaShieldAlt />, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
    architect: { icon: <FaUser />, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  };

  const rm = roleMeta[user?.role] || roleMeta.customer;
  const inputClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm shadow-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaUser /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "security", label: "Security", icon: <FaLock /> },
  ];

  if (user?.role === "customer") {
    tabs.push({ id: "bookings", label: "Bookings", icon: <FaClipboardList /> });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Nev />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar Menu */}
          <div className="lg:w-64 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMsg({ text: "", type: "" }); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <span className={activeTab === tab.id ? "text-indigo-600" : "text-gray-400"}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* Contextual Messaging */}
            <AnimatePresence>
              {msg.text && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${msg.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
                    }`}>
                  <div className="text-sm font-medium">{msg.text}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  {/* Banner */}
                  <div className="h-48 w-full bg-slate-800 relative">
                    {bannerImg && <img src={bannerImg} alt="Banner" className="w-full h-full object-cover opacity-80" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  </div>

                  {/* Avatar & Basic Info */}
                  <div className="px-8 pb-8 relative">
                    <div className="flex justify-between items-end -mt-16 mb-6">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center relative z-10">
                          {profileImg ? (
                            <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <FaUser className="text-5xl text-slate-300" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-2 relative z-10">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${rm.bg} ${rm.color}`}>
                          {rm.icon} {user?.role}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">{user?.name || "Anonymous User"}</h2>
                      <p className="text-gray-500 mt-1">{user?.bio || "No professional bio provided."}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Contact Details</h3>
                        <div className="flex items-start gap-3 text-sm">
                          <FaEnvelope className="text-gray-400 mt-1" />
                          <div><p className="text-gray-500">Email Address</p><p className="font-medium text-gray-900">{user?.email}</p></div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FaPhone className="text-gray-400 mt-1" />
                          <div><p className="text-gray-500">Phone Number</p><p className="font-medium text-gray-900">{user?.phone || "Not provided"}</p></div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FaMapMarkerAlt className="text-gray-400 mt-1" />
                          <div><p className="text-gray-500">Address</p><p className="font-medium text-gray-900">{user?.address ? `${user.address}, ${user.pincode}` : "Not provided"}</p></div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FaMapMarkerAlt className="text-gray-400 mt-1" />
                          <div>
                            <p className="text-gray-500">GPS Location</p>
                            <p className="font-medium text-gray-900">
                              {user?.location?.city ? `${user.location.city}` : ""}
                              {user?.location?.lat ? ` (${Number(user.location.lat).toFixed(4)}, ${Number(user.location.lng).toFixed(4)})` : " Not set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <FaCalendarAlt className="text-gray-400 mt-1" />
                          <div><p className="text-gray-500">Member Since</p><p className="font-medium text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A"}</p></div>
                        </div>
                      </div>

                      {/* Role Specific Details Overview */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Professional Details</h3>
                        {user?.role === "seller" && (
                          <>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Business</span><span className="font-medium text-gray-900">{user?.businessName || "-"}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900">{user?.businessCategory || "-"}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">GSTIN</span><span className="font-medium text-gray-900">{user?.gstNumber || "-"}</span></div>
                          </>
                        )}
                        {user?.role === "architect" && (
                          <>
                            <div className="flex flex-col text-sm"><span className="text-gray-500 mb-1">Core Skills</span><div className="flex flex-wrap gap-2">{user?.skills?.length ? user.skills.map((s, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">{s}</span>) : "-"}</div></div>
                            <div className="flex justify-between text-sm mt-3"><span className="text-gray-500">Contact Info</span><span className="font-medium text-gray-900">{user?.contactInfo || "-"}</span></div>
                          </>
                        )}
                        {user?.role === "delivery" && (
                          <>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Vehicle Type</span><span className="font-medium text-gray-900">{user?.vehicleType || "-"}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">License No</span><span className="font-medium text-gray-900">{user?.licenseNumber || "-"}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Service Area</span><span className="font-medium text-gray-900">{user?.deliveryAreaPincode || "-"}</span></div>
                          </>
                        )}
                        {user?.role === "customer" && (
                          <div className="text-sm text-gray-500 italic">No additional professional parameters.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 border-t border-transparent">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Profile Settings</h2>

                  <form onSubmit={handleSave} className="space-y-8">
                    {/* Media Uploads */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Media & Identification</h3>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                            {profileImg ? <img src={profileImg} alt="Avatar" className="w-full h-full object-cover" /> : <FaUser className="w-full h-full p-4 text-gray-300" />}
                          </div>
                          <div>
                            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition inline-block">
                              Change Avatar
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, "profile")} />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                          </div>
                        </div>

                        {user?.role === "seller" && (
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-16 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                              {bannerImg ? <img src={bannerImg} alt="Banner" className="w-full h-full object-cover" /> : <FaCamera className="w-full h-full p-4 text-gray-300" />}
                            </div>
                            <div>
                              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition inline-block">
                                Set Banner
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, "banner")} />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Standard Inputs */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal & Compliance Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClasses}>Full Name</label><input name="name" value={form.name} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Phone Number</label><input name="phone" value={form.phone} onChange={handleChange} className={inputClasses} /></div>
                        <div className="md:col-span-2"><label className={labelClasses}>Professional Bio</label><textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className={inputClasses} placeholder="Brief description at the top of your profile." /></div>
                        <div><label className={labelClasses}>Address (Street, City)</label><input name="address" value={form.address} onChange={handleChange} className={inputClasses} /></div>
                        <div><label className={labelClasses}>Pincode / Zip</label><input name="pincode" value={form.pincode} onChange={handleChange} className={inputClasses} /></div>
                        <div className="md:col-span-2"><label className={labelClasses}>Aadhaar Number (Compliance)</label><input name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} className={inputClasses} placeholder="12-digit Aadhaar UID" /></div>

                        {/* Location Section */}
                        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-5">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2"><FaMapMarkerAlt /> My Location</h4>
                            <p className="text-xs text-blue-600 mt-0.5">Search your city to set your location on the map</p>
                          </div>

                          {/* City Search */}
                          <div className="relative mb-4">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchLocation(); } }}
                                className={inputClasses + " flex-1"}
                                placeholder="Type your city name, e.g. Mumbai, Delhi, Jaipur..."
                              />
                              <button
                                type="button"
                                onClick={handleSearchLocation}
                                disabled={searching}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60 whitespace-nowrap"
                              >
                                {searching ? <><FaSpinner className="animate-spin" /> Searching...</> : <><FaMapMarkerAlt /> Search Location</>}
                              </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                {searchResults.map((result, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectLocation(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                                  >
                                    <FaMapMarkerAlt className="text-blue-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{result.display_name.split(",").slice(0, 3).join(",")}</p>
                                      <p className="text-[11px] text-gray-400 mt-0.5">{result.display_name}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={labelClasses}>City</label>
                              <input value={locationData.city} onChange={(e) => setLocationData({ ...locationData, city: e.target.value })} className={inputClasses} placeholder="Auto-filled when you search" />
                            </div>
                            <div>
                              <label className={labelClasses}>Latitude</label>
                              <input type="number" step="any" value={locationData.lat} onChange={(e) => setLocationData({ ...locationData, lat: e.target.value })} className={inputClasses} placeholder="e.g. 28.6139" readOnly />
                            </div>
                            <div>
                              <label className={labelClasses}>Longitude</label>
                              <input type="number" step="any" value={locationData.lng} onChange={(e) => setLocationData({ ...locationData, lng: e.target.value })} className={inputClasses} placeholder="e.g. 77.2090" readOnly />
                            </div>
                          </div>
                          {locationData.lat && locationData.lng && (
                            <p className="text-xs text-green-700 mt-3 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              ✅ Location set: <strong>{locationData.city || "Unknown"}</strong> ({Number(locationData.lat).toFixed(4)}, {Number(locationData.lng).toFixed(4)})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Role Specific Inputs */}
                    {user?.role === "seller" && (
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Business & Legal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className={labelClasses}>Business Name</label><input name="businessName" value={form.businessName} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>Business Category</label><input name="businessCategory" value={form.businessCategory} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>GST Number</label><input name="gstNumber" value={form.gstNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>PAN Number</label><input name="panNumber" value={form.panNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>Company Reg. No.</label><input name="companyRegistrationNumber" value={form.companyRegistrationNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>Trade / FSSAI License</label><input name="tradeLicenseNumber" value={form.tradeLicenseNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div className="md:col-span-2"><label className={labelClasses}>Business Address</label><input name="businessAddress" value={form.businessAddress} onChange={handleChange} className={inputClasses} /></div>
                        </div>
                      </div>
                    )}

                    {user?.role === "architect" && (
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Architectural Portfolio & Legal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2"><label className={labelClasses}>CoA Registration</label><input name="coaRegistration" value={form.coaRegistration} onChange={handleChange} className={inputClasses} placeholder="CA/YYYY/XXXXX Format" /></div>
                          <div className="md:col-span-2"><label className={labelClasses}>Skills & Software (Comma separated)</label><input name="skills" value={form.skills} onChange={handleChange} className={inputClasses} placeholder="e.g. AutoCAD, Revit, 3ds Max, Urban Planning" /></div>
                          <div className="md:col-span-2"><label className={labelClasses}>Secondary Contact Info</label><input name="contactInfo" value={form.contactInfo} onChange={handleChange} className={inputClasses} placeholder="Alternate email or phone" /></div>
                        </div>
                      </div>
                    )}

                    {user?.role === "delivery" && (
                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery & Fleet Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className={labelClasses}>Vehicle Type</label><input name="vehicleType" value={form.vehicleType} onChange={handleChange} className={inputClasses} placeholder="e.g. Mini Truck, Van" /></div>
                          <div><label className={labelClasses}>License Number</label><input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>RC Book Number</label><input name="rcBookNumber" value={form.rcBookNumber} onChange={handleChange} className={inputClasses} /></div>
                          <div><label className={labelClasses}>Service Area Pincode</label><input name="deliveryAreaPincode" value={form.deliveryAreaPincode} onChange={handleChange} className={inputClasses} /></div>
                        </div>
                      </div>
                    )}

                    {/* Submit Actions */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 z-10">
                      <button type="button" onClick={() => setActiveTab("overview")} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition cursor-pointer">Cancel</button>
                      <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm transition disabled:opacity-70 flex items-center gap-2 cursor-pointer">
                        {saving ? "Saving..." : <><FaSave /> Save Changes</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 border-t border-transparent">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Security Settings</h2>

                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Change Password</h3>
                      <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClasses}>Current Password</label>
                          <input type="password" required className={inputClasses} value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                        </div>
                        <div>
                          <label className={labelClasses}>New Password</label>
                          <input type="password" required className={inputClasses} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 shadow-sm transition disabled:opacity-70 flex items-center gap-2 cursor-pointer">
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* BOOKINGS TAB (Customers Only) */}
              {activeTab === "bookings" && user?.role === "customer" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 border-t border-transparent">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">My Service Bookings</h2>
                    <Link to="/my-construction" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm">
                      View Const. Projects
                    </Link>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900">No bookings yet</h3>
                      <p className="text-sm text-gray-500 mt-1">Get started by exploring our services.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {bookings.map(b => (
                        <div key={b._id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition cursor-default">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <FaClipboardList className="text-xl" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">{b.serviceId?.title || "Service Name Unavailable"}</h4>
                              <p className="text-sm text-gray-500 mt-0.5">Provider: <span className="text-gray-700 font-medium">{b.providerId?.name || "Unassigned"}</span></p>
                              <div className="flex gap-3 text-xs text-gray-500 mt-2">
                                <span className="flex items-center gap-1"><FaCalendarAlt /> {b.date}</span>
                                <span>@ {b.time}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 gap-2">
                            <span className="text-lg font-bold text-gray-900">₹{b.amount}</span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border
                              ${b.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                              ${b.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                              ${b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                              ${b.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                            `}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
