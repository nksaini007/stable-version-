
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";
import { Star, CheckCircle, XCircle, ShieldCheck, Truck, Sparkles } from "lucide-react";
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
      selectedVariant: selectedVariant.name
    } : productInfo;

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

  return (
    <>
      <Nev />
      {/* Breadcrumb + header band */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-indigo-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{productInfo.name}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen px-6 py-10 text-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="relative">
                {productInfo.badge && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 z-10">
                    <Sparkles className="h-4 w-4" /> {productInfo.badge}
                  </span>
                )}

                {productInfo?.arModelUrl && (
                  <button
                    onClick={() => setShowAR(!showAR)}
                    className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm text-purple-700 hover:text-purple-900 border border-purple-200 px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <FaCube /> {showAR ? "Close AR" : "View in AR"}
                  </button>
                )}

                {showAR && productInfo?.arModelUrl ? (
                  <div className="w-full h-[520px] rounded-lg overflow-hidden bg-white z-10 relative">
                    <ARViewer src={productInfo.arModelUrl} scale={productInfo.arModelScale} rotation={productInfo.arModelRotation} bgColor="bg-orange-200" />
                  </div>
                ) : selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={productInfo.name}
                    className="rounded-lg w-full max-h-[520px] object-contain bg-white"
                    {...lazyImageProps}
                  />
                ) : (
                  <div className="h-[520px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>

              {productInfo.images.length > 1 && (
                <div className="flex mt-4 gap-3 overflow-x-auto pb-1">
                  {productInfo.images.map((img, idx) => {
                    const active = selectedImage === img;
                    return (
                      <button
                        key={idx}
                        className={`relative flex-shrink-0 w-20 h-20 drop-shadow-lg rounded-lg border transition-all ${active ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => setSelectedImage(img)}
                        aria-label={`Select image ${idx + 1}`}
                      >
                        <img
                          src={getOptimizedImage(img, 200)}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                          {...lazyImageProps}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <Truck className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-600">3–5 business days</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">SSL encrypted checkout</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Quality Assured</p>
                  <p className="text-xs text-gray-600">7-day return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{productInfo.name}</h1>
                {inStock ? (
                  <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4" /> In stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full border border-red-200">
                    <XCircle className="h-4 w-4" /> Out of stock
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Brand: <span className="text-indigo-600 font-medium">{productInfo.brand}</span>
              </p>

              <div className="mt-4 flex items-center gap-3">
                <RatingStars rating={productInfo.rating} />
                <span className="text-sm text-gray-500">({productInfo.numOfReviews} reviews)</span>
              </div>

              {productInfo.variants && productInfo.variants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {productInfo.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedVariant?._id === variant._id || selectedVariant?.name === variant.name
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                            : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <p className="text-3xl font-extrabold text-gray-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedVariant ? selectedVariant.price : productInfo.price)}
                </p>
                {productInfo.mrp && productInfo.mrp > (selectedVariant ? selectedVariant.price : productInfo.price) && (
                  <p className="text-sm text-gray-500 mt-1">
                    MRP: <span className="line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(productInfo.mrp)}</span>{" "}
                    <span className="text-green-600 font-semibold">
                      Save {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(productInfo.mrp - (selectedVariant ? selectedVariant.price : productInfo.price))}
                    </span>
                  </p>
                )}
              </div>

              <p className="mt-6 text-gray-700 leading-relaxed">{productInfo.description}</p>

              {productInfo.features?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-3">
                    {productInfo.features.map((feature, idx) => (
                      <Tag key={idx}>{feature}</Tag>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 bg-gray-50/80 p-5 rounded-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Category" value={productInfo.category} />
                  <InfoRow label="Subcategory" value={productInfo.subcategory} />
                  <InfoRow label="Type" value={productInfo.type} />
                  <InfoRow label="Material" value={productInfo.material} />
                  <InfoRow label="Color" value={productInfo.color} />
                  <InfoRow label="Dimensions" value={productInfo.dimensions} />
                  <InfoRow label="Weight" value={productInfo.weight} />
                  <InfoRow label="Warranty" value={productInfo.warranty} />
                  <InfoRow label="Origin" value={productInfo.origin} />
                </div>
              </div>

              {productInfo.care_instructions && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Care instructions</h3>
                  <p className="text-gray-700">{productInfo.care_instructions}</p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition ${added ? "ring-2 ring-indigo-300" : ""
                    } disabled:opacity-50`}
                  disabled={!inStock}
                >
                  Add to cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    window.location.href = "/cart";
                  }}
                  className="flex-1 inline-flex items-center justify-center bg-gray-900 hover:bg-black text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition disabled:opacity-50"
                  disabled={!inStock}
                >
                  Buy now
                </button>
              </div>

              {added && (
                <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
                  <CheckCircle className="h-5 w-5" /> Added to cart
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto">
          <ReviewSection itemId={productId} type="product" />
        </div>
      </div>
      <Footer />

    </>
  );
};

export default ProductPage;
