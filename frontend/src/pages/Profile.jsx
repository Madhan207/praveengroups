import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileSidebar } from '../components/profile/ProfileSidebar';
import { DashboardOverview } from '../components/profile/DashboardOverview';
import { OrdersTab } from '../components/profile/OrdersTab';
import { 
  AddressesTab, PaymentsTab, CouponsTab, 
  NotificationsTab, ReviewsTab, SettingsTab, SecurityTab 
} from '../components/profile/MockedTabs';
import { BookingsTab } from '../components/profile/BookingsTab';
import { Menu, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/`);
        const data = res.data?.results || res.data;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview user={user} orders={orders} setActiveTab={setActiveTab} />;
      case 'orders': return <OrdersTab orders={orders} />;
      case 'bookings': return <BookingsTab />;

      case 'addresses': return <AddressesTab />;
      case 'payments': return <PaymentsTab />;
      case 'coupons': return <CouponsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'reviews': return <ReviewsTab />;
      case 'settings': return <SettingsTab />;
      case 'security': return <SecurityTab />;
      default: return <DashboardOverview user={user} orders={orders} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-[70vh]">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
        <h1 className="font-heading font-bold text-lg text-slate-900">My Account</h1>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-50 text-slate-700 rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 relative">
        {/* Sidebar */}
        <div className={`md:block ${mobileMenuOpen ? 'block absolute z-20 w-full md:relative md:w-auto' : 'hidden'}`}>
          <ProfileSidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }} 
            onLogout={handleLogout} 
          />
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
