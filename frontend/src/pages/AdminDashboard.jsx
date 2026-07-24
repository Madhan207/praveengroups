import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, CheckCircle, XCircle, Plus, Trash2, Edit2,
  X, BarChart2, Users, ImagePlus, UserPlus, Eye, EyeOff, LogOut,
  TrendingUp, AlertTriangle, Building2, History
} from 'lucide-react';

import { getMediaUrl } from '../utils/media';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });
const multipartHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
    'Content-Type': 'multipart/form-data',
  },
});

const EMPTY_PRODUCT = {
  name: '', slug: '', category: '', description: '',
  price: '', discount_price: '', stock: '', is_featured: false, rating: '4.5'
};

const EMPTY_ADMIN = {
  name: '', email: '', mobile_number: '', password: '', confirm_password: ''
};

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productImage, setProductImage] = useState(null);
  const [productFormError, setProductFormError] = useState('');
  const [productFormLoading, setProductFormLoading] = useState(false);

  // Admin modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormLoading, setAdminFormLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    if (user && !user.is_staff) navigate('/');
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchBusinesses();
    fetchUsers();
    fetchAuditLogs();
  };

  const fetchProducts = async () => {
    try { const r = await axios.get(`${API}/products/`); const d = r.data?.results || r.data; setProducts(Array.isArray(d) ? d : []); } catch {}
  };
  const fetchOrders = async () => {
    try { const r = await axios.get(`${API}/orders/?all=true`, authHeaders()); const d = r.data?.results || r.data; setOrders(Array.isArray(d) ? d : []); } catch {}
  };
  const fetchCategories = async () => {
    try { const r = await axios.get(`${API}/categories/`); const d = r.data?.results || r.data; setCategories(Array.isArray(d) ? d : []); } catch {}
  };
  const fetchBusinesses = async () => {
    try { const r = await axios.get(`${API}/businesses/`); const d = r.data?.results || r.data; setBusinesses(Array.isArray(d) ? d : []); } catch {}
  };
  const fetchUsers = async () => {
    try { const r = await axios.get(`${API}/users/`, authHeaders()); const d = r.data?.results || r.data; setUsersList(Array.isArray(d) ? d : []); } catch {}
  };
  const fetchAuditLogs = async () => {
    try { const r = await axios.get(`${API}/auth/audit-logs/`, authHeaders()); const d = r.data?.results || r.data; setAuditLogs(Array.isArray(d) ? d : []); } catch {}
  };

  const updateUserRole = async (userId, newRole) => {
    try { 
        await axios.patch(`${API}/auth/users/${userId}/role/`, { role: newRole }, authHeaders()); 
        fetchUsers();
        fetchAuditLogs();
    } catch { alert('Failed to update role'); }
  };

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const openAddProductModal = () => {
    setEditProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setProductImage(null);
    setProductFormError('');
    setShowProductModal(true);
  };

  const openEditProductModal = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name, slug: p.slug, category: p.category,
      description: p.description, price: p.price,
      discount_price: p.discount_price || '', stock: p.stock,
      is_featured: p.is_featured, rating: p.rating,
    });
    setProductImage(null);
    setProductFormError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductFormLoading(true);
    setProductFormError('');
    try {
      const fd = new FormData();
      Object.entries(productForm).forEach(([k, v]) => {
        if (k === 'discount_price' && v === '') return;
        fd.append(k, v);
      });
      if (productImage) fd.append('image', productImage);

      if (editProduct) {
        await axios.patch(`${API}/products/${editProduct.slug}/`, fd, multipartHeaders());
      } else {
        await axios.post(`${API}/products/`, fd, multipartHeaders());
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      setProductFormError(data ? JSON.stringify(data) : 'Failed to save product.');
    }
    setProductFormLoading(false);
  };

  const deleteProduct = async (slug, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await axios.delete(`${API}/products/${slug}/`, authHeaders()); fetchProducts(); }
    catch { alert('Delete failed.'); }
  };

  // ── Order Actions ─────────────────────────────────────────────────────────
  const updateOrderStatus = async (id, field, value) => {
    try { 
      await axios.patch(`${API}/orders/${id}/`, { [field]: value }, authHeaders()); 
      fetchOrders(); 
    } catch (err) { 
      console.error(err.response?.data);
      alert(`Update failed: ${JSON.stringify(err.response?.data)}`); 
    }
  };

  // ── Admin User Creation ───────────────────────────────────────────────────
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    setAdminSuccess('');
    if (adminForm.password !== adminForm.confirm_password) {
      setAdminFormError('Passwords do not match.');
      return;
    }
    if (adminForm.password.length < 6) {
      setAdminFormError('Password must be at least 6 characters.');
      return;
    }
    setAdminFormLoading(true);
    try {
      await axios.post(`${API}/auth/create-admin/`, {
        name: adminForm.name,
        email: adminForm.email,
        mobile_number: adminForm.mobile_number,
        password: adminForm.password,
      }, authHeaders());
      setAdminSuccess(`Admin "${adminForm.name}" created successfully!`);
      setAdminForm(EMPTY_ADMIN);
    } catch (err) {
      const data = err.response?.data;
      if (data?.email) setAdminFormError('Email already exists.');
      else if (data?.mobile_number) setAdminFormError('Mobile number already exists.');
      else setAdminFormError(data?.detail || JSON.stringify(data) || 'Failed to create admin.');
    }
    setAdminFormLoading(false);
  };

  const stats = {
    products: products.length,
    orders: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    revenue: orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0),
    lowStock: products.filter(p => p.stock < 10).length,
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: stats.pending },
    { id: 'admins', label: 'Users & Access', icon: Users },
  ];

  if (!user?.is_staff) return null;

  return (
    <div className="flex gap-6 min-h-[80vh]">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0">
        <div className="bg-slate-900 text-white rounded-3xl p-5 sticky top-24 space-y-1">
          <div className="mb-6 pb-4 border-b border-white/10">
            <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center text-lg font-bold mb-2">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <p className="font-bold text-sm leading-tight">{user.name}</p>
            <p className="text-slate-400 text-xs truncate">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>

          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{tab.badge}</span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 mt-4">
            <button onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 space-y-6">

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <h1 className="text-2xl font-heading font-bold text-slate-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500', light: 'bg-blue-50' },
                { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'bg-purple-500', light: 'bg-purple-50' },
                { label: 'Pending Orders', value: stats.pending, icon: AlertTriangle, color: 'bg-amber-500', light: 'bg-amber-50' },
                { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-green-500', light: 'bg-green-50' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`${s.light} rounded-2xl p-5 border border-white shadow-sm`}>
                  <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
                  <div className="text-slate-500 text-sm">{s.label}</div>
                </motion.div>
              ))}
            </div>
            {stats.lowStock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 text-orange-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{stats.lowStock} product(s) have low stock (under 10 units). <button onClick={() => setActiveTab('products')} className="underline font-bold">Manage Products →</button></span>
              </div>
            )}
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-brand-600 text-sm font-medium hover:underline">View all</button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>{['Order #', 'Customer', 'Amount', 'Method', 'Status'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-brand-600">#{o.id}</td>
                      <td className="px-5 py-3">{o.user_name || o.full_name}</td>
                      <td className="px-5 py-3 font-semibold">₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3">{o.payment_method}</td>
                      <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Businesses */}
        {activeTab === 'businesses' && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-bold text-slate-900">Manage Businesses</h1>
                <p className="text-slate-500 text-sm">{businesses.length} connected businesses</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {businesses.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {b.logo ? <img src={b.logo} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xl">{b.name[0]}</div>}
                    <div>
                      <h3 className="font-bold text-slate-900">{b.name}</h3>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{b.description || 'No description provided.'}</p>
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
                     <span className={`text-xs font-bold ${b.is_active ? 'text-green-600' : 'text-red-500'}`}>{b.is_active ? '● Active' : '● Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-bold text-slate-900">Manage Products</h1>
                <p className="text-slate-500 text-sm">{products.length} products</p>
              </div>
              <button onClick={openAddProductModal} className="flex items-center gap-2 bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-all shadow">
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                  <tr>{['Product', 'Price', 'Discount', 'Stock', 'Category', 'Featured', 'Actions'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900 max-w-[200px] truncate">{p.name}</td>
                      <td className="px-5 py-3">₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3">{p.discount_price ? `₹${Number(p.discount_price).toLocaleString('en-IN')}` : '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{p.category_name}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.is_featured ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.is_featured ? '⭐ Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditProductModal(p)} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteProduct(p.slug, p.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-400">No products yet. Add your first product!</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <>
            <h1 className="text-2xl font-heading font-bold text-slate-900">Manage Orders</h1>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                <ShoppingBag className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                <h3 className="font-bold text-xl text-slate-700 mb-2">No Orders Yet</h3>
                <p className="text-slate-400">Orders will appear here once users place them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex flex-wrap gap-4 justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-brand-600">#{order.id}</span>

                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {order.payment_method}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm"><strong>{order.user_name || order.full_name}</strong> · {order.user_email}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{order.city}, {order.state} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                        <p className="font-bold text-slate-900 mt-1">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                        {/* Items */}
                        {order.items?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {order.items.map(item => (
                              <span key={item.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.product_name} ×{item.quantity}</span>
                            ))}
                          </div>
                        )}
                        {/* Payment Screenshot */}
                        {order.payment_verification?.screenshot && (
                          <div className="mt-3">
                            <p className="text-xs font-bold text-slate-500 mb-1">Payment Screenshot:</p>
                            <a href={getMediaUrl(order.payment_verification.screenshot)} target="_blank" rel="noopener noreferrer">
                              <img src={getMediaUrl(order.payment_verification.screenshot)} alt="Payment Proof" className="h-16 w-16 object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Status Update */}
                        <select value={order.status} onChange={e => updateOrderStatus(order.id, 'status', e.target.value)}
                          className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-brand-400 outline-none cursor-pointer">
                          {['Pending', 'Payment Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {/* Tracking ID Input */}
                        <input
                          type="text"
                          placeholder="Tracking ID (optional)"
                          defaultValue={order.tracking_id || ''}
                          onBlur={e => e.target.value !== (order.tracking_id || '') && updateOrderStatus(order.id, 'tracking_id', e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-brand-400 outline-none w-32"
                        />
                        {/* UPI verify actions */}
                        {order.payment_method === 'UPI' && order.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button onClick={() => updateOrderStatus(order.id, 'status', 'Payment Verified')}
                              className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold text-xs">
                              <CheckCircle className="w-3 h-3" /> Verify
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, 'status', 'Cancelled')}
                              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 font-semibold text-xs">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Users & Access */}
        {activeTab === 'admins' && (
          <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-heading font-bold text-slate-900 mb-6">User Access Management</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                    <tr>{['Name', 'Email', 'Mobile', 'Current Role', 'Change Role'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {usersList.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-semibold text-slate-900">{u.name}</td>
                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3 text-slate-500">{u.mobile_number}</td>
                        <td className="px-5 py-3">
                            <span className="px-2 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-bold">{u.role}</span>
                        </td>
                        <td className="px-5 py-3">
                            <select value={u.role} onChange={e => updateUserRole(u.id, e.target.value)} disabled={u.id === user?.id}
                                className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:ring-2 focus:ring-brand-400 outline-none cursor-pointer disabled:opacity-50">
                                <option value="customer">Customer</option>
                                <option value="employee">Employee</option>
                                <option value="manager">Store Manager</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><History className="w-5 h-5 text-slate-500" /> Access Audit Logs</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
                   {auditLogs.length === 0 ? <p className="text-slate-500 text-sm">No audit logs found.</p> : auditLogs.map(log => (
                       <div key={log.id} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4"/></div>
                           <div>
                               <p className="text-sm text-slate-900">
                                   <strong>{log.admin_name} ({log.admin_email})</strong> changed role of <strong>{log.target_name} ({log.target_email})</strong>
                               </p>
                               <p className="text-xs text-slate-500 mt-1">From <span className="font-bold">{log.previous_role || 'None'}</span> to <span className="font-bold">{log.new_role}</span></p>
                               <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()} · IP: {log.ip_address || 'Unknown'}</p>
                           </div>
                       </div>
                   ))}
                </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Product Add/Edit Modal ── */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowProductModal(false)}>
            <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-4">
                {productFormError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{productFormError}</div>}
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  {[
                    { label: 'Product Name *', name: 'name', type: 'text', placeholder: 'e.g. Samsung Galaxy S25' },
                    { label: 'URL Slug *', name: 'slug', type: 'text', placeholder: 'samsung-galaxy-s25' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                      <input type={f.type} name={f.name} required placeholder={f.placeholder} value={productForm[f.name]}
                        onChange={e => setProductForm({ ...productForm, [f.name]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                    <select name="category" required value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none">
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                    <textarea rows="3" required value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Price (₹) *', name: 'price', req: true },
                      { label: 'Discount Price (₹)', name: 'discount_price', req: false },
                      { label: 'Stock *', name: 'stock', req: true },
                      { label: 'Rating (0-5)', name: 'rating', req: false },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                        <input type="number" name={f.name} required={f.req} step={f.name === 'rating' ? '0.1' : '1'}
                          min="0" max={f.name === 'rating' ? '5' : undefined}
                          value={productForm[f.name]}
                          onChange={e => setProductForm({ ...productForm, [f.name]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" />
                      </div>
                    ))}
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-brand-400 transition-colors">
                      <input type="file" accept="image/*" id="product-image"
                        onChange={e => setProductImage(e.target.files[0])}
                        className="hidden" />
                      <label htmlFor="product-image" className="flex flex-col items-center gap-2 cursor-pointer">
                        {productImage ? (
                          <>
                            <img src={URL.createObjectURL(productImage)} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                            <span className="text-xs text-slate-500">{productImage.name}</span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-500 font-medium">Click to upload image</span>
                            <span className="text-xs text-slate-400">PNG, JPG, WEBP supported</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={productForm.is_featured}
                      onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600" />
                    <span className="text-sm font-medium text-slate-700">⭐ Feature on Homepage</span>
                  </label>

                  <button type="submit" disabled={productFormLoading}
                    className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-60">
                    {productFormLoading ? 'Saving...' : (editProduct ? '✅ Update Product' : '➕ Add Product')}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component
const StatusBadge = ({ status }) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Payment Verified': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-indigo-100 text-indigo-700',
    'Shipped': 'bg-cyan-100 text-cyan-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};
