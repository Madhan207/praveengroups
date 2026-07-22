import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { useBusinessContext } from '../../context/BusinessContext';
import { Package, Search, AlertTriangle, CheckCircle, ArrowDown, Download, Briefcase, XCircle } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';
import { SkeletonTable } from '../../components/admin/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import * as XLSX from 'xlsx';

const AdminInventory = () => {
  const { selectedBusiness, activeBusinessObj } = useBusinessContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all, in_stock, low_stock, out_of_stock
  const [stockEdits, setStockEdits] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/products/`;
        if (selectedBusiness !== 'all') {
          url += `?business=${selectedBusiness}`;
        }
        const res = await api.get(url);
        setProducts(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      }
      setLoading(false);
    };

    // If context is a non-product business, don't fetch products
    if (selectedBusiness !== 'all' && activeBusinessObj && activeBusinessObj.type !== 'product') {
      setProducts([]);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [selectedBusiness, activeBusinessObj]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase()));
    }
    if (filterStock === 'out_of_stock') list = list.filter(p => Number(p.stock) === 0);
    else if (filterStock === 'low_stock') list = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5);
    else if (filterStock === 'in_stock') list = list.filter(p => Number(p.stock) > 5);
    
    // Sort by stock ascending (show out of stock first)
    return list.sort((a, b) => Number(a.stock) - Number(b.stock));
  }, [products, search, filterStock]);

  const exportExcel = () => {
    const data = filteredProducts.map(p => ({
      'Product ID': p.id,
      'Name': p.name,
      'Brand': p.brand,
      'Category': p.category,
      'Price': p.price,
      'Stock': p.stock,
      'Status': p.stock === 0 ? 'Out of Stock' : (p.stock <= 5 ? 'Low Stock' : 'In Stock')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_export.xlsx");
  };

  const stats = useMemo(() => {
    return {
      total: products.length,
      outOfStock: products.filter(p => Number(p.stock) === 0).length,
      lowStock: products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length,
      value: products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0)
    };
  }, [products]);

  const handleStockChange = (id, value) => {
    setStockEdits(prev => ({ ...prev, [id]: value }));
  };

  const updateStock = async (slug, id) => {
    const newStock = stockEdits[id];
    if (newStock === undefined) return;
    try {
      await api.patch(`/products/${slug}/`, { stock: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast('Stock updated successfully', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to update stock', 'error');
    }
  };

  if (selectedBusiness !== 'all' && activeBusinessObj && activeBusinessObj.type !== 'product') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No Inventory Management</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Service, Trust, and Logistics businesses do not have physical product inventory in this system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Inventory Tracking</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            Viewing inventory for: <span className="font-semibold">{selectedBusiness === 'all' ? 'All Product Businesses' : activeBusinessObj?.name}</span>
          </p>
        </div>
        <button onClick={exportExcel} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow">
          <Download className="w-4 h-4" /> Export Inventory
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5 border-b-4 border-b-brand-500">
          <p className="text-sm text-slate-500 font-bold uppercase">Total Products</p>
          <p className="text-3xl font-extrabold mt-1 text-slate-800">{stats.total}</p>
        </div>
        <div className="admin-card p-5 border-b-4 border-b-red-500">
          <p className="text-sm text-slate-500 font-bold uppercase">Out of Stock</p>
          <p className="text-3xl font-extrabold mt-1 text-red-600 flex items-center gap-2">
            {stats.outOfStock}
            {stats.outOfStock > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
          </p>
        </div>
        <div className="admin-card p-5 border-b-4 border-b-amber-500">
          <p className="text-sm text-slate-500 font-bold uppercase">Low Stock (≤5)</p>
          <p className="text-3xl font-extrabold mt-1 text-amber-600">{stats.lowStock}</p>
        </div>
        <div className="admin-card p-5 border-b-4 border-b-green-500">
          <p className="text-sm text-slate-500 font-bold uppercase">Inventory Value</p>
          <p className="text-2xl font-extrabold mt-1 text-green-600 truncate">₹{stats.value.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-content-bg)' }}
            />
          </div>
          
          <div className="flex bg-slate-100 rounded-lg p-1 border" style={{ borderColor: 'var(--admin-border)' }}>
            {[
              { id: 'all', label: 'All Stock' },
              { id: 'in_stock', label: 'In Stock (>5)' },
              { id: 'low_stock', label: 'Low Stock (1-5)' },
              { id: 'out_of_stock', label: 'Out of Stock (0)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStock(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filterStock === f.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead style={{ background: 'var(--admin-content-bg)' }}>
                <tr>
                  <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Product</th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Category</th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Price</th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Current Stock</th>
                  <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const currentStock = stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stock;
                  const isOOS = Number(currentStock) === 0;
                  const isLow = Number(currentStock) > 0 && Number(currentStock) <= 5;
                  
                  // Get primary image
                  let imgSrc = '';
                  if (p.images && p.images.length > 0) {
                    imgSrc = getMediaUrl(p.images[0].image_file || p.images[0].image);
                  }

                  return (
                    <tr key={p.id} className="border-t hover:bg-slate-50" style={{ borderColor: 'var(--admin-border)' }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgSrc ? (
                            <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{p.category_name || p.category}</td>
                      <td className="px-5 py-3 font-semibold text-slate-700">₹{Number(p.price).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={currentStock}
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                            className={`w-20 px-2 py-1 border rounded text-sm font-bold ${isOOS ? 'text-red-600 border-red-200 bg-red-50' : isLow ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-slate-700 outline-slate-300'}`}
                          />
                          <button onClick={() => updateStock(p.slug, p.id)} className="text-xs text-brand-600 font-bold hover:underline">Update</button>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isOOS ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700">
                            <XCircle className="w-3.5 h-3.5" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">
                            <ArrowDown className="w-3.5 h-3.5" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" /> In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No products found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
