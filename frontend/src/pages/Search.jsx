import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState({ businesses: [], categories: [], products: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setSearchResults({ businesses: [], categories: [], products: [] });
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${API}/global-search/?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Failed to search", error);
        setSearchResults({ businesses: [], categories: [], products: [] });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 mt-16 max-w-7xl mx-auto px-6 pb-20">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Search Results</h1>
        <p className="text-slate-500 text-lg">
          {loading ? (
             <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Searching...</span>
          ) : (
            <>Search results for <span className="font-bold text-brand-600">"{query}"</span></>
          )}
        </p>
      </div>

      {!loading && searchResults.businesses.length === 0 && searchResults.products.length === 0 && searchResults.categories.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <SearchIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No results found</h2>
          <p className="text-slate-500 mb-6">We couldn't find anything matching your search. Try adjusting your keywords.</p>
          <Link to="/" className="inline-block bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {searchResults.businesses && searchResults.businesses.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Businesses & Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.businesses.map(biz => (
                  <Link 
                    key={biz.slug} 
                    to={`/company/${biz.slug}`}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-300 transition-all block"
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{biz.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2">{biz.description}</p>
                    <div className="mt-4 text-brand-600 font-semibold text-sm">Visit Page →</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {searchResults.products && searchResults.products.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Products & Offerings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
