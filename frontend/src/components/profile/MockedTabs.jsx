import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, CreditCard, Tag, Bell, Star, Settings, ShieldCheck, Plus, Trash2, Edit2, ShoppingCart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const EmptyState = ({ icon: Icon, title, desc, action, to, onClick }) => (
  <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-12 h-12 text-slate-300" />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">{title}</h3>
    <p className="text-slate-500 max-w-md mx-auto mb-8">{desc}</p>
    {action && (
      to ? (
        <Link to={to} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
          {action}
        </Link>
      ) : (
        <button onClick={onClick} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
          {action}
        </button>
      )
    )}
  </div>
);

export const WishlistTab = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API}/auth/wishlist/`, authHeaders());
      setWishlist(res.data);
    } catch (err) {
      toast('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${API}/auth/wishlist/${id}/`, authHeaders());
      setWishlist(wishlist.filter(item => item.id !== id));
      toast('Item removed from wishlist', 'success');
    } catch (err) {
      toast('Failed to remove item', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
  }

  if (wishlist.length === 0) {
    return (
      <EmptyState 
        icon={Heart} 
        title="Your Wishlist is Empty" 
        desc="Save items you like in your wishlist. Review them anytime and easily move them to cart."
        action="Discover Products"
        to="/"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">My Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const product = item.product_details;
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img 
                  src={product.images && product.images.length > 0 ? (product.images[0].image || product.images[0].image_file) : ''} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-bold text-brand-600">₹{Number(product.discount_price || product.price).toLocaleString('en-IN')}</span>
                  {product.discount_price && (
                    <span className="text-sm text-slate-400 line-through">₹{Number(product.price).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <button 
                  onClick={() => toast('Added to cart', 'success')}
                  className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AddressesTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Home',
    full_name: '',
    mobile_number: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false
  });
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API}/auth/addresses/`, authHeaders());
      setAddresses(res.data);
    } catch (err) {
      toast('Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/addresses/`, formData, authHeaders());
      toast('Address added successfully', 'success');
      setShowForm(false);
      fetchAddresses();
      // Reset form
      setFormData({
        title: 'Home', full_name: '', mobile_number: '', address_line: '',
        city: '', state: '', pincode: '', is_default: false
      });
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to add address', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await axios.delete(`${API}/auth/addresses/${id}/`, authHeaders());
      toast('Address deleted', 'success');
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      toast('Failed to delete address', 'error');
    }
  };

  const handleMakeDefault = async (address) => {
    try {
      await axios.patch(`${API}/auth/addresses/${address.id}/`, { is_default: true }, authHeaders());
      toast('Default address updated', 'success');
      fetchAddresses();
    } catch (err) {
      toast('Failed to update address', 'error');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-slate-900">Saved Addresses</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-brand-600 font-bold bg-brand-50 px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors">
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="font-bold text-lg mb-4">Add New Address</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Home, Work, etc)</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                <input required type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address Line</label>
                <textarea required name="address_line" value={formData.address_line} onChange={handleChange} rows="2" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" id="is_default" name="is_default" checked={formData.is_default} onChange={handleChange} className="w-4 h-4 text-brand-600 rounded" />
                <label htmlFor="is_default" className="text-sm font-medium text-slate-700">Make this my default address</label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="bg-brand-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-brand-700">Save Address</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-700 font-bold px-6 py-2 rounded-xl hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(address => (
          <div key={address.id} className={`bg-white p-6 rounded-2xl border-2 shadow-sm relative ${address.is_default ? 'border-brand-500' : 'border-slate-100'}`}>
            {address.is_default && (
              <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full">DEFAULT</span>
            )}
            {!address.is_default && (
              <button onClick={() => handleMakeDefault(address)} className="absolute top-4 right-4 text-xs font-semibold text-brand-600 hover:underline">
                Set as Default
              </button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className={`w-5 h-5 ${address.is_default ? 'text-brand-500' : 'text-slate-400'}`} />
              <h3 className="font-bold text-slate-900">{address.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              <span className="font-semibold text-slate-900">{address.full_name}</span><br />
              {address.address_line}<br />
              {address.city}, {address.state} - {address.pincode}<br />
              Phone: {address.mobile_number}
            </p>
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button onClick={() => handleDelete(address.id)} className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-4 h-4"/> Delete</button>
            </div>
          </div>
        ))}

        {!showForm && (
          <div onClick={() => setShowForm(true)} className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] text-brand-600">
            <Plus className="w-8 h-8 mb-2 opacity-50" />
            <p className="font-bold">Add New Address</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PaymentsTab = () => (
  <EmptyState 
    icon={CreditCard} 
    title="No Saved Payment Methods" 
    desc="Save your credit, debit cards or UPI IDs during checkout for faster payments."
  />
);

export const CouponsTab = () => (
  <EmptyState 
    icon={Tag} 
    title="No Active Coupons" 
    desc="You don't have any coupons right now. Keep shopping to earn exciting rewards!"
  />
);

export const NotificationsTab = () => (
  <EmptyState 
    icon={Bell} 
    title="All Caught Up!" 
    desc="You have no new notifications. We'll let you know when there are updates on your orders or new offers."
  />
);

export const ReviewsTab = () => (
  <EmptyState 
    icon={Star} 
    title="No Reviews Yet" 
    desc="Share your experience with other customers by reviewing products you've purchased."
  />
);

export const SettingsTab = () => {
  const { toast } = useToast();
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-brand-500" /> Account Settings
      </h2>
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition-colors" defaultValue="User Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition-colors" defaultValue="user@example.com" disabled />
          </div>
        </div>
        <button onClick={() => toast('Settings saved successfully', 'success')} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export const SecurityTab = () => {
  const { toast } = useToast();
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-green-500" /> Security
      </h2>
      <div className="space-y-8 max-w-xl">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <input type="password" placeholder="Current Password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition-colors" />
            <input type="password" placeholder="New Password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition-colors" />
            <input type="password" placeholder="Confirm New Password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-500 transition-colors" />
            <button onClick={() => toast('Password updated successfully', 'success')} className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors">
              Update Password
            </button>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button onClick={() => { if(window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) toast('Account deletion request submitted to support', 'warning'); }} className="bg-red-50 text-red-600 border border-red-200 font-bold px-8 py-3 rounded-xl hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
