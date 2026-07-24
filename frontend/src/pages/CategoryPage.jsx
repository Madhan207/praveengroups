import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹10,000', min: 1000, max: 10000 },
  { label: '₹10,000 – ₹50,000', min: 10000, max: 50000 },
  { label: '₹50,000 – ₹1,00,000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyOnSale, setOnlyOnSale] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API}/categories/${slug}/`),
          axios.get(`${API}/products/?category=${slug}`)
        ]);
        setCategory(catRes.data);
        setProducts(prodRes.data.results || prodRes.data);
      } catch (error) {
        console.error("Failed to load category data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const range = PRICE_RANGES[priceRange];

  const toggleBrand = (brand) =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  const resetFilters = () => {
    setSortBy('relevance'); setPriceRange(0); setSelectedBrands([]); setOnlyOnSale(false);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (onlyOnSale) list = list.filter(p => p.discount_price);
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand));
    list = list.filter(p => {
      const price = Number(p.discount_price || p.price);
      return price >= range.min && price < range.max;
    });
    if (sortBy === 'price_asc') list.sort((a, b) => Number(a.discount_price || a.price) - Number(b.discount_price || b.price));
    else if (sortBy === 'price_desc') list.sort((a, b) => Number(b.discount_price || b.price) - Number(a.discount_price || a.price));
    else if (sortBy === 'rating') list.sort((a, b) => Number(b.rating) - Number(a.rating));
    return list;
  }, [products, onlyOnSale, selectedBrands, priceRange, sortBy]);

  const hasActiveFilters = priceRange !== 0 || selectedBrands.length > 0 || onlyOnSale || sortBy !== 'relevance';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return <div className="text-center py-20 text-2xl font-bold text-slate-700">Category not found.</div>;
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden h-52 mb-10 bg-slate-900 flex items-center px-10 mt-16">
        {category.image && <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
        <div className="relative z-10 text-white">
          <nav className="text-xs text-slate-400 mb-2 flex gap-1 items-center">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            {category.business && (
              <>
                <Link to={`/company/${category.business.slug}`} className="hover:text-white">{category.business.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-heading font-bold mb-1">{category.name}</h1>
          <p className="text-slate-300"><strong>{products.length} products available</strong></p>
        </div>
      </div>

      <div className="flex gap-8 px-6 pb-20 max-w-7xl mx-auto">
        {/* ── Sidebar Filter Panel ── */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24 space-y-7">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* Sort */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sort By</h4>
              <div className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="sort" checked={sortBy === opt.value} onChange={() => setSortBy(opt.value)} className="text-brand-600" />
                    <span className={`text-sm ${sortBy === opt.value ? 'text-brand-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Price Range</h4>
              <div className="space-y-1">
                {PRICE_RANGES.map((r, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="price" checked={priceRange === i} onChange={() => setPriceRange(i)} className="text-brand-600" />
                    <span className={`text-sm ${priceRange === i ? 'text-brand-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'}`}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Brand</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="rounded text-brand-600" />
                      <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-brand-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'} line-clamp-1`}>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* On Sale toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">🔥 On Sale Only</span>
              <button
                onClick={() => setOnlyOnSale(!onlyOnSale)}
                className={`w-10 h-6 rounded-full transition-colors ${onlyOnSale ? 'bg-brand-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${onlyOnSale ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">No Products Found</h2>
              <p className="text-slate-400 mb-6">Try adjusting your filters.</p>
              <button onClick={resetFilters} className="text-brand-600 font-semibold hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

