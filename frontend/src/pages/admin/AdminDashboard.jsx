import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, TrendingUp, Package, AlertTriangle, Users,
  CheckCircle, XCircle, Clock, Truck, Tag, ArrowRight, RefreshCw, Calendar, DollarSign
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { SalesLineChart, StatusDonutChart } from '../../components/admin/AdminChart';
import { SkeletonStats } from '../../components/admin/SkeletonLoader';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authH = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const StatusBadge = ({ status }) => {
  const map = {
    'Pending':          'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Payment Verified': 'bg-blue-100 text-blue-700 border-blue-200',
    'Processing':       'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Shipped':          'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Delivered':        'bg-green-100 text-green-700 border-green-200',
    'Cancelled':        'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

const buildSalesData = (orders, daysCount = 7) => {
  const days = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const dayOrders = orders.filter(o => o.created_at?.slice(0, 10) === key);
    days.push({
      date: label,
      orders: dayOrders.length,
      revenue: dayOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0),
    });
  }
  return days;
};

const buildStatusData = (orders) => {
  const map = {};
  orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

const AdminDashboard = () => {
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers]         = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [packages, setPackages]   = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('7days'); // today, 7days, 30days, year
  
  const navigate = useNavigate();

  const fetchAll = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [o, p, c, u, b, bk, pkg] = await Promise.all([
        axios.get(`${API}/orders/?all=true`, authH()),
        axios.get(`${API}/products/`),
        axios.get(`${API}/categories/`),
        axios.get(`${API}/users/`, authH()).catch(() => ({ data: [] })),
        axios.get(`${API}/businesses/`),
        axios.get(`${API}/bookings/`, authH()).catch(() => ({ data: [] })),
        axios.get(`${API}/service-packages/`, authH()).catch(() => ({ data: [] }))
      ]);
      
      setOrders(o.data);
      setProducts(p.data);
      setCategories(c.data.results || c.data);
      setUsers(u.data.results || u.data);
      setBusinesses(b.data.results || b.data);
      setBookings(bk.data.results || bk.data);
      setPackages(pkg.data.results || pkg.data);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  
  const stats = useMemo(() => {
    const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const pending = orders.filter(o => o.status === 'Pending').length;
    return {
      total:      orders.length,
      today:      orders.filter(o => o.created_at?.slice(0, 10) === today).length,
      revenue:    revenue,
      pending:    pending,
      delivered:  orders.filter(o => o.status === 'Delivered').length,
      cancelled:  orders.filter(o => o.status === 'Cancelled').length,
      products:   products.length,
      outOfStock: products.filter(p => p.stock === 0).length,
      categories: categories.length,
      customers:  users.length,
      bookings:   bookings.length,
      packages:   packages.length,
      totalBiz:   businesses.length
    };
  }, [orders, products, categories, users, bookings, packages, businesses]);

  const daysCount = dateRange === '7days' ? 7 : (dateRange === '30days' ? 30 : (dateRange === 'today' ? 1 : 12)); // simplified
  const salesData  = useMemo(() => buildSalesData(orders, daysCount), [orders, daysCount]);
  const statusData = useMemo(() => buildStatusData(orders), [orders]);

  const STAT_CARDS = [
    { label: 'Total Revenue',     value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, gradient: 'from-green-500 to-emerald-700', trend: 'up', trendValue: '+8%' },
    { label: 'Total Orders',      value: stats.total,      icon: ShoppingBag,  gradient: 'from-blue-500 to-blue-700',    trend: 'up',      trendValue: '+12%' },
    { label: "Today's Orders",    value: stats.today,      icon: Clock,        gradient: 'from-purple-500 to-purple-700', trend: 'neutral', trendValue: 'today' },
    { label: 'Pending Orders',    value: stats.pending,    icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', trend: stats.pending > 5 ? 'down' : 'up', trendValue: stats.pending > 5 ? 'high' : 'low' },
    { label: 'Total Customers',   value: stats.customers,  icon: Users,        gradient: 'from-pink-500 to-rose-600',    trend: 'up',      trendValue: '+2%' },
  ];

  STAT_CARDS.push(
    { label: 'Products',          value: stats.products,   icon: Package,      gradient: 'from-indigo-500 to-indigo-700', trend: 'up',     trendValue: `${stats.products}` },
    { label: 'Total Businesses',  value: stats.totalBiz,   icon: Truck,        gradient: 'from-orange-500 to-red-600',  trend: 'neutral', trendValue: `${stats.totalBiz}` },
    { label: 'Service Packages',  value: stats.packages,   icon: Tag,          gradient: 'from-teal-500 to-cyan-600',    trend: 'neutral', trendValue: `${stats.packages}` },
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStats count={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>
            Platform Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1 border" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-card-bg)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: 'year', label: 'This Year' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  dateRange === range.id 
                    ? 'bg-brand-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => fetchAll(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border hover:border-brand-400 hover:text-brand-600 transition-all"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)', background: 'var(--admin-card-bg)' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {stats.outOfStock > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {stats.outOfStock} product{stats.outOfStock > 1 ? 's are' : ' is'} out of stock!
            </p>
            <p className="text-xs text-amber-600">These products are currently unavailable to customers.</p>
          </div>
          <button onClick={() => navigate('/admin/products')} className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
            Manage Inventory <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.06} />
        ))}
      </div>

      {/* Module Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card p-6 border-l-4 border-l-brand-500">
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--admin-text)' }}>Product Businesses</h3>
          <p className="text-3xl font-extrabold text-brand-600">{businesses.filter(b => b.type === 'product').length}</p>
        </div>
        <div className="admin-card p-6 border-l-4 border-l-purple-500">
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--admin-text)' }}>Service Businesses</h3>
          <p className="text-3xl font-extrabold text-purple-600">{businesses.filter(b => b.type === 'service').length}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.bookings} Bookings total</p>
        </div>
        <div className="admin-card p-6 border-l-4 border-l-orange-500">
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--admin-text)' }}>Trust/Organizations</h3>
          <p className="text-3xl font-extrabold text-orange-600">{businesses.filter(b => b.type === 'trust').length}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales overview */}
        <div className="xl:col-span-2 admin-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Sales & Revenue</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Overview for selected date range</p>
            </div>
          </div>
          <SalesLineChart data={salesData} />
        </div>

        {/* Status distribution */}
        <div className="admin-card p-6">
          <h2 className="font-heading font-bold mb-1" style={{ color: 'var(--admin-text)' }}>Order Status</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--admin-text-muted)' }}>Distribution breakdown</p>
          {statusData.length > 0
            ? <StatusDonutChart data={statusData} />
            : <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--admin-text-muted)' }}>No data available</div>
          }
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
          <div>
            <h2 className="font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Recent Product Orders</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Latest {Math.min(8, orders.length)} transactions</p>
          </div>
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-sm text-brand-600 font-semibold hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--admin-content-bg)' }}>
              <tr>
                {['ID / Ref', 'Customer', 'Amount', 'Method', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t hover:bg-opacity-50 transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--admin-border)' }}
                  onClick={() => navigate('/admin/orders')}
                >
                  <td className="px-5 py-3.5 font-bold text-brand-600">#{o.id}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--admin-text)' }}>{o.user_name || o.full_name}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--admin-text)' }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${o.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {o.payment_method}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                </motion.tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center" style={{ color: 'var(--admin-text-muted)' }}>
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
