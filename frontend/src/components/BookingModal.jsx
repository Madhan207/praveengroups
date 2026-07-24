import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, MapPin, Users, FileText, Loader2,
  CheckCircle, Phone, Mail, User, Briefcase, ChevronDown, LogIn, Lock
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const EVENT_TYPES = [
  'Wedding', 'Birthday Party', 'Corporate Event', 'Anniversary',
  'College Fest', 'Concert / Live Show', 'Product Launch', 'Baby Shower',
  'Engagement', 'Award Ceremony', 'Other',
];

export const BookingModal = ({ isOpen, onClose, service, package: selectedPackage, business, prefilledDate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: '',
    booking_date: prefilledDate || '',
    booking_time: '',
    location_address: '',
    guest_count: '',
    special_requests: '',
  });

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.first_name || '',
        email: user.email || '',
        phone: user.mobile_number || user.phone || '',
      }));
    }
  }, [user]);

  // Pre-fill date when passed from availability calendar
  useEffect(() => {
    if (prefilledDate) {
      setFormData(prev => ({ ...prev, booking_date: prefilledDate }));
    }
  }, [prefilledDate]);

  if (!isOpen) return null;

  // ── Login Wall — shown when the user is not authenticated ──
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-6 relative">
            <button onClick={onClose} className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/20 p-2 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-brand-200" />
              <h2 className="text-2xl font-bold">Login Required</h2>
            </div>
            <p className="text-brand-100 text-sm mt-1">Please sign in to book a service</p>
          </div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-10 h-10 text-brand-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Sign In to Continue</h3>
            <p className="text-slate-500 text-sm mb-6">
              You need to be logged in to make a booking. Create a free account or sign in to proceed.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { onClose(); navigate('/login', { state: { from: window.location.pathname } }); }}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" /> Sign In to Book
              </button>
              <button
                onClick={() => { onClose(); navigate('/signup', { state: { from: window.location.pathname } }); }}
                className="w-full py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    if (!formData.booking_date) errs.booking_date = 'Event date is required';
    if (!formData.location_address.trim()) errs.location_address = 'Location is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        business: business.id,
        service: service?.id || null,
        package: selectedPackage?.id || null,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        event_type: formData.event_type,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time || null,
        location_address: formData.location_address,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
        special_requests: formData.special_requests,
      };

      const token = sessionStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${API}/bookings/`, payload, { headers });
      setBookingId(res.data.booking_id);
      setSuccess(true);
    } catch (error) {
      console.error('Booking failed:', error.response?.data || error.message);
      const serverErrors = error.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
      } else {
        alert('Failed to submit booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setBookingId('');
    setErrors({});
    onClose();
  };

  const itemToBook = selectedPackage || service;
  const price = itemToBook?.price ? parseFloat(itemToBook.price).toLocaleString('en-IN') : null;

  const inputClass = (field) =>
    `w-full p-3 rounded-xl bg-slate-50 border ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-brand-500'} focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-800`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="w-6 h-6 text-brand-200" />
              <h2 className="text-2xl font-bold font-heading">Book Now</h2>
            </div>
            {itemToBook && (
              <p className="text-brand-100 text-sm">
                {itemToBook.name}
                {price && <span className="font-bold ml-2">— ₹{price}</span>}
              </p>
            )}
            {!itemToBook && (
              <p className="text-brand-100 text-sm">{business?.name} — Event Booking</p>
            )}
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center space-y-5"
              >
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-500 mb-4">Your booking request has been received. We'll contact you within 24 hours.</p>
                  {bookingId && (
                    <div className="bg-brand-50 border border-brand-200 rounded-2xl px-6 py-4 inline-block">
                      <p className="text-xs text-brand-600 font-bold uppercase tracking-widest mb-1">Your Booking ID</p>
                      <p className="text-3xl font-extrabold text-brand-700 font-heading tracking-wider">{bookingId}</p>
                      <p className="text-xs text-slate-500 mt-2">Save this ID to track your booking</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="mt-4 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all"
                >
                  Done
                </button>
                {bookingId && (
                  <a
                    href={`/track-booking?id=${bookingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2 transition-colors"
                  >
                    Track your booking status →
                  </a>
                )}
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <User className="w-4 h-4 text-brand-500" /> Full Name *
                    </label>
                    <input
                      name="name" value={formData.name} onChange={handleChange}
                      placeholder="Your full name"
                      className={inputClass('name')}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Phone className="w-4 h-4 text-brand-500" /> Phone Number *
                    </label>
                    <input
                      name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className={inputClass('phone')}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email & Event Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Mail className="w-4 h-4 text-brand-500" /> Email Address
                    </label>
                    <input
                      type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="your@email.com"
                      className={inputClass('email')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Briefcase className="w-4 h-4 text-brand-500" /> Event Type
                    </label>
                    <div className="relative">
                      <select
                        name="event_type" value={formData.event_type} onChange={handleChange}
                        className={`${inputClass('event_type')} appearance-none pr-10 bg-slate-50`}
                      >
                        <option value="">Select event type</option>
                        {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Calendar className="w-4 h-4 text-brand-500" /> Event Date *
                    </label>
                    <input
                      type="date" name="booking_date" value={formData.booking_date} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputClass('booking_date')}
                    />
                    {errors.booking_date && <p className="text-red-500 text-xs mt-1">{errors.booking_date}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Calendar className="w-4 h-4 text-brand-500" /> Event Time
                    </label>
                    <input
                      type="time" name="booking_time" value={formData.booking_time} onChange={handleChange}
                      className={inputClass('booking_time')}
                    />
                  </div>
                </div>

                {/* Location & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-brand-500" /> Event Location / Venue *
                    </label>
                    <textarea
                      name="location_address" value={formData.location_address} onChange={handleChange}
                      placeholder="Enter complete venue address..."
                      rows={2}
                      className={`${inputClass('location_address')} resize-none`}
                    />
                    {errors.location_address && <p className="text-red-500 text-xs mt-1">{errors.location_address}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Users className="w-4 h-4 text-brand-500" /> Guest Count
                    </label>
                    <input
                      type="number" name="guest_count" value={formData.guest_count} onChange={handleChange}
                      placeholder="e.g. 500" min="1"
                      className={inputClass('guest_count')}
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-brand-500" /> Special Requirements
                  </label>
                  <textarea
                    name="special_requests" value={formData.special_requests} onChange={handleChange}
                    placeholder="Theme preferences, specific equipment, catering requirements..."
                    rows={3}
                    className={`${inputClass('special_requests')} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                >
                  {loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    : <><Calendar className="w-5 h-5" /> Confirm Booking Request</>
                  }
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
