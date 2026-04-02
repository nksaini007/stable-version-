
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";
import { Star, CheckCircle, XCircle, ShieldCheck, Truck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { FaCube } from "react-icons/fa";
import ReviewSection from "./ReviewSection";
import API from "../api/api";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import ARViewer from "./ARViewer";

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <div className="h-[450px] bg-gray-200 rounded-lg" />
          <div className="flex gap-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="h-8 bg-gray-200 w-3/4 rounded mb-4" />
          <div className="h-5 bg-gray-200 w-1/3 rounded mb-6" />
          <div className="h-10 bg-gray-200 w-1/4 rounded mb-4" />
          <div className="h-5 bg-gray-200 w-1/5 rounded mb-6" />
          <div className="h-24 bg-gray-200 w-full rounded mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-10 bg-gray-200 w-2/3 rounded mt-8" />
        </div>
      </div>
    </div>
  </div>
);

const RatingStars = ({ rating = 0 }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill={i < Math.floor(rating) ? "currentColor" : "none"}
      />
    ))}
  </div>
);

const Tag = ({ children }) => (
  <span className="bg-gray-100 text-gray-800 px-4 py-1 rounded-full text-sm shadow-sm hover:shadow-md transition">
    {children}
  </span>
);

const InfoRow = ({ label, value }) => (
  <p className="flex items-start gap-2">
    <span className="font-semibold text-gray-900">{label}:</span> <span className="text-gray-700">{value || "-"}</span>
  </p>
);

