import React, { useState, useEffect, useContext } from "react";
import { FaStar, FaRegStar, FaUser, FaPaperPlane } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const StarInput = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className="text-2xl transition-transform hover:scale-110 focus:outline-none"
            >
                {star <= value ? (
                    <FaStar className="text-amber-400 drop-shadow-sm" />
                ) : (
                    <FaRegStar className="text-gray-300 hover:text-amber-300" />
                )}
            </button>
        ))}
    </div>
);

const StarDisplay = ({ rating, size = "text-sm" }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={size}>
                {star <= Math.round(rating) ? (
                    <FaStar className="text-amber-400" />
                ) : (
                    <FaRegStar className="text-gray-300" />
                )}
            </span>
        ))}
    </div>
);

const RatingBar = ({ stars, count, total }) => (
    <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 w-8 text-right">{stars}★</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
            />
        </div>
        <span className="text-gray-400 w-6">{count}</span>
    </div>
);

/**
 * ReviewSection — Reusable component for product/service reviews
 * @param {string} itemId — Product or Service ID
 * @param {string} type — "product" or "service"
 */
const ReviewSection = ({ itemId, type = "product" }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [numReviews, setNumReviews] = useState(0);
    const [loading, setLoading] = useState(true);

    // Form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const fetchReviews = async () => {
        try {
            const res = await API.get(`/reviews/${type}/${itemId}`);
            setReviews(res.data.reviews || []);
            setAvgRating(res.data.rating || 0);
            setNumReviews(res.data.numOfReviews || 0);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (itemId) fetchReviews();
    }, [itemId, type]);

    // Pre-fill if user already reviewed
    useEffect(() => {
        if (user && reviews.length > 0) {
            const existing = reviews.find(r => r.user === user._id || r.user?._id === user._id);
            if (existing) {
                setRating(existing.rating);
                setComment(existing.comment || "");
            }
        }
    }, [reviews, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setMsg({ text: "Please select a star rating.", type: "error" });
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
            return;
        }
        setSubmitting(true);
        try {
            await API.post(`/reviews/${type}/${itemId}`, { rating, comment });
            setMsg({ text: "Review submitted successfully!", type: "success" });
            fetchReviews();
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || "Failed to submit review.", type: "error" });
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    if (loading) {
        return (
            <div className="animate-pulse space-y-3 py-8">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <div className="mt-10 pt-10 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                    <div className="text-5xl font-black text-gray-900 mb-1">{avgRating ? avgRating.toFixed(1) : "—"}</div>
                    <StarDisplay rating={avgRating} size="text-lg" />
                    <p className="text-sm text-gray-500 mt-2">{numReviews} review{numReviews !== 1 ? "s" : ""}</p>

                    <div className="mt-5 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(s => (
                            <RatingBar key={s} stars={s} count={distribution[s]} total={numReviews} />
                        ))}
                    </div>
                </div>

                {/* Write Review + Review List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Write Review */}
                    {user ? (
                        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-3">
                                {reviews.some(r => r.user === user._id || r.user?._id === user._id) ? "Update Your Review" : "Write a Review"}
                            </h3>

                            {msg.text && (
                                <div className={`mb-3 p-3 rounded-lg text-sm font-medium ${msg.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                                    {msg.text}
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm text-gray-500">Your rating:</span>
                                <StarInput value={rating} onChange={setRating} />
                                {rating > 0 && <span className="text-xs text-amber-600 font-semibold">{rating}/5</span>}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience... (optional)"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition"
                            />

                            <div className="mt-3 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || !rating}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : <><FaPaperPlane className="text-xs" /> Submit Review</>}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                            <p className="text-sm text-gray-500">Please <a href="/login" className="text-emerald-600 font-semibold underline">sign in</a> to leave a review.</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <FaStar className="text-3xl mx-auto mb-2 text-gray-200" />
                            <p className="text-sm">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews
                                .slice()
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((review) => (
                                    <div key={review._id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                <FaUser className="text-gray-400 text-sm" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                                                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5">
                                                    <StarDisplay rating={review.rating} size="text-xs" />
                                                </div>
                                                {review.comment && (
                                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
