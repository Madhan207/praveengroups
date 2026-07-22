import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, MapPin, CreditCard, 
  Tag, Bell, Star, Settings, ShieldCheck, LogOut, Calendar
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

export const ProfileSidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="w-full md:w-72 shrink-0">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 md:sticky md:top-24">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-lg shadow-brand-500/30">
            {user?.name?.[0] || user?.email?.[0]}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                GOLD MEMBER
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative group ${
                  isActive ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-brand-50 rounded-2xl border border-brand-100/50"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