const ProductPage = () => {
  const { addToCart } = useContext(CartContext);
  const { productId } = useParams();
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAR, setShowAR] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${productId}`);

        const normalizedImages = (data.images || []).map((img) =>
          img.url?.startsWith("http") ? img.url : `${img.url}`
        );

        setSelectedImage(getOptimizedImage(normalizedImages[0]));
        if (data.arModelUrl) setShowAR(true);
        if (data.variants && data.variants.length > 0) setSelectedVariant(data.variants[0]);
        setProductInfo({
          ...data,
          images: normalizedImages.map(url => getOptimizedImage(url))
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!productInfo) return;

    // Inject variant details if selected
    const productToAdd = selectedVariant ? {
      ...productInfo,
      price: selectedVariant.price,
      selectedVariant: selectedVariant.name,
      quantity: quantity
    } : { ...productInfo, quantity: quantity };

    addToCart(productToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Nev />
        <Skeleton />
        <Footer />
      </>
    );
  }

  if (error || !productInfo) {
    return (
      <>
        <Nev />
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
          <div className="max-w-lg w-full bg-white border border-red-100 rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error || "Product not found."}</p>
            <Link
              to="/"
              className="inline-flex items-center bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold hover:bg-black transition"
            >
              Go Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const inStock = productInfo.stock > 0;

  const nextImage = () => {
    if (!productInfo?.images?.length) return;
    const newIdx = (currentImageIndex + 1) % productInfo.images.length;
    setCurrentImageIndex(newIdx);
    setSelectedImage(productInfo.images[newIdx]);
  };

  const prevImage = () => {
    if (!productInfo?.images?.length) return;
    const newIdx = currentImageIndex === 0 ? productInfo.images.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIdx);
    setSelectedImage(productInfo.images[newIdx]);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Nev />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-70px)] bg-white overflow-x-hidden">
        {/* Left Half: Gray Gallery Pane - Sticky on Desktop */}
        <div className="w-full lg:w-1/2 bg-gray-200 lg:sticky lg:top-[70px] lg:h-[calc(100vh-70px)] flex flex-col justify-center items-center overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-0">

          {/* Top Badges / AR Toggle */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
            <div>
              {productInfo.badge && (
                <span className="bg-white/80 backdrop-blur-sm text-gray-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-2 inline-block shadow-sm">
                  {productInfo.badge}
                </span>
              )}
            </div>
            {productInfo?.arModelUrl && (
              <button
                onClick={() => setShowAR(!showAR)}
                className="bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 px-5 py-2.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <FaCube className="text-indigo-500" /> {showAR ? "Exit 3D View" : "View in 3D / AR"}
              </button>
            )}
          </div>

          {/* Main Visual */}
          <div className="relative w-full h-full flex items-center justify-center z-0 p-8 sm:p-12 lg:p-0">
            {showAR && productInfo?.arModelUrl ? (
              <div className="w-full h-full lg:absolute lg:inset-0 mix-blend-multiply flex items-center justify-center">
                <div className="w-full h-full max-h-[70vh] lg:max-h-full">
                  <ARViewer src={productInfo.arModelUrl} scale={productInfo.arModelScale} rotation={productInfo.arModelRotation} bgColor="bg-transparent" />
                </div>
              </div>
            ) : selectedImage ? (
              <img
                src={selectedImage}
                alt={productInfo.name}
                className="w-full h-full max-h-[60vh] lg:max-h-none object-contain mix-blend-multiply transition-all duration-500 hover:scale-105 p-4 sm:p-12 lg:p-24"
                {...lazyImageProps}
              />
            ) : (
              <div className="text-gray-400 font-medium">No Image Available</div>
            )}
          </div>

          {/* Carousel Controls */}
          {!showAR && productInfo?.images?.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-3 rounded-full shadow-sm transition">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-3 rounded-full shadow-sm transition">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              {/* Thumbnails dots */}
              <div className="absolute bottom-10 flex gap-4">
                {productInfo.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentImageIndex(idx); setSelectedImage(img); }}
                    className="group"
                  >
                    <div className={`w-14 h-1 px-2 border-b-2 transition-all duration-300 ${currentImageIndex === idx ? 'border-gray-800 scale-y-150' : 'border-gray-300 group-hover:border-gray-500'
                      }`} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Half: Details Pane */}
        <div className="lg:w-1/2 bg-white px-8 lg:px-20 py-12 lg:py-16 flex flex-col justify-center">

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{productInfo.category}</span>
            {inStock ? (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">IN STOCK</span>
            ) : (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">SOLD OUT</span>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#2A3342] leading-tight mb-2">
            {productInfo.name}
          </h1>
          <p className="text-sm text-gray-400 mb-6">Item code: {productId.slice(-6).toUpperCase()}</p>

          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2A3342] bg-yellow-400/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {productInfo.rating || "5.0"}
              </span>
              <span className="text-sm text-gray-400">({productInfo.numOfReviews || 89} reviews)</span>
            </div>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">Designed by <span className="font-bold text-gray-800">{productInfo.brand || "Thomas Jonas"}</span></p>
          </div>

          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Description</h3>
            <p className="text-[#556987] leading-relaxed text-[15px]">
              {productInfo.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Price</h3>
            <div className="flex items-baseline gap-4">
              <p className="text-[42px] font-bold text-[#2A3342] tracking-tight">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedVariant ? selectedVariant.price : productInfo.price)}
              </p>
              {productInfo.mrp && productInfo.mrp > (selectedVariant ? selectedVariant.price : productInfo.price) && (
                <p className="text-xl text-gray-400 line-through font-semibold decoration-2">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(productInfo.mrp)}
                </p>
              )}
            </div>
          </div>

          {/* Options & Variants */}
          {productInfo.variants && productInfo.variants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Color / Options</h3>
              <div className="relative w-full max-w-sm">
                <select
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3.5 px-4 pr-8 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow"
                  value={selectedVariant?._id || ""}
                  onChange={(e) => {
                    const variant = productInfo.variants.find(v => v._id === e.target.value);
                    if (variant) setSelectedVariant(variant);
                  }}
                >
                  {productInfo.variants.map((v) => (
                    <option key={v._id} value={v._id}>{v.name.toUpperCase()}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          )}

          {/* Add to Cart & Buy Now Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-12">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 py-4 px-6 font-bold text-sm tracking-widest uppercase rounded-lg shadow-lg border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${added
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-white text-[#2A3342] border-[#2A3342] hover:bg-gray-50"
                } flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none`}
            >
              {added ? (
                <><CheckCircle className="w-5 h-5" /> Added</>
              ) : (
                "Add To Cart"
              )}
            </button>

            <button
              onClick={() => {
                handleAddToCart();
                setTimeout(() => window.location.href = "/cart", 500);
              }}
              disabled={!inStock}
              className="flex-[1.5] py-4 px-6 font-bold text-sm text-white tracking-widest uppercase rounded-lg bg-[#71CDBA] hover:bg-[#60C3AE] shadow-xl shadow-[#71CDBA]/30 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              Buy Now
            </button>
          </div>

          <div className="border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-[#2A3342] mb-6">Customer Reviews</h3>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-black text-[#2A3342]">{productInfo.rating || "5.0"}</div>
                <div>
                  <RatingStars rating={productInfo.rating} />
                  <div className="text-xs text-gray-400 mt-1">Based on {productInfo.numOfReviews || 89} verified reviews</div>
                </div>
              </div>
            </div>
            <ReviewSection itemId={productId} type="product" minimal={false} />
          </div>

          {/* Restored Complete Specifications */}
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
              {productInfo.category && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Category</span><span className="font-semibold text-gray-800">{productInfo.category}</span></div>}
              {productInfo.subcategory && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Subcategory</span><span className="font-semibold text-gray-800">{productInfo.subcategory}</span></div>}
              {productInfo.type && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Type</span><span className="font-semibold text-gray-800">{productInfo.type}</span></div>}
              {productInfo.material && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Material</span><span className="font-semibold text-gray-800">{productInfo.material}</span></div>}
              {productInfo.color && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Color</span><span className="font-semibold text-gray-800">{productInfo.color}</span></div>}
              {productInfo.dimensions && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Dimensions</span><span className="font-semibold text-gray-800">{productInfo.dimensions}</span></div>}
              {productInfo.weight && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Weight</span><span className="font-semibold text-gray-800">{productInfo.weight}</span></div>}
              {productInfo.warranty && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Warranty</span><span className="font-semibold text-gray-800">{productInfo.warranty}</span></div>}
              {productInfo.origin && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Origin</span><span className="font-semibold text-gray-800">{productInfo.origin}</span></div>}
            </div>

            {productInfo.care_instructions && (
              <div className="mt-8">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Care Instructions</h3>
                <p className="text-[#556987] leading-relaxed text-[15px]">{productInfo.care_instructions}</p>
              </div>
            )}

            {productInfo.features?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Features</h3>
                <ul className="list-disc pl-5 text-[#556987] text-[15px] space-y-1">
                  {productInfo.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
