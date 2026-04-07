import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import Nev from "./Nev";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";
import { Star, CheckCircle, XCircle, ShieldCheck, Truck, Sparkles, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { FaCube, FaTerminal } from "react-icons/fa";
import ReviewSection from "./ReviewSection";
import API from "../api/api";
import { getOptimizedImage, lazyImageProps } from "../utils/imageUtils";
import ARViewer from "./ARViewer";

const Skeleton = () => (
  <div className="min-h-screen bg-[#e5e5e5] tech-grid flex flex-col pt-24 animate-pulse">
    <div className="max-w-[2000px] mx-auto w-full px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="bg-white border border-black/5 aspect-square" />
      <div className="space-y-6">
        <div className="h-12 bg-black/5 w-3/4" />
        <div className="h-4 bg-black/5 w-1/4" />
        <div className="h-24 bg-black/5 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-black/5" />
          ))}
        </div>
      </div>
    </div>
  </div>
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
        if (data.arModelUrl) setShowAR(false); // Default to image
        if (data.variants && data.variants.length > 0) setSelectedVariant(data.variants[0]);
        setProductInfo({
          ...data,
          images: normalizedImages.map(url => getOptimizedImage(url))
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product records from central server.");
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

  if (loading) return <><Nev /><Skeleton /><Footer /></>;

  if (error || !productInfo) {
    return (
      <div className="min-h-screen bg-[#e5e5e5] tech-grid flex flex-col">
        <Nev />
        <div className="flex-1 flex items-center justify-center px-6 pt-24">
          <div className="max-w-md w-full bg-white border-2 border-black p-12 text-center relative">
            <div className="corner-decal decal-tl"></div>
            <div className="corner-decal decal-br"></div>
            <FaTerminal className="text-4xl text-[#ff5c00] mx-auto mb-6" />
            <h2 className="text-2xl font-black uppercase mb-4">SYSTEM_ERROR_404</h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-8">{error || "CRITICAL_RECORD_NOT_FOUND"}</p>
            <Link to="/categories" className="inline-block bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5c00] transition-colors">BACK_TO_INVENTORY</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const inStock = productInfo.stock > 0;
  const unitPrice = selectedVariant ? selectedVariant.price : productInfo.price;

  return (
    <div className="bg-[#e5e5e5] min-h-screen font-mono selection:bg-[#ff5c00] selection:text-black tech-grid relative flex flex-col">
      <Nev />
      <div className="scanline"></div>

      <div className="flex-1 max-w-[2000px] mx-auto w-full px-6 md:px-12 pt-32 pb-24 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 mb-10 text-[9px] font-black uppercase tracking-widest text-black/30">
          <Link to="/" className="hover:text-[#ff5c00]">ROOT</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-[#ff5c00]">CATALOG</Link>
          <span>/</span>
          <span className="text-[#ff5c00]">{productInfo.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Side: Media HUD */}
          <div className="relative">
            <div className="sticky top-32 space-y-6">
              
              <div className="bg-white border border-black/10 p-1 relative overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.03)] group">
                <div className="corner-decal decal-tl !border-black/20 group-hover:!border-black transition-colors"></div>
                <div className="corner-decal decal-tr !border-black/20 group-hover:!border-black transition-colors"></div>
                
                <div className="relative aspect-square bg-black/5 overflow-hidden flex items-center justify-center">
                  {showAR && productInfo.arModelUrl ? (
                    <div className="w-full h-full mix-blend-multiply">
                      <ARViewer src={productInfo.arModelUrl} scale={productInfo.arModelScale} rotation={productInfo.arModelRotation} bgColor="bg-transparent" />
                    </div>
                  ) : (
                    <img
                      src={selectedImage}
                      alt={productInfo.name}
                      className="w-full h-full object-contain p-12 transition-transform duration-700 hover:scale-110"
                      {...lazyImageProps}
                    />
                  )}

                  {/* AR Toggle Overlay */}
                  {productInfo.arModelUrl && (
                    <button
                      onClick={() => setShowAR(!showAR)}
                      className={`absolute top-6 right-6 px-6 py-2 border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 z-20 ${
                        showAR ? "bg-[#ff5c00] text-black border-[#ff5c00]" : "bg-black text-white border-black hover:bg-[#ff5c00] hover:border-[#ff5c00] hover:text-black"
                      }`}
                    >
                      <FaCube /> {showAR ? "CLOSE_VIRTUAL_DATA" : "OVERRIDE_3D_VIEW"}
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnails HUD */}
              {!showAR && productInfo.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {productInfo.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentImageIndex(idx); setSelectedImage(img); }}
                      className={`w-20 h-20 border-2 transition-all p-1 bg-white flex-shrink-0 ${
                        currentImageIndex === idx ? "border-[#ff5c00] shadow-[4px_4px_0px_rgba(255,92,0,0.1)]" : "border-black/5 hover:border-black/20"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Data & Controls */}
          <div className="flex flex-col">
            <header className="mb-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em]">
                  {productInfo.category} // {productInfo.subcategory}
                </span>
                <span className={`text-[9px] font-black px-3 py-1 uppercase tracking-widest ${
                  inStock ? "bg-black text-white" : "bg-red-600 text-white"
                }`}>
                  {inStock ? "STATUS::AVAILABLE" : "STATUS::DEPLETED"}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-heading font-black text-black uppercase leading-none">
                {productInfo.name}
              </h1>
              
              <div className="flex items-center gap-4 text-black/30 text-[10px] font-black uppercase tracking-widest border-b border-black/5 pb-8">
                <span>REF: {productId.slice(-12).toUpperCase()}</span>
                <span>/</span>
                <div className="flex items-center gap-1 text-black">
                  <Star size={10} className="fill-current" />
                  <span>{productInfo.rating || "5.0"} UNIT_SCORE</span>
                </div>
              </div>
            </header>

            {/* Description Unit */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-[#ff5c00]"></div>
                <h3 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em]">PRIMARY_DESCRIPTION</h3>
              </div>
              <p className="text-sm text-black/70 leading-relaxed uppercase tracking-tight">
                {productInfo.description}
              </p>
            </section>

            {/* Pricing Node */}
            <section className="mb-12 bg-white border border-black/10 p-8 relative">
              <div className="corner-decal decal-br !border-black/20"></div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.3em] mb-2 text-glow-orange">FINANCIAL_UNIT::INR</h3>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-black leading-none">₹{unitPrice.toLocaleString()}</span>
                    {productInfo.mrp > unitPrice && (
                      <span className="text-xl text-black/20 line-through font-black">₹{productInfo.mrp.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                {/* Variant Selector */}
                {productInfo.variants?.length > 0 && (
                  <div className="flex-1 max-w-[200px]">
                    <h3 className="text-[9px] font-black text-black/40 uppercase tracking-[0.3em] mb-2">MODEL_VARIANT</h3>
                    <select
                      className="w-full bg-black/5 border border-black/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#ff5c00] transition-colors"
                      value={selectedVariant?._id || ""}
                      onChange={(e) => {
                        const variant = productInfo.variants.find(v => v._id === e.target.value);
                        if (variant) setSelectedVariant(variant);
                      }}
                    >
                      {productInfo.variants.map((v) => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                      ) )}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Array */}
              <div className="flex gap-4 mt-10">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 group relative h-14 border-2 transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    added 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "bg-black border-black text-white hover:bg-[#ff5c00] hover:border-[#ff5c00] hover:text-black"
                  } disabled:opacity-30`}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">
                    {added ? "RECORD_ADDED" : "ACQUIRE_UNIT"}
                  </span>
                  {added ? <CheckCircle size={14} /> : <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </section>

            {/* Engineering Specifications (Datasheet Style) */}
            <section className="mb-12">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-2 h-2 bg-black"></div>
                 <h3 className="text-[10px] font-black text-black/50 uppercase tracking-[0.3em]">ENGINEERING_DATASHEET</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10 border border-black/10 overflow-hidden">
                 {[
                   { l: "MATERIAL", v: productInfo.material },
                   { l: "COLOR_SPEC", v: productInfo.color },
                   { l: "DIMENSIONS", v: productInfo.dimensions },
                   { l: "NET_WEIGHT", v: productInfo.weight },
                   { l: "WARRANTY", v: productInfo.warranty },
                   { l: "ORIGIN", v: productInfo.origin }
                 ].filter(item => item.v).map((spec, i) => (
                   <div key={i} className="bg-white p-4 flex flex-col gap-1">
                     <span className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em]">{spec.l}</span>
                     <span className="text-[10px] font-black text-black uppercase">{spec.v}</span>
                   </div>
                 ))}
               </div>
            </section>
            
            {/* Reviews Section Integration */}
            <section className="border-t border-black/5 pt-12">
               <div className="flex items-baseline justify-between mb-8">
                 <h2 className="text-xl font-heading font-black text-black uppercase">UNIT_FEEDBACK</h2>
                 <div className="text-[10px] font-black text-black/40 uppercase tracking-widest">{productInfo.numOfReviews || 0} LOG_ENTRIES</div>
               </div>
               <div className="bg-white/50 border-x border-b border-black/5">
                <ReviewSection itemId={productId} type="product" minimal={true} />
               </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
