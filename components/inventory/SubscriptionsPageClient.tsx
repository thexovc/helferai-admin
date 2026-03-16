'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Topbar from '../Topbar';
import { formatCurrency, formatDate, getDaysRemainingColor } from '@/app/lib/utils';
import { Search, CreditCard, RefreshCw, XCircle, CheckCircle, Clock, TrendingUp, Plus, Filter, ShieldCheck, Download, MoreVertical } from 'lucide-react';
import { useInventorySubscriptions } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';

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
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const { data: subscriptionsResponse, isLoading } = useInventorySubscriptions(page, pageSize);
    const subscriptions = subscriptionsResponse?.data || [];
    const meta = subscriptionsResponse?.meta || { total: 0, page: 1, pageSize: 10 };
    const [search, setSearch] = React.useState('');
    const [planFilter, setPlanFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [billingFilter, setBillingFilter] = useState('All');

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
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 2 }}>{isLoading ? '...' : k.value}</div>
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
                            All Subscriptions <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 13 }}>({isLoading ? '...' : meta.total})</span>
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

                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 34, background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <Plus size={14} /> Add Subscription
                        </button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                            <thead>
                                <tr>
                                    {['Business', 'Plan', 'Payment Method', 'Start Date', 'End Date', 'Days Remaining', 'Amount', 'Billing', 'Auto-Renew', 'Status'].map(h => (
                                        <th key={h} style={thStyle}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan={10} style={{ padding: '12px 14px' }}>
                                                <div style={{ height: 20, background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                                            No subscriptions match your filters.
                                        </td>
                                    </tr>
                                ) : filtered.map((s, i) => {
                                    const daysColor = getDaysRemainingColor(s.daysRemaining);
                                    const sc = statusStyle[s.status] || { bg: '#f3f4f6', color: '#6b7280' };
                                    return (
                                        <tr key={s.id}
                                            style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s', cursor: 'pointer' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f9f0')}
                                            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>

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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Showing <b style={{ color: '#1a1a2e' }}>{isLoading ? '...' : filtered.length}</b> of {isLoading ? '...' : meta.total} subscriptions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
