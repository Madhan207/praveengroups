import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BusinessPage } from './BusinessPage';
import { ServiceBusinessPage } from './ServiceBusinessPage';
import { TrustPage } from './TrustPage';
import { LogisticsPage } from './LogisticsPage';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

export const CompanyRouter = () => {
  const { slug } = useParams();
  const [businessType, setBusinessType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/businesses/${slug}/`)
      .then(res => setBusinessType(res.data.type))
      .catch(() => setBusinessType(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!businessType) {
    return (
      <div className="text-center py-40 text-2xl font-bold text-slate-400">
        Business Not Found
      </div>
    );
  }

  // Route based on business type — strict separation
  switch (businessType) {
    case 'product':
      return <BusinessPage />;          // E-commerce: products, cart, categories
    case 'service':
      return <ServiceBusinessPage />;   // DJ Events, Studios: premium service landing
    case 'trust':
      return <TrustPage />;             // Educational / Welfare Trust: NGO profile
    case 'logistics':
      return <LogisticsPage />;         // Praveen Transports: logistics company
    default:
      return <ServiceBusinessPage />;   // Fallback to service page
  }
};
