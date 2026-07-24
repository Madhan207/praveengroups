import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Clock, CalendarX2, Send } from 'lucide-react';
import axios from 'axios';

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
      await axios.post(`${API}/contact-messages/`, formData);
      setStatus('Message Sent! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 overflow-hidden">
      {/* ─── Hero Section ─── */}
      <div className="relative max-w-7xl mx-auto px-6 mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-brand-50 text-brand-600 text-sm font-bold tracking-widest uppercase mb-4 border border-brand-100">
            Let's Connect
          </span>
          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-slate-900 mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">Touch</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* ─── Contact Info Cards ─── */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Head Office</h3>
              <a href="https://maps.app.goo.gl/HEgtK1bcE79LxDod9?g_st=ac" target="_blank" rel="noopener noreferrer" className="text-slate-600 leading-relaxed hover:text-blue-600 transition-colors block">
                4/114 Kattipalayam,<br />Tiruchengode to Namakkal Main Road<br />Tiruchengode Tk, Tamil Nadu 637212
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Phone size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Contact Details</h3>
              <div className="space-y-2 text-slate-600">
                <a href="tel:+918438926321" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                  <Phone size={16} /> +91 84389 26321
                </a>
                <a href="mailto:admin@praveengroups.in" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                  <Mail size={16} /> admin@praveengroups.in
                </a>
                <a href="https://praveengroups.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                  <Globe size={16} /> praveengroups.in
                </a>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 bg-slate-800 text-brand-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">Business Hours</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span>Mon - Fri</span> <span className="font-semibold text-white">9:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span>Saturday</span> <span className="font-semibold text-white">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between items-center pt-1 text-red-400">
                  <span className="flex items-center gap-2"><CalendarX2 size={16} /> Sunday</span> 
                  <span className="font-bold uppercase text-xs tracking-wider bg-red-400/10 px-3 py-1 rounded-full">Closed</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* ─── Contact Form ─── */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-extrabold text-slate-900 mb-2">Send us a Message</h2>
              <p className="text-slate-500">Fill out the form below and we'll be in touch as soon as possible.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all" placeholder="How can we help you?" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                <textarea required rows="5" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 outline-none transition-all resize-none" placeholder="Tell us more about your inquiry..."></textarea>
              </div>

              {status && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${status.includes('Sent') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                  {status}
                </div>
              )}

              <button type="submit" disabled={!!status && !status.includes('Sent')} className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
                <Send size={20} /> Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
