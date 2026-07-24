import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Store, Zap, Shirt, Wrench, ShoppingBasket, Sparkles, Sprout, Building2, Music, Camera, GraduationCap, HeartHandshake, Truck, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const ICONS = {
    'praveen-electro-world': Zap,
    'praveen-lifestyles': Shirt,
    'praveen-electronics': Wrench,
    'praveenmart': ShoppingBasket,
    'praveen-spiritual-stores': Sparkles,
    'namma-mannu': Sprout,
    'praveen-global-enterprises': Building2,
    'praveen-dj-events': Music,
    'praveen-studios-entertainment': Camera,
    'praveen-educational-trust': GraduationCap,
    'praveen-welfare-trust': HeartHandshake,
    'praveen-transports': Truck,
    'praveen-transport': Truck,
};

export const MegaMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeBusiness, setActiveBusiness] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bizRes, catRes] = await Promise.all([
                    axios.get(`${API}/businesses/`),
                    axios.get(`${API}/categories/`)
                ]);
                const fetchedBiz = bizRes.data;
                setBusinesses(fetchedBiz);
                setCategories(catRes.data.results || catRes.data);
                if (fetchedBiz.length > 0) {
                    setActiveBusiness(fetchedBiz[0]);
                }
            } catch (error) {
                console.error("Failed to fetch menu data", error);
            }
        };
        fetchData();
    }, []);

    const activeCategories = categories.filter(c => c.business_slug === activeBusiness?.slug);
    const isProductBusiness = activeBusiness && activeBusiness.type === 'product';

    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className="flex items-center gap-1 font-semibold text-slate-700 hover:text-brand-600 transition-colors px-3 py-2">
                All Businesses <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-[800px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex z-50"
                    >
                        {/* Left Sidebar - Businesses */}
                        <div className="w-1/3 bg-slate-50 border-r border-slate-100 p-2 h-[500px] overflow-y-auto custom-scrollbar">
                            {businesses.map((biz) => {
                                const Icon = ICONS[biz.slug] || Store;
                                const isActive = activeBusiness?.slug === biz.slug;
                                const typeColor = {
                                    product: 'text-brand-400',
                                    service: 'text-purple-400',
                                    trust: 'text-orange-400',
                                    logistics: 'text-yellow-500',
                                }[biz.type] || 'text-slate-400';
                                return (
                                    <Link
                                        to={`/company/${biz.slug}`}
                                        key={biz.slug}
                                        onMouseEnter={() => setActiveBusiness(biz)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-white shadow-sm text-brand-600' : 'text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm leading-tight">{biz.name}</div>
                                            <div className={`text-[10px] mt-0.5 uppercase tracking-wider font-semibold ${typeColor}`}>{biz.type}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Content */}
                        <div className="w-2/3 p-6 h-[500px] overflow-y-auto custom-scrollbar bg-white">
                            {activeBusiness && (
                                <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-end">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{activeBusiness.name}</h3>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{activeBusiness.description}</p>
                                    </div>
                                    <Link to={`/company/${activeBusiness.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline whitespace-nowrap ml-4">
                                        View Page →
                                    </Link>
                                </div>
                            )}

                            {/* Product businesses: category grid with /category/:slug links */}
                            {isProductBusiness && activeCategories.length > 0 && (
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {activeCategories.map(cat => (
                                        <Link
                                            key={cat.slug}
                                            to={`/category/${cat.slug}`}
                                            className="flex items-center gap-3 group/link"
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover/link:scale-110 transition-transform" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 group-hover/link:text-brand-600 transition-colors line-clamp-2">
                                                {cat.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Service / Trust / Logistics: show company page CTA — no product catalog */}
                            {!isProductBusiness && activeBusiness && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 mb-6">
                                        {activeBusiness.type === 'service' && 'Professional services — visit our page to explore services, packages, gallery, and booking.'}
                                        {activeBusiness.type === 'trust' && 'Non-profit organization — visit our page for programs, donations, volunteering, and events.'}
                                        {activeBusiness.type === 'logistics' && 'Logistics company — visit our page for freight services, quotes, fleet info, and parcel tracking.'}
                                    </p>
                                    <Link
                                        to={`/company/${activeBusiness.slug}`}
                                        className="flex items-center justify-between p-4 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-2xl group/cta transition-all"
                                    >
                                        <div>
                                            <p className="font-bold text-brand-700">Visit Full Page</p>
                                            <p className="text-brand-500 text-sm">Services, packages, gallery, contact &amp; booking</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-brand-500 group-hover/cta:translate-x-1 transition-transform" />
                                    </Link>
                                    {activeBusiness.whatsapp_number && (
                                        <a
                                            href={`https://wa.me/${activeBusiness.whatsapp_number.replace(/\D/g, '')}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border border-green-100 rounded-2xl group/wa transition-all"
                                        >
                                            <div>
                                                <p className="font-bold text-green-700">WhatsApp Directly</p>
                                                <p className="text-green-500 text-sm">Quick inquiry via WhatsApp</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-green-500 group-hover/wa:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {isProductBusiness && activeCategories.length === 0 && (
                                <div className="text-center text-slate-400 py-10">No categories found.</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
