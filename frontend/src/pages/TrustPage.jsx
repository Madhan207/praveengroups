import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Users, BookOpen, Calendar, MapPin, Phone, Mail, MessageCircle,
  ChevronDown, ChevronUp, CheckCircle, Send, Star, X, Upload, QrCode,
  ChevronLeft, ChevronRight, Loader2, Copy, Check
} from 'lucide-react';
import { DiscountPosters } from '../components/DiscountPosters';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };

/* ── Donation Payment Modal ─────────────────────────────────────────────────── */
function DonationModal({ business, initialAmount, onClose }) {
  const PRESET_AMOUNTS = [500, 1000, 2500, 5000];
  const [amount, setAmount] = useState(initialAmount || 500);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(!initialAmount);
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : amount;
  const upiId = business?.payment_settings?.upi_id || '8675398848@okbizaxis';
  const qrImage = business?.payment_settings?.qr_image || null;

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txnId.trim()) { setError('Please enter the Transaction ID.'); return; }
    if (!screenshot) { setError('Please upload the payment screenshot.'); return; }
    if (!donorName.trim()) { setError('Please enter your name.'); return; }
    if (!donorPhone.trim()) { setError('Please enter your phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('business', business.id);
      fd.append('donor_name', donorName);
      fd.append('donor_phone', donorPhone);
      fd.append('donor_email', donorEmail);
      fd.append('amount', finalAmount);
      fd.append('payment_method', 'UPI');
      fd.append('transaction_id', txnId);
      fd.append('payment_screenshot', screenshot);
      await axios.post(`${API}/donations/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800 bg-white transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">Donate Now</h2>
              <p className="text-orange-100 text-sm">Support Our Mission · 80G Eligible</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-5">
            {['Amount', 'Payment', 'Done'].map((label, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${step > i + 1 ? 'text-white' : step === i + 1 ? 'text-white' : 'text-white/40'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-white text-orange-600' : step === i + 1 ? 'bg-white/30 border-2 border-white' : 'bg-white/10'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-white' : 'bg-white/20'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">

          {/* ── Step 1: Choose Amount ── */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-slate-600 text-sm">Your donation directly funds scholarships, free courses, and community programs. Every rupee makes a difference.</p>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_AMOUNTS.map(a => (
                    <button
                      key={a} type="button"
                      onClick={() => { setAmount(a); setIsCustom(false); setCustomAmount(''); }}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${!isCustom && amount === a ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-700 hover:border-orange-300'}`}
                    >
                      ₹{a.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`w-full py-3 rounded-xl font-bold text-sm border-2 transition-all ${isCustom ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}
                  >
                    Custom Amount
                  </button>
                  {isCustom && (
                    <div className="mt-2 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="number" min="1" value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-orange-300 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800 font-bold"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
              {finalAmount > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-slate-600 text-sm font-medium">Donation Amount</span>
                  <span className="text-2xl font-extrabold text-orange-600">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <button
                type="button"
                disabled={!finalAmount || finalAmount < 1}
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Pay ₹{finalAmount ? finalAmount.toLocaleString('en-IN') : '—'} →
              </button>
              <p className="text-center text-xs text-slate-400">All donations are eligible for 80G Income Tax deduction</p>
            </div>
          )}

          {/* ── Step 2: QR Payment ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* QR Block */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-5 text-center">
                <p className="text-slate-600 text-sm mb-1">Scan & Pay</p>
                <p className="text-2xl font-extrabold text-orange-600 mb-4">₹{finalAmount.toLocaleString('en-IN')}</p>

                <div className="w-56 h-auto mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-200 p-2 overflow-hidden mb-4">
                  <img
                    src={qrImage || "/upi-qr.jpg"}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                {/* UPI ID copy row */}
                <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-orange-200 max-w-xs mx-auto">
                  <QrCode className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-slate-700 font-mono font-semibold text-sm flex-1 truncate">{upiId}</span>
                  <button type="button" onClick={copyUpi} className="text-orange-500 hover:text-orange-700 transition-colors shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Open any UPI app · Scan QR or enter UPI ID above</p>
              </div>

              {/* Donor Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Name *</label>
                  <input required value={donorName} onChange={e => setDonorName(e.target.value)} className={inputCls} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone *</label>
                  <input required value={donorPhone} onChange={e => setDonorPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email (for 80G receipt)</label>
                  <input type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} className={inputCls} placeholder="your@email.com" />
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transaction / UTR ID *</label>
                <input
                  required value={txnId} onChange={e => setTxnId(e.target.value)} className={inputCls}
                  placeholder="12-digit UTR or Transaction ID from UPI app"
                />
                <p className="text-xs text-slate-400 mt-1">Find this in your UPI app under payment history</p>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Screenshot *</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                {screenshotPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200">
                    <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-48 object-contain bg-slate-50" />
                    <button
                      type="button"
                      onClick={() => { setScreenshot(null); setScreenshotPreview(null); if(fileRef.current) fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button" onClick={() => fileRef.current.click()}
                    className="w-full border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/50 hover:bg-orange-50 rounded-2xl py-8 flex flex-col items-center gap-2 text-slate-500 hover:text-orange-600 transition-all"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="font-semibold text-sm">Click to upload screenshot</span>
                    <span className="text-xs">JPG, PNG, WEBP supported</span>
                  </button>
                )}
              </div>

              {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-5 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm">
                  ← Back
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><CheckCircle className="w-5 h-5" /> Confirm Donation</>}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-extrabold text-slate-900">Thank You! 🙏</h3>
              <p className="text-slate-600">
                Your donation of <span className="font-bold text-orange-600">₹{finalAmount.toLocaleString('en-IN')}</span> has been received.
                Our team will verify your payment and send a confirmation.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
                ⏳ Payment verification usually takes 24 hours. Confirmation will be sent to <strong>{donorEmail || donorPhone}</strong>
              </div>
              <button onClick={onClose} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl transition-all">
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Hero Slider ────────────────────────────────────────────────────────────── */
function HeroSlider({ banners, business, onDonate }) {
  const [current, setCurrent] = useState(0);
  const len = banners.length;
  useEffect(() => {
    if (len < 2) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % len), 6000);
    return () => clearInterval(t);
  }, [len]);
  const slide = banners[current];
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-slate-950">
      {banners.map((b, i) => (
        <motion.div key={i} className="absolute inset-0" initial={false} animate={{ opacity: i === current ? 1 : 0 }} transition={{ duration: 1.5 }}>
          <img src={b.image || b.image_file} alt={b.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        </motion.div>
      ))}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 w-full">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-block bg-orange-500/20 border border-orange-400/40 text-orange-300 text-sm font-bold px-5 py-2 rounded-full mb-6 backdrop-blur-sm">
              {business.name}
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-6 drop-shadow-xl">
              {slide.title || business.name}
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">{slide.subtitle || business.description}</p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onDonate(500)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/30 text-lg"
              >
                <Heart className="w-5 h-5" /> Donate Now
              </button>
              {business.whatsapp_number && (
                <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all backdrop-blur-sm text-lg">
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {len > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === current ? 'bg-orange-400 w-10' : 'bg-white/30 w-3'}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeader({ badge, title, subtitle, light }) {
  return (
    <div className="text-center mb-12">
      {badge && <span className={`inline-block font-bold text-sm uppercase tracking-widest mb-3 ${light ? 'text-orange-300' : 'text-orange-500'}`}>{badge}</span>}
      <h2 className={`text-4xl md:text-5xl font-heading font-extrabold ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {subtitle && <p className={`text-lg mt-4 max-w-2xl mx-auto ${light ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</p>}
    </div>
  );
}

function FAQSection({ faqs }) {
  const [open, setOpen] = useState(null);
  if (!faqs || faqs.length === 0) return null;
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-8 py-6 text-left">
            <span className="font-bold text-slate-900 text-lg pr-4">{faq.question}</span>
            {open === i ? <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <p className="px-8 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">{faq.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function VolunteerForm({ business }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', area_of_interest: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You for Registering!</h3>
        <p className="text-slate-600">We'll contact you soon to coordinate your volunteer activities.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await axios.post(`${API}/volunteer-registrations/`, {
        business: business.id,
        ...form
      });
      setSent(true);
    } catch (err) {
      console.error('Volunteer Registration Error:', err.response?.data || err.message);
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
      {error && <div className="text-red-500 text-sm font-bold p-3 bg-red-50 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
          <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800" placeholder="+91 XXXXX XXXXX" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800" placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Area of Interest *</label>
        <select required value={form.area_of_interest} onChange={e => setForm(p => ({ ...p, area_of_interest: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800 bg-white">
          <option value="">Select area</option>
          <option>Teaching / Tutoring</option>
          <option>Medical Assistance</option>
          <option>Food Distribution</option>
          <option>Administrative Support</option>
          <option>Fundraising</option>
          <option>Event Management</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Message / Skills</label>
        <textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-slate-800 resize-none" placeholder="Tell us about your skills or availability..." />
      </div>
      <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-xl shadow-orange-500/30 disabled:opacity-70">
        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} {sending ? 'Registering...' : 'Register as Volunteer'}
      </button>
    </form>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────────── */
export const TrustPage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateAmount, setDonateAmount] = useState(null); // null = closed

  useEffect(() => {
    axios.get(`${API}/businesses/${slug}/`)
      .then(r => setBusiness(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!business) return <div className="text-center py-40 text-2xl text-slate-400 font-bold">Trust / Organization not found</div>;

  const allBanners = business.banners || [];
  const heroBanners = allBanners.filter(b => b.position !== 'DISCOUNT');
  const discountPosters = allBanners.filter(b => b.position === 'DISCOUNT');

  const banners = heroBanners.length > 0
    ? heroBanners
    : [{ image: '/images/assets/asset_3e42647b.jpg', title: business.name, subtitle: business.description }];

  return (
    <div className="pb-20">
      {/* Donation Modal */}
      <AnimatePresence>
        {donateAmount !== null && (
          <DonationModal business={business} initialAmount={donateAmount} onClose={() => setDonateAmount(null)} />
        )}
      </AnimatePresence>

      <HeroSlider banners={banners} business={business} onDonate={setDonateAmount} />

      {/* ── Discount Posters ────────────────────────────── */}
      <DiscountPosters posters={discountPosters} />

      {/* Impact Numbers */}
      <div className="bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 divide-x divide-orange-400">
          {[
            { label: 'Students Supported', value: '5,000+' },
            { label: 'Programs Running', value: '12+' },
            { label: 'Villages Reached', value: '80+' },
            { label: 'Years of Service', value: '14+' },
          ].map((s, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-orange-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-24 mt-20">

        {/* About & Mission */}
        {(business.about_us || business.mission_vision) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">About Us</span>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mt-3 mb-6 leading-tight">Our Story</h2>
              {business.about_us && <p className="text-slate-600 leading-relaxed text-lg mb-8 whitespace-pre-wrap">{business.about_us}</p>}
              {business.mission_vision && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                  <p className="text-orange-900 leading-relaxed whitespace-pre-wrap font-medium">{business.mission_vision}</p>
                </div>
              )}
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(business.gallery_data || []).slice(0, 4).map((img, i) => (
                <div key={i} className={`rounded-3xl overflow-hidden ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                  <img src={img.image} alt={img.caption} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Programs & Services */}
        {business.services_data && business.services_data.length > 0 && (
          <section>
            <SectionHeader badge="Our Work" title="Programs & Initiatives" subtitle="Making a meaningful difference through targeted programs" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {business.services_data.map((s, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  {s.image && <div className="aspect-video overflow-hidden"><img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-500 transition-colors">{s.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {business.gallery_data && business.gallery_data.length > 0 && (
          <section>
            <SectionHeader badge="Gallery" title="Our Impact in Pictures" subtitle="Moments that define our mission" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {business.gallery_data.map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={`relative overflow-hidden rounded-2xl group ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                  <img src={img.image} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-end">
                    <p className="text-white text-sm font-semibold p-4 opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Donation CTA ── */}
        <section className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
          <div className="relative z-10">
            <Heart className="w-16 h-16 mx-auto mb-6 fill-white/30" />
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-6">Support Our Mission</h2>
            <p className="text-orange-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Your donation directly funds scholarships, free courses, and community programs. Every rupee makes a difference.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {[500, 1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDonateAmount(amt)}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-6 py-3 rounded-2xl backdrop-blur-sm transition-all hover:scale-105"
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
              <button
                onClick={() => setDonateAmount(0)}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-3 rounded-2xl transition-all shadow-xl hover:scale-105"
              >
                Custom Amount
              </button>
            </div>
            <p className="text-orange-200 text-sm mt-6">All donations eligible for 80G Income Tax deduction</p>
          </div>
        </section>

        {/* Upcoming Events */}
        {business.events_data && business.events_data.length > 0 && (
          <section>
            <SectionHeader badge="Calendar" title="Upcoming Events" subtitle="Join us and be part of something meaningful" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {business.events_data.map((e, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">{e.status}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{e.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1"><Calendar className="w-4 h-4" /> {e.date}</div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm"><MapPin className="w-4 h-4" /> {e.location}</div>
                  <button className="mt-4 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all">Register / Join</button>
                </motion.div>
              ))}
            </div>
          </section>
        )}



        {/* Testimonials */}
        {business.testimonials_data && business.testimonials_data.length > 0 && (
          <section className="bg-slate-50 rounded-[2.5rem] p-8 md:p-16">
            <SectionHeader badge="Impact Stories" title="Lives We've Changed" subtitle="Stories from those whose lives were transformed by our programs" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {business.testimonials_data.map((t, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <div className="flex mb-4">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}</div>
                  <p className="text-slate-600 leading-relaxed italic mb-6">"{t.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">{t.name?.[0]}</div>
                    <div><p className="font-bold text-slate-900">{t.name}</p><p className="text-slate-500 text-sm">{t.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteer + Contact */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">Get Involved</span>
            <h2 className="text-4xl font-heading font-extrabold text-slate-900 mt-2 mb-6">Volunteer With Us</h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-8">Join our growing community of volunteers and make a tangible difference in the lives of those who need it most.</p>
            <VolunteerForm business={business} />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-xl font-bold text-slate-900">Contact & Office</h3>
              {business.contact_phone && (
                <a href={`tel:${business.contact_phone}`} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><Phone className="w-5 h-5 text-orange-500" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone</p><p className="text-slate-900 font-bold">{business.contact_phone}</p></div>
                </a>
              )}
              {business.contact_email && (
                <a href={`mailto:${business.contact_email}`} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><Mail className="w-5 h-5 text-orange-500" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p><p className="text-slate-900 font-bold">{business.contact_email}</p></div>
                </a>
              )}
              {business.address && (
                <a href="https://maps.app.goo.gl/HEgtK1bcE79LxDod9?g_st=ac" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-orange-500" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Address</p><p className="text-slate-700 text-sm leading-relaxed">{business.address}</p></div>
                </a>
              )}
              {business.address && (
                <div className="w-full h-64 rounded-2xl overflow-hidden mt-4">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.465441958973!2d78.03189209008718!3d11.316396284320847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babdb5b3efe89a9%3A0x29e16979f8d13b23!2sPraveen%20groups%20of%20Companies!5e1!3m2!1sen!2sin!4v1784122147718!5m2!1sen!2sin" className="w-full h-full border-0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              )}
              {business.whatsapp_number && (
                <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all">
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </a>
              )}
              {business.social_links && Object.keys(business.social_links).length > 0 && (
                <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                  {business.social_links.facebook && (
                    <a href={business.social_links.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {business.social_links.instagram && (
                    <a href={business.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {business.faqs_data && business.faqs_data.length > 0 && (
          <section>
            <SectionHeader badge="Help" title="Frequently Asked Questions" />
            <FAQSection faqs={business.faqs_data} />
          </section>
        )}
      </div>
    </div>
  );
};
