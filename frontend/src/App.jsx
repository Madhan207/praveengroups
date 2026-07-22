import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';

// User-facing layout & pages
import { MainLayout } from './layouts/MainLayout';
import { Home }       from './pages/Home';
import { Login }      from './pages/Login';
import { Register }   from './pages/Register';
import { Cart }       from './pages/Cart';
import { Checkout }   from './pages/Checkout';
import { CategoryPage } from './pages/CategoryPage';
import { CompanyRouter } from './pages/CompanyRouter';
import { ProductDetail } from './pages/ProductDetail';
import { Profile }    from './pages/Profile';
import { Search }     from './pages/Search';
import { TrackBooking } from './pages/TrackBooking';
import { About }      from './pages/About';
import { Contact }    from './pages/Contact';
import { FAQ }        from './pages/FAQ';
import { Shipping }   from './pages/Shipping';

// Admin layout & pages (Lazy loaded)
const AdminLayout      = lazy(() => import('./layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts    = lazy(() => import('./pages/admin/AdminProducts'));
const AdminBanners     = lazy(() => import('./pages/admin/AdminBanners'));
const AdminCustomers   = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminAnalytics   = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings    = lazy(() => import('./pages/admin/AdminSettings'));

// Enterprise Admin Modules
const AdminBusinesses = lazy(() => import('./pages/admin/AdminBusinesses'));
const AdminServiceManagement = lazy(() => import('./pages/admin/AdminServiceManagement'));
const AdminTrustManagement = lazy(() => import('./pages/admin/AdminTrustManagement'));
const AdminTransportManagement = lazy(() => import('./pages/admin/AdminTransportManagement'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminPurchase = lazy(() => import('./pages/admin/AdminPurchase'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminSecurityLogs = lazy(() => import('./pages/admin/AdminSecurityLogs'));

// Route guards
import { AdminRoute as ProtectedAdmin } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── User-facing routes (with Navbar/Footer) ── */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about"          element={<About />} />
          <Route path="contact"        element={<Contact />} />
          <Route path="faq"            element={<FAQ />} />
          <Route path="shipping"       element={<Shipping />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="company/:slug"  element={<CompanyRouter />} />
          <Route path="login"          element={<Login />} />
          <Route path="register"       element={<Register />} />
          <Route path="cart"           element={<Cart />} />
          <Route path="checkout"       element={<Checkout />} />
          <Route path="search"         element={<Search />} />
          <Route path="profile"        element={<Profile />} />
          <Route path="product/:id"  element={<ProductDetail />} />
          <Route path="track-booking"  element={<TrackBooking />} />
        </Route>

        {/* ── Admin routes (full-screen, no Navbar/Footer) ── */}
        <Route path="/admin" element={
          <ProtectedAdmin>
            <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-900 text-white"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
              <AdminLayout />
            </Suspense>
          </ProtectedAdmin>
        }>
          <Route index           element={<AdminDashboard />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="banners"  element={<AdminBanners />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          
          {/* New Enterprise Modules */}
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="service-management" element={<AdminServiceManagement />} />
          <Route path="trust-management" element={<AdminTrustManagement />} />
          <Route path="transport-management" element={<AdminTransportManagement />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="purchase" element={<AdminPurchase />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="security" element={<AdminSecurityLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
