import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../../context/BusinessContext';
import { ShoppingCart, Plus, Search, Filter, Download, Briefcase, Calendar, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const authHeaders = () => ({ headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` } });

const AdminPurchase = () => {
  const { selectedBusiness, activeBusinessObj, loading } = useBusinessContext();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    po_number: '',
    supplier: '',
    total_amount: '',
    expected_delivery_date: '',
    status: 'Draft'
  });

  const fetchData = async () => {
    try {
      let url = `${API}/purchase-orders/`;
      if (selectedBusiness !== 'all') {
        url += `?business=${selectedBusiness}`;
      }
      const [poRes, supRes] = await Promise.all([
        axios.get(url, authHeaders()),
        axios.get(`${API}/suppliers/`, authHeaders())
      ]);
      setPurchases(poRes.data.results || poRes.data);
      setSuppliers(supRes.data.results || supRes.data);
    } catch (err) {
      console.error(err);
      toast('Failed to load purchase orders', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBusiness]);

  const handleNewPO = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const submitPO = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.supplier) delete dataToSubmit.supplier; // handle empty string for FK
      if (activeBusinessObj && activeBusinessObj.id) {
          dataToSubmit.business = activeBusinessObj.id;
      }
      await axios.post(`${API}/purchase-orders/`, dataToSubmit, authHeaders());
      toast('Purchase order created!', 'success');
      setIsModalOpen(false);
      setFormData({ po_number: '', supplier: '', total_amount: '', expected_delivery_date: '', status: 'Draft' });
      fetchData();
    } catch (err) {
      toast('Failed to create purchase order', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (selectedBusiness !== 'all' && activeBusinessObj && activeBusinessObj.type !== 'product') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No Purchase Management</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Service, Trust, and Logistics businesses do not manage physical product purchases in this module.
        </p>
      </div>
    );
  }

  const filteredPurchases = purchases.filter(p => 
    p.po_number.toLowerCase().includes(search.toLowerCase()) || 
    (p.supplier_name && p.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Purchase Orders</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            Viewing POs for: <span className="font-semibold">{selectedBusiness === 'all' ? 'All Product Businesses' : activeBusinessObj?.name}</span>
          </p>
        </div>
        <button onClick={handleNewPO} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors shadow">
          <Plus className="w-4 h-4" /> Create PO
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by PO ID, Supplier..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-content-bg)' }}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 font-medium" style={{ borderColor: 'var(--admin-border)' }}>
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 font-medium" style={{ borderColor: 'var(--admin-border)' }}>
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--admin-content-bg)' }}>
              <tr>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">PO Number</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Date</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Supplier</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Items</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Total Value</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((po) => (
                <tr key={po.id} className="border-t hover:bg-slate-50" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3.5 font-bold text-brand-600">{po.po_number}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-IN') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{po.supplier_name || 'Unknown'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{po.items ? po.items.length : 0} items</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">₹{Number(po.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${po.status === 'Received' ? 'bg-green-100 text-green-700' : po.status === 'Draft' ? 'bg-slate-100 text-slate-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg text-slate-800">Create Purchase Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitPO} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">PO Number</label>
                <input required value={formData.po_number} onChange={e => setFormData({...formData, po_number: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. PO-1001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Amount (₹)</label>
                <input required type="number" step="0.01" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
                <input type="date" value={formData.expected_delivery_date} onChange={e => setFormData({...formData, expected_delivery_date: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl hover:bg-brand-700 transition-colors">Save PO</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPurchase;
