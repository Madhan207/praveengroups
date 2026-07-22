import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, ChevronRight, ExternalLink, Briefcase, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusinessContext } from '../../context/BusinessContext';
const BREADCRUMB_MAP = {
  '/admin':           ['Dashboard'],
  '/admin/orders':    ['Dashboard', 'Orders'],
  '/admin/products':  ['Dashboard', 'Products'],
  '/admin/customers': ['Dashboard', 'Customers'],
  '/admin/analytics': ['Dashboard', 'Analytics'],
  '/admin/settings':  ['Dashboard', 'Settings'],
  '/admin/service-management': ['Dashboard', 'Service Management'],
  '/admin/trust-management': ['Dashboard', 'Trust Management'],
  '/admin/transport-management': ['Dashboard', 'Transport Management'],
  '/admin/payments': ['Dashboard', 'Payments'],
  '/admin/purchase': ['Dashboard', 'Purchase'],
  '/admin/inventory': ['Dashboard', 'Inventory'],
  '/admin/reports': ['Dashboard', 'Reports'],
  '/admin/security': ['Dashboard', 'Security Logs'],
  '/admin/businesses': ['Dashboard', 'Businesses'],
  '/admin/bookings': ['Dashboard', 'Bookings'],
};

const AdminTopbar = ({ sidebarCollapsed, onToggleSidebar, darkMode, onToggleDark }) => {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  
  const { businesses, selectedBusiness, setSelectedBusiness, loading, activeBusinessObj } = useBusinessContext();
  
  const crumbs = BREADCRUMB_MAP[pathname] || ['Dashboard'];

  return (
    <header
      className="flex items-center gap-4 px-6 py-3 border-b shrink-0 z-40 relative"
      style={{ background: 'var(--admin-topbar-bg)', borderColor: 'var(--admin-border)', minHeight: '64px' }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors lg:hidden"
        style={{ color: 'var(--admin-text-muted)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm mr-4">
        {crumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--admin-text-muted)' }} />}
            <span
              className={`font-medium ${i === crumbs.length - 1 ? 'text-brand-600' : ''}`}
              style={{ color: i === crumbs.length - 1 ? undefined : 'var(--admin-text-muted)' }}
            >
              {c}
            </span>
          </React.Fragment>
        ))}
      </nav>



      <div className="flex-1" />

      {/* Business Context Switcher */}
      <div className="relative z-50">
        <button
          onClick={() => setContextMenuOpen(!contextMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 border rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
          style={{ borderColor: 'var(--admin-border)' }}
        >
          <div className="w-6 h-6 rounded bg-brand-100 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Context</p>
            <p className="text-sm font-semibold leading-none truncate max-w-[120px]" style={{ color: 'var(--admin-text)' }}>
              {selectedBusiness === 'all' ? 'All Businesses' : activeBusinessObj?.name || 'Loading...'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 ml-1" style={{ color: 'var(--admin-text-muted)' }} />
        </button>

        <AnimatePresence>
          {contextMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-xl border overflow-hidden bg-white"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <div className="p-2">
                <button
                  onClick={() => { setSelectedBusiness('all'); setContextMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedBusiness === 'all' ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedBusiness === 'all' ? 'bg-brand-100' : 'bg-slate-100'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">All Businesses</div>
                  {selectedBusiness === 'all' && <Check className="w-4 h-4" />}
                </button>
                
                <div className="h-px bg-slate-100 my-2 mx-2" />
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-slate-500">Loading businesses...</div>
                  ) : (
                    businesses.map(biz => (
                      <button
                        key={biz.slug}
                        onClick={() => { setSelectedBusiness(biz.slug); setContextMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedBusiness === biz.slug ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedBusiness === biz.slug ? 'bg-brand-100' : 'bg-slate-100'}`}>
                          <span className="text-xs uppercase font-bold">{biz.name.slice(0, 2)}</span>
                        </div>
                        <div className="flex-1 text-left truncate">{biz.name}</div>
                        {selectedBusiness === biz.slug && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search bar */}
      <div className="hidden lg:flex items-center relative">
        <AnimatePresence>
          {searchOpen && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              autoFocus
              placeholder="Search ERP..."
              onBlur={() => setSearchOpen(false)}
              className="text-sm px-4 py-2 rounded-lg border outline-none"
              style={{
                background: 'var(--admin-content-bg)',
                borderColor: 'var(--admin-border)',
                color: 'var(--admin-text)',
              }}
            />
          )}
        </AnimatePresence>
        <button
          onClick={() => setSearchOpen(s => !s)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors ml-1"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          <Search className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(n => !n)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
          style={{ color: 'var(--admin-text-muted)' }}
        >
          <Bell style={{ width: '18px', height: '18px' }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden"
              style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}
            >
              <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--admin-border)' }}>
                <span className="font-bold text-sm" style={{ color: 'var(--admin-text)' }}>Alerts</span>
                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">3 new</span>
              </div>
              {[
                { title: 'New order placed', desc: 'Order #1042 — ₹4,299 (Electro World)', time: '2m ago', dot: 'bg-green-500' },
                { title: 'New DJ Booking', desc: 'Wedding DJ Request — Chennai', time: '15m ago', dot: 'bg-purple-500' },
                { title: 'Logistics Quote', desc: '5-Ton Cargo Quote Request', time: '1h ago', dot: 'bg-yellow-500' },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 items-start cursor-pointer border-b last:border-0"
                  style={{ borderColor: 'var(--admin-border)' }}>
                  <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.dot}`} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--admin-text)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>{n.desc}</p>
                    <p className="text-xs mt-1 text-slate-400">{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        style={{ color: 'var(--admin-text-muted)' }}
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode
          ? <Sun style={{ width: '18px', height: '18px' }} />
          : <Moon style={{ width: '18px', height: '18px' }} />
        }
      </button>

      {/* View site link */}
      <Link
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all hover:border-brand-400 hover:text-brand-600 shadow-sm"
        style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)', background: 'var(--admin-card-bg)' }}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View Site
      </Link>
      
    </header>
  );
};

export default AdminTopbar;
