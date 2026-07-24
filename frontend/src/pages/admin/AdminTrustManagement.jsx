import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HeartHandshake, Image as ImageIcon, Users, Calendar, Plus, Edit2, Trash2, Heart, MessageSquare, Loader2 } from 'lucide-react';
import { SkeletonTable } from '../../components/admin/SkeletonLoader';
import { getMediaUrl } from '../../utils/media';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');
const getHeaders = () => {
  const token = sessionStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function GalleryTab({ businessId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ caption: '', category: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ caption: '', category: '' });
  const fileRef = React.useRef();

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
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : 'Upload failed';
      alert(`Upload Error: ${msg}`);
    }
    finally { setUploading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API}/gallery-images/${editingId}/`, editForm, { headers: getHeaders() });
      setEditingId(null);
      fetch();
    } catch (e) {
      alert('Failed to update image details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    await axios.delete(`${API}/gallery-images/${id}/`, { headers: getHeaders() });
    fetch();
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-sm';
  const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

  return (
    <div>
      <form onSubmit={handleUpload} className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-brand-600" /> Add New Image</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Upload File</label>
            <input type="file" accept="image/*" ref={fileRef} onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold hover:file:bg-brand-100" />
          </div>
          <div>
            <label className={labelCls}>Or Image URL</label>
            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className={inputCls} placeholder="https://example.com/img.jpg" disabled={!!imageFile} />
          </div>
          <div>
            <label className={labelCls}>Caption</label>
            <input value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} className={inputCls} placeholder="e.g. Activity Photo" />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="e.g. Events, Campus" />
          </div>
        </div>
        <button type="submit" disabled={uploading || (!imageFile && !form.image_url) || businessId === 'all'} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Upload Image
        </button>
        {businessId === 'all' && <p className="text-xs text-red-500 mt-2 font-semibold">Please select a specific trust to upload images.</p>}
      </form>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div> : (
        images.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Gallery is empty. Upload your first image!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-100 bg-white">
                <img src={img.image} alt={img.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-300 flex items-end">
                  <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    {businessId === 'all' && img.business_name && (
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold mb-1 inline-block">{img.business_name}</span>
                    )}
                    <p className="text-white text-xs font-medium truncate mb-2">{img.caption || 'Untitled'}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        setEditingId(img.id);
                        setEditForm({ caption: img.caption || '', category: img.category || '' });
                      }} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-lg font-semibold flex-1 justify-center">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(img.id)} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg font-semibold flex-1 justify-center">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Gallery Image</h3>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className={labelCls}>Caption</label>
                  <input value={editForm.caption} onChange={e => setEditForm(p => ({ ...p, caption: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function VolunteersTab({ businessId }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const query = businessId !== 'all' ? `?business=${businessId}` : '';
      const res = await axios.get(`${API}/volunteer-registrations/${query}`, { headers: getHeaders() });
      setVolunteers(res.data.results || res.data);
    } catch { } finally { setLoading(false); }
  };
  
  useEffect(() => { fetchVolunteers(); }, [businessId]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/volunteer-registrations/${id}/update-status/`, { status }, { headers: getHeaders() });
      fetchVolunteers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : volunteers.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No volunteer applications found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Applicant</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Contact</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Area of Interest</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Message</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-right text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-t hover:bg-slate-50 border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {v.name}
                    {businessId === 'all' && v.business_name && (
                      <div className="text-[10px] text-slate-400 font-normal">{v.business_name}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <div>{v.email}</div>
                    <div className="text-xs text-slate-400">{v.phone}</div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{v.area_of_interest}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs max-w-xs">{v.message || '-'}</td>
                  <td className="px-5 py-3">
                    <select
                      value={v.status}
                      onChange={(e) => updateStatus(v.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                        v.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        v.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500 text-xs">{new Date(v.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const AdminTrustManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBizId, setSelectedBizId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programs');
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    axios.get(`${API}/businesses/`, { headers: getHeaders() })
      .then(res => {
        const list = res.data.results || res.data;
        setBusinesses(list.filter(b => b.type === 'trust'));
        if (list.filter(b => b.type === 'trust').length > 0) {
          setSelectedBizId(list.filter(b => b.type === 'trust')[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'donations' && selectedBizId && selectedBizId !== 'all') {
      axios.get(`${API}/donations/?business=${selectedBizId}`, { headers: getHeaders() })
        .then(res => setDonations(res.data.results || res.data))
        .catch(console.error);
    }
  }, [activeTab, selectedBizId]);

  const updateDonationStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API}/donations/${id}/`, { status: newStatus }, { headers: getHeaders() });
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch (err) {
      console.error('Failed to update donation status:', err);
      alert('Failed to update donation status');
    }
  };

  if (loading) return <SkeletonTable rows={5} cols={4} />;

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <HeartHandshake className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">No Trust Organizations Found</h2>
        <p className="text-slate-500 mt-2">Create a trust business first to manage programs and events.</p>
      </div>
    );
  }

  const activeBusinessObj = businesses.find(b => String(b.id) === String(selectedBizId)) || businesses[0];

  const tabs = [
    { id: 'programs', label: 'Programs', icon: HeartHandshake },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'team', label: 'Board Members', icon: Users },
    { id: 'testimonials', label: 'Impact Stories', icon: MessageSquare },
  ];

  const renderDataTab = (dataArray, columns, emptyMsg) => {
    if (!dataArray || dataArray.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-slate-500">{emptyMsg}</p>
          <button className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700">
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>
      );
    }
    return (
      <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'var(--admin-border)' }}>
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'var(--admin-content-bg)' }}>
            <tr>
              {columns.map(c => <th key={c.key} className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">{c.label}</th>)}
              <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-right text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item, i) => (
              <tr key={i} className="border-t hover:bg-slate-50" style={{ borderColor: 'var(--admin-border)' }}>
                {columns.map(c => (
                  <td key={c.key} className="px-5 py-3">
                    {c.isImage && item[c.key] ? (
                      <img src={item[c.key]} alt="thumbnail" className="w-10 h-10 rounded object-cover border" />
                    ) : c.isDate ? (
                      <span className="text-slate-600">{new Date(item[c.key]).toLocaleDateString()}</span>
                    ) : (
                      <span className="font-medium text-slate-700">{item[c.key] || '-'}</span>
                    )}
                  </td>
                ))}
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Trust Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Managing content for {activeBusinessObj?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedBizId} 
            onChange={e => setSelectedBizId(e.target.value)}
            className="px-4 py-2 border rounded-xl bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 min-w-48"
            style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
          >
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {!['donations', 'volunteers'].includes(activeTab) && (
            <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow">
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b" style={{ borderColor: 'var(--admin-border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === t.id 
                ? 'text-orange-600 border-orange-600 bg-orange-50/50' 
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card p-6 min-h-[400px]">
        {activeTab === 'programs' && renderDataTab(
          activeBusinessObj.services_data, 
          [{ key: 'title', label: 'Program Name' }, { key: 'image', label: 'Image', isImage: true }],
          'No programs defined yet.'
        )}
        
        {activeTab === 'events' && renderDataTab(
          activeBusinessObj.events_data, 
          [{ key: 'title', label: 'Event Name' }, { key: 'date', label: 'Date', isDate: true }, { key: 'location', label: 'Location' }],
          'No upcoming events.'
        )}
        
        {activeTab === 'gallery' && <GalleryTab businessId={selectedBizId} />}
        
        {activeTab === 'team' && renderDataTab(
          activeBusinessObj.team_data, 
          [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Position' }, { key: 'image', label: 'Photo', isImage: true }],
          'No board members added.'
        )}

        {activeTab === 'testimonials' && renderDataTab(
          activeBusinessObj.testimonials_data, 
          [{ key: 'name', label: 'Beneficiary/Donor' }, { key: 'text', label: 'Story' }],
          'No impact stories added.'
        )}

        {activeTab === 'donations' && (
          donations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No donations recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'var(--admin-border)' }}>
              <table className="w-full text-sm text-left">
                <thead style={{ background: 'var(--admin-content-bg)' }}>
                  <tr>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Donor</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Contact</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Transaction ID</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Screenshot</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-right text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => {
                    const imgUrl = getMediaUrl(d.payment_screenshot);
                    return (
                      <tr key={i} className="border-t hover:bg-slate-50" style={{ borderColor: 'var(--admin-border)' }}>
                        <td className="px-5 py-3 font-medium text-slate-700">{d.donor_name}</td>
                        <td className="px-5 py-3 text-slate-600">{d.donor_email}<br/><span className="text-xs text-slate-400">{d.donor_phone}</span></td>
                        <td className="px-5 py-3 font-bold text-green-600">₹{Number(d.amount).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3 font-mono text-slate-600">{d.transaction_id || '-'}</td>
                        <td className="px-5 py-3">
                          {imgUrl ? (
                            <a href={imgUrl} target="_blank" rel="noopener noreferrer">
                              <img src={imgUrl} alt="Proof" className="w-12 h-12 rounded object-cover border hover:scale-105 transition-transform" />
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={d.status}
                            onChange={(e) => updateDonationStatus(d.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${d.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : d.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right text-slate-500">{new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
        
        {activeTab === 'volunteers' && <VolunteersTab businessId={selectedBizId} />}
      </div>
    </div>
  );
};

export default AdminTrustManagement;
