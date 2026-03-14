import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';
import Nev from './Nev';
import Footer from './Footer';
import { FaStore, FaBoxOpen, FaStar, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerShop = () => {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Seller Public Profile
                const sellerRes = await API.get(`/users/shop/${id}`);
                setSeller(sellerRes.data);

                // 2. Fetch Seller's active products
                const productsRes = await API.get(`/products/shop/${id}`);
                setProducts(productsRes.data);
            } catch (err) {
                console.error("Error loading shop:", err);
                setError(err.response?.data?.message || "Failed to load shop. The seller may not exist or is inactive.");
                toast.error("Error loading shop details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchShopData();
        }
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${seller?.businessName || seller?.name}'s Shop`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Shop link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <Nev />
                <div className="flex-1 flex justify-center items-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <Nev />
                <div className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                        <FaStore className="text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">{error || "This shop link appears to be broken or the seller is no longer active."}</p>
                    <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition">
                        Return to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Nev />

            {/* Shop Header Cover & Banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
                    {/* Render uploaded shop banner or fallback abstract shapes */}
                    {seller?.shopBanner ? (
                        <img
                            src={`${seller.shopBanner}`}
                            alt={`${seller.businessName || seller.name} Banner`}
                            className="w-full h-full object-cover absolute top-0 left-0"
                        />
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute w-64 h-64 bg-white rounded-full -top-10 -left-10 mix-blend-overlay filter blur-3xl"></div>
                            <div className="absolute w-96 h-96 bg-blue-300 rounded-full bottom-10 right-10 mix-blend-overlay filter blur-3xl"></div>
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative pb-8">
                    {/* Avatar positioned over the seam */}
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {seller.profileImage ? (
                                <img src={`${seller.profileImage}`} alt={seller.businessName || seller.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-5xl font-bold">
                                    {(seller.businessName || seller.name).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
                                {seller.businessName || seller.name}
                            </h1>
                            {seller.bio && (
                                <p className="text-gray-600 text-sm md:text-base max-w-2xl">{seller.bio}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
                                <span className="flex items-center gap-1.5"><FaBoxOpen className="text-blue-500" /> {products.length} Products</span>
                                <span className="flex items-center gap-1.5"><FaStar className="text-yellow-400" /> Verified Seller</span>
                            </div>
                        </div>

                        <div className="flex-shrink-0 md:pb-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-700 font-bold rounded-full hover:bg-gray-50 hover:text-blue-600 transition"
                            >
                                <FaShareAlt /> Share Shop
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Inventory Grid */}
            <div className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 w-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                            <FaBoxOpen className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Yet</h3>
                        <p className="text-gray-500 max-w-md mx-auto">This seller hasn't listed any items for sale currently. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.map(product => (
                            <Link to={`/product/${product._id}`} key={product._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
                                <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={`${product.images[0].url}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FaBoxOpen className="text-4xl" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                        <span className="font-extrabold text-blue-600 text-lg">₹{product.price}</span>
                                        {product.rating > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                                <FaStar className="text-yellow-400" /> {product.rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SellerShop;
