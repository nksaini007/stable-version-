import React, { useEffect, useState, useCallback } from "react";
import API from "../../../../../api/api";
import {
  FaTrash, FaSearch, FaUser, FaStore, FaTruck, FaShieldAlt,
  FaToggleOn, FaToggleOff, FaTimes, FaCheckCircle, FaHourglassHalf,
  FaBan, FaFileAlt, FaEye, FaEdit, FaSave, FaTimesCircle,
  FaIdCard, FaCar, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaUniversity, FaHardHat, FaWrench, FaDownload, FaExternalLinkAlt,
  FaUserCheck, FaUserTimes, FaEllipsisV, FaFilter, FaSortAmountDown,
  FaClock, FaChartBar,
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
    <span className="text-gray-500 mt-0.5 shrink-0 text-xs">{icon}</span>
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium break-all">{value || <span className="text-gray-600 font-normal">Not provided</span>}</p>
    </div>
  </div>
);

const DocCard = ({ label, url }) => {
  if (!url) return null;
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
        <FaFileAlt className="text-blue-400 text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-300 truncate">{label}</p>
        <p className="text-[10px] text-gray-500">{isImage ? "Image" : "Document"}</p>
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
      const res = await API.get("/users");
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
    <div className="p-6 space-y-6 min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FaUserCheck className="text-blue-400" /> User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage all users, partners, and document verification</p>
        </div>
        {msg && (
          <div className={`px-4 py-2 rounded-xl text-sm font-medium border ${msg.startsWith("✅") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            {msg}
          </div>
        )}
      </div>

      {/* Stat Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setRoleFilter(t.key)}
            className={`relative rounded-2xl p-3 text-left transition-all border ${roleFilter === t.key ? "border-white/20 bg-white/10 shadow-lg" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
            {roleFilter === t.key && (
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.color} opacity-10`} />
            )}
            <p className="text-xl font-black text-white">{t.count}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{t.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-60">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input placeholder="Search name, email, phone, business..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500/40" />
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2">
          <FaSortAmountDown className="text-gray-500 text-xs" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-transparent text-sm text-gray-300 focus:outline-none">
            <option value="newest" className="bg-[#0a0f1e]">Newest First</option>
            <option value="oldest" className="bg-[#0a0f1e]">Oldest First</option>
            <option value="name" className="bg-[#0a0f1e]">Name A–Z</option>
          </select>
        </div>
        <span className="text-gray-500 text-sm">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* User Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FaUser className="text-5xl mx-auto mb-4 opacity-20" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(u => {
            const rc = roleConfig[u.role] || roleConfig.customer;
            const isPending = u.isApproved === false && u.role !== "customer" && u.role !== "admin";
            const docCount = [u.verificationDocuments, u.shopBanner].flat().filter(Boolean).length;
            const hasLegalDocs = u.gstNumber || u.panNumber || u.aadhaarNumber || u.licenseNumber || u.coaRegistration;

            return (
              <div key={u._id}
                className={`group bg-white/[0.03] border rounded-2xl p-4 transition-all hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30 cursor-pointer ${isPending ? "border-yellow-500/30" : "border-white/5"}`}
                onClick={() => setSelected(u)}>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rc.color} flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg`}>
                      {u.profileImage ? (
                        <img src={u.profileImage.startsWith("http") ? u.profileImage : `${API_BASE}${u.profileImage}`}
                          alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span>{u.name?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{u.name}</p>
                      <p className="text-gray-400 text-xs truncate">{u.email}</p>
                      {u.businessName && <p className="text-orange-400 text-xs truncate">{u.businessName}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rc.badge}`}>
                      {rc.label}
                    </span>
                    {isPending && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                        Pending
                      </span>
                    )}
                    {u.isActive === false && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
                  {u.phone && <span className="flex items-center gap-1"><FaPhone />{u.phone}</span>}
                  {u.location?.city && <span className="flex items-center gap-1"><FaMapMarkerAlt />{u.location.city}</span>}
                  <span className="flex items-center gap-1"><FaClock />{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                {/* Indicators */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {hasLegalDocs && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 flex items-center gap-1">
                        <FaIdCard className="text-[8px]" /> Docs
                      </span>
                    )}
                    {docCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 flex items-center gap-1">
                        <FaFileAlt className="text-[8px]" /> {docCount} file{docCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    {isPending && (
                      <button onClick={() => handleApprove(u._id)} disabled={actionLoading}
                        className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-bold hover:bg-green-500/30 transition-all">
                        Approve
                      </button>
                    )}
                    <button onClick={() => handleToggle(u._id)} disabled={actionLoading}
                      className={`p-1.5 rounded-lg transition-all text-sm ${u.isActive !== false ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"}`}
                      title={u.isActive !== false ? "Deactivate" : "Activate"}>
                      {u.isActive !== false ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── DETAIL MODAL ──────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#0d1225] border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            {(() => {
              const u = selected;
              const rc = roleConfig[u.role] || roleConfig.customer;
              const isPending = u.isApproved === false && u.role !== "customer" && u.role !== "admin";

              // collect all docs
              const docs = [];
              if (u.shopBanner) docs.push({ label: "Shop Banner", url: u.shopBanner });
              if (u.verificationDocuments?.length) {
                u.verificationDocuments.forEach((d, i) => docs.push({ label: `Verification Doc ${i + 1}`, url: d }));
              }

              return (
                <>
                  {/* Modal Header */}
                  <div className={`relative rounded-t-3xl p-6 bg-gradient-to-br ${rc.color} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,white,transparent)]" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black border border-white/30 overflow-hidden">
                          {u.profileImage ? (
                            <img src={u.profileImage.startsWith("http") ? u.profileImage : `${API_BASE}${u.profileImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{u.name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-white">{u.name}</h2>
                          {u.businessName && <p className="text-white/80 text-sm">{u.businessName}</p>}
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{rc.label}</span>
                            {isPending && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400/30 text-yellow-100">Pending Approval</span>}
                            {u.isActive === false && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/40 text-red-100">Inactive</span>}
                            {u.isApproved && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-400/30 text-green-100">Verified</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all shrink-0">
                        <FaTimes />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-2">
                      {isPending && (
                        <button onClick={() => handleApprove(u._id)} disabled={actionLoading}
                          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                          <FaUserCheck /> Approve Partner
                        </button>
                      )}
                      <button onClick={() => handleToggle(u._id)} disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl text-sm transition-all disabled:opacity-60 ${u.isActive !== false ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"}`}>
                        {u.isActive !== false ? <><FaBan /> Deactivate</> : <><FaToggleOn /> Activate</>}
                      </button>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-xs text-gray-400">Role:</span>
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="bg-transparent text-sm text-white focus:outline-none" disabled={actionLoading}>
                          {["customer", "seller", "delivery", "provider", "architect", "admin"].map(r => (
                            <option key={r} value={r} className="bg-[#0d1225] capitalize">{r}</option>
                          ))}
                        </select>
                      </div>
                      <button onClick={() => handleDelete(u._id)} disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-bold rounded-xl text-sm transition-all ml-auto disabled:opacity-60">
                        <FaTrash /> Delete
                      </button>
                    </div>

                    {/* Grid: Contact + Account */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Contact Info */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><FaUser /> Contact Info</h3>
                        <InfoRow icon={<FaEnvelope />} label="Email" value={u.email} />
                        <InfoRow icon={<FaPhone />} label="Phone" value={u.phone} />
                        <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={u.address} />
                        <InfoRow icon={<FaMapMarkerAlt />} label="Pincode" value={u.pincode} />
                        {u.location?.city && <InfoRow icon={<FaMapMarkerAlt />} label="City" value={u.location.city} />}
                        {u.bio && <InfoRow icon={<FaUser />} label="Bio" value={u.bio} />}
                      </div>

                      {/* Account Info */}
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><FaChartBar /> Account Info</h3>
                        <InfoRow icon={<FaClock />} label="Joined" value={new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
                        <InfoRow icon={<FaShieldAlt />} label="Status" value={u.isActive !== false ? "Active" : "Inactive"} />
                        <InfoRow icon={<FaCheckCircle />} label="Approval" value={u.isApproved ? "Approved ✅" : "Pending ⏳"} />
                        {u.aadhaarNumber && <InfoRow icon={<FaIdCard />} label="Aadhaar" value={`****${u.aadhaarNumber.slice(-4)}`} />}
                      </div>
                    </div>

                    {/* Role-specific: Seller */}
                    {u.role === "seller" && (
                      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><FaStore /> Seller / Business Info</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <InfoRow icon={<FaBuilding />} label="Business Name" value={u.businessName} />
                          <InfoRow icon={<FaBuilding />} label="Business Category" value={u.businessCategory} />
                          <InfoRow icon={<FaBuilding />} label="Business Address" value={u.businessAddress} />
                          <InfoRow icon={<FaIdCard />} label="GST Number" value={u.gstNumber} />
                          <InfoRow icon={<FaIdCard />} label="PAN Number" value={u.panNumber} />
                          <InfoRow icon={<FaIdCard />} label="Company Reg. No." value={u.companyRegistrationNumber} />
                          <InfoRow icon={<FaIdCard />} label="Trade License" value={u.tradeLicenseNumber} />
                          <InfoRow icon={<FaIdCard />} label="FSSAI License" value={u.fssaiLicense} />
                          <InfoRow icon={<FaUniversity />} label="Bank Account" value={u.bankAccount ? `****${u.bankAccount.slice(-4)}` : null} />
                          <InfoRow icon={<FaUniversity />} label="IFSC Code" value={u.ifscCode} />
                        </div>
                      </div>
                    )}

                    {/* Role-specific: Delivery */}
                    {u.role === "delivery" && (
                      <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><FaTruck /> Delivery Partner Info</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <InfoRow icon={<FaCar />} label="Vehicle Type" value={u.vehicleType} />
                          <InfoRow icon={<FaIdCard />} label="License Number" value={u.licenseNumber} />
                          <InfoRow icon={<FaIdCard />} label="RC Book Number" value={u.rcBookNumber} />
                          <InfoRow icon={<FaMapMarkerAlt />} label="Delivery Area Pincode" value={u.deliveryAreaPincode} />
                        </div>
                      </div>
                    )}

                    {/* Role-specific: Provider */}
                    {u.role === "provider" && (
                      <div className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2"><FaWrench /> Service Provider Info</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <InfoRow icon={<FaWrench />} label="Service Category" value={u.serviceCategory} />
                          <InfoRow icon={<FaChartBar />} label="Experience" value={u.experience} />
                          <InfoRow icon={<FaBuilding />} label="Description" value={u.serviceDescription} />
                        </div>
                      </div>
                    )}

                    {/* Role-specific: Architect */}
                    {u.role === "architect" && (
                      <div className="bg-pink-500/5 border border-pink-500/15 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2"><FaHardHat /> Architect Info</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <InfoRow icon={<FaIdCard />} label="COA Registration" value={u.coaRegistration} />
                          <InfoRow icon={<FaPhone />} label="Contact Info" value={u.contactInfo} />
                          <InfoRow icon={<FaWrench />} label="Skills" value={u.skills?.join(", ")} />
                        </div>
                      </div>
                    )}

                    {/* Submitted Documents */}
                    {docs.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <FaFileAlt /> Uploaded Documents ({docs.length})
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {docs.map((d, i) => <DocCard key={i} label={d.label} url={d.url} />)}
                        </div>
                        {isPending && (
                          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <p className="text-yellow-400 text-xs font-semibold">⚠️ Verify documents above before approving this partner account.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No docs placeholder for partners */}
                    {docs.length === 0 && u.role !== "customer" && u.role !== "admin" && (
                      <div className="bg-white/[0.03] border border-white/5 border-dashed rounded-2xl p-6 text-center">
                        <FaFileAlt className="text-3xl text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No documents submitted by this partner</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
