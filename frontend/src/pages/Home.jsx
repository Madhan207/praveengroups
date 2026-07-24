import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';
import { DiscountPosters } from '../components/DiscountPosters';
import { ShieldCheck, Truck, RefreshCw, Headphones, Star, Tag, ChevronRight, Flame } from 'lucide-react';
import { getMediaUrl } from '../utils/media';

// Business-type image map — matched by slug / name keyword
const BIZ_IMAGES = {
  electro: '/images/assets/asset_b58b6398.jpg',
  electronic: '/images/assets/asset_b58b6398.jpg',
  lifestyle: '/images/assets/asset_1af06ac3.jpg',
  fashion: '/images/assets/asset_1af06ac3.jpg',
  mart: '/images/assets/asset_a5efd5ba.jpg',
  grocery: '/images/assets/asset_a5efd5ba.jpg',
  spiritual: '/images/assets/asset_4dfd9db4.jpg',
  pooja: '/images/assets/asset_4dfd9db4.jpg',
  mannu: '/images/assets/asset_b2b0ee51.jpg',
  farm: '/images/assets/asset_b2b0ee51.jpg',
  agri: '/images/assets/asset_b2b0ee51.jpg',
  global: '/images/assets/asset_353b024b.jpg',
  enterprise: '/images/assets/asset_353b024b.jpg',
  construct: '/images/assets/asset_353b024b.jpg',
  dj: '/images/assets/asset_09dd9826.jpg',
  event: '/images/assets/asset_09dd9826.jpg',
  studio: '/images/assets/asset_b2576200.jpg',
  photo: '/images/assets/asset_b2576200.jpg',
  video: '/images/assets/asset_b2576200.jpg',
  logistic: '/images/assets/asset_fc7594fa.jpg',
  transport: '/images/assets/asset_fc7594fa.jpg',
  trust: '/images/assets/asset_d4b54d42.jpg',
  foundation: '/images/assets/asset_d4b54d42.jpg',
};

const DEFAULT_BIZ_IMAGE = '/images/assets/asset_84ea5325.jpg';

function getBizImage(biz) {
  // 1. If the API already provides an image/logo, use it
  if (biz.logo) return getMediaUrl(biz.logo);
  if (biz.thumbnail) return getMediaUrl(biz.thumbnail);
  if (biz.image) return getMediaUrl(biz.image);
  // 2. Match slug or name keywords
  const key = `${biz.slug || ''} ${biz.name || ''}`.toLowerCase();
  for (const [keyword, url] of Object.entries(BIZ_IMAGES)) {
    if (key.includes(keyword)) return url;
  }
  return DEFAULT_BIZ_IMAGE;
}

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const TRUST_BADGES = [
  { icon: Truck, label: 'Nationwide Delivery', sub: 'Fast & Secure', color: '#3b82f6', bg: '#dbeafe' },
  { icon: ShieldCheck, label: 'Trusted by Millions', sub: '100% Genuine', color: '#10b981', bg: '#d1fae5' },
  { icon: RefreshCw, label: 'Easy Returns', sub: 'Hassle-free process', color: '#f59e0b', bg: '#fef3c7' },
  { icon: Headphones, label: '24/7 Support', sub: 'Always here to help', color: '#8b5cf6', bg: '#ede9fe' },
];

