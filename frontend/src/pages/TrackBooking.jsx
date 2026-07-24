import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Calendar, MapPin, Users, Clock, Building2,
  CheckCircle, AlertCircle, Loader2, Package, ArrowRight,
  Ticket, Phone, FileText, Star
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const STATUS_CONFIG = {
  Pending:      { color: 'amber',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800',  icon: Clock,         label: 'Pending Review' },
  Confirmed:    { color: 'blue',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800',    icon: CheckCircle,   label: 'Confirmed' },
  'In Progress':{ color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800', icon: Loader2,       label: 'In Progress' },
  Completed:    { color: 'green',  bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',  icon: Star,          label: 'Completed' },
  Cancelled:    { color: 'red',    bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',      icon: AlertCircle,   label: 'Cancelled' },
};

const STEPS = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

export const TrackBooking = () => {
  const [searchParams] = useSearchParams();
  const [bookingId, setBookingId] = useState(searchParams.get('id') || '');
  const [booking, setBooking]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const doSearch = async (id) => {
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const res = await axios.get(`${API}/bookings/track/?id=${encodeURIComponent(clean)}`);
      setBooking(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if id is in URL
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) doSearch(id);
  }, []); // eslint-disable-line

  const handleSearch = (e) => { e.preventDefault(); doSearch(bookingId); };

  const cfg = booking ? (STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending) : null;
  const StatusIcon = cfg?.icon;
  const currentStep = STEPS.indexOf(booking?.status);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-slate-100 py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-xl shadow-brand-500/30 mb-4">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">Track Your Booking</h1>
          <p className="text-slate-500 text-lg">Enter your Booking ID to check the status in real time.</p>
        </motion.div>

        {/* Search Box */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 mb-8"
        >
          <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-brand-500" />
            Booking ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={bookingId}
              onChange={e => setBookingId(e.target.value.toUpperCase())}
              placeholder="e.g. BK-A3F9X2"
              maxLength={12}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-slate-900 font-mono font-bold text-lg placeholder:font-normal placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !bookingId.trim()}
              className="flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              <span className="hidden sm:block">Track</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Your Booking ID was provided when you made a booking (e.g. BK-A3F9X2). Check your confirmation message.
          </p>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 mb-8"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Result */}
        <AnimatePresence>
          {booking && cfg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Status Card */}
              <div className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Booking ID</p>
                    <p className="text-2xl font-extrabold font-mono text-slate-900">{booking.booking_id}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${cfg.badge}`}>
                    <StatusIcon className={`w-4 h-4 ${booking.status === 'In Progress' ? 'animate-spin' : ''}`} />
                    {cfg.label}
                  </div>
                </div>

                {/* Progress Stepper (only if not cancelled) */}
                {booking.status !== 'Cancelled' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />
                      <div
                        className="absolute top-4 left-0 h-0.5 bg-brand-500 z-0 transition-all duration-700"
                        style={{ width: `${currentStep < 0 ? 0 : (currentStep / (STEPS.length - 1)) * 100}%` }}
                      />
                      {STEPS.map((step, i) => {
                        const done = i <= currentStep;
                        return (
                          <div key={step} className="flex flex-col items-center z-10">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                              done ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-xs mt-2 font-semibold ${done ? 'text-brand-600' : 'text-slate-400'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Details Grid */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-500" /> Booking Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {booking.customer_name && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-slate-900 font-semibold">{booking.customer_name}</p>
                    </div>
                  )}

                  {booking.business_name && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Business</p>
                      <p className="text-slate-900 font-semibold">{booking.business_name}</p>
                    </div>
                  )}

                  {(booking.service_name || booking.package_name) && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Service / Package</p>
                      <p className="text-slate-900 font-semibold">{booking.service_name || booking.package_name}</p>
                    </div>
                  )}

                  {booking.event_type && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Event Type</p>
                      <p className="text-slate-900 font-semibold">{booking.event_type}</p>
                    </div>
                  )}

                  {booking.booking_date && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Event Date</p>
                      <p className="text-slate-900 font-semibold">{formatDate(booking.booking_date)}</p>
                      {booking.booking_time && <p className="text-slate-500 text-sm mt-0.5">at {booking.booking_time}</p>}
                    </div>
                  )}

                  {booking.guest_count && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Guests</p>
                      <p className="text-slate-900 font-semibold">{booking.guest_count} people</p>
                    </div>
                  )}

                  {booking.location && (
                    <div className="bg-slate-50 rounded-2xl p-4 sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue / Location</p>
                      <p className="text-slate-900 font-semibold">{booking.location}</p>
                    </div>
                  )}

                  {booking.special_requests && (
                    <div className="bg-slate-50 rounded-2xl p-4 sm:col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Special Requirements</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{booking.special_requests}</p>
                    </div>
                  )}

                  {booking.total_amount && booking.total_amount !== '0.00' && (
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-brand-800 font-extrabold text-xl">₹{parseFloat(booking.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Booked On</p>
                    <p className="text-slate-900 font-semibold text-sm">{booking.created_at}</p>
                  </div>

                </div>
              </div>

              {/* Help Card */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">Need help?</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    If you have questions about your booking, contact us directly via WhatsApp or phone. Have your Booking ID ready: <span className="text-brand-400 font-mono font-bold">{booking.booking_id}</span>
                  </p>
                </div>
              </div>

              {/* Track another */}
              <button
                onClick={() => { setBooking(null); setBookingId(''); setError(''); }}
                className="w-full py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
              >
                Track Another Booking
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
