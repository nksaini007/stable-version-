
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaBoxes, FaSearch } from "react-icons/fa";

/* -------------------- Helpers -------------------- */
const getImageUrl = (img) => {
  if (!img) return null;
  const cleanImg = img.replace(/^\/+/, "");
  return img.startsWith("http")
    ? img
    : `/${cleanImg}`;//192.168.29.236
};

/* ------------------- Skeleton ------------------- */
const SkeletonCards = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 animate-pulse"
      >
        <div className="w-full h-32 bg-gray-200 rounded-lg" />
        <div className="mt-3 h-4 w-2/3 bg-gray-200 rounded" />
        <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

/* -------------------- Component -------------------- */
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `/api/categories`//192.168.29.236
        );
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  /* -------------------- Search -------------------- */
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return categories;
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(t)
    );
  }, [categories, term]);

  /* -------------------- Popular -------------------- */
  const popular = useMemo(() => {
    return [...categories]
      .sort(
        (a, b) =>
          (b.subcategories?.length || 0) -
          (a.subcategories?.length || 0)
      )
      .slice(0, 8);
  }, [categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ---------------- Header ---------------- */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Browse Categories
          </h1>
          <p className="text-sm text-gray-600">
            Compact view to explore more items at once
          </p>
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---------------- Sidebar ---------------- */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <label className="text-xs font-semibold text-gray-600">
                Search
              </label>
              <div className="relative mt-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
            </div>

            {/* Popular */}
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Popular Categories
              </h3>
              <div className="space-y-1">
                {popular.map((cat, i) => (
                  <Link
                    key={cat._id || i}
                    to={`/category/${encodeURIComponent(cat.name)}`}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm"
                  >
                    <span className="truncate capitalize">
                      {cat.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {cat.subcategories?.length || 0}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ---------------- Grid ---------------- */}
          <main className="lg:col-span-9">
            {loading ? (
              <SkeletonCards />
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <FaBoxes className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  No categories found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filtered.map((category, idx) => {
                  const subs = category.subcategories || [];
                  const imageUrl = getImageUrl(category.image);
                  const overflow = subs.length - 4;

                  return (
                    <Link
                      key={category._id || idx}
                      to={`/category/${encodeURIComponent(
                        category.name
                      )}`}
                      className="group"
                    >
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
                        {/* Image */}
                        <div className="relative h-32 bg-gray-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <FaBoxes className="text-4xl text-gray-300" />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 text-[11px] font-semibold bg-white/90 px-2 py-0.5 rounded-full">
                            {category.name}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {subs.slice(0, 4).map((sub, i) => (
                              <span
                                key={sub._id || i}
                                className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                              >
                                {sub.name}
                              </span>
                            ))}
                            {overflow > 0 && (
                              <span className="text-[11px] bg-gray-200 px-2 py-0.5 rounded-full">
                                +{overflow}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Categories;
