import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
            <h3 className="text-2xl font-heading font-bold text-white">Praveen<span className="text-brand-500">Groups</span></h3>
          </div>
          <p className="text-slate-400 text-sm">A conglomerate of premium businesses for modern living. Trusted services and solutions since 2022.</p>
          <a href="https://praveengroups.in" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">🌐 praveengroups.in</a>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-brand-500 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-brand-500 transition-colors">FAQ</Link></li>
            <li><Link to="/shipping" className="hover:text-brand-500 transition-colors">Shipping Info</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Our Businesses</h4>
          <ul className="space-y-2">
            <li><Link to="/company/praveen-electro-world" className="hover:text-brand-500 transition-colors">Praveen Electro World</Link></li>
            <li><Link to="/company/praveen-lifestyles" className="hover:text-brand-500 transition-colors">Praveen Lifestyles</Link></li>
            <li><Link to="/company/praveen-educational-trust" className="hover:text-brand-500 transition-colors">Educational Trust</Link></li>
            <li><Link to="/company/praveen-transports" className="hover:text-brand-500 transition-colors">Praveen Transports</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">📍</span>
              <a href="https://maps.app.goo.gl/HEgtK1bcE79LxDod9?g_st=ac" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">4/114 Kattipalayam,<br />Tiruchengode to Namakkal Main Road<br />Tiruchengode Tk, Tamil Nadu 637212</a>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <a href="tel:+918438926321" className="hover:text-brand-400 transition-colors">+91 84389 26321</a>, <a href="tel:+918675398848" className="hover:text-brand-400 transition-colors">+91 86753 98848</a>
            </li>
            <li className="flex items-center gap-2">
              <span>✉️</span>
              <a href="mailto:admin@praveengroups.in" className="hover:text-brand-400 transition-colors">admin@praveengroups.in</a>
            </li>

            <li className="flex items-center gap-2">
              <span>🌐</span>
              <a href="https://praveengroups.in" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">praveengroups.in</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Praveen Groups. All rights reserved.
      </div>
    </footer>
  );
};
