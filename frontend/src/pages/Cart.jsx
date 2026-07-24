import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (cartItems.length === 0) {
      axios.get(`${API}/products/`)
        .then(res => setRecommended(res.data.slice(0, 4)))
        .catch(console.error);
    }
  }, [cartItems.length]);

  if (cartItems.length === 0) {
    return (
      <div className="py-10">
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center bg-white rounded-3xl p-10 shadow-sm border border-slate-100 mb-12">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">Your Cart is Empty</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Discover our top picks below!</p>
          <Button onClick={() => navigate('/')}>Start Shopping</Button>
        </div>
        
        {recommended.length > 0 && (
          <div>
            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-6">Recommended for you</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommended.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-heading font-bold text-slate-900 mb-10">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <motion.div layout key={item.id} className="flex gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 items-center">
              <img src={item.images?.[0]?.image || 'https://placehold.co/200'} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-slate-50" />
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.name}</h3>
                <p className="text-brand-600 font-semibold mb-4">₹{item.discount_price || item.price}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-100 rounded-full px-3 py-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-brand-600"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-brand-600"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="text-xl font-bold text-slate-900">
                ₹{(item.discount_price || item.price) * item.quantity}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-slate-900 text-white p-8 rounded-3xl h-fit sticky top-24">
          <h2 className="text-2xl font-heading font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-8 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-white">₹{getCartTotal()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-green-400">Free</span>
            </div>
            <div className="border-t border-slate-700 pt-4 mt-4 flex justify-between text-xl font-bold text-white">
              <span>Total</span>
              <span>₹{getCartTotal()}</span>
            </div>
          </div>
          <Button variant="primary" className="w-full text-lg py-4" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
