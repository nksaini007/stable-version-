import React, { useEffect, useState } from "react";
import API from "../../../../../api/api";
import Nev from "../../../../Nev";
import { FaTrash, FaEdit, FaUsers, FaBox, FaShieldAlt, FaCog, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* -----------------------------
   Professional Theme Tokens (Compact and Aesthetic)
------------------------------ */
const proTokens = {
  bg: "bg-gray-50",
  surface: "bg-white",
  border: "border border-gray-200",
  shadow: "shadow-sm hover:shadow-lg",
  textPrimary: "text-gray-900",
  textSecondary: "text-gray-600",
  textAccent: "text-blue-600",
  buttonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
  buttonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  buttonDanger: "bg-red-500 hover:bg-red-600 text-white",
};

/* -----------------------------
   Compact Metric Card
------------------------------ */
const MetricCard = ({ icon, title, value, change }) => (
  <div className={`${proTokens.surface} ${proTokens.border} ${proTokens.shadow} rounded-md p-4 transition-all duration-200 flex items-center space-x-4`}>
    <div className={`text-2xl ${proTokens.textAccent}`}>{icon}</div>
    <div>
      <h3 className={`text-xs font-medium ${proTokens.textSecondary} uppercase tracking-wide`}>{title}</h3>
      <p className={`text-xl font-bold ${proTokens.textPrimary}`}>{value}</p>
      {change !== undefined && (
        <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
  <div className={`${proTokens.surface} ${proTokens.border} ${proTokens.shadow} rounded-md p-3 mb-2 transition-all duration-200 hover:bg-gray-50 flex justify-between items-center`}>
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <h4 className={`font-medium ${proTokens.textPrimary} text-sm`}>{user.name}</h4>
        <p className={`text-xs ${proTokens.textSecondary}`}>{user.email}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
        {user.role}
      </span>
      {user.isActive === false && (
        <span className="text-xs text-yellow-600">Inactive</span>
      )}
      <button
        className={`${proTokens.buttonSecondary} p-1 rounded transition text-xs`}
        onClick={() => onEdit(user)}
        title="Edit"
      >
        <FaEdit />
      </button>
      <button
        className={`${proTokens.buttonDanger} p-1 rounded transition text-xs`}
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
      <Nev />
      <div className={`min-h-screen ${proTokens.bg} text-gray-900`}>
        {/* Page header */}
        <header className="px-4 md:px-6 pt-6 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              Admin Dashboard
            </h1>
            <div className="text-xs text-gray-600">Welcome back</div>
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
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
