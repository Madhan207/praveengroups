import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';
import { DiscountPosters } from '../components/DiscountPosters';
import { Store, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

export const BusinessPage = () => {
    const { slug } = useParams();
    const [business, setBusiness] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    // HeroSlider component handles its own state now

    useEffect(() => {
        const fetchBusinessData = async () => {
            setLoading(true);
            try {
                // We fetch everything based on the business slug
                const [bizRes, catRes, prodRes] = await Promise.all([
                    axios.get(`${API}/businesses/${slug}/`),
                    axios.get(`${API}/categories/?business=${slug}`),
                    axios.get(`${API}/products/?business=${slug}`)
                ]);
                setBusiness(bizRes.data);
                setCategories(catRes.data.results || catRes.data);
                setProducts(prodRes.data.results || prodRes.data);
            } catch (error) {
                console.error("Failed to load business data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusinessData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (!business) {
        return <div className="text-center py-20 text-2xl font-bold text-slate-700">Business not found.</div>;
    }

    const allBanners = business.banners || [];
    const heroBanners = allBanners.filter(b => b.position !== 'DISCOUNT');
    const discountPosters = allBanners.filter(b => b.position === 'DISCOUNT');

    const banners = heroBanners.length > 0 ? heroBanners : [{
        image: '/images/assets/asset_e40c5047.jpg',
        title: business.name,
        subtitle: business.description
    }];

    return (
        <div className="pb-20">
            {/* ─── Hero Slider ─────────────────────────────────────────────────── */}
            <HeroSlider banners={banners} fallbackHeight="min-h-[500px] md:min-h-[650px]" />

            {/* ─── Discount Posters ───────────────────────────────────────────── */}
            <DiscountPosters posters={discountPosters} />

            <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
                {/* Categories */}
                {categories.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-brand-600" /> 
                            Departments
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {categories.map(cat => (
                                <Link 
                                    key={cat.slug} 
                                    to={`/category/${cat.slug}`}
                                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-center group"
                                >
                                    <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden">
                                        {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                                    </div>
                                    <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 line-clamp-2">{cat.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Products / Services */}
                {products.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-heading font-bold text-slate-900 mb-8">
                            {business.type === 'service' ? 'Available Services' : 'Featured Products'}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
