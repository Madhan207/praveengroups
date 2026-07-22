import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, TrendingUp, Award, User, Edit3, Shield, Calendar, Phone, Mail } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const DashboardOverview = ({ user, orders, setActiveTab }) => {
  const { cartItems } = useCart();
  
  const totalSpent = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Cart Items', value: cartItems.length, icon: ShoppingCart, color: 'from-brand-500 to-cyan-600', bg: 'bg-brand-50', text: 'text-brand-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-7 h-7 ${stat.text}`} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-white flex items-center justify-center text-4xl font-bold uppercase">
                  {user?.name?.[0] || user?.email?.[0]}
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow border border-slate-100 flex items-center justify-center text-slate-600 hover:text-brand-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab('security')}
                className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
              >
                Change Password
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-slate-900">{user?.name}</h2>
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1">
                  <Shield className="w-4 h-4" /> Verified Account
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                    <p className="font-semibold text-slate-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Mobile Number</p>
                    <p className="font-semibold text-slate-900">{user?.mobile_number || '+91 - Not Added'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:border-l border-slate-100 md:pl-8 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Calendar className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Member Since</p>
                  <p className="font-semibold text-slate-900">June 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><User className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Gender</p>
                  <p className="font-semibold text-slate-900">Not specified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
