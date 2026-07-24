import React, { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, Star, CalendarDays, Heart, CheckCircle, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { QuickViewModal } from "./QuickViewModal";

import { getMediaUrl } from "../utils/media";

export const ProductCard = memo(({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const discount = product.discount_price
    ? Math.round((1 - Number(product.discount_price) / Number(product.price)) * 100)
    : 0;

  const handleBuyNow = useCallback((e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    addToCart(product);
    navigate("/checkout");
  }, [user, product, navigate, addToCart]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    addToCart(product);
    setAddedToCart(true);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 600);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [user, product, navigate, addToCart]);

  const handleWishlist = useCallback((e) => {
    e.preventDefault();
    setWishlisted(w => !w);
  }, []);

  const productImageSrc = product.images && product.images.length > 0 && product.images[0].image
    ? getMediaUrl(product.images[0].image)
    : (product.image ? getMediaUrl(product.image) : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80");

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden group flex flex-col relative card-hover-glow transition-shadow duration-300"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-50 img-zoom-container">
        <img
          src={productImageSrc}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-600"
        />

        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Quick View on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
            >
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
                className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap hover:bg-white hover:text-brand-600 transition-colors"
              >
                <Eye className="w-3 h-3" /> Quick View
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 deal-badge text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            -{discount}%
          </span>
        )}

        {product.is_service && (
          <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow animate-badge-pop">
            Service
          </span>
        )}

        {!product.is_service && product.stock < 10 && product.stock > 0 && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute bottom-3 left-3 bg-orange-500/90 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm"
          >
            Only {product.stock} left!
          </motion.div>
        )}

        {!product.is_service && product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="bg-white text-slate-800 text-sm font-bold px-4 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Wishlist */}
        <motion.button
          onClick={handleWishlist}
          whileTap={{ scale: 0.75 }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
        >
          <motion.div animate={wishlisted ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
          </motion.div>
        </motion.button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-[10px] text-slate-500 font-medium mb-1.5 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
          {product.business_name && (
            <span className="text-brand-700 font-bold bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded">
              {product.business_name}
            </span>
          )}
          <span>{product.category_name}</span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="text-sm font-bold text-slate-900 mb-2 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating — Flipkart style green pill */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
              {Number(product.rating).toFixed(1)}
              <Star className="w-2.5 h-2.5 fill-white" />
            </span>
            {product.reviews_count > 0 && (
              <span className="text-xs text-slate-500 font-medium">({product.reviews_count.toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          {product.discount_price ? (
            <>
              <motion.span
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-slate-900"
              >
                &#8377;{Number(product.discount_price).toLocaleString("en-IN")}
              </motion.span>
              <span className="text-sm text-slate-400 line-through">&#8377;{Number(product.price).toLocaleString("en-IN")}</span>
              <span className="text-xs font-bold text-green-600">{discount}% off</span>
            </>
          ) : (
            <span className="text-xl font-bold text-slate-900">&#8377;{Number(product.price).toLocaleString("en-IN")}</span>
          )}
        </div>

        {/* Buttons */}
        {!product.is_service ? (
          <div className="flex gap-2">
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.93 }}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-1.5 border-2 font-bold py-2.5 rounded-xl transition-all text-sm btn-ripple ${
                addedToCart
                  ? "border-green-500 bg-green-50 text-green-600"
                  : "border-brand-500 text-brand-600 hover:bg-brand-50"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span className={cartBounce ? "animate-cart-bounce inline-block" : "inline-block"}>
                {addedToCart ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </span>
              {addedToCart ? "Added!" : "Cart"}
            </motion.button>

            <motion.button
              onClick={handleBuyNow}
              whileTap={{ scale: 0.93 }}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-all text-sm shadow-md hover:shadow-lg btn-ripple disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" /> Buy Now
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleBuyNow}
            whileTap={{ scale: 0.93 }}
            className="w-full flex items-center justify-center gap-1.5 bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-all text-sm shadow-md hover:shadow-lg btn-ripple"
          >
            <CalendarDays className="w-4 h-4" /> Book Service
          </motion.button>
        )}
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={showQuickView} 
        onClose={() => setShowQuickView(false)} 
      />
    </motion.div>
  );
});
