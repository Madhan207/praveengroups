import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => {
  const stats = [
    { label: 'Years of Excellence', value: '5+' },
    { label: 'Happy Customers', value: '10k+' },
    { label: 'Specialized Divisions', value: '12' },
    { label: 'Awards Won', value: '25+' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 overflow-hidden">
      
      {/* ─── Immersive Hero Section ─── */}
      <div className="relative max-w-7xl mx-auto px-6 mb-24 mt-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400 rounded-full blur-[120px] opacity-20 -z-10 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -z-10 -translate-x-1/2"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-brand-50 text-brand-600 text-sm font-bold tracking-widest uppercase mb-6 border border-brand-100 shadow-sm">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">Modern Living</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Praveen Groups is a premier conglomerate committed to providing trusted services, cutting-edge solutions, and unparalleled quality across multiple domains.
          </p>
        </motion.div>
      </div>

      {/* ─── Animated Stats ─── */}
      <div className="max-w-7xl mx-auto px-6 mb-32 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-brand-600 to-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Core Values Section ─── */}
      <div className="bg-slate-900 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/50 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">Our Core Philosophy</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">The principles that drive every decision we make and every product we deliver.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-brand-500/25">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                To deliver outstanding value, foster innovation, and build lasting relationships with our customers by consistently exceeding expectations.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/25">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                To be the leading provider of holistic solutions that empower individuals and elevate communities locally and globally.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-emerald-500/25">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Promise</h3>
              <p className="text-slate-400 leading-relaxed text-lg">
                Uncompromising quality, total transparency, and a relentless commitment to customer satisfaction across every division.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── CTA Section ─── */}
      <div className="max-w-5xl mx-auto px-6 mt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-brand-600 to-blue-600 rounded-[3rem] p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mb-6 relative z-10">Ready to Experience the Best?</h2>
          <p className="text-xl text-brand-100 max-w-2xl mx-auto mb-10 relative z-10">
            Join thousands of satisfied customers who trust Praveen Groups for their daily needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/" className="px-8 py-4 bg-white text-brand-600 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Explore Services <ArrowRight size={20} />
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center justify-center">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
};
