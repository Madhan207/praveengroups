import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion, Search } from 'lucide-react';

export const FAQ = () => {
  const allFaqs = [
    { category: 'General', q: "What businesses fall under Praveen Groups?", a: "Praveen Groups includes Praveen Electro World, Praveen Lifestyles, Praveen Transports, Educational Trusts, and several other service and retail branches." },
    { category: 'General', q: "Do you offer customer support on weekends?", a: "Yes, our support team is available on Saturdays. However, our main offices are closed on Sundays." },
    { category: 'Orders', q: "How can I track my order or service booking?", a: "You can use the 'Track Booking' page available on our website to check the real-time status of your orders, logistics shipments, and service appointments." },
    { category: 'Orders', q: "How do I return a product?", a: "Returns depend on the specific business you purchased from. Generally, we offer a 7-day return policy for electronics and apparel if the items are unused and in original packaging." },
    { category: 'Services', q: "Can I book a service for a future date?", a: "Absolutely. When booking any professional service, you can select an available time slot up to 30 days in advance." },
    { category: 'Corporate', q: "Do you handle B2B or corporate orders?", a: "Yes, our Global Enterprises division specializes in bulk orders and corporate supplies with dedicated account managers and exclusive pricing." },
  ];

  const categories = ['All', 'General', 'Orders', 'Services', 'Corporate'];

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      
      {/* ─── Hero Section ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 py-20 px-6 relative overflow-hidden mb-16 rounded-[3rem] max-w-7xl mx-auto shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/3"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center justify-center bg-brand-500/20 text-brand-300 w-20 h-20 rounded-3xl mb-8 backdrop-blur-md border border-brand-500/30 shadow-inner">
            <MessageCircleQuestion size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-6 leading-tight">How can we help you?</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-slate-300 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 outline-none transition-all duration-300 shadow-xl text-lg"
            />
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* ─── Category Tabs ─── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:bg-brand-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── FAQ List ─── */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <motion.div 
                  key={faq.q} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === idx ? 'border-brand-500 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500/20' : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'}`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between focus:outline-none group"
                  >
                    <h3 className={`text-lg font-bold pr-6 transition-colors ${openIndex === idx ? 'text-brand-600' : 'text-slate-800 group-hover:text-brand-600'}`}>
                      {faq.q}
                    </h3>
                    <motion.div
                      animate={{ rotate: openIndex === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${openIndex === idx ? 'bg-brand-100 text-brand-600' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'}`}
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-8 pb-8 pt-2 text-slate-600 text-lg leading-relaxed border-t border-slate-50 mt-2">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No answers found</h3>
                <p className="text-slate-500">We couldn't find any FAQs matching your search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
