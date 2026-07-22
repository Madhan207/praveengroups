import React, { useState } from 'react';
import { useBusinessContext } from '../../context/BusinessContext';
import { FileText, Download, Calendar, Filter, PieChart, ShoppingBag, DollarSign, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../utils/api';

const AdminReports = () => {
  const { activeBusinessObj, selectedBusiness, loading } = useBusinessContext();
  const [reportType, setReportType] = useState('sales');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', icon: DollarSign, available: ['all', 'product'] },
    { id: 'orders', label: 'Order Report', icon: ShoppingBag, available: ['all', 'product'] },
    { id: 'products', label: 'Product-wise Sales', icon: PieChart, available: ['all', 'product'] },
    { id: 'customers', label: 'Customer Report', icon: FileText, available: ['all', 'product', 'service'] },
    { id: 'payments', label: 'Payment Report', icon: DollarSign, available: ['all', 'product'] },
    { id: 'inventory', label: 'Inventory Report', icon: FileText, available: ['all', 'product'] },
    { id: 'bookings', label: 'Booking Report', icon: Calendar, available: ['service'] },
    { id: 'trust', label: 'Trust Donations Report', icon: FileText, available: ['trust'] },
    { id: 'transport', label: 'Transport Bookings Report', icon: FileText, available: ['logistics'] },
  ];

  const filteredReports = reportTypes.filter(rt => {
    const bType = selectedBusiness === 'all' ? 'all' : (activeBusinessObj?.type || 'all');
    return rt.available.includes(bType) || rt.available.includes('all');
  });

  const fetchReportData = async () => {
    try {
      let data = [];
      let params = {};
      
      // If a specific business is selected, filter by it
      if (selectedBusiness !== 'all' && activeBusinessObj?.id) {
        params.business = activeBusinessObj.id;
      }
      
      if (reportType === 'orders' || reportType === 'sales') {
        params.all = 'true'; // ensure we get all orders if we are admin
        const response = await api.get('/orders/', { params });
        let results = response.data.results || response.data;
        
        // Filter by date if provided
        if (dateFrom) {
          results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        data = results.map(item => ({
          'Date': new Date(item.created_at).toLocaleDateString(),
          'Order ID': item.id,
          'Customer Name': item.full_name || item.user_name,
          'Business Category': item.business_name || 'N/A',
          'Amount': parseFloat(item.total_amount).toFixed(2),
          'Payment Method': item.payment_method,
          'Status': item.status
        }));
      } else if (reportType === 'bookings') {
        const response = await api.get('/bookings/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) {
          results = results.filter(item => new Date(item.booking_date) >= new Date(dateFrom));
        }
        if (dateTo) {
          results = results.filter(item => new Date(item.booking_date) <= new Date(dateTo));
        }

        data = results.map(item => ({
          'Date': new Date(item.booking_date).toLocaleDateString(),
          'Booking ID': item.booking_id,
          'Customer Name': item.customer_name || item.name,
          'Business': item.business_name || 'N/A',
          'Service': item.service_name || 'N/A',
          'Package': item.package_name || 'N/A',
          'Amount': parseFloat(item.total_amount).toFixed(2),
          'Status': item.status
        }));
      } else if (reportType === 'products') {
        params.all = 'true';
        const response = await api.get('/orders/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        const productStats = {};
        results.forEach(order => {
          if (order.status === 'Cancelled' || order.status === 'Returned') return;
          (order.items || []).forEach(item => {
            if (!productStats[item.product_name]) {
              productStats[item.product_name] = { category: item.product_category_name, quantity: 0, revenue: 0 };
            }
            productStats[item.product_name].quantity += item.quantity;
            productStats[item.product_name].revenue += parseFloat(item.price) * item.quantity;
          });
        });
        
        data = Object.keys(productStats).map(pName => ({
          'Product Name': pName,
          'Category': productStats[pName].category || 'N/A',
          'Quantity Sold': productStats[pName].quantity,
          'Total Revenue': parseFloat(productStats[pName].revenue).toFixed(2)
        }));
      } else if (reportType === 'customers') {
        params.all = 'true';
        const response = await api.get('/orders/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        const customerStats = {};
        results.forEach(order => {
          const email = order.user_email || order.mobile_number || 'Guest';
          const name = order.full_name || order.user_name || 'Guest';
          const key = `${email}|${name}`;
          if (!customerStats[key]) {
            customerStats[key] = { name, email, orders: 0, spent: 0, lastOrder: order.created_at };
          }
          customerStats[key].orders += 1;
          if (order.status !== 'Cancelled' && order.status !== 'Returned') {
            customerStats[key].spent += parseFloat(order.total_amount);
          }
          if (new Date(order.created_at) > new Date(customerStats[key].lastOrder)) {
            customerStats[key].lastOrder = order.created_at;
          }
        });
        
        data = Object.values(customerStats).map(c => ({
          'Customer Name': c.name,
          'Email/Contact': c.email,
          'Total Orders': c.orders,
          'Total Spent': parseFloat(c.spent).toFixed(2),
          'Last Order Date': new Date(c.lastOrder).toLocaleDateString()
        }));
      } else if (reportType === 'payments') {
        params.all = 'true';
        const response = await api.get('/orders/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        data = results.map(item => ({
          'Date': new Date(item.created_at).toLocaleDateString(),
          'Order ID': item.id,
          'Customer': item.full_name || item.user_name,
          'Amount': parseFloat(item.total_amount).toFixed(2),
          'Method': item.payment_method,
          'UTR Number': item.payment_verification?.utr_number || 'N/A',
          'Verification': item.payment_verification ? (item.payment_verification.is_verified ? 'Verified' : 'Pending') : 'N/A',
          'Order Status': item.status
        }));
      } else if (reportType === 'inventory') {
        const invParams = {};
        if (selectedBusiness !== 'all' && activeBusinessObj?.slug) {
          invParams.business = activeBusinessObj.slug;
        }
        const response = await api.get('/products/', { params: invParams });
        let results = response.data.results || response.data;
        
        data = results.map(item => ({
          'Product Name': item.name,
          'SKU': item.sku || 'N/A',
          'Category': item.category?.name || 'N/A',
          'Price': parseFloat(item.price).toFixed(2),
          'Stock': item.stock,
          'Status': item.is_active ? 'Active' : 'Inactive',
          'Is Featured': item.is_featured ? 'Yes' : 'No'
        }));
      } else if (reportType === 'trust') {
        const response = await api.get('/donations/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        data = results.map(item => ({
          'Date': new Date(item.created_at).toLocaleDateString(),
          'Donor Name': item.donor_name,
          'Email': item.donor_email || 'N/A',
          'Phone': item.donor_phone || 'N/A',
          'Amount': parseFloat(item.amount).toFixed(2),
          'Transaction ID': item.transaction_id || 'N/A',
          'Status': item.status
        }));
      } else if (reportType === 'transport') {
        const response = await api.get('/quote-requests/', { params });
        let results = response.data.results || response.data;
        
        if (dateFrom) results = results.filter(item => new Date(item.created_at) >= new Date(dateFrom));
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          results = results.filter(item => new Date(item.created_at) <= toDate);
        }
        
        data = results.map(item => ({
          'Date': new Date(item.created_at).toLocaleDateString(),
          'Customer': item.name,
          'Phone': item.phone,
          'Event/Cargo': item.event_type || 'N/A',
          'Location': item.event_location || 'N/A',
          'Status': item.status
        }));
      } else {
        // Fallback for unimplemented reports
        data = [
          { 'Notice': `The ${reportType} report is not fully implemented yet.` },
          { 'Date': new Date().toLocaleDateString(), 'Business': activeBusinessObj?.name || 'All Businesses' }
        ];
      }
      
      if (data.length === 0) {
        data = [{ 'Notice': 'No data found for the selected criteria.' }];
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      alert('Failed to generate report data. Please check your connection.');
      return null;
    }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    const data = await fetchReportData();
    setIsExporting(false);
    if (!data) return;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, `${reportType}_report.xlsx`);
  };

  const exportCSV = async () => {
    setIsExporting(true);
    const data = await fetchReportData();
    setIsExporting(false);
    if (!data) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => obj[h] ?? ''));
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `${reportType}_report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>Reports & Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            Context: <span className="font-semibold">{selectedBusiness === 'all' ? 'All Businesses' : activeBusinessObj?.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar: Report Types */}
        <div className="admin-card p-4 h-fit">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-slate-500">Available Reports</h3>
          <div className="space-y-1">
            {filteredReports.map(rt => (
              <button
                key={rt.id}
                onClick={() => setReportType(rt.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  reportType === rt.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <rt.icon className={`w-4 h-4 ${reportType === rt.id ? 'text-brand-600' : 'text-slate-400'}`} />
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Report Generator */}
        <div className="md:col-span-3 space-y-6">
          <div className="admin-card p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--admin-text)' }}>
              {filteredReports.find(r => r.id === reportType)?.label || 'Report Configuration'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border" style={{ borderColor: 'var(--admin-border)' }}>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 bg-white" style={{ borderColor: 'var(--admin-border)' }}>
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full text-sm py-2 outline-none bg-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 bg-white" style={{ borderColor: 'var(--admin-border)' }}>
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full text-sm py-2 outline-none bg-transparent" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={exportCSV} 
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                Export CSV
              </button>
              <button 
                onClick={exportExcel} 
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} 
                Export Excel
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow disabled:opacity-50">
                <FileText className="w-4 h-4" /> Generate PDF / Print
              </button>
            </div>
          </div>
          
          <div className="admin-card p-6 text-center text-slate-500 py-12 print:block">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Select a date range and click an export option above to download the {filteredReports.find(r => r.id === reportType)?.label?.toLowerCase() || 'report'}.</p>
            <p className="text-sm mt-1">The report will be filtered by your current business context.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
