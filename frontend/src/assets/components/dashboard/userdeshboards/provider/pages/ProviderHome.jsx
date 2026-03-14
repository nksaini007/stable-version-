import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import API from "../../../../../api/api";
import { FaBoxOpen, FaClipboardList, FaCheckCircle, FaSpinner } from "react-icons/fa";

const ProviderHome = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ services: 0, bookings: 0, pending: 0, confirmed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [servicesRes, bookingsRes] = await Promise.all([
                    API.get("/services/user/my-services"),
                    API.get("/bookings/provider-bookings")
                ]);

                const services = servicesRes.data || [];
                const bookings = bookingsRes.data || [];

                setStats({
                    services: services.length,
                    bookings: bookings.length,
                    pending: bookings.filter(b => b.status === "Pending").length,
                    confirmed: bookings.filter(b => b.status === "Confirmed").length,
                });
            } catch (err) {
                console.error("Error fetching provider stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="text-4xl text-orange-500 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { title: "Total Services", value: stats.services, icon: <FaBoxOpen />, color: "from-blue-500 to-blue-600" },
        { title: "Total Bookings", value: stats.bookings, icon: <FaClipboardList />, color: "from-purple-500 to-purple-600" },
        { title: "Pending Requests", value: stats.pending, icon: <FaClipboardList />, color: "from-orange-500 to-amber-500" },
        { title: "Confirmed Bookings", value: stats.confirmed, icon: <FaCheckCircle />, color: "from-emerald-500 to-emerald-600" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || "Provider"}!</h1>
                <p className="text-gray-500 text-sm mt-1">Here is the overview of your services and bookings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition hover:shadow-md">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProviderHome;
