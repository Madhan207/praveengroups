import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle, Loader2, User, Phone, Mail, Briefcase,
  Calendar, MapPin, Users, DollarSign, FileText, ChevronDown
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const EVENT_TYPES = [
  'Wedding', 'Birthday Party', 'Corporate Event', 'Anniversary',
  'College Fest', 'Concert / Live Show', 'Product Launch', 'Baby Shower',
  'Engagement', 'Award Ceremony', 'Other',
];

const BUDGETS = [
  'Below ₹20,000',
  '₹20,000 – ₹50,000',
  '₹50,000 – ₹1,00,000',
  '₹1,00,000 – ₹2,00,000',
  '₹2,00,000 – ₹5,00,000',
  'Above ₹5,00,000',
];

export const QuoteModal = ({ isOpen, onClose, business, selectedPackage }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteRef, setQuoteRef] = useState('');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    event_type: '',
    budget: '',
    event_date: '',
    event_location: '',
    guest_count: '',
    special_requirements: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
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
        name: form.name,
        phone: form.phone,
        email: form.email,
        event_type: form.event_type,
        budget: form.budget,
        event_date: form.event_date || null,
        event_location: form.event_location,
        guest_count: form.guest_count ? parseInt(form.guest_count) : null,
        special_requirements: form.special_requirements,
        package_interest: selectedPackage?.id || null,
      };

      const res = await axios.post(`${API}/quote-requests/`, payload);
      setQuoteRef(`QT-${String(res.data.id).padStart(5, '0')}`);
      setSuccess(true);
    } catch (error) {
      console.error('Quote request failed:', error.response?.data || error.message);
      const serverErrors = error.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
      } else {
        alert('Failed to submit quote request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setQuoteRef('');
    setErrors({});
    onClose();
  };

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
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <DollarSign className="w-6 h-6 text-brand-400" />
              <h2 className="text-2xl font-bold font-heading">Get a Free Quote</h2>
            </div>
            <p className="text-slate-400 text-sm">
              {selectedPackage
                ? `Interested in: ${selectedPackage.name}`
                : 'Fill in your event details and we\'ll send you a customized quote within 24 hours'
              }
            </p>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Quote Request Submitted!</h3>
                  <p className="text-slate-500 mb-4">
                    We've received your request and will send you a personalized quote within 24 hours.
                  </p>
                  {quoteRef && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 inline-block">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Quote Reference</p>
                      <p className="text-2xl font-extrabold text-slate-800 font-heading tracking-wider">{quoteRef}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="mt-4 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all"
                >
                  Done
                </button>
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
                      name="name" value={form.name} onChange={handleChange}
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
                      name="phone" value={form.phone} onChange={handleChange}
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
                      type="email" name="email" value={form.email} onChange={handleChange}
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
                        name="event_type" value={form.event_type} onChange={handleChange}
                        className={`${inputClass('event_type')} appearance-none pr-10`}
                      >
                        <option value="">Select event type</option>
                        {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Budget & Event Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-4 h-4 text-brand-500" /> Budget Range
                    </label>
                    <div className="relative">
                      <select
                        name="budget" value={form.budget} onChange={handleChange}
                        className={`${inputClass('budget')} appearance-none pr-10`}
                      >
                        <option value="">Select budget range</option>
                        {BUDGETS.map(b => <option key={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Calendar className="w-4 h-4 text-brand-500" /> Event Date
                    </label>
                    <input
                      type="date" name="event_date" value={form.event_date} onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputClass('event_date')}
                    />
                  </div>
                </div>

                {/* Location & Guests */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-brand-500" /> Event Location
                    </label>
                    <input
                      name="event_location" value={form.event_location} onChange={handleChange}
                      placeholder="City / Venue name"
                      className={inputClass('event_location')}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <Users className="w-4 h-4 text-brand-500" /> Guest Count
                    </label>
                    <input
                      type="number" name="guest_count" value={form.guest_count} onChange={handleChange}
                      placeholder="e.g. 200" min="1"
                      className={inputClass('guest_count')}
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-brand-500" /> Special Requirements
                  </label>
                  <textarea
                    name="special_requirements" value={form.special_requirements} onChange={handleChange}
                    placeholder="Theme, setup style, specific equipment, catering, decoration preferences..."
                    rows={3}
                    className={`${inputClass('special_requirements')} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                >
                  {loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                    : <><DollarSign className="w-5 h-5" /> Request Free Quote</>
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
