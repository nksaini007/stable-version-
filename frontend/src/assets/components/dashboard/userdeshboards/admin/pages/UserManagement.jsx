import React, { useEffect, useState, useCallback } from "react";
import API, { API_BASE } from "../../../../../api/api";
import {
  FaTrash, FaSearch, FaUser, FaStore, FaTruck, FaShieldAlt,
  FaToggleOn, FaToggleOff, FaTimes, FaCheckCircle, FaHourglassHalf,
  FaBan, FaFileAlt, FaEye, FaEdit, FaSave, FaTimesCircle,
  FaIdCard, FaCar, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaUniversity, FaHardHat, FaWrench, FaDownload, FaExternalLinkAlt,
  FaUserCheck, FaUserTimes, FaEllipsisV, FaFilter, FaSortAmountDown,
  FaClock, FaChartBar,
} from "react-icons/fa";
import { getOptimizedImage } from "../../../../../utils/imageUtils";

// ─── helpers ───────────────────────────────────────────────────────────────
const roleConfig = {
  customer: { icon: <FaUser />, color: "from-orange-500 to-amber-500", badge: "bg-orange-500/15 text-orange-400 border-orange-500/20", label: "Customer" },
  seller: { icon: <FaStore />, color: "from-emerald-500 to-green-600", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", label: "Seller" },
  delivery: { icon: <FaTruck />, color: "from-blue-500 to-cyan-600", badge: "bg-blue-500/15 text-blue-400 border-blue-500/20", label: "Delivery" },
  provider: { icon: <FaWrench />, color: "from-purple-500 to-violet-600", badge: "bg-purple-500/15 text-purple-400 border-purple-500/20", label: "Provider" },
  architect: { icon: <FaHardHat />, color: "from-pink-500 to-rose-600", badge: "bg-pink-500/15 text-pink-400 border-pink-500/20", label: "Architect" },
  admin: { icon: <FaShieldAlt />, color: "from-red-500 to-rose-700", badge: "bg-red-500/15 text-red-400 border-red-500/20", label: "Admin" },
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-[#8E929C] mt-0.5 shrink-0 text-xs">{icon}</span>
    <div>
      <p className="text-[10px] text-[#8E929C] uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium break-all">{value || <span className="text-[#8E929C] font-normal">Not provided</span>}</p>
    </div>
  </div>
);

const DocCard = ({ label, url }) => {
  if (!url) return null;
  const fullUrl = getOptimizedImage(url);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  return (
    <div className="bg-[#1A1B1E] border border-[#2A2B2F]/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
        <FaFileAlt className="text-blue-400 text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-300 truncate">{label}</p>
        <p className="text-[10px] text-[#8E929C]">{isImage ? "Image" : "Document"}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <a href={fullUrl} target="_blank" rel="noreferrer"
          className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all" title="View">
          <FaEye className="text-xs" />
        </a>
        <a href={fullUrl} download
          className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all" title="Download">
          <FaDownload className="text-xs" />
        </a>
      </div>
    </div>
  );
};

// ─── main component ─────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null); // full user detail modal
  const [editNote, setEditNote] = useState("");
  const [msg, setMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/all");
      setUsers(res.data.users || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // action helpers
  const doAction = async (fn, successMsg) => {
    setActionLoading(true);
    try { await fn(); setMsg("✅ " + successMsg); fetchUsers(); }
    catch (e) { setMsg("❌ " + (e.response?.data?.message || "Error")); }
    finally { setActionLoading(false); setTimeout(() => setMsg(""), 3000); }
  };

  const handleApprove = (id) => doAction(() => API.put(`/users/${id}/approve`), "User approved");
  const handleToggle = (id) => doAction(() => API.put(`/users/${id}/toggle-active`), "Status updated");
  const handleDelete = (id) => { if (!window.confirm("Permanently delete this user?")) return; doAction(() => API.delete(`/users/${id}`), "User deleted").then(() => setSelected(null)); };
  const handleRoleChange = (id, role) => doAction(() => API.put(`/users/${id}/role`, { role }), "Role changed");

  // counts
  const counts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    if ((u.role !== "customer" && u.role !== "admin") && u.isApproved === false) acc.pending = (acc.pending || 0) + 1;
    return acc;
  }, { all: users.length });

  // filter + sort
  const filtered = users
    .filter(u => {
      if (roleFilter === "pending") return u.role !== "customer" && u.role !== "admin" && u.isApproved === false;
      return roleFilter === "all" || u.role === roleFilter;
    })
    .filter(u => {
      if (!search) return true;
      const s = search.toLowerCase();
      return u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s) || u.businessName?.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const TABS = [
    { key: "all", label: "All", count: counts.all || 0, color: "from-slate-500 to-gray-600" },
    { key: "customer", label: "Customers", count: counts.customer || 0, color: "from-orange-500 to-amber-500" },
    { key: "seller", label: "Sellers", count: counts.seller || 0, color: "from-emerald-500 to-green-600" },
    { key: "delivery", label: "Delivery", count: counts.delivery || 0, color: "from-blue-500 to-cyan-600" },
    { key: "provider", label: "Providers", count: counts.provider || 0, color: "from-purple-500 to-violet-600" },
    { key: "architect", label: "Architects", count: counts.architect || 0, color: "from-pink-500 to-rose-600" },
    { key: "admin", label: "Admins", count: counts.admin || 0, color: "from-red-500 to-rose-700" },
    { key: "pending", label: "⚡ Pending", count: counts.pending || 0, color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <FaUserCheck className="text-blue-500" /> User Management
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">Manage users, partners, roles and verify specialized documents.</p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Stat Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setRoleFilter(t.key)}
            className={`relative rounded-xl p-3 text-left transition-all border ${roleFilter === t.key ? "border-white/20 bg-[#1A1B1E] shadow-lg" : "border-white/5 bg-[#1A1B1E]/60 hover:bg-[#1A1B1E]"}`}>
            {roleFilter === t.key && <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${t.color} opacity-10`} />}
            <p className="text-xl font-black text-white">{t.count}</p>
            <p className="text-[11px] text-[#8E929C] uppercase tracking-wider mt-0.5">{t.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center bg-[#1A1B1E] border border-white/5 p-2 rounded-xl">
        <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E929C] text-sm" />
          <input placeholder="Search user by name, email, phone, business..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-white text-sm placeholder-[#8E929C] focus:outline-none" />
        </div>
        <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
        <div className="flex items-center gap-2 px-3">
          <FaSortAmountDown className="text-[#8E929C] text-sm" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-transparent text-sm text-gray-300 font-semibold focus:outline-none cursor-pointer">
            <option value="newest" className="bg-[#1A1B1E]">Newest First</option>
            <option value="oldest" className="bg-[#1A1B1E]">Oldest First</option>
            <option value="name" className="bg-[#1A1B1E]">Name A-Z</option>
          </select>
        </div>
        <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
        <div className="px-3">
          <span className="text-white bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/20">{filtered.length} Users</span>
        </div>
      </div>

      {/* Modern List View */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#8E929C]">
           <FaUser className="mx-auto text-4xl mb-3 opacity-20"/>
          <p className="text-sm font-semibold tracking-wide">No users found based on current filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(u => {
            const rc = roleConfig[u.role] || roleConfig.customer;
            const isPending = u.isApproved === false && u.role !== "customer" && u.role !== "admin";
            const docCount = [u.verificationDocuments, u.shopBanner].flat().filter(Boolean).length;
            const hasLegalDocs = u.gstNumber || u.panNumber || u.aadhaarNumber || u.licenseNumber || u.coaRegistration;

            return (
              <div key={u._id} onClick={() => setSelected(u)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-[#1A1B1E] hover:bg-[#2A2B2F]/80 border border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition-all gap-4 sm:gap-6 ${isPending ? "border-l-2 border-l-yellow-500 bg-yellow-500/[0.02]" : ""}`}>
                
                {/* Identity */}
                <div className="flex items-center gap-4 sm:w-1/3 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-black shrink-0 bg-gradient-to-br ${rc.color} shadow-lg`}>
                    {u.profileImage ? <img src={getOptimizedImage(u.profileImage)} className="w-full h-full object-cover rounded-lg" /> : <span>{u.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-sm text-white font-bold truncate leading-tight">{u.name}</span>
                    <span className="text-xs text-[#8E929C] truncate leading-tight mt-0.5">{u.email}</span>
                    {u.businessName && <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wide truncate mt-1">{u.businessName}</span>}
                  </div>
                </div>

                {/* Role & Status */}
                <div className="flex items-center gap-2 sm:w-1/4 flex-wrap shrink-0">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-widest ${rc.badge}`}>{rc.label}</span>
                  {isPending && <span className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 uppercase tracking-widest">Pending</span>}
                  {u.isActive === false && <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 uppercase tracking-widest">Inactive</span>}
                </div>

                {/* Contact */}
                <div className="flex flex-col sm:w-1/4 text-xs text-[#8E929C] shrink-0">
                   <span className="truncate flex items-center gap-2"><FaPhone className="text-[10px] text-[#6B7280]"/> {u.phone || "No Phone"}</span>
                   <span className="truncate flex items-center gap-2 mt-1"><FaMapMarkerAlt className="text-[10px] text-[#6B7280]"/> {u.location?.city || u.pincode ? `${u.location?.city || ''} ${u.pincode || ''}` : "No Location Details"}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-[15%] shrink-0">
                  <div className="flex items-center gap-2">
                    {hasLegalDocs && <FaIdCard className="text-blue-400 text-xs" title="Has Legal Identifiers" />}
                    {docCount > 0 && <FaFileAlt className="text-purple-400 text-xs" title={`${docCount} verified documents`} />}
                  </div>
                  
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    {isPending && (
                      <button onClick={() => handleApprove(u._id)} disabled={actionLoading} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg text-xs font-bold transition-all border border-green-500/30">Approve</button>
                    )}
                    <button onClick={() => handleToggle(u._id)} disabled={actionLoading} className={`p-2 rounded-lg transition-all flex items-center justify-center border ${u.isActive !== false ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20" : "bg-gray-500/10 text-[#8E929C] hover:bg-gray-500/30 border-gray-500/20"}`} title={u.isActive !== false ? "Deactivate User" : "Activate User"}>
                      {u.isActive !== false ? <FaToggleOn className="text-lg"/> : <FaToggleOff className="text-lg"/>}
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* ─── DETAILED COMPREHENSIVE MODAL ─────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1B1E] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {(() => {
              const u = selected;
              const rc = roleConfig[u.role] || roleConfig.customer;
              const isPending = u.isApproved === false && u.role !== "customer" && u.role !== "admin";
              const docs = [];
              if (u.shopBanner) docs.push({ label: "Shop Banner", url: u.shopBanner });
              if (u.verificationDocuments?.length) {
                u.verificationDocuments.forEach((d, i) => docs.push({ label: `Verification Doc ${i + 1}`, url: d }));
              }

              return (
                <div className="flex flex-col h-full">
                  {/* Detailed Standard Header */}
                  <div className={`shrink-0 relative p-6 bg-gradient-to-r ${rc.color} flex items-center justify-between`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,white,transparent)]" />
                    <div className="relative flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-[#1A1B1E] flex items-center justify-center text-white text-2xl font-black border-2 border-white/20 overflow-hidden shadow-xl">
                        {u.profileImage ? <img src={getOptimizedImage(u.profileImage)} className="w-full h-full object-cover" /> : <span>{u.name?.[0]?.toUpperCase()}</span>}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white leading-tight">{u.name}</h2>
                        {u.businessName && <p className="text-white/90 text-sm font-semibold tracking-wide">{u.businessName}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-black/30 border border-white/20 text-white uppercase tracking-wider">{rc.label}</span>
                          {isPending && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-yellow-400/90 text-black uppercase tracking-wider shadow-sm">Pending Approval</span>}
                          {u.isActive === false && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/90 text-white uppercase tracking-wider shadow-sm">Account Deactivated</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)} className="relative w-10 h-10 rounded-xl bg-black/20 hover:bg-black/40 border border-white/20 flex items-center justify-center text-white transition-all text-lg shrink-0">
                      <FaTimes />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="overflow-y-auto p-6 space-y-6">
                    
                    {/* Floating Controls */}
                    <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0a0f1e]/50 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3 bg-[#1A1B1E] border border-white/10 rounded-lg px-3 py-2 sm:max-w-xs w-full sm:w-auto">
                        <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider">Role Matrix:</span>
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="bg-transparent text-sm font-bold text-white focus:outline-none w-full cursor-pointer uppercase tracking-wide" disabled={actionLoading}>
                          {["customer", "seller", "delivery", "provider", "architect", "admin"].map(r => (
                            <option key={r} value={r} className="bg-[#1A1B1E] text-white">{r}</option>
                          ))}
                        </select>
                      </div>
                      
                      {isPending && (
                        <button onClick={() => handleApprove(u._id)} disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-green-500/20 flex-1 sm:flex-none justify-center">
                          <FaUserCheck /> Approve
                        </button>
                      )}
                      
                      <button onClick={() => handleToggle(u._id)} disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg text-sm transition-all border flex-1 sm:flex-none justify-center ${u.isActive !== false ? "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"}`}>
                        {u.isActive !== false ? <><FaBan /> Deactivate</> : <><FaToggleOn /> Activate</>}
                      </button>

                      <button onClick={() => handleDelete(u._id)} disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-bold rounded-lg text-sm transition-all sm:ml-auto w-full sm:w-auto justify-center">
                        <FaTrash /> Delete Permanently
                      </button>
                    </div>

                    {/* Information Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Identity Group */}
                      <div className="bg-[#0a0f1e]/30 border border-white/5 rounded-xl p-5">
                         <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2 mb-4"><FaUser /> Basics & Contact</h3>
                         <div className="space-y-4">
                            <InfoRow icon={<FaEnvelope />} label="Email Address" value={u.email} />
                            <InfoRow icon={<FaPhone />} label="Phone Number" value={u.phone} />
                            <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={u.address} />
                            <InfoRow icon={<FaMapMarkerAlt />} label="City / Region" value={u.location?.city || u.pincode ? `${u.location?.city || ''} ${u.pincode || ''}` : null} />
                         </div>
                      </div>

                      {/* Specialist Group */}
                      {(u.role === "seller" || u.role === "delivery" || u.role === "provider" || u.role === "architect") ? (
                        <div className={`bg-gradient-to-br ${rc.color} hover:bg-opacity-10 bg-opacity-5 border border-white/10 rounded-xl p-5 relative overflow-hidden transition-all`}>
                          <div className="absolute inset-0 bg-[#0a0f1e]/80" />
                          <div className="relative">
                            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-${rc.color.split("-")[1]}-400`}>
                              {rc.icon} Professional Details
                            </h3>
                            <div className="space-y-4">
                              {u.role === "seller" && (
                                <>
                                  <InfoRow icon={<FaBuilding />} label="Business Legal Name" value={u.businessName} />
                                  <InfoRow icon={<FaBuilding />} label="Business Category" value={u.businessCategory} />
                                  <InfoRow icon={<FaIdCard />} label="GSTIN Number" value={u.gstNumber} />
                                  <InfoRow icon={<FaIdCard />} label="PAN Number" value={u.panNumber} />
                                  <InfoRow icon={<FaIdCard />} label="Trade / FSSAI License" value={u.tradeLicenseNumber || u.fssaiLicense ? `${u.tradeLicenseNumber || 'N/A'} / ${u.fssaiLicense || 'N/A'}` : null} />
                                  <InfoRow icon={<FaUniversity />} label="Banking Info (IFSC)" value={u.ifscCode ? `Bank A/C Linked (IFSC: ${u.ifscCode})` : null} />
                                </>
                              )}
                              {u.role === "delivery" && (
                                <>
                                  <InfoRow icon={<FaCar />} label="Registered Vehicle" value={u.vehicleType} />
                                  <InfoRow icon={<FaIdCard />} label="Driving License" value={u.licenseNumber} />
                                  <InfoRow icon={<FaIdCard />} label="RC Book Reference" value={u.rcBookNumber} />
                                  <InfoRow icon={<FaMapMarkerAlt />} label="Service Area Pincode" value={u.deliveryAreaPincode} />
                                </>
                              )}
                              {u.role === "provider" && (
                                <>
                                  <InfoRow icon={<FaWrench />} label="Service Category" value={u.serviceCategory} />
                                  <InfoRow icon={<FaChartBar />} label="Experience Level" value={u.experience} />
                                  <InfoRow icon={<FaBuilding />} label="Service Description" value={u.serviceDescription} />
                                </>
                              )}
                              {u.role === "architect" && (
                                <>
                                  <InfoRow icon={<FaIdCard />} label="COA Registration Number" value={u.coaRegistration} />
                                  <InfoRow icon={<FaPhone />} label="Professional Contact" value={u.contactInfo} />
                                  <InfoRow icon={<FaWrench />} label="Specialized Skills" value={u.skills?.join(", ")} />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#0a0f1e]/30 border border-white/5 rounded-xl p-5">
                           <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2 mb-4"><FaChartBar /> Additional Context</h3>
                           <div className="space-y-4">
                             <InfoRow icon={<FaShieldAlt />} label="Account Standing" value={u.isActive !== false ? "Active ✅" : "Suspended ❌"} />
                             <InfoRow icon={<FaUser />} label="Personal Bio" value={u.bio} />
                             {u.aadhaarNumber && <InfoRow icon={<FaIdCard />} label="Aadhaar Info" value={`Masked: **** **** ${u.aadhaarNumber.slice(-4)}`} />}
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Strip */}
                    <div className="bg-[#0a0f1e]/30 border border-white/5 rounded-xl p-5 flex flex-wrap gap-8 items-center">
                       <div>
                         <p className="text-[10px] text-[#8E929C] uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaClock /> Registration Date</p>
                         <p className="text-sm font-semibold text-gray-200">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: '2-digit', minute:'2-digit' })}</p>
                       </div>
                       
                       {/* Do not show Approval for Customers and Admins since they aren't bound to vetting workflows */}
                       {(u.role !== 'customer' && u.role !== 'admin') && (
                         <div>
                           <p className="text-[10px] text-[#8E929C] uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaCheckCircle className={u.isApproved ? "text-green-500" : "text-yellow-500"} /> Vetting Status</p>
                           <p className={`text-sm font-semibold ${u.isApproved ? "text-green-400" : "text-yellow-400"}`}>{u.isApproved ? "Approved ✅" : "Pending Evaluation ⏳"}</p>
                         </div>
                       )}

                       <div>
                         <p className="text-[10px] text-[#8E929C] uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaIdCard /> System UUID</p>
                         <p className="text-xs font-mono text-gray-400 bg-black/40 px-2 py-1 rounded">{u._id}</p>
                       </div>
                    </div>

                    {/* Regulatory Documents */}
                    {docs.length > 0 ? (
                      <div className="bg-[#0a0f1e]/30 border border-white/5 rounded-xl p-5">
                        <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2 mb-4">
                          <FaFileAlt /> Provided Records ({docs.length})
                        </h3>
                        {/* Enhanced Docs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {docs.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#1A1B1E] border border-white/10 rounded-lg p-3 group">
                              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <FaFileAlt className="text-blue-500 text-lg" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-bold text-gray-200 block truncate">{d.label}</span>
                                <span className="text-[10px] text-gray-500">Encrypted Asset</span>
                              </div>
                              <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={getOptimizedImage(d.url)} target="_blank" rel="noreferrer" className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded"><FaEye className="text-[10px]"/></a>
                                <a href={getOptimizedImage(d.url)} download className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded"><FaDownload className="text-[10px]"/></a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (u.role !== "customer" && u.role !== "admin") && (
                        <div className="bg-orange-500/5 border border-orange-500/20 border-dashed rounded-xl p-6 text-center">
                          <FaFileAlt className="text-3xl text-orange-500/50 mx-auto mb-2" />
                          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">No Legal Identifiers/Documents Present</p>
                          <p className="text-[#8E929C] text-xs mt-1">This user has not completed uploading physical verification items.</p>
                        </div>
                      )
                    )}

                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
