import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Zap, Star, Heart, Minus, Plus, ChevronRight, Package, Tag, Building2, Shield, Truck, RotateCcw, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  // Reset on product change
  useEffect(() => { setActiveImg(0); setQty(1); setAdded(false); }, [product?.id]);

  if (!product || !isOpen) return null;

  // Build image array — serializer returns absolute URL in img.image
  const images = (product.images && product.images.length > 0)
    ? product.images.map(img => ({ url: img.image || '', label: img.label || '' }))
    : [{ url: 'https://placehold.co/600x600/f8fafc/94a3b8?text=No+Image', label: '' }];

  const price = Number(product.price);
  const salePrice = product.discount_price ? Number(product.discount_price) : null;
  const discount = salePrice ? Math.round((1 - salePrice / price) * 100) : 0;
  const displayPrice = salePrice || price;

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); onClose(); return; }
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); onClose(); return; }
    addToCart(product, qty);
    navigate('/checkout');
    onClose();
  };

  // Get first group of specs for quick display
  const specs = Array.isArray(product.specifications) ? product.specifications : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights : [];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="qv-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            key="qv-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={onClose}
              className="absolute top-3 right-3 z-20 w-9 h-9 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-all">
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

              {/* ─── LEFT: Image Gallery ─────────────────────────── */}
              <div className="w-full lg:w-[42%] flex flex-col bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 p-4 shrink-0">
                {/* Main Image */}
                <div className="relative flex-1 min-h-[240px] max-h-[360px] lg:max-h-none bg-white rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={images[activeImg].url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-4 transition-all duration-200"
                    onError={e => { e.target.src = 'https://placehold.co/600x600/f8fafc/94a3b8?text=No+Image'; }}
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow">
                      -{discount}%
                    </span>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-full">Out of Stock</span>
                    </div>
                  )}
                  {images[activeImg].label && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded">
                      {images[activeImg].label}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden bg-white transition-all ${
                          activeImg === i ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-contain p-0.5"
                          onError={e => { e.target.src = 'https://placehold.co/60x60/f8fafc/94a3b8?text=img'; }} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { icon: Shield, label: '1 Yr Warranty' },
                    { icon: RotateCcw, label: '7 Day Return' },
                    { icon: Truck, label: 'Free Delivery' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 py-2 px-1 bg-white rounded-lg border border-slate-100">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── RIGHT: Product Details ───────────────────────── */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-5 lg:p-6 flex flex-col gap-4 flex-1">

                  {/* Brand + badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.business_name && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {product.business_name}
                      </span>
                    )}
                    {product.category_name && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {product.category_name}
                      </span>
                    )}
                    {product.is_best_seller && <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🏆 Best Seller</span>}
                    {product.is_new_arrival && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✨ New</span>}
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{product.name}</h2>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {product.rating} <Star className="w-3 h-3 fill-white" />
                      </div>
                      {product.reviews_count > 0 && (
                        <span className="text-sm text-slate-500">{product.reviews_count.toLocaleString('en-IN')} ratings</span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl font-black text-slate-900">₹{displayPrice.toLocaleString('en-IN')}</span>
                      {salePrice && (
                        <span className="text-lg text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                      )}
                      {discount > 0 && (
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          {discount}% off
                        </span>
                      )}
                    </div>
                    {salePrice && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        You save ₹{(price - salePrice).toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Inclusive of all taxes</p>
                  </div>

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Highlights</h3>
                      <ul className="space-y-1.5">
                        {highlights.slice(0, 5).map((hl, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                            {hl}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Specs from first group */}
                  {specs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Specifications</h3>
                      <div className="rounded-lg border border-slate-100 overflow-hidden">
                        {specs[0].attributes.slice(0, 4).map((attr, i) => (
                          <div key={i} className={`flex text-xs ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                            <div className="w-2/5 px-3 py-2 font-medium text-slate-500 border-r border-slate-100">{attr.name}</div>
                            <div className="flex-1 px-3 py-2 text-slate-800">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock warning */}
                  {product.stock > 0 && product.stock <= 10 && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 animate-pulse">
                      ⚡ Only {product.stock} left in stock — order soon!
                    </p>
                  )}

                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    {/* Qty selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">Qty:</span>
                      <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-lg">
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-800">{qty}</span>
                        <button onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-lg">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button onClick={handleAddToCart} disabled={product.stock === 0}
                        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm border-2 transition-all disabled:opacity-40 ${
                          added ? 'border-green-500 bg-green-50 text-green-600' : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                        }`}>
                        {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                      </button>
                      <button onClick={handleBuyNow} disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-lg shadow-amber-500/30 disabled:opacity-40">
                        <Zap className="w-4 h-4 fill-white" /> Buy Now
                      </button>
                      <button onClick={() => setWishlisted(w => !w)}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                          wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-400'
                        }`}>
                        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>

                    {/* View full details link */}
                    <Link to={`/product/${product.id}`} onClick={onClose}
                      className="flex items-center justify-center gap-1.5 text-sm text-blue-600 font-medium hover:underline">
                      View Full Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
