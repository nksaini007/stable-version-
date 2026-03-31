import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/AuthContext';
import { FaHardHat, FaSignOutAlt, FaTasks, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ArchitectPartnerLayout = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Protective check
    if (!token) return <Navigate to="/login" />;
    if (user?.role !== "architectPartner") return <Navigate to="/" />;

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row">
            {/* Mobile-friendly Sidebar */}
            <aside className="w-full md:w-64 bg-[#111] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
                <div className="p-6 flex items-center justify-between md:block">
                    <div className="flex items-center gap-3">
                        <FaHardHat className="text-3xl text-yellow-500" />
                        <div>
                            <h2 className="font-bold text-lg tracking-wide uppercase">Partner</h2>
                            <p className="text-xs text-gray-500">Workspace</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 flex md:block overflow-x-auto gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium w-full text-left transition-colors">
                        <FaTasks /> Tasks & Attendance
                    </button>
                    {/* Add more nav buttons later if needed */}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{user?.name}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl transition-colors font-medium text-sm"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default ArchitectPartnerLayout;
