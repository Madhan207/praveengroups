import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, ShoppingBag, TrendingUp, Mail, Phone,
  Shield, ShieldAlert, ShieldCheck, UserX, UserCheck,
  Edit2, X, ChevronDown, AlertTriangle, CheckCircle,
  Clock, Calendar, Filter, RefreshCw, Eye, Lock
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://praveengroups.onrender.com/api');

const ROLE_CONFIG = {
  superadmin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ShieldAlert, dot: 'bg-purple-500' },
  manager:    { label: 'Manager',     color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: ShieldCheck, dot: 'bg-blue-500' },
  employee:   { label: 'Employee',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Shield,      dot: 'bg-indigo-500' },
  customer:   { label: 'Customer',    color: 'bg-green-100 text-green-700 border-green-200',    icon: Users,       dot: 'bg-green-500' },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const AdminCustomers = () => {
  const [users, setUsers]       = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [newRole, setNewRole]   = useState('');
  const [saving, setSaving]     = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes] = await Promise.all([
        api.get(`/users/`),
        api.get(`/orders/?all=true`)
      ]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data.results || []));
      setOrders(Array.isArray(oRes.data) ? oRes.data : (oRes.data.results || []));
    } catch (err) {
      toast('Failed to load user data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const enrichedUsers = useMemo(() => {
    return users.map(u => {
      const uOrders = orders.filter(o => o.user_email === u.email || o.mobile_number === u.mobile_number);
      const totalSpent = uOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const lastOrder = uOrders.reduce((latest, o) =>
        !latest || new Date(o.created_at) > new Date(latest) ? o.created_at : latest, null);
      return { ...u, orderCount: uOrders.length, totalSpent, lastOrder };
    });
  }, [users, orders]);

  const filtered = useMemo(() => {
    let list = enrichedUsers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.mobile_number || '').includes(q)
      );
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (statusFilter === 'active')   list = list.filter(u => u.is_active);
    if (statusFilter === 'disabled') list = list.filter(u => !u.is_active);
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [enrichedUsers, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total:      users.length,
    active:     users.filter(u => u.is_active).length,
    admins:     users.filter(u => ['superadmin','manager','employee'].includes(u.role)).length,
    revenue:    enrichedUsers.reduce((s, u) => s + u.totalSpent, 0),
  }), [users, enrichedUsers]);

  const handleRoleUpdate = async () => {
    if (!editRoleUser || !newRole) return;
    setSaving(true);
    try {
      await api.patch(`/users/${editRoleUser.id}/role/`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === editRoleUser.id
        ? { ...u, role: newRole, is_staff: ['superadmin','manager','employee'].includes(newRole) }
        : u
      ));
      if (selectedUser?.id === editRoleUser.id) setSelectedUser(prev => ({ ...prev, role: newRole }));
      toast(`Role updated to ${ROLE_CONFIG[newRole]?.label}`, 'success');
      setEditRoleUser(null);
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update role', 'error');
    }
    setSaving(false);
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? 'disable' : 'enable';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${user.name || user.email}?`)) return;
    try {
      const res = await api.patch(`/users/${user.id}/toggle-active/`, {});
      const newActive = res.data.is_active;
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newActive } : u));
      if (selectedUser?.id === user.id) setSelectedUser(prev => ({ ...prev, is_active: newActive }));
      toast(`Account ${newActive ? 'enabled' : 'disabled'} successfully`, newActive ? 'success' : 'warning');
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update account', 'error');
    }
  };

  const STAT_CARDS = [
    { label: 'Total Users',   value: stats.total,   icon: Users,       grad: 'from-blue-500 to-blue-700',     sub: `${stats.active} active` },
    { label: 'Staff Members', value: stats.admins,   icon: ShieldCheck, grad: 'from-purple-500 to-purple-700', sub: 'admins & staff' },
    { label: 'Orders Placed', value: orders.length,  icon: ShoppingBag, grad: 'from-orange-500 to-orange-700', sub: 'all time' },
    { label: 'Total Revenue', value: `₹${Math.round(stats.revenue).toLocaleString('en-IN')}`, icon: TrendingUp, grad: 'from-emerald-500 to-emerald-700', sub: 'from all users' },
  ];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="admin-card h-28 animate-pulse" style={{ background: 'var(--admin-card-bg)' }} />)}
      </div>
      <div className="admin-card h-96 animate-pulse" style={{ background: 'var(--admin-card-bg)' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--admin-text)' }}>User Management</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
            {filtered.length} of {users.length} users · Full access control
          </p>
        </div>
        <button onClick={fetchData}
          className="p-2.5 rounded-xl border transition-all hover:border-brand-400 hover:text-brand-600"
          style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-muted)' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="admin-card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.grad} rounded-t-2xl`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-3 shadow`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--admin-text)' }}>{s.value}</p>
            <p className="text-xs font-bold mt-1" style={{ color: 'var(--admin-text-muted)' }}>{s.label}</p>
            <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--admin-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-brand-500"
            style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
          <option value="customer">Customer</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border outline-none"
          style={{ background: 'var(--admin-content-bg)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--admin-content-bg)' }}>
              <tr>
                {['User', 'Contact', 'Role', 'Orders', 'Total Spent', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider"
                    style={{ color: 'var(--admin-text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-t hover:bg-slate-50/30 transition-colors" style={{ borderColor: 'var(--admin-border)' }}>
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        u.role === 'superadmin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                        u.role === 'manager'    ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                        u.role === 'employee'   ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' :
                                                  'bg-gradient-to-br from-emerald-400 to-teal-600'
                      }`}>
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: 'var(--admin-text)' }}>{u.name || '—'}</p>
                        {u.is_staff && <p className="text-xs text-purple-500 font-semibold">Staff Account</p>}
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[150px]">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{u.mobile_number || '—'}</span>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                  {/* Orders */}
                  <td className="px-5 py-4">
                    <span className="font-bold text-brand-600">{u.orderCount}</span>
                  </td>
                  {/* Spent */}
                  <td className="px-5 py-4">
                    <span className="font-bold text-emerald-600">₹{u.totalSpent.toLocaleString('en-IN')}</span>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-4 text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN') : '—'}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(u)}
                        title="View details"
                        className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditRoleUser(u); setNewRole(u.role); }}
                        title="Change role"
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(u)}
                        title={u.is_active ? 'Disable account' : 'Enable account'}
                        className={`p-1.5 rounded-lg transition-colors ${u.is_active
                          ? 'hover:bg-red-50 text-red-500'
                          : 'hover:bg-green-50 text-green-600'}`}>
                        {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-16 text-center" style={{ color: 'var(--admin-text-muted)' }}>
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No users found matching your filters
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Change Role Modal ── */}
      <AnimatePresence>
        {editRoleUser && (
          <motion.div key="role-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setEditRoleUser(null); }}>
            <motion.div key="role-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--admin-card-bg)' }}>
              {/* Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
                <div className="relative px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Change Role</h3>
                      <p className="text-white/70 text-xs">{editRoleUser.name || editRoleUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditRoleUser(null)}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>Select new role:</p>
                <div className="space-y-2">
                  {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <label key={key}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          newRole === key
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-transparent hover:border-slate-200'
                        }`}
                        style={{ background: newRole === key ? undefined : 'var(--admin-content-bg)' }}>
                        <input type="radio" name="role" value={key} checked={newRole === key}
                          onChange={() => setNewRole(key)} className="hidden" />
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--admin-text)' }}>{cfg.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--admin-text-muted)' }}>
                            {key === 'superadmin' ? 'Full access to all features' :
                             key === 'manager'    ? 'Manage products, orders, inventory' :
                             key === 'employee'   ? 'View and process orders' :
                                                    'Standard customer account'}
                          </p>
                        </div>
                        {newRole === key && <CheckCircle className="w-5 h-5 text-indigo-600 ml-auto" />}
                      </label>
                    );
                  })}
                </div>
                {newRole !== editRoleUser.role && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Changing from <strong>{ROLE_CONFIG[editRoleUser.role]?.label}</strong> to <strong>{ROLE_CONFIG[newRole]?.label}</strong>. This is logged in the audit trail.
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditRoleUser(null)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                    style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                    Cancel
                  </button>
                  <button onClick={handleRoleUpdate} disabled={saving || newRole === editRoleUser.role}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : 'Update Role'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Details Side Panel ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div key="panel-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)} />
            <motion.div key="panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 38 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm z-50 shadow-2xl flex flex-col"
              style={{ background: 'var(--admin-card-bg)' }}>
              {/* Panel Header */}
              <div className={`relative overflow-hidden flex-shrink-0 ${
                selectedUser.role === 'superadmin' ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
                selectedUser.role === 'manager'    ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                selectedUser.role === 'employee'   ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' :
                                                     'bg-gradient-to-br from-emerald-600 to-teal-700'
              }`}>
                <button onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
                  <X className="w-4 h-4" />
                </button>
                <div className="px-6 py-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-white/25 flex items-center justify-center text-white text-3xl font-extrabold mb-3 ring-4 ring-white/20">
                    {(selectedUser.name || selectedUser.email || '?')[0].toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.name || '—'}</h2>
                  <p className="text-white/70 text-sm mt-0.5">{selectedUser.email}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <RoleBadge role={selectedUser.role} />
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedUser.is_active ? 'bg-green-400/30 text-white' : 'bg-red-400/30 text-white'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.is_active ? 'bg-green-300' : 'bg-red-300'}`} />
                      {selectedUser.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Info Cards */}
                {[
                  { icon: Mail, label: 'Email', value: selectedUser.email },
                  { icon: Phone, label: 'Phone', value: selectedUser.mobile_number || '—' },
                  { icon: ShoppingBag, label: 'Total Orders', value: selectedUser.orderCount },
                  { icon: TrendingUp, label: 'Total Spent', value: `₹${(selectedUser.totalSpent || 0).toLocaleString('en-IN')}` },
                  { icon: Calendar, label: 'Member Since', value: selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { icon: Clock, label: 'Last Order', value: selectedUser.lastOrder ? new Date(selectedUser.lastOrder).toLocaleDateString('en-IN') : 'No orders yet' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--admin-content-bg)' }}>
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel Footer Actions */}
              <div className="flex-shrink-0 p-5 border-t space-y-2" style={{ borderColor: 'var(--admin-border)' }}>
                <button
                  onClick={() => { setEditRoleUser(selectedUser); setNewRole(selectedUser.role); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                  <Shield className="w-4 h-4" /> Change Role
                </button>
                <button
                  onClick={() => handleToggleActive(selectedUser)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-colors ${
                    selectedUser.is_active
                      ? 'text-red-600 border-red-200 hover:bg-red-50'
                      : 'text-green-600 border-green-200 hover:bg-green-50'
                  }`}>
                  {selectedUser.is_active
                    ? <><UserX className="w-4 h-4" /> Disable Account</>
                    : <><UserCheck className="w-4 h-4" /> Enable Account</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
