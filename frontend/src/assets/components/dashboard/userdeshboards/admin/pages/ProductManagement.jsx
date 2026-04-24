import React, { useState, useEffect } from 'react';
import API from '../../../../../api/api';
import { FaTrash, FaSearch, FaBox, FaStore, FaLayerGroup } from 'react-icons/fa';
import AdminCategoryDashboard from '../../../AdminCategoryDashboard';
import { getOptimizedImage } from '../../../../utils/imageUtils';

const AdminProductTable = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/admin-all');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;

    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name?.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s) || p.seller?.name?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Master Product Data</h2>
          <p className="text-sm text-[#8E929C]">View and manage all products across all sellers on the platform.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm" />
          <input
            type="text"
            placeholder="Search products by name, category, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#2A2B2F] rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-[#6B7280]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl border border-[#2A2B2F]  text-[#8E929C]">
          <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
          <p>No products found in the database.</p>
        </div>
      ) : (
        <div className="bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl border border-[#2A2B2F]  overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#121212] border-b border-[#2A2B2F]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#8E929C] uppercase text-xs">Product Details & ID</th>
                  <th className="px-4 py-3 font-semibold text-[#8E929C] uppercase text-xs">Seller Details</th>
                  <th className="px-4 py-3 font-semibold text-[#8E929C] uppercase text-xs">Pricing Tiers (₹)</th>
                  <th className="px-4 py-3 font-semibold text-[#8E929C] uppercase text-xs">Stock & Status</th>
                  <th className="px-4 py-3 font-semibold text-[#8E929C] uppercase text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2B2F]">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-[#121212] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#121212] overflow-hidden flex-shrink-0 border border-[#2A2B2F]">
                          {product.images?.[0]?.url ? (
                            <img src={getOptimizedImage(product.images[0].url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><FaBox /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{product.name}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                          <div className="flex flex-col gap-1 mt-1.5">
                            <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 w-fit uppercase tracking-tighter">ID: {product._id?.slice(-8)}</span>
                            <p className="text-[10px] text-[#8E929C]"><span className="font-bold text-blue-500">{product.category}</span> {product.subcategory && `> ${product.subcategory}`}</p>
                          </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.seller ? (
                        <div className="space-y-1">
                          <p className="font-bold text-white flex items-center gap-1.5"><FaStore className="text-blue-500 text-xs" /> {product.seller.name}</p>
                          <p className="text-[11px] text-[#8E929C] leading-tight">{product.seller.email}</p>
                          <p className="text-[11px] text-[#6B7280] font-medium">Role: <span className="text-blue-400">{product.seller.role}</span></p>
                        </div>
                      ) : (
                        <span className="text-red-400 text-xs italic">Seller Unavailable</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-[11px]">
                      <div className="space-y-1 text-[10px] bg-[#121212] p-1.5 rounded-lg border border-[#2A2B2F]">
                        <div className="flex justify-between border-b border-[#2A2B2F] pb-1">
                          <span className="text-[#6B7280]">Normal:</span>
                          <span className="font-bold text-gray-200 ml-2">₹{product.pricingTiers?.normal || product.price || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#2A2B2F] pb-1">
                          <span className="text-orange-400 font-bold">Stinchar:</span>
                          <span className="font-bold text-white ml-2">₹{product.pricingTiers?.stinchar || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-400 font-bold">Architect:</span>
                          <span className="font-bold text-white ml-2">₹{product.pricingTiers?.architect || 0}</span>
                        </div>
                      </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <p className={`text-xs font-bold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                          QTY: {product.stock}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${product.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[#2A2B2F] text-[#8E929C]'}`}>
                          {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-transparent hover:border-red-600 "
                        title="Force Delete Product"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Data Management</h1>
        <p className="text-[#8E929C] text-sm mt-1">Control all product listings and categories on the platform.</p>
      </div>

      {/* Custom Tabs */}
      <div className="flex border-b border-[#2A2B2F]">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'products' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-[#8E929C] hover:text-gray-200 hover:bg-[#1A1B1E]'
            }`}
        >
          <FaBox className="text-lg" /> All Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'categories' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-[#8E929C] hover:text-gray-200 hover:bg-[#1A1B1E]'
            }`}
        >
          <FaLayerGroup className="text-lg" /> Manage Categories
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'products' ? (
          <AdminProductTable />
        ) : (
          <AdminCategoryDashboard />
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
