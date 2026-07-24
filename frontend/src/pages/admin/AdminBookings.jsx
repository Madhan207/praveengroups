import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Phone, Mail, Package, Building2,
  CheckCircle, XCircle, Clock, AlertCircle, Loader2, RefreshCw,
  ChevronDown, ChevronUp, Search, Filter, Eye, Download, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const STATUS_CONFIG = {
  Pending:               { color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-400',   icon: AlertCircle  },
  Confirmed:             { color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',    icon: CheckCircle  },
  'Technician Assigned': { color: 'bg-teal-100 text-teal-700 border-teal-200',       dot: 'bg-teal-500',    icon: Users        },
  'In Progress':         { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500',  icon: Clock        },
  Completed:             { color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500',   icon: CheckCircle  },
  Cancelled:             { color: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',     icon: XCircle      },
};

const STATUSES = ['Pending', 'Confirmed', 'Technician Assigned', 'In Progress', 'Completed', 'Cancelled'];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function BookingRow({ booking, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  
  const [techName, setTechName] = useState(booking.technician_name || '');
  const [techPhone, setTechPhone] = useState(booking.technician_phone || '');
  const [estCost, setEstCost] = useState(booking.total_amount || '');
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '');
  const [updatingDetails, setUpdatingDetails] = useState(false);

  const handleUpdateDetails = async () => {
    setUpdatingDetails(true);
    try {
      await axios.patch(
        `${API}/electro-bookings/${booking.id}/`,
        { technician_name: techName, technician_phone: techPhone, estimated_cost: estCost || null, admin_notes: adminNotes },
        authHeaders()
      );
      alert('Details updated successfully');
    } catch(err) {
      alert('Failed to update details: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      if (booking.type === 'electro') {
        await axios.patch(
          `${API}/electro-bookings/${booking.id}/`,
          { status: newStatus },
          authHeaders()
        );
      } else {
        await axios.post(
          `${API}/bookings/${booking.id}/update-status/`,
          { status: newStatus },
          authHeaders()
        );
      }
      setSelectedStatus(newStatus);
      onStatusChange(booking.id, newStatus);
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div layout className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Main Row */}
      <div
        className="p-4 flex flex-col lg:flex-row lg:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-all"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Left: ID + Business */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-sm">{booking.booking_id}</span>
              <StatusBadge status={selectedStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              <span className="font-semibold text-slate-700">{booking.business_name}</span>
              {booking.service_name && <> · {booking.service_name}</>}
              {booking.package_name && <> · {booking.package_name}</>}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="min-w-0 lg:w-44">
          <p className="font-semibold text-slate-800 text-sm truncate">{booking.name || booking.customer_name}</p>
          <p className="text-xs text-slate-400 truncate">{booking.phone}</p>
        </div>

        {/* Date */}
        <div className="lg:w-28">
          <p className="text-sm font-semibold text-slate-800">{booking.booking_date}</p>
          {booking.booking_time && <p className="text-xs text-slate-400">{booking.booking_time}</p>}
        </div>

        {/* Amount */}
        <div className="lg:w-24">
          {parseFloat(booking.total_amount) > 0 ? (
            <p className="text-sm font-extrabold text-brand-600">₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}</p>
          ) : (
            <p className="text-xs text-slate-400">—</p>
          )}
        </div>

        {/* Status Changer */}
        <div className="flex items-center gap-2 lg:w-44" onClick={e => e.stopPropagation()}>
          <div className="relative flex-1">
            <select
              value={selectedStatus}
              onChange={e => handleStatusUpdate(e.target.value)}
              disabled={updating}
              className="w-full text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 bg-white focus:border-brand-400 outline-none appearance-none cursor-pointer disabled:opacity-60"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {updating
              ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500 animate-spin" />
              : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            }
          </div>
        </div>

        {/* Expand toggle */}
        <button className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
              {booking.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${booking.email}`} className="text-brand-600 hover:underline font-medium">{booking.email}</a>
                </div>
              )}
              {booking.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${booking.phone}`} className="text-slate-700 font-medium">{booking.phone}</a>
                </div>
              )}
              {booking.event_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Event:</span>
                  <span className="font-semibold text-slate-800">{booking.event_type}</span>
                </div>
              )}
              {booking.guest_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Guests:</span>
                  <span className="font-semibold text-slate-800">{booking.guest_count}</span>
                </div>
              )}
              {booking.location_address && (
                <div className="flex items-start gap-2 text-sm md:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500">Venue: </span>
                    <span className="font-semibold text-slate-800">{booking.location_address}</span>
                  </div>
                </div>
              )}
              {booking.special_requests && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Special Requests</p>
                  <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-100">{booking.special_requests}</p>
                </div>
              )}
              {booking.type === 'electro' && booking.issue_description && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Issue Description</p>
                  <p className="text-sm text-slate-700 bg-white rounded-xl p-3 border border-slate-100">{booking.issue_description}</p>
                </div>
              )}
              {booking.type === 'electro' && (
                <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 mt-2">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2">Admin / Technician Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Technician Name</label>
                      <input value={techName} onChange={e => setTechName(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-brand-500" placeholder="e.g. Ramesh" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Technician Phone</label>
                      <input value={techPhone} onChange={e => setTechPhone(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-brand-500" placeholder="e.g. 9876543210" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Estimated Cost (₹)</label>
                      <input type="number" value={estCost} onChange={e => setEstCost(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-brand-500" placeholder="e.g. 1500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Admin Notes</label>
                      <input value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-brand-500" placeholder="Internal notes" />
                    </div>
                  </div>
                  <button onClick={handleUpdateDetails} disabled={updatingDetails} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition flex items-center gap-2">
                    {updatingDetails && <Loader2 className="w-4 h-4 animate-spin" />} Update Details
                  </button>
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3 text-xs text-slate-400 border-t border-slate-100 pt-3 flex justify-between">
                <span>Booked on {new Date(booking.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                {booking.type === 'electro' && <span className="font-semibold text-brand-600">Electrical Booking</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({});

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [bookRes, elRes] = await Promise.all([
        axios.get(`${API}/bookings/`, authHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API}/electro-bookings/`, authHeaders()).catch(() => ({ data: [] }))
      ]);
      const bookData = bookRes.data?.results || bookRes.data;
      const elData = elRes.data?.results || elRes.data;
      
      const arr = Array.isArray(bookData) ? bookData.map(b => ({ ...b, type: 'standard' })) : [];
      const elArr = Array.isArray(elData) ? elData.map(b => ({
        ...b,
        type: 'electro',
        business_name: 'Praveen Electro World',
        service_name: b.service_type,
        customer_name: b.name,
        customer_email: b.email,
        total_amount: b.estimated_cost || 0,
        booking_date: b.preferred_date,
        booking_time: b.preferred_time,
        location_address: `${b.address || ''}${b.city ? ', ' + b.city : ''}${b.pincode ? ' - ' + b.pincode : ''}`,
        technician_name: b.technician_name,
        technician_phone: b.technician_phone,
        admin_notes: b.admin_notes
      })) : [];

      const combined = [...arr, ...elArr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(combined);

      // Compute quick stats
      const s = { All: combined.length };
      STATUSES.forEach(st => { s[st] = combined.filter(b => b.status === st).length; });
      setStats(s);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // Fetch businesses for the filter dropdown (only service businesses)
    axios.get(`${API}/businesses/`).then(res => {
      const allBiz = res.data.results || res.data || [];
      const serviceBiz = allBiz.filter(b => b.type === 'service');
      setBusinesses(serviceBiz);
    }).catch(console.error);
  }, []);

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    setStats(prev => {
      const booking = bookings.find(b => b.id === bookingId);
      const s = { ...prev };
      if (booking) {
        s[booking.status] = Math.max(0, (s[booking.status] || 0) - 1);
        s[newStatus] = (s[newStatus] || 0) + 1;
      }
      return s;
    });
  };

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    // For businessFilter, match either by exact string name or we can match by ID if business filter holds ID.
    // Assuming business filter holds the business name for easier matching or we can use ID. Let's use name.
    const matchBusiness = businessFilter === 'All' || b.business_name === businessFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (
      b.booking_id?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.business_name?.toLowerCase().includes(q) ||
      b.event_type?.toLowerCase().includes(q)
    );
    return matchStatus && matchBusiness && matchSearch;
  });

  const exportCSV = (dataList) => {
    const headers = ['Booking ID', 'Customer', 'Email', 'Phone', 'Business', 'Service', 'Package', 'Date', 'Amount', 'Status'];
    const rows = dataList.map(b => [
      b.booking_id, b.name || b.customer_name, b.email || b.customer_email, b.phone,
      b.business_name || 'N/A', b.service_name || 'N/A', b.package_name || 'N/A',
      `${b.booking_date} ${b.booking_time || ''}`.trim(),
      b.total_amount, b.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = (dataList) => {
    const data = dataList.map(b => ({
      'Booking ID': b.booking_id,
      'Customer Name': b.name || b.customer_name,
      'Email': b.email || b.customer_email,
      'Phone': b.phone,
      'Business': b.business_name || 'N/A',
      'Service': b.service_name || 'N/A',
      'Package': b.package_name || 'N/A',
      'Date': `${b.booking_date} ${b.booking_time || ''}`.trim(),
      'Total Amount': b.total_amount,
      'Status': b.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "bookings_export.xlsx");
  };

  const STAT_CARDS = [
    { label: 'Total', key: 'All', color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Pending', key: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed', key: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Assigned', key: 'Technician Assigned', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'In Progress', key: 'In Progress', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed', key: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cancelled', key: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all service & event bookings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-brand-500/30"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white text-slate-700 font-semibold shadow-sm hover:text-brand-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => exportExcel(filtered)}
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAT_CARDS.map(({ label, key, color, bg }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`rounded-2xl p-4 border text-left transition-all hover:shadow-md ${
              statusFilter === key ? 'border-brand-300 bg-brand-50 shadow-md' : 'bg-white border-slate-100'
            }`}
          >
            <p className={`text-2xl font-extrabold ${color}`}>{stats[key] || 0}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">{label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, booking ID, business..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 outline-none text-sm"
          />
        </div>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={businessFilter}
            onChange={e => setBusinessFilter(e.target.value)}
            className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 focus:border-brand-400 outline-none bg-white text-sm font-semibold appearance-none"
          >
            <option value="All">All Businesses</option>
            {businesses.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 focus:border-brand-400 outline-none bg-white text-sm font-semibold appearance-none"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden lg:grid grid-cols-[1fr_160px_110px_90px_180px_40px] gap-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <div>Booking / Service</div>
        <div>Customer</div>
        <div>Date</div>
        <div>Amount</div>
        <div>Update Status</div>
        <div></div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">No bookings found</h3>
          <p className="text-slate-400 text-sm">
            {search || statusFilter !== 'All'
              ? 'Try adjusting your search or filter.'
              : 'Bookings will appear here when customers submit service booking requests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <BookingRow key={b.id} booking={b} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
