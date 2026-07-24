import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Clock, CheckCircle, Search, Download, RefreshCw, Star, XCircle, X, Phone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

import { getMediaUrl } from '../../utils/media';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const toMediaUrl = (path) => {
  if (!path) return null;
  return getMediaUrl(path);
};

export const OrdersTab = ({ orders: initialOrders }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [cancellingId, setCancellingId] = useState(null);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnProof, setReturnProof] = useState(null);
  const [supportOrderId, setSupportOrderId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const downloadInvoice = async (order) => {
    const url = toMediaUrl(order.invoice_file);
    if (!url) return;
    setDownloadingId(order.id);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const ext = url.split('.').pop().split('?')[0] || 'pdf';
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Invoice_Order_${order.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast('Invoice downloaded!', 'success');
    } catch {
      toast('Failed to download invoice. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Out for Delivery': return 'text-brand-600 bg-brand-50 border-brand-200';
      case 'Processing': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'Refund Initiated': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'Shipped': case 'Out for Delivery': return <Truck className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/cancel/`);
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: 'Cancelled' } : o
      ));
      
      toast('Order cancelled successfully.', 'success');
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel order.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const showToast = (msg, type = 'info') => {
    toast(msg, type);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">No orders yet</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-8">When you buy something from Praveen Electro World, it will appear here.</p>
        <button className="bg-brand-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group"
        >
          {/* Order Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Order Placed</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-sm font-semibold text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Ship To</p>
                <p className="text-sm font-semibold text-brand-600 cursor-pointer hover:underline">User Name ▾</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Order # {order.id}</p>
              <div className="flex gap-3 mt-1">
                <button 
                  onClick={() => showToast('Invoice downloading...', 'info')}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Download className="w-4 h-4" /> Invoice
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Items List */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    {order.status === 'Delivered' ? 'Delivered' : 'Arriving Soon'}
                  </h3>
                  <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>

                {order.items.map(item => (
                  <div key={item.id} className="flex gap-5">
                    {/* Mock Product Image */}
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 shrink-0 border border-slate-200 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">📦</div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 hover:text-brand-600 cursor-pointer line-clamp-2 leading-tight mb-1">
                        {item.product_name}
                      </h4>
                      <p className="text-sm text-slate-500 mb-2">Sold by: Praveen Electro World</p>
                      
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-900">
                        <span>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                        <span className="text-slate-400">|</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => showToast('Item added to cart.', 'success')}
                          className="px-4 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Buy Again
                        </button>
                        <button 
                          onClick={() => item.product ? navigate(`/product/${item.product}?tab=reviews`) : showToast('Product page not available', 'error')}
                          className="px-4 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" /> Write Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Actions Sidebar */}
              <div className="w-full lg:w-64 shrink-0 space-y-3 lg:border-l border-slate-100 lg:pl-8">
                <button 
                  onClick={() => setReturnOrderId(order.id)}
                  disabled={order.return_requested}
                  className={`w-full py-2.5 bg-white border border-slate-200 text-sm font-bold rounded-xl transition-colors ${order.return_requested ? 'text-slate-400 cursor-not-allowed opacity-60' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {order.return_requested ? 'Return Requested' : 'Return or Replace Items'}
                </button>
                {order.invoice_file && (
                  <button
                    onClick={() => downloadInvoice(order)}
                    disabled={downloadingId === order.id}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-50 border border-brand-200 text-brand-700 text-sm font-bold rounded-xl hover:bg-brand-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingId === order.id ? 'Downloading...' : 'Download Invoice'}
                  </button>
                )}
                <button 
                  onClick={() => setSupportOrderId(order.id)}
                  className="w-full py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
                >
                  Get Product Support
                </button>
                
                {['Pending', 'Processing'].includes(order.status) && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className={`w-full py-2.5 bg-white border border-slate-200 text-red-600 text-sm font-bold rounded-xl transition-colors ${cancellingId === order.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'}`}
                  >
                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      ))}

      {/* Return / Replace Modal */}
      <AnimatePresence>
        {returnOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-heading text-slate-900">Return or Replace</h3>
                <button onClick={() => setReturnOrderId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Please let us know the reason for returning or replacing Order #{returnOrderId}.
              </p>
              <textarea 
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm min-h-[100px] mb-4"
                placeholder="e.g. Item was damaged, changed my mind..."
              ></textarea>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Photo Proof (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setReturnProof(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-xl p-1"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setReturnOrderId(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!returnReason.trim()) return showToast('Please enter a reason', 'error');
                    try {
                      showToast('Submitting return request...', 'info');
                      const formData = new FormData();
                      formData.append('return_reason', returnReason);
                      if (returnProof) formData.append('return_proof', returnProof);
                      
                      const res = await api.patch(`/orders/${returnOrderId}/request_return/`, formData);
                      
                      // Update local state
                      setOrders(orders.map(o => 
                        o.id === returnOrderId ? { ...o, return_requested: true, return_reason: returnReason, return_proof: returnProof ? URL.createObjectURL(returnProof) : null } : o
                      ));
                      
                      showToast('Return/Replace request submitted successfully!', 'success');
                      setReturnOrderId(null);
                      setReturnReason('');
                      setReturnProof(null);
                    } catch (err) {
                      showToast('Failed to submit request', 'error');
                    }
                  }}
                  className="flex-1 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {supportOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Get Product Support</h3>
              <p className="text-slate-600 text-sm mb-6">
                For immediate assistance with Order #{supportOrderId}, please contact our admin support directly at:
              </p>
              <div className="bg-slate-50 py-3 px-4 rounded-xl mb-6">
                <p className="text-2xl font-bold text-slate-900 tracking-wide">+91 84389 26321</p>
              </div>
              <button 
                onClick={() => setSupportOrderId(null)}
                className="w-full py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
