import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Briefcase, Image as ImageIcon, Users, MessageSquare, Plus, Edit2,
  Trash2, Calendar, Star, X, CheckCircle, XCircle, Eye, Mail,
  ChevronDown, Loader2, RefreshCw, Send, ArrowRight, MessageCircle, Phone
} from 'lucide-react';
import { SkeletonTable } from '../../components/admin/SkeletonLoader';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const getHeaders = () => {
  const token = sessionStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TIERS = ['Bronze', 'Silver', 'Gold', 'Premium', 'Luxury', 'Custom'];
const STATUS_COLORS = {
  Pending:   'bg-amber-100 text-amber-700',
  Replied:   'bg-blue-100 text-blue-700',
  Approved:  'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
  Converted: 'bg-purple-100 text-purple-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  'In Progress': 'bg-indigo-100 text-indigo-700',
};

// ── Generic Modal ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = 'max-w-xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${size} my-8`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Input helpers ──────────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-800 text-sm';
const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

// ── Packages Tab ───────────────────────────────────────────────────────────────
function PackagesTab({ businessId }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', tier: 'Gold', price: '', badge: '', duration: '', features: '', is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/service-packages/${query}`, { headers: getHeaders() });
      setPackages(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', tier: 'Gold', price: '', badge: '', duration: '', features: '', is_active: true });
    setImageFile(null);
    setModalOpen(true);
  };
  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg.name, tier: pkg.tier, price: pkg.price, badge: pkg.badge || '',
      duration: pkg.duration || '', features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      is_active: pkg.is_active,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('business', businessId);
      fd.append('name', form.name);
      fd.append('tier', form.tier);
      fd.append('price', form.price);
      fd.append('badge', form.badge);
      fd.append('duration', form.duration);
      fd.append('is_active', form.is_active ? 'true' : 'false');
      const featuresArr = form.features.split('\n').map(f => f.trim()).filter(Boolean);
      fd.append('features', JSON.stringify(featuresArr));
      if (imageFile) fd.append('image_file', imageFile);

      if (editing) {
        await axios.patch(`${API}/service-packages/${editing.id}/`, fd, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/service-packages/`, fd, { headers: getHeaders() });
      }
      setModalOpen(false);
      fetch();
    } catch (e) { alert('Save failed: ' + JSON.stringify(e.response?.data)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this package?')) return;
    await axios.delete(`${API}/service-packages/${id}/`, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        packages.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No packages yet. Add your first package!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className={`rounded-2xl border p-5 ${pkg.is_active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-600">{pkg.tier}</span>
                      {businessId === 'all' && pkg.business_name && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{pkg.business_name}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{pkg.name}</h4>
                    <div className="text-2xl font-extrabold text-brand-600">
                      ₹{parseFloat(pkg.price).toLocaleString('en-IN')}
                    </div>
                    {pkg.badge && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">{pkg.badge}</span>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(pkg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <ul className="space-y-1">
                  {(pkg.features || []).slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                  {(pkg.features || []).length > 4 && <li className="text-xs text-slate-400">+{pkg.features.length - 4} more features</li>}
                </ul>
                {!pkg.is_active && <div className="mt-3 text-xs text-red-500 font-semibold">● Disabled</div>}
              </div>
            ))}
          </div>
        )
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Package' : 'Add Package'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Package Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Silver Sound" />
              </div>
              <div>
                <label className={labelCls}>Tier</label>
                <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))} className={inputCls}>
                  {TIERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={inputCls} placeholder="25000" />
              </div>
              <div>
                <label className={labelCls}>Duration</label>
                <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className={inputCls} placeholder="e.g. Per Event, 8 Hours" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Badge Label</label>
              <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} className={inputCls} placeholder="e.g. Best Value, Popular" />
            </div>
            <div>
              <label className={labelCls}>Features (one per line)</label>
              <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} rows={6} className={inputCls + ' resize-none'} placeholder={"LED Lights Setup\nWireless Mic\nSetup & Teardown\n..."} />
            </div>
            <div>
              <label className={labelCls}>Package Image</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold hover:file:bg-brand-100" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
              <span className="text-sm font-semibold text-slate-700">Active (visible on website)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {saving ? 'Saving...' : 'Save Package'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Gallery Tab ────────────────────────────────────────────────────────────────
function GalleryTab({ businessId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ caption: '', category: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/gallery-images/${query}`, { headers: getHeaders() });
      setImages(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('business', businessId);
      if (imageFile) fd.append('image_file', imageFile);
      else if (form.image_url) fd.append('image_url', form.image_url);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      await axios.post(`${API}/gallery-images/`, fd, { headers: getHeaders() });
      setForm({ caption: '', category: '', image_url: '' });
      setImageFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetch();
    } catch (e) { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    await axios.delete(`${API}/gallery-images/${id}/`, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-brand-600" /> Add New Image</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelCls}>Upload File</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold hover:file:bg-brand-100" />
          </div>
          <div>
            <label className={labelCls}>Caption</label>
            <input value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} className={inputCls} placeholder="e.g. Wedding at Grand Ballroom" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="e.g. Wedding, Corporate" />
          </div>
        </div>
        <button type="submit" disabled={uploading || (!imageFile && !form.image_url) || businessId === 'all'} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Upload Image
        </button>
        {businessId === 'all' && <p className="text-xs text-red-500 mt-2 font-semibold">Please select a specific business to upload images.</p>}
      </form>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        images.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Gallery is empty. Upload your first image!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-100">
                <img src={img.image} alt={img.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-300 flex items-end">
                  <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    {businessId === 'all' && img.business_name && (
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold mb-1 inline-block">{img.business_name}</span>
                    )}
                    <p className="text-white text-xs font-medium truncate mb-2">{img.caption || 'Untitled'}</p>
                    <button onClick={() => handleDelete(img.id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg font-semibold">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Testimonials Tab ───────────────────────────────────────────────────────────
function TestimonialsTab({ businessId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', comment: '', rating: 5, is_approved: false });

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/testimonials/${query}`, { headers: getHeaders() });
      setItems(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const openAdd = () => { setEditing(null); setForm({ name: '', role: '', comment: '', rating: 5, is_approved: false }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, role: item.role || '', comment: item.comment, rating: item.rating, is_approved: item.is_approved }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { business: businessId, ...form };
      if (editing) await axios.patch(`${API}/testimonials/${editing.id}/`, payload, { headers: getHeaders() });
      else await axios.post(`${API}/testimonials/`, payload, { headers: getHeaders() });
      setModalOpen(false); fetch();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const toggleApprove = async (item) => {
    const url = item.is_approved ? `${API}/testimonials/${item.id}/unapprove/` : `${API}/testimonials/${item.id}/approve/`;
    await axios.post(url, {}, { headers: getHeaders() });
    fetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await axios.delete(`${API}/testimonials/${id}/`, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {businessId === 'all' ? <p className="text-sm text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">Select a specific business to add testimonials.</p> : <div></div>}
        <button onClick={openAdd} disabled={businessId === 'all'} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="overflow-x-auto border rounded-xl border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Client', 'Role', 'Rating', 'Review', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {item.name}
                    {businessId === 'all' && item.business_name && <div className="text-[10px] text-slate-400 font-normal">{item.business_name}</div>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{item.role || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{item.comment}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleApprove(item)} title={item.is_approved ? 'Unapprove' : 'Approve'} className={`p-1.5 rounded-lg ${item.is_approved ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                        {item.is_approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Testimonial' : 'Add Testimonial'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Client Name *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
              <div><label className={labelCls}>Role / Occasion</label><input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls} placeholder="e.g. Bride, HR Manager" /></div>
            </div>
            <div>
              <label className={labelCls}>Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}>
                    <Star className={`w-7 h-7 ${s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div><label className={labelCls}>Review *</label><textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} rows={4} className={inputCls + ' resize-none'} /></div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_approved} onChange={e => setForm(p => ({ ...p, is_approved: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
              <span className="text-sm font-semibold text-slate-700">Approved (visible on website)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FAQs Tab ───────────────────────────────────────────────────────────────────
function FAQsTab({ businessId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', order: 0, is_active: true });

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/faqs/${query}`, { headers: getHeaders() });
      setItems(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const openAdd = () => { setEditing(null); setForm({ question: '', answer: '', order: items.length, is_active: true }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ question: item.question, answer: item.answer, order: item.order, is_active: item.is_active }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { business: businessId, ...form };
      if (editing) await axios.patch(`${API}/faqs/${editing.id}/`, payload, { headers: getHeaders() });
      else await axios.post(`${API}/faqs/`, payload, { headers: getHeaders() });
      setModalOpen(false); fetch();
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    await axios.delete(`${API}/faqs/${id}/`, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {businessId === 'all' ? <p className="text-sm text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">Select a specific business to add FAQs.</p> : <div></div>}
        <button onClick={openAdd} disabled={businessId === 'all'} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`rounded-2xl border p-5 ${item.is_active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-slate-900">Q: {item.question}</p>
                    {businessId === 'all' && item.business_name && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{item.business_name}</span>}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">A: {item.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-slate-400">Order: {item.order}</span>
                <span className={`text-xs font-semibold ${item.is_active ? 'text-green-600' : 'text-red-500'}`}>
                  {item.is_active ? '● Active' : '● Hidden'}
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
              <p className="text-slate-500 font-medium">No FAQs yet.</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit FAQ' : 'Add FAQ'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Question *</label><input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Answer *</label><textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={4} className={inputCls + ' resize-none'} /></div>
            <div><label className={labelCls}>Display Order</label><input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className={inputCls} /></div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded accent-brand-600" />
              <span className="text-sm font-semibold text-slate-700">Active (visible on website)</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Availability Tab ───────────────────────────────────────────────────────────
function AvailabilityTab({ businessId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', is_available: true, title: '', note: '' });
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/availability/${query}`, { headers: getHeaders() });
      setSlots(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API}/availability/`, { business: businessId, ...form }, { headers: getHeaders() });
      setForm({ date: '', is_available: true, title: '', note: '' });
      fetch();
    } catch (err) {
      // If date already exists, try patch
      const existing = slots.find(s => s.date === form.date);
      if (existing) {
        await axios.patch(`${API}/availability/${existing.id}/`, { ...form, business: businessId }, { headers: getHeaders() });
        fetch();
      } else {
        alert('Failed: ' + JSON.stringify(err.response?.data));
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/availability/${id}/`, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4">Add / Update Date Availability</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.is_available ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, is_available: e.target.value === 'true' }))} className={inputCls}>
              <option value="true">Available</option>
              <option value="false">Booked / Unavailable</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Label</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. Wedding Booked" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving || businessId === 'all'} className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Add / Update'}
            </button>
          </div>
        </div>
        {businessId === 'all' && <p className="text-xs text-red-500 font-semibold mt-1">Please select a specific business to manage availability.</p>}
      </form>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="overflow-x-auto border rounded-xl border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Date', 'Status', 'Label', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{slot.date}</p>
                    {businessId === 'all' && slot.business_name && <p className="text-[10px] text-slate-400">{slot.business_name}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${slot.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {slot.is_available ? 'Available' : 'Booked'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{slot.title || '—'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(slot.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">No availability slots set.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Bookings Tab ───────────────────────────────────────────────────────────────
function BookingsTab({ businessId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/bookings/${query}`, { headers: getHeaders() });
      setBookings(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/bookings/${id}/`, { status }, { headers: getHeaders() });
      fetch();
    } catch { alert('Failed to update status'); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={fetch} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="overflow-x-auto border rounded-xl border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Booking ID', 'Customer', 'Event', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-brand-600 font-bold text-xs">{b.booking_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{b.customer_name || b.name}</p>
                    <p className="text-xs text-slate-400">{b.customer_email || b.email}</p>
                    {b.phone && <p className="text-xs text-slate-400">{b.phone}</p>}
                    {businessId === 'all' && b.business_name && <p className="text-[10px] bg-slate-100 text-slate-500 inline-block px-1.5 py-0.5 rounded mt-1">{b.business_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{b.service_name || b.package_name || 'General'}</p>
                    <p className="text-xs text-slate-400">{b.event_type}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{b.booking_date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">₹{parseFloat(b.total_amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={e => updateStatus(b.id, e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-brand-500"
                    >
                      {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Quotes Tab ─────────────────────────────────────────────────────────────────
function QuotesTab({ businessId }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/quote-requests/${query}`, { headers: getHeaders() });
      setQuotes(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const handleAction = async (id, action, extra = {}) => {
    try {
      await axios.post(`${API}/quote-requests/${id}/${action}/`, extra, { headers: getHeaders() });
      fetch();
    } catch { alert('Action failed'); }
  };

  const sendReply = async () => {
    setSending(true);
    await handleAction(replyModal.id, 'reply', { reply_text: replyText });
    setReplyModal(null); setReplyText('');
    setSending(false);
  };

  return (
    <div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="space-y-4">
          {quotes.map(q => (
            <div key={q.id} className={`rounded-2xl border p-5 ${!q.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-bold text-slate-900 text-lg">{q.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[q.status] || 'bg-slate-100 text-slate-600'}`}>{q.status}</span>
                    {!q.is_read && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">New</span>}
                    {businessId === 'all' && q.business_name && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{q.business_name}</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600 mb-3">
                    <div><Phone className="w-3.5 h-3.5 inline mr-1" />{q.phone}</div>
                    {q.email && <div><Mail className="w-3.5 h-3.5 inline mr-1" />{q.email}</div>}
                    {q.event_type && <div><Briefcase className="w-3.5 h-3.5 inline mr-1" />{q.event_type}</div>}
                    {q.event_date && <div><Calendar className="w-3.5 h-3.5 inline mr-1" />{q.event_date}</div>}
                    {q.budget && <div>Budget: {q.budget}</div>}
                    {q.guest_count && <div><Users className="w-3.5 h-3.5 inline mr-1" />{q.guest_count} guests</div>}
                    {q.event_location && <div>📍 {q.event_location}</div>}
                  </div>
                  {q.special_requirements && <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 mb-3">{q.special_requirements}</p>}
                  {q.reply_text && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                      <strong>Your Reply:</strong> {q.reply_text}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => { setReplyModal(q); setReplyText(q.reply_text || ''); }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700">
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                  {q.status === 'Pending' || q.status === 'Replied' ? (
                    <>
                      <button onClick={() => handleAction(q.id, 'approve')} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleAction(q.id, 'reject')} className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : null}
                  {q.status === 'Approved' && !q.booking && (
                    <button onClick={() => handleAction(q.id, 'convert-to-booking', { booking_date: q.event_date })} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700">
                      <ArrowRight className="w-3.5 h-3.5" /> Convert to Booking
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2">{new Date(q.created_at).toLocaleString()}</div>
            </div>
          ))}
          {quotes.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No quote requests yet.</p>
            </div>
          )}
        </div>
      )}

      {replyModal && (
        <Modal title={`Reply to ${replyModal.name}`} onClose={() => setReplyModal(null)}>
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <strong>{replyModal.name}</strong> • {replyModal.event_type} • {replyModal.event_date}<br />
              Budget: {replyModal.budget} • {replyModal.guest_count} guests
            </div>
            <div>
              <label className={labelCls}>Your Reply</label>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={5} className={inputCls + ' resize-none'} placeholder="Type your reply to the client..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setReplyModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm">Cancel</button>
              <button onClick={sendReply} disabled={sending} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Contact Inquiries Tab ──────────────────────────────────────────────────────
function ContactsTab({ businessId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/contact-inquiries/${query}`, { headers: getHeaders() });
      setItems(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [businessId]);

  const markRead = async (id) => {
    await axios.post(`${API}/contact-inquiries/${id}/mark-read/`, {}, { headers: getHeaders() });
    fetch();
  };

  return (
    <div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div> : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`rounded-2xl border p-5 ${!item.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {!item.is_read && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">New</span>}
                    {businessId === 'all' && item.business_name && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{item.business_name}</span>}
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500 mb-3 flex-wrap">
                    {item.phone && <span><Phone className="w-3.5 h-3.5 inline mr-1" />{item.phone}</span>}
                    {item.email && <span><Mail className="w-3.5 h-3.5 inline mr-1" />{item.email}</span>}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{item.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {item.email && (
                    <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700">
                      <Mail className="w-3.5 h-3.5" /> Reply
                    </a>
                  )}
                  {!item.is_read && (
                    <button onClick={() => markRead(item.id)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50">
                      <Eye className="w-3.5 h-3.5" /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No contact inquiries yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminServiceManagement = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/businesses/`, { headers: getHeaders() })
      .then(res => {
        const list = res.data.results || res.data;
        setBusinesses(list.filter(b => b.type === 'service'));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonTable rows={5} cols={4} />;

  const tabs = [
    { id: 'packages',      label: 'Packages',     icon: Star },
    { id: 'gallery',       label: 'Gallery',       icon: ImageIcon },
    { id: 'testimonials',  label: 'Testimonials',  icon: MessageSquare },
    { id: 'faqs',          label: 'FAQs',          icon: Briefcase },
    { id: 'availability',  label: 'Availability',  icon: Calendar },
    { id: 'bookings',      label: 'Bookings',      icon: Calendar },
    { id: 'quotes',        label: 'Quotes',        icon: MessageCircle },
    { id: 'contacts',      label: 'Contacts',      icon: Mail },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Service Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Manage service packages, bookings, and inquiries</p>
        </div>
        <select 
          value={selectedBiz} 
          onChange={e => setSelectedBiz(e.target.value)}
          className="px-4 py-2 border rounded-xl bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 min-w-48"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
        >
          <option value="all">All Service Businesses</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--admin-border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? 'text-brand-600 border-brand-600 bg-brand-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card p-6 min-h-[400px]">
        {activeTab === 'packages'     && <PackagesTab     businessId={selectedBiz} />}
        {activeTab === 'gallery'      && <GalleryTab      businessId={selectedBiz} />}
        {activeTab === 'testimonials' && <TestimonialsTab businessId={selectedBiz} />}
        {activeTab === 'faqs'         && <FAQsTab         businessId={selectedBiz} />}
        {activeTab === 'availability' && <AvailabilityTab businessId={selectedBiz} />}
        {activeTab === 'bookings'     && <BookingsTab     businessId={selectedBiz} />}
        {activeTab === 'quotes'       && <QuotesTab       businessId={selectedBiz} />}
        {activeTab === 'contacts'     && <ContactsTab     businessId={selectedBiz} />}
      </div>
    </div>
  );
};

export default AdminServiceManagement;
