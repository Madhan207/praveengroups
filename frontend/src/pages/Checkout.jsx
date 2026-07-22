import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, Package, MapPin, CreditCard } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

export const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get(`/payment-settings/`);
        const settings = res.data.results || res.data;
        if (settings.length > 0) {
          setPaymentSettings(settings[0]);
          
          // If COD is default but disabled, switch to UPI
          if (!settings[0].cod_enabled && settings[0].upi_enabled) {
            setFormData(prev => ({ ...prev, payment_method: 'UPI' }));
          }
        }
      } catch (err) {
        console.error("Failed to load payment settings", err);
      }
    };
    fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    mobile_number: user?.mobile_number || '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    payment_method: 'UPI',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const total = getCartTotal();

  if (!user) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Please login to checkout</h2>
      <Link to="/login"><Button>Login</Button></Link>
    </div>
  );

  if (cartItems.length === 0 && step < 3) {
    navigate('/cart');
    return null;
  }

  const submitShipping = (e) => { e.preventDefault(); setError(''); setStep(2); };

  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create the order
      const orderRes = await api.post(`/orders/`, {
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        payment_method: formData.payment_method,
        total_amount: total,
        order_items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.discount_price || item.price,
        })),
      });

      const newOrderId = orderRes.data.id;
      setOrderId(newOrderId);

      // 2. If UPI, upload screenshot + UTR
      if (formData.payment_method === 'UPI' && screenshot) {
        const fd = new FormData();
        fd.append('order', newOrderId);
        fd.append('utr_number', utrNumber);
        fd.append('screenshot', screenshot);
        await api.post(`/payment-verifications/`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      clearCart();
      setStep(3);
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to place order. Please try again.');
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      {step < 3 && (
        <div className="flex items-center mb-10">
          {[{ n: 1, icon: MapPin, label: 'Shipping' }, { n: 2, icon: CreditCard, label: 'Payment' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-brand-600' : 'text-slate-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.n ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="font-semibold hidden sm:block">{s.label}</span>
              </div>
              {i < 1 && <div className={`flex-1 h-0.5 mx-4 ${step > 1 ? 'bg-brand-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step 1 — Shipping */}
      {step === 1 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><MapPin className="w-6 h-6 text-brand-500" /> Shipping Details</h2>
          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 mb-5 text-sm">{error}</div>}
          <form onSubmit={submitShipping} className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                <input type="tel" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Address</label>
              <textarea name="address" required rows="2" value={formData.address} onChange={handleChange} placeholder="House No, Street, Area..." className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                <input type="text" name="state" required value={formData.state} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                <input type="text" name="pincode" required maxLength={6} pattern="[0-9]{6}" value={formData.pincode} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} × {item.quantity}</span>
                    <span className="font-semibold">₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full py-4 text-lg">Continue to Payment →</Button>
          </form>
        </div>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><CreditCard className="w-6 h-6 text-brand-500" /> Payment</h2>
          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 mb-5 text-sm">{error}</div>}
          <form onSubmit={submitOrder} className="space-y-6">
            {/* Method Selector */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { value: 'UPI', label: '📱 UPI Payment', sub: 'Scan QR & upload proof', enabled: paymentSettings ? paymentSettings.upi_enabled : true },
              ].filter(m => m.enabled).map(m => (
                <label key={m.value} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.payment_method === m.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'}`}>
                  <input type="radio" name="payment_method" value={m.value} checked={formData.payment_method === m.value} onChange={handleChange} className="hidden" />
                  <div className="font-bold text-slate-900">{m.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
                </label>
              ))}
            </div>

            {/* UPI Details */}
            {formData.payment_method === 'UPI' && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl mb-1">Pay ₹{total.toLocaleString('en-IN')}</h3>
                  <p className="text-slate-500 text-sm mb-3">Scan the QR below with any UPI app</p>
                  <div className="inline-block bg-white rounded-2xl shadow-lg p-3 border border-slate-200">
                    <img
                      src="/upi-qr.jpg"
                      alt="UPI QR Code - Praveen Electro World"
                      className="mx-auto w-56 h-auto rounded-xl"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-brand-600 font-bold text-base">8675398848@okbizaxis</p>
                    <p className="text-slate-500 text-xs">Praveen Electro World · +91 86753 98848</p>
                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">G Pay</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">PhonePe</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">Paytm</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">BHIM UPI</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">UTR / Transaction ID *</label>
                  <input type="text" required={formData.payment_method === 'UPI'} value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                    placeholder="12-digit UTR number" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Screenshot *</label>
                  <input type="file" accept="image/*" required={formData.payment_method === 'UPI'}
                    onChange={e => setScreenshot(e.target.files[0])}
                    className="w-full text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 transition-all" />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} type="button" className="px-8">← Back</Button>
              <Button type="submit" className="flex-1 py-4 text-lg" disabled={loading}>
                {loading ? 'Placing Order...' : `✅ Confirm Order · ₹${total.toLocaleString('en-IN')}`}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3 — Success */}
      {step === 3 && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-3">Order Placed! 🎉</h2>
          <p className="text-slate-500 mb-2">Your order #{orderId} has been placed successfully.</p>
          {formData.payment_method === 'UPI' && (
            <p className="text-amber-600 text-sm font-medium bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              ⏳ Your UPI payment is pending verification. Our admin will confirm it shortly.
            </p>
          )}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="secondary">Continue Shopping</Button>
          </div>
        </div>
      )}
    </div>
  );
};
