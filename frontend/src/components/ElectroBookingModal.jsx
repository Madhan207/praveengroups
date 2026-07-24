import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Calendar, MapPin, Phone, User, Mail,
  CheckCircle, Loader2, Wrench, Clock, ChevronRight, LogIn
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

const SERVICE_ICONS = {
  "AC Service":         { emoji: "❄️",  label: "AC Service" },
  "Fan Installation":   { emoji: "💨",  label: "Fan Install" },
  "Wiring":             { emoji: "⚡",  label: "Wiring" },
  "MCB / Switch":       { emoji: "🔌",  label: "MCB/Switch" },
  "Inverter / Battery": { emoji: "🔋",  label: "Inverter" },
  "Water Heater":       { emoji: "🚿",  label: "Geyser" },
  "TV / Home Theatre":  { emoji: "📺",  label: "TV/Home Theatre" },
  "Washing Machine":    { emoji: "🫧",  label: "Washing Machine" },
  "Refrigerator":       { emoji: "🧊",  label: "Refrigerator" },
  "Motor / Pump":       { emoji: "💧",  label: "Motor/Pump" },
  "New Connection":     { emoji: "🏠",  label: "New Connection" },
  "Other":              { emoji: "🔧",  label: "Other" },
};

const TIME_SLOTS = [
  "Morning (8AM–12PM)",
  "Afternoon (12PM–4PM)",
  "Evening (4PM–8PM)",
];

const BRANDS = ["Samsung", "LG", "Voltas", "Havells", "Syska", "Phillips", "Bajaj", "Crompton", "Panasonic", "Whirlpool", "Godrej", "Orient", "Other"];

export const ElectroBookingModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=service type, 2=details, 3=schedule
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    service_type: "", appliance_brand: "",
    issue_description: "",
    preferred_date: "", preferred_time: "Morning (8AM–12PM)",
    address: "", city: "", pincode: "",
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || user.first_name || "",
        email: user.email || "",
        phone: user.mobile_number || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) { setStep(1); setSuccess(false); setErrors({}); }
  }, [isOpen]);

  if (!isOpen) return null;

  // Login wall
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-bold text-xl text-slate-900 mb-2">Login Required</h3>
          <p className="text-slate-500 text-sm mb-6">Please login to book an electrical service.</p>
          <button onClick={() => navigate("/login")} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Login / Register
          </button>
        </motion.div>
      </div>
    );
  }

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const today = new Date().toISOString().split("T")[0];

  const validate = () => {
    const errs = {};
    if (!form.service_type) errs.service_type = "Select a service type";
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.issue_description.trim()) errs.issue_description = "Describe the issue";
    if (!form.preferred_date) errs.preferred_date = "Select a date";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    
    // Auto-navigate to step with error
    if (errs.service_type) setStep(1);
    else if (errs.name || errs.phone || errs.issue_description) setStep(2);
    
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
      const payload = {
        ...form,
        preferred_time: form.preferred_time_slot
      };
      
      const res = await axios.post(`${API}/electro-bookings/`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setBookingId(res.data.booking_id);
      setSuccess(true);
    } catch (e) {
      console.error("Booking API Error:", e);
      const data = e.response?.data;
      if (data && typeof data === "object") setErrors(data);
      else setErrors({ general: "Booking failed. Network Error or Server Unavailable." });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h3 className="font-bold text-2xl text-slate-900 mb-2">Booking Confirmed!</h3>
          <p className="text-slate-500 text-sm mb-4">Our technician will contact you shortly.</p>
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-1">Booking ID</div>
            <div className="text-2xl font-extrabold text-blue-700 tracking-widest">{bookingId}</div>
          </div>
          <p className="text-xs text-slate-400 mb-6">Save this ID to track your booking from your Profile → Orders.</p>
          <button onClick={onClose} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-3xl sm:rounded-t-3xl p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Book Electrical Service</h2>
              <p className="text-blue-100 text-xs">Praveen Electro World</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-slate-100 shrink-0">
          {["Service Type", "Your Details", "Schedule"].map((s, i) => (
            <button key={i} onClick={() => i + 1 < step && setStep(i + 1)}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${step === i + 1 ? "text-blue-600 border-b-2 border-blue-600" : step > i + 1 ? "text-green-600" : "text-slate-400"}`}
            >
              {step > i + 1 ? "✓ " : `${i + 1}. `}{s}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{errors.general}</div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1 — Service Type */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-slate-600 text-sm mb-4 font-medium">What service do you need?</p>
                {errors.service_type && <p className="text-red-500 text-xs mb-2">{errors.service_type}</p>}
                <div className="grid grid-cols-3 gap-2.5">
                  {Object.entries(SERVICE_ICONS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => { set("service_type", key); setTimeout(() => setStep(2), 300); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center ${
                        form.service_type === key
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                          : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                    >
                      <span className="text-2xl">{val.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight">{val.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Personal Details */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xl">{SERVICE_ICONS[form.service_type]?.emoji}</span>
                  <span className="font-semibold text-blue-700 text-sm">{form.service_type}</span>
                  <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-500 underline">Change</button>
                </div>

                {[
                  { label: "Your Name", key: "name", icon: User, type: "text" },
                  { label: "Phone Number", key: "phone", icon: Phone, type: "tel" },
                  { label: "Email (optional)", key: "email", icon: Mail, type: "email" },
                ].map(({ label, key, icon: Icon, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={type}
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors[key] ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                        placeholder={label}
                      />
                    </div>
                    {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Appliance Brand (optional)</label>
                  <select value={form.appliance_brand} onChange={e => set("appliance_brand", e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Describe the Issue</label>
                  <textarea
                    value={form.issue_description}
                    onChange={e => set("issue_description", e.target.value)}
                    rows={3}
                    placeholder="e.g., AC not cooling, fan making noise, wiring spark..."
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none ${errors.issue_description ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  />
                  {errors.issue_description && <p className="text-red-500 text-xs mt-1">{errors.issue_description}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Schedule + Location */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Preferred Date</label>
                  <input type="date" min={today} value={form.preferred_date} onChange={e => set("preferred_date", e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.preferred_date ? "border-red-300" : "border-slate-200"}`} />
                  {errors.preferred_date && <p className="text-red-500 text-xs mt-1">{errors.preferred_date}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Preferred Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(ts => (
                      <button key={ts} onClick={() => set("preferred_time", ts)}
                        className={`py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all ${form.preferred_time === ts ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-600 hover:border-blue-200"}`}>
                        {ts.split(" ")[0]}<br /><span className="font-normal text-slate-400">{ts.match(/\(.*\)/)?.[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Service Address</label>
                  <textarea value={form.address} onChange={e => set("address", e.target.value)} rows={2}
                    placeholder="Door no., Street, Area..."
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2 ${errors.address ? "border-red-300 bg-red-50" : "border-slate-200"}`} />
                  {errors.address && <p className="text-red-500 text-xs mb-1">{errors.address}</p>}
                  <div className="flex gap-2">
                    <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City"
                      className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="Pincode" maxLength={6}
                      className="w-28 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 shrink-0 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !form.service_type) { setErrors({ service_type: "Select a service type" }); return; }
                if (step === 2) {
                  const errs = {};
                  if (!form.name.trim()) errs.name = "Name is required";
                  if (!form.phone.trim()) errs.phone = "Phone is required";
                  if (!form.issue_description.trim()) errs.issue_description = "Describe the issue";
                  if (Object.keys(errs).length > 0) { setErrors(errs); return; }
                }
                setErrors({});
                setStep(s => s + 1);
              }}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : <><Wrench className="w-4 h-4" /> Confirm Booking</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
