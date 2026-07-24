import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Package, Building2,
  CheckCircle, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const STATUS_CONFIG = {
  Pending:     { color: 'bg-amber-100 text-amber-700 border-amber-200',    icon: AlertCircle,   dot: 'bg-amber-400' },
  Confirmed:   { color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle,   dot: 'bg-blue-400' },
  'In Progress':{ color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock,         dot: 'bg-purple-400' },
  Completed:   { color: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle,   dot: 'bg-green-400' },
  Cancelled:   { color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle,       dot: 'bg-red-400' },
};

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
    >
      {/* Card Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-base">{booking.booking_id}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {booking.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              <span className="font-semibold text-slate-700">{booking.business_name}</span>
              {booking.service_name && <> · {booking.service_name}</>}
              {booking.package_name && <> · {booking.package_name}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{booking.booking_date}</p>
            {booking.booking_time && <p className="text-xs text-slate-500">{booking.booking_time}</p>}
          </div>
          {booking.total_amount > 0 && (
            <div className="text-right">
              <p className="text-sm font-extrabold text-brand-600">₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}</p>
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50">
              {booking.event_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Event Type:</span>
                  <span className="font-semibold text-slate-800">{booking.event_type}</span>
                </div>
              )}
              {booking.location_address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-500">Venue:</span>
                  <span className="font-semibold text-slate-800">{booking.location_address}</span>
                </div>
              )}
              {booking.guest_count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Guests:</span>
                  <span className="font-semibold text-slate-800">{booking.guest_count}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm sm:hidden">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">{booking.booking_date}</span>
              </div>
              {booking.special_requests && (
                <div className="sm:col-span-2 text-sm">
                  <p className="text-slate-500 mb-1">Special Requests:</p>
                  <p className="text-slate-700 bg-white rounded-xl p-3 border border-slate-100">{booking.special_requests}</p>
                </div>
              )}
              <div className="sm:col-span-2 text-xs text-slate-400">
                Booked on {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              
              {/* Cancel Button */}
              {['Pending', 'Confirmed'].includes(booking.status) && (
                <div className="sm:col-span-2 flex justify-end mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                      setIsCancelling(true);
                      await onCancel(booking.id);
                      setIsCancelling(false);
                    }}
                    disabled={isCancelling}
                    className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="px-5 pb-5 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Booking Progress</p>
              <div className="flex items-center gap-0">
                {['Pending', 'Confirmed', 'In Progress', 'Completed'].map((s, i, arr) => {
                  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
                  const currentIdx = statuses.indexOf(booking.status);
                  const stepIdx = statuses.indexOf(s);
                  const isDone = booking.status === 'Cancelled' ? false : currentIdx >= stepIdx;
                  const isCurrent = booking.status === s;
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isDone ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${isCurrent ? 'text-brand-600' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>{s}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 ${isDone && currentIdx > stepIdx ? 'bg-brand-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
                {booking.status === 'Cancelled' && (
                  <div className="ml-4 flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-xl px-3 py-1.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-red-600">Cancelled</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const FILTERS = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/bookings/`, authHeaders());
      const data = res.data?.results || res.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelBooking = async (id) => {
    try {
      await axios.post(`${API}/bookings/${id}/cancel/`, {}, authHeaders());
      fetchBookings(); // Refresh list to reflect Cancelled status
    } catch (err) {
      console.error('Failed to cancel booking', err);
      alert(err.response?.data?.error || 'Failed to cancel booking. Please try again.');
    }
  };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">My Bookings</h2>
            <p className="text-slate-500 text-sm mt-1">Track all your service bookings in real time</p>
          </div>
          <button onClick={fetchBookings} className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-brand-50 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${filter === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
            >
              {f} {f === 'All' && `(${bookings.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">No bookings found</h3>
          <p className="text-slate-400 text-sm">
            {filter !== 'All' ? `No ${filter} bookings.` : 'Your service bookings will appear here once you book a DJ, Studio, or any event service.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking} />)}
        </div>
      )}
    </div>
  );
}
