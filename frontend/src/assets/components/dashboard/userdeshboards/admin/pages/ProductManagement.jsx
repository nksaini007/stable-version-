import React, { useState, useEffect } from 'react';
import API from '../../../../../api/api';
import { FaTrash, FaSearch, FaBox, FaStore, FaLayerGroup } from 'react-icons/fa';
import AdminCategoryDashboard from '../../../AdminCategoryDashboard';

const AdminProductTable = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/admin-all');
      setProducts(res.data);
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
          <h2 className="text-lg font-bold text-gray-800">Master Product Data</h2>
          <p className="text-sm text-gray-500">View and manage all products across all sellers on the platform.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search products by name, category, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-500">
          <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
          <p>No products found in the database.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Product Details & ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Seller Details</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Pricing Tiers (₹)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Stock & Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><FaBox /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">ID: {product._id}</span>
                            <p className="text-xs text-gray-500"><span className="font-medium text-blue-600">{product.category}</span> {product.subcategory && `> ${product.subcategory}`}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.seller ? (
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 flex items-center gap-1.5"><FaStore className="text-blue-500 text-xs" /> {product.seller.name}</p>
                          <p className="text-[11px] text-gray-500 leading-tight">{product.seller.email}</p>
                          <p className="text-[11px] text-gray-400 font-medium">Role: <span className="text-blue-600">{product.seller.role}</span></p>
                        </div>
                      ) : (
                        <span className="text-red-400 text-xs italic">Seller Unavailable</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between border-b border-gray-50 pb-0.5">
                          <span className="text-gray-400">Normal:</span>
                          <span className="font-bold text-gray-700">₹{product.pricingTiers?.normal || product.price || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-0.5">
                          <span className="text-orange-400 font-medium">Stinchar:</span>
                          <span className="font-bold text-orange-600">₹{product.pricingTiers?.stinchar || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-400 font-medium">Architect:</span>
                          <span className="font-bold text-blue-600">₹{product.pricingTiers?.architect || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <p className={`text-xs font-bold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                          QTY: {product.stock}
                        </p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {product.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-transparent hover:border-red-600 shadow-sm"
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
        <h1 className="text-2xl font-bold text-gray-800">Product Data Management</h1>
        <p className="text-gray-500 text-sm mt-1">Control all product listings and categories on the platform.</p>
      </div>

      {/* Custom Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'products' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
          <FaBox className="text-lg" /> All Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'categories' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
