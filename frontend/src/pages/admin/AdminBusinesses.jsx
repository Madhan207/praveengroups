import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Globe, Truck, MapPin, Mail, Phone, Edit3 } from 'lucide-react';
import { SkeletonStats } from '../../components/admin/SkeletonLoader';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const TYPE_COLORS = {
  product: 'bg-brand-100 text-brand-700 border-brand-200',
  service: 'bg-purple-100 text-purple-700 border-purple-200',
  trust: 'bg-orange-100 text-orange-700 border-orange-200',
  logistics: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const AdminBusinesses = () => {
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type');
  
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  React.useEffect(() => {
    const fetchBiz = async () => {
      try {
        const res = await axios.get(`${API}/businesses/`);
        let data = res.data;
        if (typeFilter) {
          data = data.filter(b => b.type === typeFilter);
        }
        setBusinesses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBiz();
  }, [typeFilter]);

  if (loading) return <SkeletonStats count={6} />;

  const displayType = typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) : 'All';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>{displayType} Business Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>Manage {businesses.length} {displayType} divisions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {businesses.map((biz) => (
          <div 
            key={biz.id} 
            className="admin-card overflow-hidden border-2 transition-all hover:shadow-md border-transparent hover:border-brand-300"
          >
            <div className="p-5 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border" style={{ borderColor: 'var(--admin-border)' }}>
                  {biz.type === 'product' ? <Briefcase className="w-6 h-6 text-brand-500" /> :
                   biz.type === 'service' ? <Building2 className="w-6 h-6 text-purple-500" /> :
                   biz.type === 'logistics' ? <Truck className="w-6 h-6 text-yellow-500" /> :
                   <Globe className="w-6 h-6 text-orange-500" />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${TYPE_COLORS[biz.type]}`}>
                  {biz.type}
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1" 
                style={{ color: 'var(--admin-text)' }}
              >
                {biz.name}
              </h3>
              <p className="text-xs line-clamp-2" style={{ color: 'var(--admin-text-muted)' }}>
                {biz.description || 'No description provided'}
              </p>
            </div>
            
            <div className="p-5 bg-slate-50/50 space-y-3" style={{ background: 'var(--admin-sidebar-bg)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--admin-text)' }}>
                <MapPin className="w-3.5 h-3.5 opacity-50" />
                <span className="truncate">{biz.address || 'Address not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--admin-text)' }}>
                <Mail className="w-3.5 h-3.5 opacity-50" />
                <span className="truncate">{biz.email || 'Email not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--admin-text)' }}>
                <Phone className="w-3.5 h-3.5 opacity-50" />
                <span className="truncate">{biz.phone || 'Phone not set'}</span>
              </div>
            </div>
            
            <div className="px-5 py-3 border-t flex gap-2" style={{ borderColor: 'var(--admin-border)' }}>
              <button className="ml-auto px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border" style={{ borderColor: 'var(--admin-border)' }}>
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBusinesses;
