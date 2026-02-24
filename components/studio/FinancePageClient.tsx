'use client';
import React from 'react';
import Topbar from '../Topbar';
import { StudioService } from '@/app/lib/services/studio';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import type { FinanceTransaction } from '@/app/lib/types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, Search, AlertCircle, Clock } from 'lucide-react';

const accent = '#7c5cbf';
const fmtK = (v: number) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;
const PLAN_COLORS = ['#7c5cbf', '#6c9e4e', '#3b82f6', '#f59e0b'];

const statusColors: Record<string, { bg: string; color: string }> = {
    Paid: { bg: '#dcfce7', color: '#15803d' },
    Failed: { bg: '#fee2e2', color: '#dc2626' },
    Pending: { bg: '#fef9c3', color: '#a16207' },
    Refunded: { bg: '#e0e7ff', color: '#3730a3' },
};

const typeColors: Record<string, { bg: string; color: string }> = {
    Subscription: { bg: '#f0ebff', color: '#7c3aed' },
    Renewal: { bg: '#f0f9ff', color: '#0284c7' },
    Upgrade: { bg: '#eaf4e3', color: '#5b8441' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }}>{fmtK(p.value)}</div>)}
        </div>
    );
};

export default function StudioFinancePageClient() {
    const [data, setData] = React.useState<any>(null);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [typeFilter, setTypeFilter] = React.useState('All');

    React.useEffect(() => {
        StudioService.getFinanceData().then(setData);
    }, []);

    if (!data) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Finance...</div>;

    const { transactions, revenueByPlan, paymentMethods, revenueOverTime } = data;

    const filtered: FinanceTransaction[] = transactions.filter((t: FinanceTransaction) => {
        const matchSearch = t.businessOrUserName.toLowerCase().includes(search.toLowerCase()) || t.plan.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchType = typeFilter === 'All' || t.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const totalRevenue = transactions.filter((t: FinanceTransaction) => t.status === 'Paid').reduce((s: number, t: FinanceTransaction) => s + t.amount, 0);
    const failedCount = transactions.filter((t: FinanceTransaction) => t.status === 'Failed').length;
    const pendingCount = transactions.filter((t: FinanceTransaction) => t.status === 'Pending').length;

    return (
        <div>
            <Topbar title="Finance" subtitle="Revenue, payments & subscription transactions" product="studio" />
            <div style={{ padding: 'var(--content-padding)' }}>

                {/* Top KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                    {[
                        { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign size={18} />, accent: '#7c5cbf', sub: 'All paid transactions' },
                        { label: 'MRR', value: '₦1.04M', icon: <TrendingUp size={18} />, accent: '#7c5cbf', sub: '+18% vs last month' },
                        { label: 'ARR', value: '₦12.5M', icon: <TrendingUp size={18} />, accent: '#6c9e4e', sub: 'Annual projection' },
                        { label: 'ARPU', value: '₦16,200', icon: <CreditCard size={18} />, accent: '#3b82f6', sub: '+8% trend' },
                        { label: 'Failed Payments', value: String(failedCount), icon: <AlertCircle size={18} />, accent: '#ef4444', sub: 'Needs attention' },
                        { label: 'Pending', value: String(pendingCount), icon: <Clock size={18} />, accent: '#f59e0b', sub: 'Awaiting payment' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.accent}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ width: 36, height: 36, background: `${k.accent}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>{k.icon}</div>
                                <ArrowUpRight size={14} color="#9ca3af" />
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', marginBottom: 2 }}>{k.value}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{k.label}</div>
                            <div style={{ fontSize: 11, color: k.accent, fontWeight: 600, marginTop: 2 }}>{k.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Revenue Over Time (MRR Trend)</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={revenueOverTime}>
                                <defs>
                                    <linearGradient id="studioRevGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accent} stopOpacity={0.18} />
                                        <stop offset="95%" stopColor={accent} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} fill="url(#studioRevGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Revenue by Plan</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={revenueByPlan} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="plan">
                                    {revenueByPlan.map((_: any, i: number) => <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => fmtK(Number(v))} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Payment Methods Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        {paymentMethods.map((pm: any) => (
                            <div key={pm.method} style={{ padding: '16px 20px', background: '#f9fafb', borderRadius: 12, border: `1.5px solid ${pm.color}30` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{pm.method}</span>
                                    <span style={{ fontSize: 11, padding: '2px 8px', background: `${pm.color}15`, color: pm.color, borderRadius: 99, fontWeight: 700 }}>{pm.count} txns</span>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: pm.color }}>{fmtK(pm.amount)}</div>
                                <div style={{ marginTop: 8, height: 4, background: '#f0f0f0', borderRadius: 99 }}>
                                    <div style={{ height: 4, background: pm.color, borderRadius: 99, width: `${(pm.count / 43) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transactions Table */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a2e', flex: 1 }}>Recent Transactions</h3>
                        <div style={{ position: 'relative', minWidth: 220 }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…" style={{ paddingLeft: 30, width: '100%', height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, outline: 'none', color: '#1a1a2e' }} />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: 34, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 12, background: '#f9fafb', outline: 'none', color: '#374151' }}>
                            <option>All</option>
                            {['Paid', 'Failed', 'Pending', 'Refunded'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ height: 34, borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 12, background: '#f9fafb', outline: 'none', color: '#374151' }}>
                            <option>All</option>
                            {['Subscription', 'Renewal', 'Upgrade'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ minWidth: 900 }}>
                            <thead>
                                <tr>
                                    {['User Name', 'Date', 'Plan', 'Type', 'Payment Method', 'Billing', 'Amount', 'Status'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t: FinanceTransaction, i: number) => {
                                    const sc = statusColors[t.status];
                                    const tc = typeColors[t.type];
                                    return (
                                        <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f0ff')}
                                            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa')}>
                                            <td style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{t.businessOrUserName}</td>
                                            <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                                            <td style={{ fontSize: 12, fontWeight: 600 }}>{t.plan}</td>
                                            <td>
                                                <span style={{ padding: '3px 8px', background: tc.bg, color: tc.color, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{t.type}</span>
                                            </td>
                                            <td style={{ fontSize: 12, color: '#374151' }}>{t.paymentMethod}</td>
                                            <td>
                                                <span style={{ padding: '3px 8px', background: t.billingCycle === 'Annual' ? '#f0ebff' : '#f3f4f6', color: t.billingCycle === 'Annual' ? '#7c5cbf' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{t.billingCycle}</span>
                                            </td>
                                            <td style={{ fontSize: 13, fontWeight: 700, color: t.amount > 0 ? '#1a1a2e' : '#9ca3af', whiteSpace: 'nowrap' }}>
                                                {t.amount > 0 ? formatCurrency(t.amount) : '—'}
                                            </td>
                                            <td>
                                                <span style={{ padding: '3px 10px', background: sc.bg, color: sc.color, borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{t.status}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f5f5', fontSize: 12, color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Showing {filtered.length} of {transactions.length} transactions</span>
                        <span>Total paid: <b style={{ color: '#1a1a2e' }}>{formatCurrency(totalRevenue)}</b></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
