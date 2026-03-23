import React, { useEffect, useState } from "react";
import API from "../../../../../api/api";
import Nev from "../../../../Nev";
import { FaTrash, FaEdit, FaUsers, FaBox, FaShieldAlt, FaCog, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* -----------------------------
   Professional Theme Tokens (Compact and Aesthetic)
------------------------------ */
const proTokens = {
  bg: "bg-[#050505]",
  surface: "bg-[#111111]/80 backdrop-blur-xl",
  border: "border border-white/5",
  shadow: "shadow-none",
  textPrimary: "text-white",
  textSecondary: "text-gray-400",
  textAccent: "text-blue-400",
  buttonPrimary: "bg-blue-600/80 hover:bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-blue-500/30",
  buttonSecondary: "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 hover:border-white/20",
  buttonDanger: "bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/20 hover:border-red-500/40",
};

/* -----------------------------
   Compact Metric Card
------------------------------ */
const MetricCard = ({ icon, title, value, change }) => (
  <div className={`${proTokens.surface} ${proTokens.border} ${proTokens.shadow} rounded-2xl p-5 transition-all duration-300 hover:bg-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center space-x-5`}>
    <div className={`text-3xl ${proTokens.textAccent} drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]`}>{icon}</div>
    <div>
      <h3 className={`text-xs font-semibold ${proTokens.textSecondary} uppercase tracking-wider mb-1`}>{title}</h3>
      <p className={`text-2xl font-bold ${proTokens.textPrimary} tracking-tight`}>{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 font-medium ${change > 0 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'}`}>
          {change > 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  </div>
);

/* -----------------------------
   Compact User Row (Table-like)
------------------------------ */
const UserRow = ({ user, onEdit, onDelete }) => (
  <div className={`${proTokens.surface} ${proTokens.border} ${proTokens.shadow} rounded-xl p-4 mb-3 transition-all duration-300 hover:bg-white/5 hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.02)] flex justify-between items-center`}>
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.2)]">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className={`font-semibold ${proTokens.textPrimary} text-sm tracking-wide`}>{user.name}</h4>
        <p className={`text-xs ${proTokens.textSecondary} mt-0.5`}>{user.email}</p>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
        {user.role}
      </span>
      {user.isActive === false && (
        <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.2)]">Inactive</span>
      )}
      <button
        className={`${proTokens.buttonSecondary} p-2 rounded-lg transition hover:scale-110 text-sm`}
        onClick={() => onEdit(user)}
        title="Edit"
      >
        <FaEdit />
      </button>
      <button
        className={`${proTokens.buttonDanger} p-2 rounded-lg transition hover:scale-110 text-sm`}
        onClick={() => onDelete(user._id)}
        title="Delete"
      >
        <FaTrash />
      </button>
    </div>
  </div>
);

/* -----------------------------
   Main Dashboard
------------------------------ */
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          API.get("/users"),
          API.get("/products"),
        ]);
        setUsers(usersRes.data.users || usersRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteUser = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    if (!ok) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    // Placeholder for edit functionality
    console.log("Edit user:", user);
  };

  const handledashboard = () => {
    navigate("/admin");
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive !== false).length;
  const totalProducts = products.length;
  const userChange = 5; // Example
  const productChange = -2; // Example

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={`min-h-screen ${proTokens.bg} text-white`}>
        {/* Page header */}
        <header className="px-4 md:px-6 pt-6 pb-4 border-b border-white/5 bg-[#050505]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
              Admin Dashboard
            </h1>
            <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Overview</div>
          </div>
        </header>

        {/* Controls and Search */}
        <div className="px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-1.5 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
            />
          </div>
          <button
            className={`${proTokens.buttonPrimary} font-medium py-1.5 px-4 rounded-md transition text-sm`}
            onClick={handledashboard}
          >
            <FaCog className="inline mr-1" /> Controls
          </button>
        </div>

        {/* Compact Metrics */}
        <div className="px-4 md:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard icon={<FaUsers />} title="Total Users" value={totalUsers} change={userChange} />
            <MetricCard icon={<FaShieldAlt />} title="Active Users" value={activeUsers} />
            <MetricCard icon={<FaBox />} title="Total Products" value={totalProducts} change={productChange} />
          </div>
        </div>

        {/* Compact User List */}
        <div className="px-4 md:px-6 pb-6">
          <h2 className={`text-lg font-bold mb-3 ${proTokens.textPrimary}`}>User Management</h2>
          {loading ? (
            <div className="text-center text-gray-600 text-sm">Loading users...</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
