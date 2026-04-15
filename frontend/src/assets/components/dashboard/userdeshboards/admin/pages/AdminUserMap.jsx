import React, { useState, useEffect, useRef } from "react";
import API from "../../../../../api/api";
import { FaMapMarkerAlt, FaFilter, FaSearch, FaTimes, FaPhone, FaEnvelope } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Role colors
const roleColors = {
    customer: "#3b82f6",
    seller: "#10b981",
    delivery: "#f59e0b",
    provider: "#8b5cf6",
    architect: "#ec4899",
    admin: "#ef4444",
};

const roleBadgeColors = {
    customer: "bg-blue-50 text-blue-700 border-blue-200",
    seller: "bg-emerald-50 text-emerald-700 border-emerald-200",
    delivery: "bg-amber-50 text-amber-700 border-amber-200",
    provider: "bg-violet-50 text-violet-700 border-violet-200",
    architect: "bg-pink-50 text-pink-700 border-pink-200",
    admin: "bg-red-50 text-red-700 border-red-200",
};

const roleDotColors = {
    customer: "bg-blue-500",
    seller: "bg-emerald-500",
    delivery: "bg-amber-500",
    provider: "bg-violet-500",
    architect: "bg-pink-500",
    admin: "bg-red-500",
};

// Create marker icon with user's profile image
const createUserIcon = (user) => {
    const color = roleColors[user.role] || "#6b7280";
    const initial = (user.name || "?").charAt(0).toUpperCase();

    // If user has a profile image, show it in the marker
    const imgSrc = user.profileImage || "";
    const hasImage = !!imgSrc;

    const html = hasImage
        ? `<div style="
            width: 40px; height: 40px; border-radius: 50%;
            border: 3px solid ${color}; box-: 0 2px 10px rgba(0,0,0,0.3);
            overflow: hidden; background: white;
          ">
            <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${color};color:white;font-weight:bold;font-size:16px;\\'>${initial}</div>'" />
          </div>
          <div style="
            width: 12px; height: 12px; background: ${color};
            position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);
            border-right: 2px solid ${color}; border-bottom: 2px solid ${color};
            z-index: -1;
          "></div>`
        : `<div style="
            width: 40px; height: 40px; border-radius: 50%;
            border: 3px solid ${color}; box-: 0 2px 10px rgba(0,0,0,0.3);
            background: ${color}; display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: 16px; font-family: sans-serif;
          ">${initial}</div>
          <div style="
            width: 12px; height: 12px; background: ${color};
            position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);
            z-index: -1;
          "></div>`;

    return new L.DivIcon({
        className: "",
        html: `<div style="position:relative;width:40px;height:48px;">${html}</div>`,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -45],
    });
};

// Component to fly map to a location
const FlyToLocation = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, zoom || 13, { duration: 1.5 });
    }, [center, zoom]);
    return null;
};

