import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, CheckCircle, XCircle, Eye,
  ChevronLeft, ChevronRight, RefreshCw, SlidersHorizontal, Calendar, FileSpreadsheet, RotateCcw, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import OrderDrawer from '../../components/admin/OrderDrawer';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/admin/SkeletonLoader';

import { getMediaUrl } from '../../utils/media';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
const authH = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const STATUS_COLORS = {
  'Pending':          'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Payment Verified': 'bg-blue-100 text-blue-700 border-blue-200',
  'Processing':       'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Shipped':          'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Delivered':        'bg-green-100 text-green-700 border-green-200',
  'Cancelled':        'bg-red-100 text-red-700 border-red-200',
  'Returned':         'bg-purple-100 text-purple-700 border-purple-200',
  'Return Rejected':  'bg-orange-100 text-orange-700 border-orange-200',
};
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{status}</span>
);

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const ALL_STATUSES = ['All', 'Pending', 'Payment Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return Rejected'];
const ALL_METHODS  = ['All', 'UPI', 'COD'];

const exportCSV = (orders) => {
  const headers = ['ID', 'Customer', 'Email', 'Phone', 'Business', 'Category', 'Amount', 'Method', 'Status', 'Date', 'City', 'State'];
  const rows = orders.map(o => {
    const category = o.items && o.items.length > 0 ? o.items[0].product_category_name || 'N/A' : 'N/A';
    return [
      o.id, o.user_name || o.full_name, o.user_email, o.mobile_number,
      o.business_name || 'N/A', category,
      o.total_amount, o.payment_method, o.status,
      new Date(o.created_at).toLocaleDateString('en-IN'),
      o.city, o.state,
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  URL.revokeObjectURL(url);
};

const exportExcel = (orders) => {
  const data = orders.map(o => ({
    'Order ID': o.id,
    'Customer Name': o.user_name || o.full_name,
    'Email': o.user_email,
    'Phone': o.mobile_number,
    'Business': o.business_name || 'N/A',
    'Category': o.items && o.items.length > 0 ? o.items[0].product_category_name || 'N/A' : 'N/A',
    'Total Amount': o.total_amount,
    'Payment Method': o.payment_method,
    'Status': o.status,
    'Date': new Date(o.created_at).toLocaleDateString('en-IN'),
    'City': o.city,
    'State': o.state,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "orders_export.xlsx");
};

const AdminOrders = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [methodFilter, setMethod]   = useState('All');
  const [bizFilter, setBizFilter]   = useState('All');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [selected, setSelected]     = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [drawerOrder, setDrawer]    = useState(null);
  const [sortKey, setSortKey]       = useState('id');
  const [sortDir, setSortDir]       = useState('desc');
  const [businesses, setBusinesses] = useState([]);
  const [viewMode, setViewMode]     = useState('All'); // 'All' or 'Returns'
  
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [r, b] = await Promise.all([
        axios.get(`${API}/orders/?all=true`, authH()),
        axios.get(`${API}/businesses/`, authH())
      ]);
      const d = r.data?.results || r.data;
      setOrders(Array.isArray(d) ? d : []);
      let bizList = b.data.results || b.data;
      setBusinesses(bizList.filter(bz => bz.type === 'product'));
    } catch { toast('Failed to fetch orders', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, field, value) => {
    try {
      await axios.patch(`${API}/orders/${id}/`, { [field]: value }, authH());
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
      if (drawerOrder?.id === id) setDrawer(prev => ({ ...prev, [field]: value }));
      toast(`Order #${id} updated`, 'success');
    } catch { toast('Update failed', 'error'); }
  };

  const localUpdate = (id, field, value) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    if (drawerOrder?.id === id) setDrawer(prev => ({ ...prev, [field]: value }));
  };

  const bulkUpdate = async () => {
    if (!bulkStatus || !selected.length) return;
    await Promise.all(selected.map(id => updateStatus(id, 'status', bulkStatus)));
    setSelected([]);
    setBulkStatus('');
  };

  const sort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let list = [...orders];

    if (viewMode === 'Returns') {
      list = list.filter(o => o.return_requested);
    }

    if (bizFilter !== 'All') {
      list = list.filter(o => String(o.business) === bizFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        String(o.id).includes(q) ||
        (o.user_name || o.full_name || '').toLowerCase().includes(q) ||
        (o.user_email || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter(o => o.status === statusFilter);
    if (methodFilter !== 'All') list = list.filter(o => o.payment_method === methodFilter);
    
    if (dateFrom) {
      const fromD = new Date(dateFrom);
      fromD.setHours(0,0,0,0);
      list = list.filter(o => new Date(o.created_at) >= fromD);
    }
    if (dateTo) {
      const toD = new Date(dateTo);
      toD.setHours(23,59,59,999);
      list = list.filter(o => new Date(o.created_at) <= toD);
    }

    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'total_amount') { av = Number(av); bv = Number(bv); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [orders, viewMode, search, statusFilter, methodFilter, bizFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <span className="opacity-30">↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) return <SkeletonTable rows={8} cols={6} />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>
            {viewMode === 'Returns' ? 'Return Center' : 'Order Management'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>{filtered.length} {viewMode === 'Returns' ? 'return requests' : 'orders'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-all hover:border-brand-400 hover:text-brand-600"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          
          <div className="flex bg-slate-100 rounded-xl p-0.5 border" style={{ borderColor: 'var(--admin-border)' }}>
            <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white text-slate-700 font-semibold shadow-sm hover:text-brand-600 transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={() => exportExcel(filtered)} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit" style={{ borderColor: 'var(--admin-border)' }}>
        <button 
          onClick={() => { setViewMode('All'); setPage(1); }} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'All' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All Orders
        </button>
        <button 
          onClick={() => { setViewMode('Returns'); setPage(1); }} 
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'Returns' ? 'bg-red-500 text-white shadow-sm' : 'text-red-500 hover:bg-red-50'}`}
        >
          Return Center
          {orders.filter(o => o.return_requested && o.status !== 'Returned' && o.status !== 'Return Rejected').length > 0 && (
            <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-full text-xs">
              {orders.filter(o => o.return_requested && o.status !== 'Returned' && o.status !== 'Return Rejected').length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order #, customer, email..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-brand-500"
            style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          />
        </div>
        <select value={bizFilter} onChange={e => { setBizFilter(e.target.value); setPage(1); }}
          className="text-sm px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-brand-500"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="All">All Businesses</option>
          {businesses.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="text-sm px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-brand-500"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={methodFilter} onChange={e => { setMethod(e.target.value); setPage(1); }} className="text-sm px-3 py-2 rounded-lg border bg-white outline-none"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          {ALL_METHODS.map(m => <option key={m} value={m}>{m === 'All' ? 'All Methods' : m}</option>)}
        </select>
        
        <div className="flex items-center gap-2 border rounded-lg px-2 bg-white" style={{ borderColor: 'var(--admin-border)' }}>
          <Calendar className="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)} 
            className="text-xs px-1 py-2 outline-none text-slate-600 bg-transparent"
            title="Start Date"
          />
          <span className="text-slate-300">-</span>
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)} 
            className="text-xs px-1 py-2 outline-none text-slate-600 bg-transparent"
            title="End Date"
          />
        </div>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="admin-card p-3 flex items-center gap-3 flex-wrap bg-brand-50 border-brand-200"
          >
            <span className="text-sm font-semibold text-brand-700">{selected.length} selected</span>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-brand-300 outline-none text-brand-700 bg-white">
              <option value="">Change status to...</option>
              {['Pending','Payment Verified','Processing','Shipped','Delivered','Cancelled','Returned','Return Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={bulkUpdate} className="text-sm bg-brand-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-brand-700">Apply</button>
            <button onClick={() => setSelected([])} className="text-sm text-brand-600 underline">Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Center Card View */}
      {viewMode === 'Returns' && (
        <div className="space-y-3">
          {paginated.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <RotateCcw className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="font-semibold text-slate-400">No return requests found</p>
            </div>
          )}
          {paginated.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50" style={{ background: '#fafafa' }}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-600 text-sm">#{o.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    o.status === 'Returned' ? 'bg-green-100 text-green-700 border-green-200' :
                    o.status === 'Return Rejected' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    {o.status === 'Returned' ? 'ACCEPTED' : o.status === 'Return Rejected' ? 'REJECTED' : 'PENDING REVIEW'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Customer</p>
                      <p className="text-sm font-semibold text-slate-800">{o.user_name || o.full_name}</p>
                      <p className="text-xs text-slate-400">{o.user_email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Return Reason</p>
                      <p className="text-sm text-slate-700 bg-red-50 border border-red-100 rounded-xl p-2.5 leading-relaxed">
                        {o.return_reason || 'No reason provided.'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500">Order Amount:</span>
                      <span className="text-xs font-bold text-green-700">₹{Number(o.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-44 shrink-0">
                    {o.return_proof && (
                      <a href={getMediaUrl(o.return_proof)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={getMediaUrl(o.return_proof)}
                          alt="Return Proof"
                          className="w-full h-24 object-cover rounded-xl border-2 border-red-100 hover:opacity-90 transition-opacity"
                        />
                        <p className="text-[10px] text-red-400 mt-0.5 text-center">Photo Proof</p>
                      </a>
                    )}
                    <button
                      onClick={() => setDrawer(o)}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Full Details
                    </button>
                    {o.status !== 'Returned' && o.status !== 'Return Rejected' && (
                      <>
                        <button
                          onClick={() => updateStatus(o.id, 'status', 'Returned')}
                          className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                        >
                          ✓ Accept Return
                        </button>
                        <button
                          onClick={() => updateStatus(o.id, 'status', 'Return Rejected')}
                          className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject Return
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View (All Orders) */}
      {viewMode === 'All' && (<div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--admin-content-bg)' }}>
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox"
                    checked={paginated.length > 0 && paginated.every(o => selected.includes(o.id))}
                    onChange={e => setSelected(e.target.checked ? paginated.map(o => o.id) : [])}
                    className="w-4 h-4 rounded"
                  />
                </th>
                {[['id','Order #'],['user_name','Customer'],['business','Business'],['category','Category'],['total_amount','Amount'],['payment_method','Method'],['status','Status'],['created_at','Date']].map(([k, label]) => (
                  <th key={k} className="px-4 py-3 text-left cursor-pointer select-none font-semibold text-xs uppercase tracking-wider"
                    style={{ color: 'var(--admin-text-muted)' }}
                    onClick={() => sort(k)}>
                    <span className="flex items-center gap-1">{label} <SortIcon k={k} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => {
                const category = o.items && o.items.length > 0 ? o.items[0].product_category_name || 'N/A' : 'N/A';
                return (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t transition-colors hover:bg-slate-50/50"
                  style={{ borderColor: 'var(--admin-border)' }}
                >
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selected.includes(o.id)}
                      onChange={e => setSelected(prev => e.target.checked ? [...prev, o.id] : prev.filter(x => x !== o.id))}
                      className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-brand-600">#{o.id}</span>
                      {o.return_requested && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold w-fit">Return Req</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: 'var(--admin-text)' }}>{o.user_name || o.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>{o.user_email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                    {o.business_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                    {category}
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--admin-text)' }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${o.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{o.payment_method}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <select value={o.status} onChange={e => updateStatus(o.id, 'status', e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${STATUS_COLORS[o.status] || ''}`}>
                      {['Pending','Payment Verified','Processing','Shipped','Delivered','Cancelled','Returned','Return Rejected'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--admin-text-muted)' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => setDrawer(o)} className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {o.payment_method === 'UPI' && o.status === 'Pending' && (
                        <>
                          <button onClick={() => updateStatus(o.id, 'status', 'Payment Verified')}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors" title="Verify Payment">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateStatus(o.id, 'status', 'Cancelled')}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )})}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center" style={{ color: 'var(--admin-text-muted)' }}>
                    No orders match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
            Show
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="px-2 py-1 rounded-lg border outline-none text-sm"
              style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n}>{n}</option>)}
            </select>
            per page · Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border disabled:opacity-40 hover:bg-slate-100 transition-colors"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-brand-600 text-white' : 'hover:bg-slate-100'}`}
                  style={{ color: p === page ? undefined : 'var(--admin-text-muted)' }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border disabled:opacity-40 hover:bg-slate-100 transition-colors"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Order Drawer */}
      {drawerOrder && (
        <OrderDrawer order={drawerOrder} onClose={() => setDrawer(null)} onStatusChange={updateStatus} onLocalUpdate={localUpdate} />
      )}
    </div>
  );
};

export default AdminOrders;
