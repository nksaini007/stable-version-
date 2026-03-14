import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { FaCheckCircle, FaTimesCircle, FaCheck, FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../../../../context/AuthContext";

const ProviderServices = () => {
    const { user } = useContext(AuthContext);
    const [allServices, setAllServices] = useState([]);
    const [offeredServices, setOfferedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, profileRes] = await Promise.all([
                API.get("/services"), // Public or accessible endpoint to fetch all services
                API.get("/users/me") // Fetch my profile
            ]);

            setAllServices(servicesRes.data);
            setOfferedServices(profileRes.data.offeredServices || []);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleOfferedService = (serviceId) => {
        if (offeredServices.includes(serviceId)) {
            setOfferedServices(offeredServices.filter(id => id !== serviceId));
        } else {
            setOfferedServices([...offeredServices, serviceId]);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await API.put("/users/me", { offeredServices });
            toast.success("Offered services updated successfully");
        } catch (err) {
            toast.error("Failed to update offered services");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading services...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Offered Services</h1>
                    <p className="text-sm text-gray-500 mt-1">Select the services you are capable of providing.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md hover:shadow-orange-500/30 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? "Saving..." : <><FaCheck /> Save Selection</>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allServices.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                        No platform services available to choose from.
                    </div>
                ) : (
                    allServices.map(svc => {
                        const isSelected = offeredServices.includes(svc._id);
                        return (
                            <div
                                key={svc._id}
                                onClick={() => toggleOfferedService(svc._id)}
                                className={`bg-white rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group flex flex-col 
                                    ${isSelected ? 'border-orange-500 shadow-orange-500/20 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200'}`}
                            >
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    {svc.images?.length > 0 ? (
                                        <img src={`${svc.images[0]}`} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                            <FaTools className="text-3xl" />
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors
                                        ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-gray-300'}`}>
                                        <FaCheck />
                                    </div>
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                                        {svc.category}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-1">{svc.title}</h3>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">{svc.description}</p>
                                    <div className="font-black text-gray-900 mt-auto">₹{svc.price}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProviderServices;
