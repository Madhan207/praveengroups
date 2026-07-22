import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Loader2, Image as ImageIcon, X,
  CheckCircle2, Globe, Building2, Star, UploadCloud, Eye, EyeOff,
  Layers, Sparkles
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const EMPTY_FORM = { title: '', subtitle: '', business: '', position: 'HERO', priority: 0, is_active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchBanners();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API}/banners/`);
      setBanners(res.data.results || res.data);
    } catch (e) {
      console.error('Failed to fetch banners', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get(`${API}/businesses/`);
      setBusinesses(res.data.results || res.data);
    } catch (e) {
      console.error('Failed to fetch businesses', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await axios.delete(`${API}/banners/${id}/`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` },
      });
      fetchBanners();
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  const openForm = (banner = null) => {
    setEditingBanner(banner);
    setFormData(banner
      ? { title: banner.title || '', subtitle: banner.subtitle || '', business: banner.business || '', position: banner.position || 'HERO', priority: banner.priority || 0, is_active: banner.is_active }
      : EMPTY_FORM
    );
    setImageFile(null);
    setImagePreview(banner ? (banner.image || banner.image_file || null) : null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('business', formData.business || '');
    data.append('position', formData.position);
    data.append('priority', formData.priority);
    data.append('is_active', formData.is_active);
    if (imageFile) data.append('image_file', imageFile);

    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` };
      if (editingBanner) {
        await axios.patch(`${API}/banners/${editingBanner.id}/`, data, { headers });
      } else {
        await axios.post(`${API}/banners/`, data, { headers });
      }
      await fetchBanners();
      closeForm();
    } catch (e) {
      console.error('Failed to save banner', e);
      alert('Failed to save banner. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const bizName = (id) => businesses.find(b => b.id === id)?.name || 'Specific Business';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
            <Loader2 className="w-3.5 h-3.5 text-brand-500 animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Loading banners…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────── */}
      <div
        ref={formRef}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, var(--admin-card-bg, #1e293b) 0%, rgba(99,102,241,0.12) 100%)',
          border: '1px solid var(--admin-border)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--admin-text)' }}>
                Banner Management
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
                {banners.length} banner{banners.length !== 1 ? 's' : ''} · Global &amp; business-specific
              </p>
            </div>
          </div>

          <button
            onClick={() => showForm ? closeForm() : openForm()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-200 ${
              showForm
                ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                : 'bg-gradient-to-r from-brand-500 to-purple-600 text-white hover:from-brand-600 hover:to-purple-700 hover:shadow-brand-500/30 hover:shadow-lg'
            }`}
          >
            {showForm
              ? <><X className="w-4 h-4" /> Discard</>
              : <><Plus className="w-4 h-4" /> New Banner</>
            }
          </button>
        </div>
      </div>

      {/* ── Inline Form Panel ───────────────────────── */}
      {showForm && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid var(--admin-border)',
            background: 'var(--admin-card-bg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Form header stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

          <div className="p-6">
            <h2 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
              {editingBanner
                ? <><Edit2 className="w-4 h-4 text-brand-500" /> Edit Banner</>
                : <><Plus className="w-4 h-4 text-brand-500" /> Create New Banner</>
              }
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left column: Image upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--admin-text-muted)' }}>
                    Banner Image
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`relative cursor-pointer rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all duration-200 ${
                      dragOver ? 'border-brand-500 bg-brand-500/5 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/5'
                    }`}
                    style={{ height: '200px' }}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <UploadCloud className="w-8 h-8 text-white mb-1" />
                          <span className="text-white text-xs font-semibold">Click to change</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                          Drag & drop or <span className="text-brand-500 font-bold">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400">PNG, JPG, WEBP · Max 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Right column: Fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Summer Sale 2025"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/40"
                      style={{
                        background: 'var(--admin-content-bg, #f8fafc)',
                        border: '1.5px solid var(--admin-border)',
                        color: 'var(--admin-text)',
                      }}
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Up to 50% off on all electronics"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/40"
                      style={{
                        background: 'var(--admin-content-bg, #f8fafc)',
                        border: '1.5px solid var(--admin-border)',
                        color: 'var(--admin-text)',
                      }}
                    />
                  </div>

                  {/* Target + Position + Priority row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                        Target
                      </label>
                      <select
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/40"
                        style={{
                          background: 'var(--admin-content-bg, #f8fafc)',
                          border: '1.5px solid var(--admin-border)',
                          color: 'var(--admin-text)',
                        }}
                      >
                        <option value="">🌐 Global</option>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>🏢 {b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                        Position
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/40"
                        style={{
                          background: 'var(--admin-content-bg, #f8fafc)',
                          border: '1.5px solid var(--admin-border)',
                          color: 'var(--admin-text)',
                        }}
                      >
                        <option value="HERO">Hero Banner</option>
                        <option value="DISCOUNT">Discount Poster</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--admin-text-muted)' }}>
                        Priority
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-brand-500/40"
                        style={{
                          background: 'var(--admin-content-bg, #f8fafc)',
                          border: '1.5px solid var(--admin-border)',
                          color: 'var(--admin-text)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                        formData.is_active ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${
                        formData.is_active ? 'left-5' : 'left-0.5'
                      }`} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                      {formData.is_active ? 'Active — visible to users' : 'Inactive — hidden from users'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border hover:opacity-80"
                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : <><CheckCircle2 className="w-4 h-4" /> {editingBanner ? 'Update Banner' : 'Create Banner'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Banner Cards Grid ────────────────────────── */}
      {banners.length === 0 ? (
        <div className="admin-card rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--admin-text)' }}>No banners yet</p>
            <p className="text-sm mt-1 text-slate-400">Click <strong>New Banner</strong> above to create your first one.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ border: '1px solid var(--admin-border)', background: 'var(--admin-card-bg)' }}
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                {banner.image || banner.image_file ? (
                  <img
                    src={banner.image || banner.image_file}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 w-max ${
                    banner.position === 'DISCOUNT' ? 'bg-orange-500/90 text-white' : 'bg-blue-500/90 text-white'
                  }`}>
                    {banner.position === 'DISCOUNT' ? 'Discount Poster' : 'Hero Banner'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 w-max ${
                    banner.is_active
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-slate-700/80 text-slate-300'
                  }`}>
                    {banner.is_active ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    {banner.is_active ? 'Live' : 'Hidden'}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 bg-black/50 text-white">
                    <Star className="w-2.5 h-2.5 text-yellow-400" />
                    {banner.priority}
                  </span>
                </div>

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openForm(banner)}
                    className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-brand-600 shadow-md hover:shadow-lg transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-red-500 shadow-md hover:shadow-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-bold text-sm truncate" style={{ color: 'var(--admin-text)' }}>
                  {banner.title || <span className="italic text-slate-400">Untitled Banner</span>}
                </h3>
                {banner.subtitle && (
                  <p className="text-xs mt-0.5 truncate text-slate-400">{banner.subtitle}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    banner.business
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {banner.business
                      ? <><Building2 className="w-3 h-3" />{bizName(banner.business)}</>
                      : <><Globe className="w-3 h-3" />Global</>
                    }
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openForm(banner)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
