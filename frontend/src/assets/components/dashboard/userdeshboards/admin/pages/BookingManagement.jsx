import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { FaTrash, FaCalendarAlt, FaStore, FaUser, FaClipboardCheck, FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bRes, pRes] = await Promise.all([
                API.get("/bookings"),
                API.get("/users/providers")
            ]);
            setBookings(bRes.data);
            setProviders(pRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking marked as ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const assignProvider = async (id, providerId) => {
        try {
            await API.put(`/bookings/${id}/status`, { providerId });
            toast.success(`Provider assigned successfully`);
            fetchData();
        } catch (err) {
            toast.error("Failed to assign provider");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#8E929C]">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Booking Management</h1>
                    <p className="text-sm text-[#8E929C] mt-1">Track and manage all customer bookings and provider fulfillments.</p>
                </div>
                <div className="flex items-center gap-2 text-sm bg-[#1A1B1E] border border-[#2A2B2F] px-4 py-2 rounded-xl  border border-[#2A2B2F]">
                    <span className="font-bold text-white">{bookings.length}</span> Total Bookings
                </div>
            </div>

            <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-2xl  border border-[#2A2B2F] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#121212] border-b border-[#2A2B2F] text-[#8E929C]">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Service Details</th>
                                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Customer Details</th>
                                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Provider Info</th>
                                <th className="px-6 py-4 font-semibold text-center">Amount</th>
                                <th className="px-6 py-4 font-semibold text-center">Schedule</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[#8E929C]">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map(b => (
                                    <tr key={b._id} className="hover:bg-[#121212]/50 transition border-b border-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white">{b.serviceId?.title || 'Unknown Service'}</p>
                                            <p className="text-xs text-blue-500 font-medium">{b.serviceId?.category}</p>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white font-bold">
                                                    <FaUser className="text-[#6B7280] size-3" />
                                                    <span>{b.customerId?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#8E929C] text-xs">
                                                    <FaPhone className="text-gray-300 size-3" />
                                                    <span>{b.customerId?.phone || 'No Phone'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#8E929C] text-xs">
                                                    <FaEnvelope className="text-gray-300 size-3" />
                                                    <span>{b.customerId?.email}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-[#8E929C] text-[10px] leading-tight max-w-[200px] whitespace-normal">
                                                    <FaMapMarkerAlt className="text-gray-300 size-3 mt-0.5 flex-shrink-0" />
                                                    <span>{b.customerId?.address}{b.customerId?.pincode ? `, ${b.customerId.pincode}` : ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {b.providerId ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-white font-semibold">
                                                        <FaStore className="text-orange-300 size-3" />
                                                        <span>{b.providerId.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[#8E929C] text-xs">
                                                        <FaPhone className="text-gray-300 size-3" />
                                                        <span>{b.providerId.phone || 'No Phone'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded border border-yellow-200 uppercase tracking-wider">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-white">
                                            ₹{b.amount}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center text-xs text-[#8E929C]">
                                                <FaCalendarAlt className="mb-0.5 text-[#6B7280]" />
                                                {b.date}
                                                <span className="text-[#6B7280]">{b.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border
                                                ${b.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}
                                                ${b.status === 'Confirmed' ? 'bg-blue-50 text-blue-400 border-blue-200' : ''}
                                                ${b.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                                                ${b.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                                            `}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    onChange={(e) => assignProvider(b._id, e.target.value)}
                                                    value={b.providerId?._id || ""}
                                                    className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-200 outline-none cursor-pointer font-bold"
                                                >
                                                    <option value="" disabled>Assign Provider</option>
                                                    {(() => {
                                                        const capable = providers.filter(p => p.offeredServices?.some(id => id === b.serviceId?._id));
                                                        if (capable.length === 0) return <option disabled>No specific providers found</option>;
                                                        return capable.map(p => (
                                                            <option key={p._id} value={p._id}>{p.name}</option>
                                                        ));
                                                    })()}
                                                </select>
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => updateStatus(b._id, e.target.value)}
                                                    className="text-[10px] bg-[#1A1B1E] border border-[#2A2B2F] border border-[#2A2B2F] rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-100 outline-none font-medium"
                                                >
                                                    <option value="Pending">Status: Pending</option>
                                                    <option value="Confirmed">Status: Confirmed</option>
                                                    <option value="Completed">Status: Completed</option>
                                                    <option value="Cancelled">Status: Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingManagement;