const TICKER_DEALS = [
  '🔥 Flat ₹500 off on Electronics | Use code: ELECTRO500',
  '⚡ Flash Sale: Smartphones up to 40% OFF — Today Only!',
  '🚚 Free Delivery on orders above ₹999',
  '🎁 New Arrivals in Lifestyle Division — Shop Now!',
  '✨ Exclusive DJ & Event Packages at Unbeatable Prices',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export const Home = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [globalBanners, setGlobalBanners] = useState([]);
  const [globalDiscountPosters, setGlobalDiscountPosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bizRes, prodRes, servRes, bannerRes, posterRes] = await Promise.allSettled([
          axios.get(`${API}/businesses/`),
          axios.get(`${API}/products/?is_service=false&is_trending=true`),
          axios.get(`${API}/products/?is_service=true`),
          axios.get(`${API}/banners/?global=true&position=HERO`),
          axios.get(`${API}/banners/?global=true&position=DISCOUNT`)
        ]);

        if (bizRes.status === 'fulfilled') {
          const data = bizRes.value.data.results || bizRes.value.data;
          setBusinesses(Array.isArray(data) ? data : []);
        }
        if (prodRes.status === 'fulfilled') {
          const data = prodRes.value.data.results || prodRes.value.data;
          setTopProducts(Array.isArray(data) ? data.slice(0, 12) : []);
        }
        if (servRes.status === 'fulfilled') {
          const data = servRes.value.data.results || servRes.value.data;
          setTopServices(Array.isArray(data) ? data.slice(0, 4) : []);
        }
        if (bannerRes.status === 'fulfilled') {
          const data = bannerRes.value.data.results || bannerRes.value.data;
          setGlobalBanners(Array.isArray(data) ? data : []);
        }
        if (posterRes.status === 'fulfilled') {
          const data = posterRes.value.data.results || posterRes.value.data;
          setGlobalDiscountPosters(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pb-20">

      {/* ─── Ticker + Hero (zero gap between them) ──────────────────────── */}
      <div>
        {/* Deal Ticker */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-blue-600 py-2.5 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center gap-2 bg-amber-400 text-slate-900 text-xs font-extrabold px-4 py-1.5 rounded-r-full">
              <Flame className="w-3.5 h-3.5" /> DEALS
            </div>
            <div className="ticker-wrap flex-1">
              <div className="ticker-inner text-sm text-white font-medium">
                {[...TICKER_DEALS, ...TICKER_DEALS].map((deal, i) => (
                  <span key={`ticker-${i}`} className="mx-12">{deal}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Slider — flush against ticker */}
        <HeroSlider banners={globalBanners} fallbackHeight="min-h-[500px] md:min-h-[650px]" />
      </div>

      {/* ─── Rest of page with consistent spacing ────────────────────────── */}
      <div className="space-y-16 mt-16">

        {/* ─── Discount Posters (Flipkart style) ─────────────────────────── */}
        <DiscountPosters posters={globalDiscountPosters} />

        {/* ─── Trust Badges ─────────────────────────────────────────── */}
        <section className="px-6 mx-auto max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {TRUST_BADGES.map((b, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: b.bg }}>
                  <b.icon className="w-6 h-6" style={{ color: b.color }} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{b.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{b.sub}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── Featured Businesses ───────────────────────────────────────────── */}
        <section id="businesses" className="px-6 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4"
          >
            <div>
              <span className="text-brand-600 font-bold text-sm uppercase tracking-widest">Our Divisions</span>
              <h2 className="text-4xl font-heading font-extrabold text-slate-900 mt-2">Explore Praveen Groups</h2>
              <p className="text-slate-500 mt-2 text-lg">Serving quality products and services across 12 specialized divisions</p>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 h-64 animate-pulse flex flex-col justify-between">
                  <div className="w-full h-32 bg-slate-200 rounded-2xl mb-4" />
                  <div className="w-3/4 h-4 bg-slate-200 rounded mb-2" />
                  <div className="w-1/2 h-3 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.01 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {businesses.map((biz, i) => (
                <motion.div
                  key={biz.slug || i}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group cursor-pointer bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden card-hover-glow"
                >
                  <Link to={`/company/${biz.slug}`} className="absolute inset-0 z-10" />

                  {/* Business image banner */}
                  <div className="relative w-full h-36 overflow-hidden rounded-t-3xl img-zoom-container">
                    <img
                      src={getBizImage(biz)}
                      alt={biz.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  </div>

                  {/* Card content */}
                  <div className="p-5 flex flex-col flex-1 text-center items-center">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors mb-1.5 line-clamp-1">{biz.name}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{biz.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand-600 uppercase tracking-wider group-hover:gap-2 transition-all">
                      Explore <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* ─── Global Trending Products ────────────────────────────────────────── */}
        {topProducts.length > 0 && (
          <section className="bg-gradient-to-b from-slate-50 to-white py-12 border-b border-slate-100">
            <div className="px-6 mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1 h-6 bg-brand-600 rounded-full inline-block"></span>
                    <span className="text-brand-600 font-bold text-sm uppercase tracking-widest">Global Top Picks</span>
                  </div>
                  <h2 className="text-3xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                    <Flame className="w-8 h-8 text-orange-500 fill-orange-500" /> Trending Products
                  </h2>
                  <p className="text-slate-500 mt-2">Discover the most popular products across all our businesses</p>
                </div>
                <Button variant="secondary" className="bg-white">View All Trending</Button>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topProducts.map(product => (
                  <ProductCard key={`global-${product.id}`} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Banner ───────────────────────────────────────────────── */}
        <section className="px-6 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

            <div className="text-white flex-1 relative z-10 max-w-2xl">
              <span className="inline-block bg-white/10 text-brand-200 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-white/20">
                Corporate Orders
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-6 leading-tight">Partner with Praveen Global Enterprises</h2>
              <p className="text-brand-100 text-lg mb-8 leading-relaxed">
                Looking for bulk orders, B2B supplies, or industrial equipment? Our Global Enterprises division offers unmatched pricing and dedicated support for all corporate needs.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => navigate('/contact')} className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 text-base font-bold shadow-xl shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                  Partnership Enquiries
                </Button>
              </div>
            </div>

            <div className="w-full md:w-1/3 relative z-10 hidden md:block">
              <img src="/images/assets/asset_a724aad9.jpg" alt="Corporate" className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
        </section>

        {/* ─── Featured Services ──────────────────────────────────────────── */}
        {topServices.length > 0 && (
          <section className="px-6 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-brand-600 font-bold text-sm uppercase tracking-widest">Professional Services</span>
                <h2 className="text-4xl font-heading font-extrabold text-slate-900 mt-2">Book Expert Services</h2>
                <p className="text-slate-500 mt-2 text-lg">From DJ Events to Home Appliance Repair</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {topServices.map(service => (
                <ProductCard key={service.id} product={service} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Trust ────────────────────────────────────────── */}
        <section className="text-center px-6 mx-auto max-w-4xl py-12">
          <h2 className="text-4xl font-heading font-extrabold text-slate-900 mb-6">Built on Trust & Quality</h2>
          <p className="text-slate-500 text-lg mb-16 leading-relaxed">Praveen Groups of Companies has been serving the community with dedication, innovation, and unwavering commitment to customer satisfaction across all our divisions.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: '12 Divisions', text: 'Operating across multiple industries to serve all your needs.' },
              { title: 'GST Certified', text: 'Certified under Goods and Services Tax for authentic billing and compliance.' },
              { title: 'MSME Certified', text: 'Recognized as a Micro, Small & Medium Enterprise by the Government of India.' },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -6 }} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 fill-brand-500" />
                </div>
                <h3 className="font-extrabold text-2xl text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </div> {/* end space-y-16 */}
    </div>
  );
};
