import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Nev from './Nev';
import { AuthContext } from '../context/AuthContext';
import { FaStore, FaBoxOpen, FaHeart, FaRegHeart, FaShareAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChevronLeft, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SellerShop = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [likedProducts, setLikedProducts] = useState(new Set());
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);
                const [sellerRes, productsRes] = await Promise.all([
                    API.get(`/users/shop/${id}`),
                    API.get(`/products/shop/${id}`),
                ]);
                setSeller(sellerRes.data);
                setProducts(productsRes.data);
                setFollowersCount(sellerRes.data.followersCount || 0);

                // Check follow status if logged in
                if (user) {
                    try {
                        const statusRes = await API.get(`/follow/${id}/status`);
                        setIsFollowing(statusRes.data.isFollowing);
                    } catch (e) { /* not logged in or error */ }
                }

                // Build liked set from products
                const liked = new Set();
                productsRes.data.forEach(p => {
                    if (p.likes?.includes(user?._id)) liked.add(p._id);
                });
                setLikedProducts(liked);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load shop.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchShopData();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user) return navigate('/login');
        setFollowLoading(true);
        try {
            if (isFollowing) {
                const res = await API.delete(`/follow/${id}`);
                setIsFollowing(false);
                setFollowersCount(res.data.followersCount);
            } else {
                const res = await API.post(`/follow/${id}`);
                setIsFollowing(true);
                setFollowersCount(res.data.followersCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async (productId) => {
        if (!user) return navigate('/login');
        try {
            const res = await API.post(`/products/${productId}/like`);
            setLikedProducts(prev => {
                const next = new Set(prev);
                if (res.data.liked) next.add(productId);
                else next.delete(productId);
                return next;
            });
            setProducts(prev => prev.map(p =>
                p._id === productId ? { ...p, likesCount: res.data.likesCount } : p
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: `${seller?.businessName || seller?.name}'s Shop`, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8">
                <FaStore className="text-5xl text-white/10 mb-6" />
                <h2 className="text-2xl font-black mb-2">Shop Not Found</h2>
                <p className="text-white/40 text-center max-w-md mb-8">{error || "This shop doesn't exist or is inactive."}</p>
                <Link to="/" className="px-8 py-3 bg-white text-black rounded-full text-sm font-black">Return Home</Link>
            </div>
        );
    }

    const socialLinks = seller.socialLinks || {};
    const hasSocials = socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.linkedin;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 md:pb-16">
            <Nev />

            {/* Mobile Back Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10">
                    <FaChevronLeft size={14} />
                </button>
            </div>

            {/* Profile Header Section */}
            <div className="pt-4 md:pt-24 px-0 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Info */}
                    <div className="flex flex-col items-center text-center pt-8 pb-6 px-6">
                        {/* Avatar */}
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#1A1B1E] shadow-2xl mb-5 bg-[#1A1B1E]">
                            {seller.profileImage ? (
                                <img src={seller.profileImage} alt={seller.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10">
                                    {(seller.businessName || seller.name)?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Tag */}
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{seller.businessName || seller.name}</h1>
                        {seller.tagline && <p className="text-white/40 text-sm mb-1">@{seller.tagline}</p>}
                        <p className="text-white/30 text-xs mb-6">{seller.businessCategory || "Seller"} • Stinchar</p>

                        {/* Follow Button */}
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`px-10 py-3 rounded-full text-sm font-black transition-all duration-300 mb-8 ${
                                isFollowing
                                    ? "bg-[#1A1B1E] border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                                    : "bg-white text-black hover:bg-white/90"
                            }`}
                        >
                            {followLoading ? <FaSpinner className="animate-spin" /> : isFollowing ? "Following" : "Follow"}
                        </button>

                        {/* Stats Row */}
                        <div className="flex items-center gap-10 md:gap-16">
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{seller.productCount || products.length}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Products</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{followersCount}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl md:text-2xl font-black">{seller.followingCount || 0}</p>
                                <p className="text-white/30 text-[11px] uppercase tracking-widest font-bold">Following</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/10 px-4 md:px-0 mt-4">
                        {['products', 'about'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                                    activeTab === tab ? "text-white" : "text-white/20"
                                }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="shop-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid (Instagram-style) */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <FaBoxOpen className="text-4xl text-white/10 mb-4" />
                                        <p className="text-white/30 text-sm font-bold">No products yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] md:gap-1 mt-[2px] md:mt-1">
                                        {products.map(product => (
                                            <div key={product._id} className="relative group aspect-square bg-[#1A1B1E] overflow-hidden">
                                                <Link to={`/product/${product._id}`}>
                                                    {product.images?.[0]?.url ? (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <FaBoxOpen className="text-3xl text-white/10" />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Product Name Overlay (Mobile) */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <p className="text-xs font-bold line-clamp-1">{product.name}</p>
                                                    <p className="text-[10px] text-white/50 font-bold">₹{product.price}</p>
                                                </div>

                                                {/* Like Button */}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleLike(product._id); }}
                                                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 transition-all active:scale-90"
                                                    style={{ opacity: likedProducts.has(product._id) ? 1 : undefined }}
                                                >
                                                    {likedProducts.has(product._id)
                                                        ? <FaHeart className="text-red-500" size={14} />
                                                        : <FaRegHeart className="text-white" size={14} />
                                                    }
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'about' && (
                            <motion.div
                                key="about"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-6 md:p-10 space-y-10"
                            >
                                {/* Bio */}
                                {seller.bio && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">About</h4>
                                        <p className="text-white/70 leading-relaxed">{seller.bio}</p>
                                    </div>
                                )}

                                {/* Store Description */}
                                {seller.storeDescription && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Store</h4>
                                        <p className="text-white/70 leading-relaxed">{seller.storeDescription}</p>
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {seller.location?.city && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaMapMarkerAlt className="text-blue-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Location</p>
                                                <p className="text-sm font-bold">{seller.location.city}</p>
                                            </div>
                                        </div>
                                    )}
                                    {seller.workingHours && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaClock className="text-emerald-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Working Hours</p>
                                                <p className="text-sm font-bold">{seller.workingHours}</p>
                                            </div>
                                        </div>
                                    )}
                                    {seller.established && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaCalendarAlt className="text-purple-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Established</p>
                                                <p className="text-sm font-bold">{new Date(seller.established).getFullYear()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {seller.businessType && (
                                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <FaStore className="text-amber-400" />
                                            <div>
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Business Type</p>
                                                <p className="text-sm font-bold">{seller.businessType}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Policies */}
                                {(seller.returnPolicy || seller.shippingInfo || seller.storePolicies) && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Policies</h4>
                                        {seller.returnPolicy && (
                                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                                <p className="text-xs font-bold text-white/50 mb-2">Return Policy</p>
                                                <p className="text-sm text-white/70">{seller.returnPolicy}</p>
                                            </div>
                                        )}
                                        {seller.shippingInfo && (
                                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                                <p className="text-xs font-bold text-white/50 mb-2">Shipping</p>
                                                <p className="text-sm text-white/70">{seller.shippingInfo}</p>
                                            </div>
                                        )}
                                        {seller.storePolicies && (
                                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                                <p className="text-xs font-bold text-white/50 mb-2">Store Policies</p>
                                                <p className="text-sm text-white/70">{seller.storePolicies}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Social Links */}
                                {hasSocials && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Connect</h4>
                                        <div className="flex gap-4">
                                            {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 transition-all"><FaFacebook className="text-blue-400" /></a>}
                                            {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 transition-all"><FaInstagram className="text-pink-400" /></a>}
                                            {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-sky-500/20 transition-all"><FaTwitter className="text-sky-400" /></a>}
                                            {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600/20 transition-all"><FaLinkedin className="text-blue-500" /></a>}
                                        </div>
                                    </div>
                                )}

                                {/* Share */}
                                <button onClick={handleShare} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                    <FaShareAlt /> Share This Shop
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SellerShop;