const AdminUserMap = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const searchRef = useRef(null);
    const markerRefs = useRef({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/users/all");
                const allUsers = res.data.users || res.data || [];
                setUsers(allUsers);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users.filter(u => u.location?.lat && u.location?.lng);
        if (roleFilter !== "all") {
            result = result.filter(u => u.role === roleFilter);
        }
        setFilteredUsers(result);
    }, [users, roleFilter]);

    // Search users
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        const q = searchQuery.toLowerCase();
        const matches = users
            .filter(u => u.location?.lat && u.location?.lng)
            .filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.phone?.includes(q) ||
                u.location?.city?.toLowerCase().includes(q) ||
                u.role?.toLowerCase().includes(q)
            )
            .slice(0, 8);
        setSearchResults(matches);
        setShowSearchDropdown(matches.length > 0);
    }, [searchQuery, users]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const close = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleSelectUser = (user) => {
        setFlyTarget([user.location.lat, user.location.lng]);
        setSelectedUserId(user._id);
        setShowSearchDropdown(false);
        setSearchQuery(user.name);
        // Open the marker popup after flying
        setTimeout(() => {
            if (markerRefs.current[user._id]) {
                markerRefs.current[user._id].openPopup();
            }
        }, 1800);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchDropdown(false);
        setSelectedUserId(null);
    };

    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    const totalWithLocation = users.filter(u => u.location?.lat && u.location?.lng).length;
    const totalWithoutLocation = users.length - totalWithLocation;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Locations</h1>
                    <p className="text-sm text-[#8E929C] mt-1">
                        {totalWithLocation} users mapped / {users.length} total
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-[#1A1B1E] border border-[#2A2B2F] px-4 py-2 rounded-xl  border border-[#2A2B2F]">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <span className="font-bold text-white">{filteredUsers.length}</span> on map
                </div>
            </div>

            {/* Search + Filters */}
            <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F] p-4 space-y-3">
                {/* Search Bar */}
                <div className="relative" ref={searchRef}>
                    <div className="flex items-center gap-2 border-2 border-[#2A2B2F] rounded-xl px-4 py-2.5 focus-within:border-blue-400 transition bg-[#121212]">
                        <FaSearch className="text-[#6B7280] text-sm" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search user by name, email, phone, city, or role..."
                            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} className="text-[#6B7280] hover:text-red-500 transition">
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Search Dropdown */}
                    {showSearchDropdown && (
                        <div className="absolute z-30 w-full mt-1 bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F] rounded-xl  overflow-hidden max-h-80 overflow-y-auto">
                            {searchResults.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                                >
                                    {/* User Image */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: roleColors[user.role] }}>
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ background: roleColors[user.role] }}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                        <p className="text-[11px] text-[#6B7280] truncate">{user.email} {user.location?.city ? `• ${user.location.city}` : ""}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${roleBadgeColors[user.role]}`}>
                                        {user.role}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Role Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <FaFilter className="text-[#6B7280] text-sm" />
                    <button
                        onClick={() => setRoleFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${roleFilter === "all" ? "bg-[#1A1B1E] text-white border-gray-800" : "bg-[#121212] text-[#8E929C] border-[#2A2B2F] hover:bg-[#121212]"}`}
                    >
                        All ({totalWithLocation})
                    </button>
                    {["customer", "seller", "delivery", "provider", "architect", "admin"].map(role => {
                        const roleCount = users.filter(u => u.role === role && u.location?.lat && u.location?.lng).length;
                        return (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${roleFilter === role ? "bg-[#1A1B1E] text-white border-gray-800" : `${roleBadgeColors[role]} hover:opacity-80`}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${roleFilter === role ? "bg-[#1A1B1E] border border-[#2A2B2F]" : roleDotColors[role]}`}></span>
                                {role.charAt(0).toUpperCase() + role.slice(1)} ({roleCount})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Map */}
            <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl border border-[#2A2B2F] overflow-hidden " style={{ height: "550px" }}>
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <FaMapMarkerAlt className="text-5xl mb-3" />
                        <p className="text-lg font-semibold text-[#8E929C]">No users with location data</p>
                        <p className="text-sm text-[#6B7280] mt-1">
                            {totalWithoutLocation > 0
                                ? `${totalWithoutLocation} users haven't set their location yet.`
                                : "Users need to set their location in their profile."}
                        </p>
                    </div>
                ) : (
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {flyTarget && <FlyToLocation center={flyTarget} zoom={14} />}
                        {filteredUsers.map(user => (
                            <Marker
                                key={user._id}
                                position={[user.location.lat, user.location.lng]}
                                icon={createUserIcon(user)}
                                ref={(ref) => { if (ref) markerRefs.current[user._id] = ref; }}
                            >
                                <Popup>
                                    <div className="min-w-[220px]">
                                        {/* Popup Header with Image */}
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#2A2B2F]">
                                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: roleColors[user.role] }}>
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ background: roleColors[user.role] }}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-white text-sm truncate">{user.name}</p>
                                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border mt-0.5 ${roleBadgeColors[user.role]}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Popup Details */}
                                        <div className="space-y-1.5 text-xs">
                                            <p className="flex items-center gap-2 text-[#8E929C]">
                                                <FaEnvelope className="text-[#6B7280] shrink-0" /> <span className="truncate">{user.email}</span>
                                            </p>
                                            {user.phone && (
                                                <p className="flex items-center gap-2 text-[#8E929C]">
                                                    <FaPhone className="text-[#6B7280] shrink-0" /> {user.phone}
                                                </p>
                                            )}
                                            {user.location?.city && (
                                                <p className="flex items-center gap-2 text-[#8E929C]">
                                                    <FaMapMarkerAlt className="text-[#6B7280] shrink-0" /> {user.location.city}
                                                </p>
                                            )}
                                            {user.address && (
                                                <p className="flex items-center gap-2 text-[#8E929C] truncate">
                                                    🏠 <span className="truncate">{user.address}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>

            {/* Info Note */}
            {totalWithoutLocation > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-500">
                    <strong className="text-amber-400">Note:</strong> {totalWithoutLocation} user{totalWithoutLocation !== 1 ? "s" : ""} haven't set their location yet.
                    Location can be set from the user's profile settings.
                </div>
            )}
        </div>
    );
};

export default AdminUserMap;
