import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Package, Warehouse, MapPin, Phone, Mail, MessageCircle,
  ChevronDown, ChevronUp, CheckCircle, Send, Star,
  Clock, Shield, Navigation
} from 'lucide-react';
import { DiscountPosters } from '../components/DiscountPosters';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };

function HeroSlider({ banners, business }) {
  const [current, setCurrent] = useState(0);
  const len = banners.length;
  useEffect(() => {
    if (len < 2) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % len), 5500);
    return () => clearInterval(t);
  }, [len]);
  const slide = banners[current];
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {banners.map((b, i) => (
        <motion.div key={i} className="absolute inset-0" initial={false} animate={{ opacity: i === current ? 1 : 0 }} transition={{ duration: 1.4 }}>
          <img src={b.image || b.image_file} alt={b.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
        </motion.div>
      ))}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16 w-full">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-block bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-sm font-bold px-5 py-2 rounded-full mb-6 backdrop-blur-sm">
              {business.name}
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-6 drop-shadow-xl">
              {slide.title || business.name}
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">{slide.subtitle || business.description}</p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-yellow-500/30 text-lg">
                <Navigation className="w-5 h-5" /> Get a Quote
              </button>
              {business.contact_phone && (
                <a href={`tel:${business.contact_phone}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all backdrop-blur-sm text-lg">
                  <Phone className="w-5 h-5" /> Call Us 24/7
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {len > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === current ? 'bg-yellow-400 w-10' : 'bg-white/30 w-3'}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      {badge && <span className="inline-block text-yellow-600 font-bold text-sm uppercase tracking-widest mb-3">{badge}</span>}
      <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900">{title}</h2>
      {subtitle && <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">{subtitle}</p>}
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
            {open === i ? <ChevronUp className="w-5 h-5 text-yellow-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
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

function QuoteForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', from: '', to: '', weight: '', type: '', date: '' });
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Quote Request Sent!</h3>
        <p className="text-slate-600">Our logistics team will call you within 2 hours with a custom quote.</p>
      </div>
    );
  }
  return (
    <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name *</label>
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
          <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Pickup Location *</label>
          <input required value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800" placeholder="City / Pincode" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Location *</label>
          <input required value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800" placeholder="City / Pincode" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Cargo Weight</label>
          <select value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800 bg-white">
            <option value="">Select weight range</option>
            <option>Below 100 kg</option>
            <option>100 kg – 1 Ton</option>
            <option>1 Ton – 5 Ton</option>
            <option>5 Ton – 15 Ton</option>
            <option>Above 15 Ton (FTL)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Cargo Type</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800 bg-white">
            <option value="">Select cargo type</option>
            <option>General Goods</option>
            <option>Fragile / Electronics</option>
            <option>Perishables / Cold Chain</option>
            <option>Industrial / Machinery</option>
            <option>Hazardous Materials</option>
            <option>E-Commerce / Parcels</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Pickup Date</label>
        <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 outline-none text-slate-800" />
      </div>
      <button type="submit" className="w-full flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-2xl text-lg transition-all shadow-xl shadow-yellow-500/30">
        <Send className="w-5 h-5" /> Request Quote
      </button>
    </form>
  );
}

export const LogisticsPage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/businesses/${slug}/`)
      .then(r => setBusiness(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!business) return <div className="text-center py-40 text-2xl text-slate-400 font-bold">Company not found</div>;

  const allBanners = business.banners || [];
  const heroBanners = allBanners.filter(b => b.position !== 'DISCOUNT');
  const discountPosters = allBanners.filter(b => b.position === 'DISCOUNT');

  const banners = heroBanners.length > 0
    ? heroBanners
    : [{ image: '/images/assets/asset_3f04db14.jpg', title: business.name, subtitle: business.description }];

  return (
    <div className="pb-20">
      {/* ── Hero ──────────────────────────────────────────── */}
      <HeroSlider banners={banners} business={business} />

      {/* ── Discount Posters ────────────────────────────── */}
      <DiscountPosters posters={discountPosters} />

      {/* Stats Bar */}
      <div className="bg-yellow-500 text-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 divide-x divide-yellow-400">
          {[
            { label: 'Vehicles in Fleet', value: '120+' },
            { label: 'Daily Deliveries', value: '500+' },
            { label: 'Corporate Clients', value: '500+' },
            { label: 'Years of Experience', value: '15+' },
          ].map((s, i) => (
            <div key={i} className="text-center px-4">
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-slate-700 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-24 mt-20">

        {/* About */}
        {(business.about_us || business.mission_vision) && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="text-yellow-600 font-bold text-sm uppercase tracking-widest">About Us</span>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-slate-900 mt-3 mb-6 leading-tight">Trusted Logistics Partner</h2>
              {business.about_us && <p className="text-slate-600 leading-relaxed text-lg mb-8 whitespace-pre-wrap">{business.about_us}</p>}
              {business.mission_vision && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
                  <p className="text-yellow-900 leading-relaxed whitespace-pre-wrap font-medium">{business.mission_vision}</p>
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

        {/* Why Choose Us */}
        <section className="bg-slate-50 rounded-[2.5rem] p-8 md:p-16">
          <SectionHeader badge="Our Advantages" title="Why Choose Praveen Transports" subtitle="Reliable, fast, and cost-effective logistics for businesses of all sizes" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Fully Insured', desc: 'All shipments covered under comprehensive cargo insurance up to ₹50 lakhs.' },
              { icon: Navigation, title: 'GPS Live Tracking', desc: 'Real-time tracking for every shipment. Know exactly where your cargo is, always.' },
              { icon: Clock, title: '24/7 Operations', desc: 'Round-the-clock support, dispatching, and customer service for urgent deliveries.' },
              { icon: Truck, title: '120+ Vehicle Fleet', desc: 'From mini-trucks to 40ft containers and refrigerated units — we have it all.' },
              { icon: Warehouse, title: '3PL Warehousing', desc: 'Modern warehouse facilities in Chennai, Coimbatore, and Madurai for storage & distribution.' },
              { icon: Package, title: 'Last-Mile Delivery', desc: 'Dedicated e-commerce last-mile delivery with COD handling and return management.' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-5"><f.icon className="w-7 h-7 text-yellow-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Services */}
        {business.services_data && business.services_data.length > 0 && (
          <section>
            <SectionHeader badge="What We Do" title="Our Services" subtitle="Comprehensive logistics solutions for every industry" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {business.services_data.map((s, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: (i % 4) * 0.1 }} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  {s.image && <div className="aspect-video overflow-hidden"><img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors">{s.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Packages / Rate Cards */}
        {business.packages_data && business.packages_data.length > 0 && (
          <section>
            <SectionHeader badge="Pricing" title="Service Packages" subtitle="Transparent pricing for all freight requirements" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {business.packages_data.map((pkg, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                  {pkg.badge && <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">{pkg.badge}</span>}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-extrabold text-yellow-600 mb-1">{pkg.price}</div>
                  {pkg.duration && <div className="text-sm text-slate-500 mb-6">{pkg.duration}</div>}
                  <ul className="space-y-3 flex-1 mb-8">
                    {(pkg.features || []).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span className="text-slate-600 text-sm">{f}</span></li>
                    ))}
                  </ul>
                  <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-2xl text-sm transition-all">Get Quote</button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {business.gallery_data && business.gallery_data.length > 0 && (
          <section>
            <SectionHeader badge="Fleet & Operations" title="Our Gallery" subtitle="Our modern fleet and state-of-the-art facilities" />
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



        {/* Testimonials */}
        {business.testimonials_data && business.testimonials_data.length > 0 && (
          <section>
            <SectionHeader badge="Client Reviews" title="What Our Clients Say" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {business.testimonials_data.map((t, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <div className="flex mb-4">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}</div>
                  <p className="text-slate-600 leading-relaxed italic mb-6">"{t.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xl">{t.name?.[0]}</div>
                    <div><p className="font-bold text-slate-900">{t.name}</p><p className="text-slate-500 text-sm">{t.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Quote Form + Contact */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <span className="text-yellow-600 font-bold text-sm uppercase tracking-widest">Book Now</span>
            <h2 className="text-4xl font-heading font-extrabold text-slate-900 mt-2 mb-6">Get an Instant Quote</h2>
            <p className="text-slate-600 leading-relaxed text-lg mb-8">Fill in the details below and our team will call you with a competitive quote within 2 hours.</p>
            <QuoteForm />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-xl font-bold text-slate-900">Contact Us</h3>
              {business.contact_phone && (
                <a href={`tel:${business.contact_phone}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center"><Phone className="w-5 h-5 text-yellow-600" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">24/7 Helpline</p><p className="text-slate-900 font-bold">{business.contact_phone}</p></div>
                </a>
              )}
              {business.contact_email && (
                <a href={`mailto:${business.contact_email}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center"><Mail className="w-5 h-5 text-yellow-600" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p><p className="text-slate-900 font-bold">{business.contact_email}</p></div>
                </a>
              )}
              {business.address && (
                <a href="https://maps.app.goo.gl/HEgtK1bcE79LxDod9?g_st=ac" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-yellow-600" /></div>
                  <div><p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Transport Hub</p><p className="text-slate-700 text-sm leading-relaxed">{business.address}</p></div>
                </a>
              )}
              {business.address && (
                <div className="w-full h-64 rounded-2xl overflow-hidden mt-4">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3969.465441958973!2d78.03189209008718!3d11.316396284320847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babdb5b3efe89a9%3A0x29e16979f8d13b23!2sPraveen%20groups%20of%20Companies!5e1!3m2!1sen!2sin!4v1784122147718!5m2!1sen!2sin" className="w-full h-full border-0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              )}
              {business.whatsapp_number && (
                <a href={`https://wa.me/${business.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all">
                  <MessageCircle className="w-5 h-5" /> WhatsApp for Quick Quote
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

        {/* Parcel Tracking (placeholder) */}
        <section className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white">
          <div className="text-center mb-10">
            <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest">Track Shipment</span>
            <h2 className="text-4xl font-heading font-extrabold mt-3">Track Your Parcel</h2>
          </div>
          <div className="max-w-2xl mx-auto flex gap-4">
            <input className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:border-yellow-400 text-lg" placeholder="Enter LR Number / Tracking ID" />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-xl shadow-yellow-500/30">Track</button>
          </div>
          <p className="text-slate-400 text-sm text-center mt-4">Enter your Lorry Receipt (LR) number to get real-time status</p>
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
