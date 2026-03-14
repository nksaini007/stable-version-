import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { FaCheckCircle, FaTimesCircle, FaCheck, FaBan, FaCalendarAlt } from "react-icons/fa";

const ProviderBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await API.get("/bookings/provider-bookings");
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Mark booking as ${status}?`)) return;
        try {
            await API.put(`/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
                <p className="text-gray-500 text-sm mt-1">Manage all your customer bookings.</p>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">No bookings yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Service</th>
                                <th className="p-4 font-semibold">Date & Time</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-800">{b.customerId?.name}</div>
                                        <div className="text-xs text-gray-500">{b.customerId?.phone || "No phone"}</div>
                                        <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate">{b.customerId?.address}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-800 font-medium">{b.serviceId?.title}</div>
                                        <div className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded mt-1">{b.serviceId?.category}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <FaCalendarAlt className="text-blue-500" />
                                            {b.date} at {b.time}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-700">₹{b.amount}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full 
                      ${b.status === 'Pending' ? 'bg-orange-100 text-orange-700' : ''}
                      ${b.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : ''}
                      ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}
                      ${b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(b._id, 'Confirmed')} className="text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition">Accept</button>
                                                <button onClick={() => handleUpdateStatus(b._id, 'Cancelled')} className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition">Reject</button>
                                            </>
                                        )}
                                        {b.status === 'Confirmed' && (
                                            <button onClick={() => handleUpdateStatus(b._id, 'Completed')} className="text-green-600 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition">Mark Completed</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProviderBookings;
