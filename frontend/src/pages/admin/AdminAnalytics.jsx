import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import { SalesLineChart, RevenueLineChart, StatusDonutChart, ProductBarChart } from '../../components/admin/AdminChart';
import { SkeletonCard } from '../../components/admin/SkeletonLoader';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authH = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const buildMonthlyRevenue = (orders) => {
  const map = {};
  orders.filter(o => o.status !== 'Cancelled').forEach(o => {
    const d     = new Date(o.created_at);
    const key   = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    map[key]    = (map[key] || 0) + Number(o.total_amount || 0);
  });
  return Object.entries(map).slice(-6).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
};

const buildDailyOrders = (orders) => {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key   = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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

const buildTopProducts = (orders) => {
  const map = {};
  orders.forEach(o => o.items?.forEach(item => {
    const name = item.product_name;
    map[name] = (map[name] || 0) + (item.quantity || 1);
  }));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, sold]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, sold }));
};

const AdminAnalytics = () => {
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/orders/?all=true`, authH()),
      axios.get(`${API}/products/`),
    ]).then(([o, p]) => { 
      const oData = o.data?.results || o.data;
      const pData = p.data?.results || p.data;
      setOrders(Array.isArray(oData) ? oData : []); 
      setProducts(Array.isArray(pData) ? pData : []); 
    }).finally(() => setLoading(false));
  }, []);

  const dailyData   = useMemo(() => buildDailyOrders(orders), [orders]);
  const monthlyData = useMemo(() => buildMonthlyRevenue(orders), [orders]);
  const statusData  = useMemo(() => buildStatusData(orders), [orders]);
  const topProducts = useMemo(() => buildTopProducts(orders), [orders]);

  const revenue     = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const deliveredRate = orders.length ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 0;
  const cancelRate    = orders.length ? Math.round((orders.filter(o => o.status === 'Cancelled').length / orders.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Product Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Performance insights computed from your product orders</p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`,          icon: TrendingUp,  gradient: 'from-green-500 to-emerald-700' },
          { label: 'Total Orders',  value: orders.length,                                    icon: ShoppingBag, gradient: 'from-blue-500 to-blue-700' },
          { label: 'Delivery Rate', value: `${deliveredRate}%`,                              icon: Package,     gradient: 'from-cyan-500 to-teal-600' },
          { label: 'Cancel Rate',   value: `${cancelRate}%`,                                 icon: Users,       gradient: 'from-red-500 to-rose-700' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="stat-card" style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}>
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${s.gradient}`} />
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-muted)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily trend + Status distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 admin-card p-6">
          <h2 className="font-heading font-bold mb-1" style={{ color: 'var(--admin-text)' }}>Daily Sales (Last 14 Days)</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--admin-text-muted)' }}>Orders & Revenue trend</p>
          <SalesLineChart data={dailyData} />
        </div>
        <div className="admin-card p-6">
          <h2 className="font-heading font-bold mb-1" style={{ color: 'var(--admin-text)' }}>Order Status</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--admin-text-muted)' }}>Distribution breakdown</p>
          {statusData.length > 0 ? <StatusDonutChart data={statusData} /> : <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--admin-text-muted)' }}>No orders yet</div>}
        </div>
      </div>

      {/* Monthly revenue + Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="admin-card p-6">
          <h2 className="font-heading font-bold mb-1" style={{ color: 'var(--admin-text)' }}>Monthly Revenue</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--admin-text-muted)' }}>Last 6 months (excluding cancelled)</p>
          {monthlyData.length > 0 ? <RevenueLineChart data={monthlyData} /> : <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--admin-text-muted)' }}>Not enough data</div>}
        </div>
        <div className="admin-card p-6">
          <h2 className="font-heading font-bold mb-1" style={{ color: 'var(--admin-text)' }}>Top Selling Products</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--admin-text-muted)' }}>By units sold across all orders</p>
          {topProducts.length > 0 ? <ProductBarChart data={topProducts} /> : <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--admin-text-muted)' }}>No sales data</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
