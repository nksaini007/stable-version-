import React, { useState, useEffect } from "react";
import API from "../../../../../api/api";
import { FaStar, FaChartBar, FaRegStar, FaBoxOpen, FaCogs, FaUser, FaTrash } from "react-icons/fa";

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get("/reviews/analytics");
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleDeleteReview = async (type, itemId, reviewId) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await API.delete(`/reviews/${type}/${itemId}/${reviewId}`);
            // Refresh
            const res = await API.get("/reviews/analytics");
            setData(res.data);
        } catch (err) {
            alert("Failed to delete review");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-20 text-gray-500">Failed to load analytics data.</div>;
    }

    const maxDist = Math.max(...Object.values(data.ratingDistribution), 1);
    const tabs = [
        { id: "overview", label: "Overview", icon: <FaChartBar /> },
        { id: "products", label: "Top Products", icon: <FaBoxOpen /> },
        { id: "services", label: "Top Services", icon: <FaCogs /> },
        { id: "reviews", label: "Recent Reviews", icon: <FaStar /> },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Product & Service Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor reviews, ratings, and performance across all products and services</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Reviews</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{data.totalReviews}</p>
                    <p className="text-xs text-gray-500 mt-1">{data.productsWithReviews} products • {data.servicesWithReviews} services reviewed</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Avg Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-3xl font-black text-gray-900">{data.avgRating || "—"}</p>
                        <FaStar className="text-amber-400 text-xl" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Across all items</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Products</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{data.totalProducts}</p>
                    <p className="text-xs text-gray-500 mt-1">{data.productsWithReviews} have reviews</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Services</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{data.totalServices}</p>
                    <p className="text-xs text-gray-500 mt-1">{data.servicesWithReviews} have reviews</p>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex gap-1 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Rating Distribution */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Rating Distribution</h3>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = data.ratingDistribution[star] || 0;
                                const pct = data.totalReviews > 0 ? ((count / data.totalReviews) * 100).toFixed(0) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-600 w-6 text-right">{star}</span>
                                        <FaStar className="text-amber-400 text-sm" />
                                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${star >= 4 ? "bg-emerald-400" : star === 3 ? "bg-amber-400" : "bg-red-400"}`}
                                                style={{ width: `${(count / maxDist) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Most Reviewed */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Most Reviewed Items</h3>
                        {data.mostReviewed.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">No reviews yet</p>
                        ) : (
                            <div className="space-y-3">
                                {data.mostReviewed.map((item, idx) => (
                                    <div key={item._id} className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-[11px] text-gray-400">{item.type} • {item.rating}★</p>
                                        </div>
                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">{item.numOfReviews} reviews</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TOP PRODUCTS TAB */}
            {activeTab === "products" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Top Rated Products</h3>
                    </div>
                    {data.topProducts.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No product reviews yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                        <th className="px-5 py-3">#</th>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">Seller</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Price</th>
                                        <th className="px-5 py-3">Rating</th>
                                        <th className="px-5 py-3">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topProducts.map((p, idx) => (
                                        <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                            <td className="px-5 py-3 font-bold text-gray-400">{idx + 1}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.image ? (
                                                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            <FaBoxOpen className="text-gray-300" />
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-gray-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">{p.seller || "—"}</td>
                                            <td className="px-5 py-3 text-gray-500">{p.category || "—"}</td>
                                            <td className="px-5 py-3 font-semibold text-gray-800">₹{p.price}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1">
                                                    <FaStar className="text-amber-400 text-xs" />
                                                    <span className="font-bold text-gray-800">{p.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">{p.numOfReviews}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TOP SERVICES TAB */}
            {activeTab === "services" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Top Rated Services</h3>
                    </div>
                    {data.topServices.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No service reviews yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                                        <th className="px-5 py-3">#</th>
                                        <th className="px-5 py-3">Service</th>
                                        <th className="px-5 py-3">Category</th>
                                        <th className="px-5 py-3">Price</th>
                                        <th className="px-5 py-3">Rating</th>
                                        <th className="px-5 py-3">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topServices.map((s, idx) => (
                                        <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                            <td className="px-5 py-3 font-bold text-gray-400">{idx + 1}</td>
                                            <td className="px-5 py-3 font-semibold text-gray-800">{s.name}</td>
                                            <td className="px-5 py-3 text-gray-500">{s.category || "—"}</td>
                                            <td className="px-5 py-3 font-semibold text-gray-800">₹{s.price}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1">
                                                    <FaStar className="text-amber-400 text-xs" />
                                                    <span className="font-bold text-gray-800">{s.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500">{s.numOfReviews}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* RECENT REVIEWS TAB */}
            {activeTab === "reviews" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800">Recent Reviews ({data.recentReviews.length})</h3>
                    </div>
                    {data.recentReviews.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No reviews yet</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {data.recentReviews.map((review) => (
                                <div key={review._id} className="px-5 py-4 hover:bg-gray-50/50 transition flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                        <FaUser className="text-indigo-400 text-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-gray-800">{review.name}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${review.type === "product" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-purple-50 text-purple-600 border-purple-200"}`}>
                                                {review.type}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">on <span className="font-medium text-gray-700">{review.itemName}</span></p>
                                        <div className="flex items-center gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                s <= review.rating
                                                    ? <FaStar key={s} className="text-amber-400 text-xs" />
                                                    : <FaRegStar key={s} className="text-gray-300 text-xs" />
                                            ))}
                                        </div>
                                        {review.comment && <p className="text-sm text-gray-600 mt-1.5">{review.comment}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteReview(review.type, review.itemId, review._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                                        title="Delete review"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
