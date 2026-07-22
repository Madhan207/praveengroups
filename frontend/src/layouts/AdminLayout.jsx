import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import { BusinessProvider } from '../context/BusinessContext';

export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('adminDarkMode') === 'true';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
  }, [darkMode]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('adminDarkMode', next);
  };

  return (
    <BusinessProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: 'var(--admin-content-bg)' }}
      >
        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}>
          <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        </div>

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminTopbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(c => !c)}
            darkMode={darkMode}
            onToggleDark={toggleDark}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="page-enter max-w-screen-2xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
};
