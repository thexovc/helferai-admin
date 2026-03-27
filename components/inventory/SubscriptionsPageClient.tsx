'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '../Topbar';
import { formatCurrency, formatDate, getDaysRemainingColor } from '@/app/lib/utils';
import { Search, CreditCard, RefreshCw, XCircle, CheckCircle, Clock, TrendingUp, Plus, Edit2, Trash2, Building2, Calendar } from 'lucide-react';
import { useInventorySubscriptions } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

const PLAN_OPTIONS = ['All', 'Enterprise', 'Pro', 'Basic', 'Basic Helfer'];
const STATUS_OPTIONS = ['All', 'Active', 'Trial', 'Expired', 'Cancelled'];
const BILLING_OPTIONS = ['All', 'Monthly', 'Annual'];

const statusStyle: Record<string, { bg: string; color: string }> = {
    Active: { bg: '#dcfce7', color: '#15803d' },
    Trial: { bg: '#fef9c3', color: '#a16207' },
    Expired: { bg: '#fee2e2', color: '#dc2626' },
    Cancelled: { bg: '#f3f4f6', color: '#6b7280' },
};

export default function SubscriptionsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: subscriptionsResponse, isLoading } = useInventorySubscriptions(page, pageSize);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [planFilter, setPlanFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [billingFilter, setBillingFilter] = useState('All');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        businessEmail: '',
        plan: 'Basic',
        amountPaying: 0,
        billingCycle: 'Monthly',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        autoRenew: true,
        paymentMethod: 'Paystack'
    });

    useEffect(() => {
        if (subscriptionsResponse?.data) {
            setSubscriptions(subscriptionsResponse.data);
        }
    }, [subscriptionsResponse]);

    const handleOpenModal = (sub?: any) => {
        if (sub) {
            setEditingSub(sub);
            setFormData({
                businessName: sub.businessName,
                businessEmail: sub.businessEmail,
                plan: sub.plan,
                amountPaying: sub.amountPaying,
                billingCycle: sub.billingCycle,
                status: sub.status,
                startDate: sub.startDate.split('T')[0],
                endDate: sub.endDate.split('T')[0],
                autoRenew: sub.autoRenew,
                paymentMethod: sub.paymentMethod || 'Paystack'
            });
        } else {
            setEditingSub(null);
            setFormData({
                businessName: '',
                businessEmail: '',
                plan: 'Basic',
                amountPaying: 15000,
                billingCycle: 'Monthly',
                status: 'Active',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                autoRenew: true,
                paymentMethod: 'Paystack'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveSubscription = () => {
        if (!formData.businessName || !formData.businessEmail) {
            toast.error('Business details are required');
            return;
        }

        if (editingSub) {
            setSubscriptions(prev => prev.map(s => s.id === editingSub.id ? { ...s, ...formData, daysRemaining: Math.ceil((new Date(formData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) } : s));
            toast.success(`Subscription for "${formData.businessName}" updated successfully`);
        } else {
            const newSub = {
                id: `sub-${Date.now()}`,
                ...formData,
                businessId: `b-${Date.now()}`,
                daysRemaining: Math.ceil((new Date(formData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                createdAt: new Date().toISOString()
            };
            setSubscriptions(prev => [newSub, ...prev]);
            toast.success(`Subscription for "${formData.businessName}" created successfully`);
        }
        setIsModalOpen(false);
    };

    const handleAction = (type: 'edit' | 'cancel', sub: any) => {
        if (type === 'cancel') {
            if (confirm(`Are you sure you want to cancel the subscription for ${sub.businessName}?`)) {
                setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'Cancelled' } : s));
                toast.success(`Subscription for ${sub.businessName} has been cancelled`);
            }
        } else {
            handleOpenModal(sub);
        }
    };

    const filtered = subscriptions.filter(s => {
        const matchSearch =
            s.businessName.toLowerCase().includes(search.toLowerCase()) ||
            s.businessEmail.toLowerCase().includes(search.toLowerCase()) ||
            s.plan.toLowerCase().includes(search.toLowerCase());
        const matchPlan = planFilter === 'All' || s.plan === planFilter;
        const matchStatus = statusFilter === 'All' || s.status === statusFilter;
        const matchBilling = billingFilter === 'All' || s.billingCycle === billingFilter;
        return matchSearch && matchPlan && matchStatus && matchBilling;
    });

    // KPIs
    const totalActive = subscriptions.filter(s => s.status === 'Active').length;
    const totalTrial = subscriptions.filter(s => s.status === 'Trial').length;
    const totalExpired = subscriptions.filter(s => s.status === 'Expired').length;
    const totalCancelled = subscriptions.filter(s => s.status === 'Cancelled').length;
    const totalMRR = subscriptions
        .filter(s => s.status === 'Active' && s.billingCycle === 'Monthly')
        .reduce((acc, s) => acc + s.amountPaying, 0);
    const totalARR = subscriptions
        .filter(s => s.status === 'Active' && s.billingCycle === 'Annual')
        .reduce((acc, s) => acc + s.amountPaying, 0);

    const thStyle: React.CSSProperties = {
        padding: '11px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0',
        background: '#f9fafb', whiteSpace: 'nowrap',
    };
    const tdStyle: React.CSSProperties = {
        padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5',
    };

    return (
        <div>
            <Topbar title="Subscriptions" subtitle="Manage all business subscription plans" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                    {[
                        { label: 'Active', value: totalActive, icon: <CheckCircle size={18} />, accent: '#22c55e', sub: 'Paid & current' },
                        { label: 'On Trial', value: totalTrial, icon: <Clock size={18} />, accent: '#f59e0b', sub: 'Free trial period' },
                        { label: 'Expired', value: totalExpired, icon: <XCircle size={18} />, accent: '#ef4444', sub: 'Needs renewal' },
                        { label: 'Cancelled', value: totalCancelled, icon: <XCircle size={18} />, accent: '#6b7280', sub: 'Churned' },
                        { label: 'Monthly Revenue', value: formatCurrency(totalMRR), icon: <CreditCard size={18} />, accent: '#6c9e4e', sub: 'Active monthly subs' },
                        { label: 'Annual Revenue', value: formatCurrency(totalARR), icon: <TrendingUp size={18} />, accent: '#7c5cbf', sub: 'Active annual subs' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.accent}` }}>
                            <div style={{ color: k.accent, marginBottom: 8 }}>{k.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 2 }}>{isLoading && subscriptions.length === 0 ? '...' : k.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{k.label}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{k.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e', flex: 1 }}>
                            All Subscriptions <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 13 }}>({isLoading && subscriptions.length === 0 ? '...' : filtered.length})</span>
                        </h3>

                        {/* Search */}
                        <div style={{ position: 'relative', minWidth: 220 }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search business or plan…"
                                style={{ paddingLeft: 30, width: '100%', height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, outline: 'none', color: '#1a1a2e', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Filters */}
                        {[
                            { label: 'Plan', value: planFilter, setValue: setPlanFilter, options: PLAN_OPTIONS },
                            { label: 'Status', value: statusFilter, setValue: setStatusFilter, options: STATUS_OPTIONS },
                            { label: 'Billing', value: billingFilter, setValue: setBillingFilter, options: BILLING_OPTIONS },
                        ].map(f => (
                            <select key={f.label} value={f.value} onChange={e => f.setValue(e.target.value)}
                                style={{ height: 34, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 12, background: '#f9fafb', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                                {f.options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        ))}

                        <button
                            onClick={() => handleOpenModal()}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 34, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <Plus size={14} /> Add Subscription
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                            <thead>
                                <tr>
                                    {['Business', 'Plan', 'Payment Method', 'Start Date', 'End Date', 'Days Remaining', 'Amount', 'Billing', 'Auto-Renew', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && subscriptions.length === 0 ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan={11} style={{ padding: '12px 14px' }}>
                                                <div style={{ height: 20, background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                                            No subscriptions match your filters.
                                        </td>
                                    </tr>
                                ) : filtered.map((s, i) => {
                                    const daysColor = getDaysRemainingColor(s.daysRemaining);
                                    const sc = statusStyle[s.status] || { bg: '#f3f4f6', color: '#6b7280' };
                                    return (
                                        <tr key={s.id}
                                            style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}>

                                            {/* Business */}
                                            <td style={tdStyle}>
                                                <Link href={`/inventory/businesses/${s.businessId}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 13 }}>{s.businessName}</div>
                                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.businessEmail}</div>
                                                </Link>
                                            </td>

                                            {/* Plan */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '3px 10px', background: '#eaf4e3', color: '#5b8441', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{s.plan}</span>
                                            </td>

                                            {/* Payment Method */}
                                            <td style={{ ...tdStyle, fontSize: 12, color: '#6b7280' }}>{s.paymentMethod}</td>

                                            {/* Dates */}
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{s.amountPaying > 0 ? formatDate(s.startDate) : '—'}</td>
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{s.amountPaying > 0 ? formatDate(s.endDate) : '—'}</td>

                                            {/* Days Remaining */}
                                            <td style={tdStyle}>
                                                <span style={{ fontWeight: 700, color: daysColor, fontSize: 13 }}>
                                                    {s.daysRemaining < 0 ? `${Math.abs(s.daysRemaining)}d overdue` : s.status === 'Cancelled' ? '—' : `${s.daysRemaining}d`}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td style={{ ...tdStyle, fontWeight: 700, color: s.amountPaying > 0 ? '#1a1a2e' : '#9ca3af', whiteSpace: 'nowrap' }}>
                                                {s.amountPaying > 0 ? formatCurrency(s.amountPaying) : 'Free'}
                                            </td>

                                            {/* Billing */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '2px 8px', background: s.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: s.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {s.billingCycle}
                                                </span>
                                            </td>

                                            {/* Auto-Renew */}
                                            <td style={tdStyle}>
                                                {s.autoRenew
                                                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 12, fontWeight: 600 }}><RefreshCw size={12} /> Yes</span>
                                                    : <span style={{ color: '#9ca3af', fontSize: 12 }}>No</span>}
                                            </td>

                                            {/* Status */}
                                            <td style={tdStyle}>
                                                <span style={{ padding: '3px 10px', background: sc.bg, color: sc.color, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                                    {s.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => handleAction('edit', s)}
                                                        style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }} title="Edit"><Edit2 size={13} /></button>
                                                    <button
                                                        onClick={() => handleAction('cancel', s)}
                                                        style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }} title="Cancel"><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Showing <b style={{ color: '#1a1a2e' }}>{isLoading && subscriptions.length === 0 ? '...' : filtered.length}</b> of {isLoading && subscriptions.length === 0 ? '...' : (subscriptionsResponse?.meta?.total || subscriptions.length)} subscriptions</span>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil((subscriptionsResponse?.meta?.total || subscriptions.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={subscriptionsResponse?.meta?.total || subscriptions.length}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSub ? 'Edit Subscription' : 'Add New Subscription'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveSubscription} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {editingSub ? 'Save Changes' : 'Create Subscription'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Business Name
                        </label>
                        <input
                            value={formData.businessName}
                            onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="e.g. Acme Corp"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Owner Email
                        </label>
                        <input
                            value={formData.businessEmail}
                            onChange={e => setFormData(prev => ({ ...prev, businessEmail: e.target.value }))}
                            placeholder="owner@example.com"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Plan</label>
                            <select
                                value={formData.plan}
                                onChange={e => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Basic', 'Pro', 'Enterprise', 'Basic Helfer'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Billing Cycle</label>
                            <select
                                value={formData.billingCycle}
                                onChange={e => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Monthly', 'Annual'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Calendar size={14} /> Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Calendar size={14} /> End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Amount (₦)</label>
                            <input
                                type="number"
                                value={formData.amountPaying}
                                onChange={e => setFormData(prev => ({ ...prev, amountPaying: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                                {['Active', 'Trial', 'Expired', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
