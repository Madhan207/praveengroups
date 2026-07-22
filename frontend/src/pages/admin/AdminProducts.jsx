import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Search, X, ImagePlus, Package,
  AlertTriangle, CheckCircle, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/admin/SkeletonLoader';
import { getMediaUrl } from '../../utils/media';

const STEPS = ['Basic', 'Pricing', 'Images', 'Specs', 'Description', 'Settings'];

const EMPTY = {
  name: '', slug: '', category: '', brand: '', description: '',
  price: '', discount_price: '', stock: '0',
  sku: '', barcode: '', seo_title: '', seo_description: '',
  is_featured: false, is_best_seller: false, is_new_arrival: false,
  is_trending: false, trending_priority: 0,
  rating: '4.5',
  highlights: [], specifications: []
};

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Out of Stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{stock} Low</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">{stock} In Stock</span>;
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [bizFilter, setBizFilter] = useState('all');
  const [showModal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [imgFiles, setImgFiles] = useState([]);
  const [imgLabels, setImgLabels] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [formError, setFormError] = useState('');
  const [formLoading, setFL] = useState(false);
  const [selectedBizInModal, setSelectedBizInModal] = useState('');
  const [showQuickCatModal, setShowQuickCatModal] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatBiz, setQuickCatBiz] = useState('');
  const [quickCatLoading, setQuickCatLoading] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c, b] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/'),
        api.get('/businesses/')
      ]);
      setProducts(p.data.results || p.data);
      setCategories(c.data.results || c.data);
      const bizList = b.data.results || b.data;
      setBusinesses(bizList);
    } catch {
      toast('Failed to load products', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setSelectedBizInModal('');
    setForm({ ...EMPTY, sku: 'SKU-' + Date.now() });
    setStep(0); setImgFiles([]); setImgLabels([]);
    setExistingImages([]); setDeletedImageIds([]);
    setFormError(''); setModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    const catObj = categories.find(c => String(c.id) === String(p.category));
    setSelectedBizInModal(catObj ? String(catObj.business) : '');
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      category: String(p.category || ''),
      brand: p.brand || '',
      description: p.description || '',
      price: p.price || '',
      discount_price: p.discount_price || '',
      stock: p.stock !== undefined ? String(p.stock) : '0',
      rating: p.rating || '4.5',
      sku: p.sku || '',
      barcode: p.barcode || '',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      is_featured: !!p.is_featured,
      is_best_seller: !!p.is_best_seller,
      is_new_arrival: !!p.is_new_arrival,
      is_trending: !!p.is_trending,
      trending_priority: p.trending_priority || 0,
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      specifications: Array.isArray(p.specifications) && p.specifications.length > 0
        ? (p.specifications[0].attributes || [])
        : []
    });
    setExistingImages(p.images || []);
    setStep(0); setImgFiles([]); setImgLabels([]);
    setDeletedImageIds([]); setFormError(''); setModal(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFL(true); setFormError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'discount_price' && (v === '' || v === null)) return;
        if (k === 'specifications') {
          fd.append(k, JSON.stringify([{ group: 'Specifications', attributes: v }]));
        } else if (k === 'highlights') {
          fd.append(k, JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      imgFiles.forEach(file => fd.append('images', file));
      imgLabels.forEach(label => fd.append('image_labels', label));
      deletedImageIds.forEach(id => fd.append('deleted_image_ids', id));

      if (editItem) {
        await api.patch('/products/' + editItem.id + '/', fd);
        toast('Product updated!', 'success');
      } else {
        await api.post('/products/', fd);
        toast('Product added!', 'success');
      }
      setModal(false);
      fetchAll();
    } catch (err) {
      const d = err.response && err.response.data;
      if (d && typeof d === 'object') {
        const msgs = Object.entries(d).map(([k, v]) => k + ': ' + (Array.isArray(v) ? v.join(', ') : v)).join(' | ');
        setFormError(msgs);
      } else {
        setFormError('Failed to save. Check all required fields and try again.');
      }
    }
    setFL(false);
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm('Delete "' + name + '"?')) return;
    try { await api.delete('/products/' + id + '/'); fetchAll(); toast('Product deleted', 'warning'); }
    catch { toast('Delete failed', 'error'); }
  };

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { name: '', value: '' }] }));
  const updateSpec = (i, key, val) => setForm(f => {
    const s = [...f.specifications];
    s[i] = { ...s[i], [key]: val };
    return { ...f, specifications: s };
  });
  const removeSpec = (i) => setForm(f => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));
  const addHighlight = () => setForm(f => ({ ...f, highlights: [...f.highlights, ''] }));
  const updateHighlight = (i, val) => setForm(f => { const h = [...f.highlights]; h[i] = val; return { ...f, highlights: h }; });
  const removeHighlight = (i) => setForm(f => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (bizFilter !== 'all') {
      const allowed = categories.filter(c => String(c.business) === bizFilter).map(c => String(c.id));
      list = list.filter(p => allowed.includes(String(p.category)));
    }
    if (catFilter !== 'all') list = list.filter(p => String(p.category) === catFilter);
    return list;
  }, [products, search, catFilter, bizFilter, categories]);

  const catsByBiz = useMemo(() => {
    if (bizFilter !== 'all') return categories.filter(c => String(c.business) === bizFilter);
    return categories;
  }, [categories, bizFilter]);

  if (loading) return <SkeletonTable rows={6} cols={6} />;

  const IS = (k, placeholder) => (
    { value: form[k], onChange: e => setForm(f => ({ ...f, [k]: e.target.value }), placeholder) }
  );

  const inputStyle = { background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' };

  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Product Name *</label>
          <input required value={form.name} onChange={e => {
            const v = e.target.value;
            const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            setForm(f => ({ ...f, name: v, slug: editItem ? f.slug : slug }));
          }} className={inputCls} style={inputStyle} placeholder="e.g. Samsung 55-inch 4K Smart TV" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Business / Division (Optional Filter)</label>
          <select value={selectedBizInModal} onChange={e => {
            const bId = e.target.value;
            setSelectedBizInModal(bId);
            setForm(f => ({ ...f, category: '' }));
          }} className={inputCls} style={inputStyle}>
            <option value="">— All Businesses / Divisions —</option>
            {businesses.map(b => (
              <option key={b.id} value={String(b.id)}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--admin-text-muted)' }}>Category *</label>
            <button type="button" onClick={() => {
              setQuickCatBiz(selectedBizInModal || (businesses[0] ? String(businesses[0].id) : ''));
              setShowQuickCatModal(true);
            }} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Quick Add New Category
            </button>
          </div>
          <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle}>
            <option value="">— Select Category —</option>
            {categories
              .filter(c => !selectedBizInModal || String(c.business) === selectedBizInModal)
              .map(c => (
                <option key={c.id} value={String(c.id)}>
                  {(businesses.find(b => String(b.id) === String(c.business)) || {}).name || '?'} → {c.name}
                </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Brand</label>
            <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputCls} style={inputStyle} placeholder="e.g. Samsung" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>SKU / Item No.</label>
            <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Barcode (Optional)</label>
          <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className={inputCls} style={inputStyle} />
        </div>
      </div>
    );

    if (step === 1) return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Original Price (MRP) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls + " pl-7"} style={inputStyle} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Selling Price (After Discount)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} className={inputCls + " pl-7"} style={inputStyle} placeholder="0" />
            </div>
          </div>
        </div>
        {form.price && form.discount_price && Number(form.discount_price) > 0 && Number(form.discount_price) < Number(form.price) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-medium text-green-700">
            ✓ Discount: {Math.round((1 - Number(form.discount_price) / Number(form.price)) * 100)}% OFF — Customer saves ₹{(Number(form.price) - Number(form.discount_price)).toLocaleString('en-IN')}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Stock Quantity *</label>
            <input type="number" required value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputCls} style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Base Rating (0-5)</label>
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-5">
        <label htmlFor="prod-img-upload"
          className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-brand-400 hover:bg-brand-50/20"
          style={{ borderColor: 'var(--admin-border)' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            setImgFiles(prev => [...prev, ...files]);
            setImgLabels(prev => [...prev, ...files.map(() => '')]);
          }}>
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <ImagePlus className="w-7 h-7 text-brand-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800">Drag & Drop or Click to Upload</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG. Up to 20 images. First image = Main image.</p>
          </div>
          <input type="file" id="prod-img-upload" accept="image/*" multiple className="hidden" onChange={e => {
            const files = Array.from(e.target.files);
            setImgFiles(prev => [...prev, ...files]);
            setImgLabels(prev => [...prev, ...files.map(() => '')]);
          }} />
        </label>

        {imgFiles.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--admin-text-muted)' }}>New Images — {imgFiles.length}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {imgFiles.map((file, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
                  <div className="aspect-square relative group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      setImgFiles(prev => prev.filter((_, i) => i !== idx));
                      setImgLabels(prev => prev.filter((_, i) => i !== idx));
                    }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && <div className="absolute top-1.5 left-1.5 bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">MAIN</div>}
                  </div>
                  <input type="text" placeholder="Label (e.g. Front View)" value={imgLabels[idx] || ''} onChange={e => {
                    const nl = [...imgLabels]; nl[idx] = e.target.value; setImgLabels(nl);
                  }} className="text-[10px] px-2 py-1 border-t border-slate-100 outline-none w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {existingImages.filter(img => !deletedImageIds.includes(img.id)).length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--admin-text-muted)' }}>
              Existing Images — <span className="text-red-400 normal-case font-normal">hover to delete</span>
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {existingImages.filter(img => !deletedImageIds.includes(img.id)).map((img) => (
                <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                  <div className="aspect-square relative">
                    <img src={getMediaUrl(img.image_file || img.image)} alt="existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setDeletedImageIds(prev => [...prev, img.id])}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {img.is_primary && <div className="absolute top-1.5 left-1.5 bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PRIMARY</div>}
                  </div>
                  <p className="text-[10px] text-center text-slate-500 px-1 py-1 truncate">{img.label || 'No label'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    if (step === 3) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>Specifications</p>
          <button type="button" onClick={addSpec}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors border border-brand-200">
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>
        {form.specifications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--admin-border)' }}>
            <p className="text-sm text-slate-400 mb-3">No specifications added yet.</p>
            <button type="button" onClick={addSpec} className="text-sm font-bold text-brand-600 hover:underline">+ Add Specification</button>
          </div>
        ) : (
          <div className="space-y-2 p-3 border rounded-xl" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-card-bg)' }}>
            {form.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Field (e.g. Screen Size)" value={spec.name}
                  onChange={e => updateSpec(i, 'name', e.target.value)}
                  className="w-2/5 text-xs px-3 py-2.5 rounded-lg border outline-none focus:border-brand-500"
                  style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
                <input type="text" placeholder="Value (e.g. 6.7 inches)" value={spec.value}
                  onChange={e => updateSpec(i, 'value', e.target.value)}
                  className="flex-1 text-xs px-3 py-2.5 rounded-lg border outline-none focus:border-brand-500"
                  style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
                <button type="button" onClick={() => removeSpec(i)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    if (step === 4) return (
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Product Description</label>
          <textarea rows={6} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className={inputCls + " resize-y"} style={{ ...inputStyle, minHeight: '140px' }}
            placeholder="Describe the product in detail..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold" style={{ color: 'var(--admin-text-muted)' }}>Quick Highlights</label>
            <button type="button" onClick={addHighlight}
              className="text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 border border-brand-200 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {form.highlights.map((hl, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                <input value={hl} onChange={e => updateHighlight(i, e.target.value)}
                  placeholder="e.g. 5G Connectivity"
                  className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none"
                  style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
                <button type="button" onClick={() => removeHighlight(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.highlights.length === 0 && <p className="text-xs text-slate-400 italic">No highlights added.</p>}
          </div>
        </div>
      </div>
    );

    if (step === 5) return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'is_trending', label: 'Global Trending', emoji: '🔥', desc: 'Shows in homepage Trending Products' },
            { key: 'is_featured', label: 'Featured Product', emoji: '⭐', desc: 'Highlighted in category listing' },
            { key: 'is_best_seller', label: 'Best Seller', emoji: '🏆', desc: 'Shows Best Seller badge' },
            { key: 'is_new_arrival', label: 'New Arrival', emoji: '✨', desc: 'Shows New badge on card' },
          ].map(({ key, label, emoji, desc }) => (
            <label key={key} className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors"
              style={{ borderColor: form[key] ? '#818cf8' : 'var(--admin-border)', background: form[key] ? '#eef2ff' : 'var(--admin-card-bg)' }}>
              <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 mt-0.5" />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>{emoji} {label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>SEO Title</label>
          <input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} className={inputCls} style={inputStyle} placeholder="Leave blank to use product name" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>SEO Description</label>
          <textarea rows={3} value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} className={inputCls + " resize-none"} style={inputStyle} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Product Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            {filtered.length} products · {products.filter(p => p.stock === 0).length} out of stock
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2.5 rounded-xl border transition-all hover:border-brand-400 hover:text-brand-600"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="admin-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-brand-500"
            style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
        </div>
        <select value={bizFilter} onChange={e => { setBizFilter(e.target.value); setCatFilter('all'); }}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="all">All Businesses</option>
          {businesses.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="all">All Categories</option>
          {catsByBiz.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--admin-content-bg)' }}>
              <tr>
                {['Product', 'Business / Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--admin-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No products found.</td></tr>
              ) : filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-t hover:bg-slate-50/30 transition-colors" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                        {p.images && p.images[0] ? (
                          <img src={getMediaUrl(p.images[0].image_file || p.images[0].image)}
                            alt={p.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                      </div>
                      <div>
                        <div className="font-semibold line-clamp-1" style={{ color: 'var(--admin-text)' }}>{p.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{p.sku || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs font-bold" style={{ color: 'var(--admin-text)' }}>{p.business_name || '—'}</div>
                    <div className="text-xs text-slate-400">{p.category_name || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold" style={{ color: 'var(--admin-text)' }}>₹{Number(p.discount_price || p.price).toLocaleString('en-IN')}</div>
                    {p.discount_price && <div className="text-xs text-slate-400 line-through">₹{Number(p.price).toLocaleString('en-IN')}</div>}
                  </td>
                  <td className="px-5 py-3.5"><StockBadge stock={p.stock} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {p.is_trending && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">🔥 Trending</span>}
                      {p.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">⭐ Featured</span>}
                      {p.is_best_seller && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">🏆 Best</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg border transition-all hover:border-brand-400 hover:text-brand-600"
                        style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id, p.name)} className="p-2 rounded-lg border border-transparent text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-16"
              style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)' }}
              onClick={() => setModal(false)}>
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="w-full sm:max-w-4xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl"
                style={{ background: 'var(--admin-card-bg)' }}
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--admin-border)' }}>
                  <div>
                    <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--admin-text)' }}>
                      {editItem ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Step {step + 1}/{STEPS.length}: {STEPS[step]}</p>
                  </div>
                  <button onClick={() => setModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: 'var(--admin-text-muted)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex px-6 py-3 gap-1.5 shrink-0" style={{ background: 'var(--admin-content-bg)' }}>
                  {STEPS.map((s, i) => (
                    <div key={s} 
                         onClick={() => setStep(i)}
                         className="flex-1 flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className={'w-full h-1.5 rounded-full transition-colors ' + (i < step ? 'bg-green-500' : i === step ? 'bg-brand-500' : 'bg-slate-200')} />
                      <span className={'text-[9px] font-bold uppercase hidden sm:block ' + (i === step ? 'text-brand-600' : i < step ? 'text-green-600' : 'text-slate-400')}>{s}</span>
                    </div>
                  ))}
                </div>

                {formError && (
                  <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2 shrink-0">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                  <form id="product-wizard" onSubmit={handleSubmit}>
                    {renderStep()}
                  </form>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-content-bg)' }}>
                  <button type="button"
                    onClick={() => step > 0 ? setStep(s => s - 1) : setModal(false)}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors hover:bg-slate-50"
                    style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                    <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={() => {
                      if (step === 0 && (!form.name || !form.category)) return toast('Name & Category required', 'error');
                      if (step === 1 && !form.price) return toast('Price required', 'error');
                      setStep(s => s + 1);
                    }} className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-lg">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" form="product-wizard" onClick={handleSubmit} disabled={formLoading}
                      className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg disabled:opacity-60">
                      {formLoading ? <span className="animate-pulse">Saving…</span> : <><CheckCircle className="w-4 h-4" /> Save Product</>}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Quick Add Category Modal */}
      {createPortal(
        <AnimatePresence>
          {showQuickCatModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--admin-border)' }}>
                  <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--admin-text)' }}>Create New Category</h3>
                  <button type="button" onClick={() => setShowQuickCatModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!quickCatName.trim() || !quickCatBiz) return toast('Name and Business are required', 'error');
                  setQuickCatLoading(true);
                  try {
                    const slug = quickCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    const res = await api.post('/categories/', {
                      name: quickCatName.trim(),
                      slug: slug,
                      business: Number(quickCatBiz),
                      description: ''
                    });
                    const newCat = res.data;
                    toast(`Category "${newCat.name}" created!`, 'success');
                    const cRes = await api.get('/categories/');
                    setCategories(cRes.data.results || cRes.data);
                    setSelectedBizInModal(String(quickCatBiz));
                    setForm(f => ({ ...f, category: String(newCat.id) }));
                    setShowQuickCatModal(false);
                    setQuickCatName('');
                  } catch (err) {
                    toast(err.response?.data?.name?.[0] || 'Failed to create category', 'error');
                  } finally {
                    setQuickCatLoading(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Business / Division *</label>
                    <select required value={quickCatBiz} onChange={e => setQuickCatBiz(e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="">— Select Business —</option>
                      {businesses.map(b => (
                        <option key={b.id} value={String(b.id)}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>Category Name *</label>
                    <input required type="text" placeholder="e.g. Smart TVs" value={quickCatName} onChange={e => setQuickCatName(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                    <button type="button" onClick={() => setShowQuickCatModal(false)} className="px-4 py-2 text-sm font-semibold rounded-xl border" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={quickCatLoading} className="px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
                      {quickCatLoading ? 'Saving...' : 'Create & Select'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
