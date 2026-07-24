import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BusinessContext = createContext();
const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

export const BusinessProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(() => {
    return localStorage.getItem('adminSelectedBusiness') || 'all';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get(`${API}/businesses/`);
        setBusinesses(res.data);
      } catch (err) {
        console.error('Failed to load businesses for admin context', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSelectedBusiness', selectedBusiness);
  }, [selectedBusiness]);

  const activeBusinessObj = selectedBusiness === 'all' 
    ? null 
    : businesses.find(b => b.slug === selectedBusiness);

  return (
    <BusinessContext.Provider value={{ 
      businesses, 
      selectedBusiness, 
      setSelectedBusiness,
      activeBusinessObj,
      loading 
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => useContext(BusinessContext);
