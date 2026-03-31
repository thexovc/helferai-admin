'use client';
import React from 'react';
import Topbar from '../Topbar';
import { useInventoryFinance } from '@/api/inventory/inventory.queries';
import * as T from '@/api/inventory/inventory.types';
import {
    DollarSign, TrendingUp, CreditCard, ArrowUpRight, Search, CheckCircle,
    AlertCircle, Clock, RefreshCw, BarChart as BarIcon, PieChart as PieIcon,
    Download, ChevronDown, Filter, MoreHorizontal, UserCheck, Flame
} from 'lucide-react';
import { KPISkeleton } from '../Skeleton';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, Legend, AreaChart, Area
} from 'recharts';
import DashboardCard from './DashboardCard';
import RevenueEvent from './RevenueEvent';
import Pagination from '../Pagination';

const fmtK = (v: number) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;
const PLAN_COLORS = ['#6c9e4e', '#7c5cbf', '#3b82f6', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>{fmtK(p.value)}</div>
            ))}
        </div>
    );
};

export default function InventoryFinancePageClient() {
    const { data: financeData, isLoading } = useInventoryFinance();
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [search, setSearch] = React.useState('');
    const [planFilter, setPlanFilter] = React.useState('All');
    const [statusFilter, setStatusFilter] = React.useState('All');

    if (isLoading || !financeData) {
        return (
            <div>
                <Topbar title="Financial Dashboard" subtitle="Core business performance & growth analysis" product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                        {Array(6).fill(0).map((_: number, i: number) => <KPISkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    const { kpis, charts, subscriptions, anomalousEvents } = financeData;
    const overview = kpis;

    // Map subscription growth data to match component expectations (Capitalized keys)
    const subGrowthData = (charts.subscriptionGrowth || []).map((d: any) => ({
        month: d.month,
        Basic: d.basic,
        Smart: d.smart,
        Genius: d.genius
    }));

    const revenueOverTime = (charts.monthlyRevenue || []).map((d: any) => ({ month: d.month, value: d.amount }));

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
            {/* Custom Header with Date Selector */}
            <div style={{
                padding: '16px var(--content-padding)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                background: '#fff',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a1a2e' }}>Financial Dashboard</h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Core Business Performance & Growth Analysis</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        padding: '8px 16px', borderRadius: 8, background: '#f8fafc',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 13, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer'
                    }}>
                        Aug 1, 2023 - Aug 31, 2023 <ChevronDown size={14} color="#94a3b8" />
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['Today', 'Yesterday', '7D', '30D', '3M', '6M', '12M', 'Default'].map(p => (
                            <button key={p} style={{
                                background: p === '30D' ? '#fff' : 'transparent',
                                border: p === '30D' ? '1px solid #e2e8f0' : 'none',
                                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                color: p === '30D' ? '#1a1a2e' : '#94a3b8', cursor: 'pointer',
                                borderRadius: 6
                            }}>{p}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* FINANCIAL KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <DashboardCard variant="metric" label="MRR" value={`₦${(kpis.mrr?.value / 1000).toFixed(1)}k`} trend={kpis.mrr?.trend ?? ''} trendUp={kpis.mrr?.trendUp ?? true} subtitle="vs last month" />
                    <DashboardCard variant="metric" label="ARR" value={`₦${(kpis.arr?.value / 1000000).toFixed(2)}M`} trend={kpis.arr?.trend ?? ''} trendUp={kpis.arr?.trendUp ?? true} subtitle="vs last month" />
                    <DashboardCard variant="metric" label="Revenue Today" value={`₦${kpis.revenueToday?.value?.toLocaleString()}`} trend={kpis.revenueToday?.trend ?? ''} trendUp={kpis.revenueToday?.trendUp ?? true} subtitle="vs yesterday" />
                    <DashboardCard variant="metric" label="Rev. This Month" value={`₦${(kpis.revenueMonth?.value / 1000).toFixed(1)}k`} trend={kpis.revenueMonth?.trend ?? ''} trendUp={kpis.revenueMonth?.trendUp ?? true} subtitle="vs last month" />
                    <DashboardCard variant="metric" label="ARPU" value={`₦${kpis.arpu?.value?.toLocaleString()}`} trend={kpis.arpu?.trend ?? ''} trendUp={kpis.arpu?.trendUp ?? true} subtitle="vs last month" />
                    <DashboardCard variant="status" label="Pending Renewals" value={kpis.pendingRenewalsValue?.value?.toLocaleString() ?? '0'} subValue="Due soon" icon={Clock} accent="#f59e0b" progress={65} />
                </div>

                {/* CHARTS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
                    {/* Monthly Revenue Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Monthly Revenue</h3>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>Gross billing performance by month</div>
                            </div>
                            <div style={{ color: '#94a3b8' }}><MoreHorizontal size={20} /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueOverTime} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tickFormatter={v => `₦${v / 1000000}M`} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#eaf4e3" radius={[8, 8, 8, 8]}>
                                    {revenueOverTime.map((_, index) => (
                                        <Cell key={index} fill={index === revenueOverTime.length - 2 ? '#6c9e4e' : '#eaf4e3'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subscription Growth Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Subscription Growth</h3>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>Distribution of Business across Tiers</div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#64748b' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 99, background: '#94a3b8' }} /> Basic
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#64748b' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 99, background: '#7c5cbf' }} /> Smart
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#64748b' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 99, background: '#6c9e4e' }} /> Genius
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subGrowthData} barSize={36}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="Basic" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Smart" stackId="a" fill="#7c5cbf" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Genius" stackId="a" fill="#6c9e4e" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SUBSCRIPTION MANAGEMENT */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Subscription Management</h3>
                            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>Oversee and filter active business lifecycles.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ position: 'relative', minWidth: 280 }}>
                                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search business…" style={{ paddingLeft: 42, paddingRight: 16, width: '100%', height: 44, borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 13, outline: 'none', color: '#1a1a2e', fontWeight: 500 }} />
                            </div>
                            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ padding: '0 16px', height: 44, borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#64748b', outline: 'none' }}>
                                <option>Plan Type</option>
                                <option>Enterprise</option>
                                <option>Smart Helfer</option>
                                <option>Basic Helfer</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0 16px', height: 44, borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#64748b', outline: 'none' }}>
                                <option>Status</option>
                                <option>Active</option>
                                <option>Expiring Soon</option>
                                <option>Expired</option>
                            </select>
                            <button style={{ background: '#1a1a2e', color: '#fff', border: 'none', height: 44, padding: '0 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                                <Filter size={16} /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                            <thead>
                                <tr style={{ background: 'transparent' }}>
                                    {['BUSINESS NAME', 'CURRENT PLAN', 'START DATE', 'EXPIRY DATE', 'PLAN VALUE', 'STATUS'].map(h => (
                                        <th key={h} style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', padding: '0 20px', background: 'transparent', textAlign: h === 'PLAN VALUE' ? 'center' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((s: T.FinanceSubscription) => (
                                    <tr key={s.id} style={{ background: '#fff', transition: 'transform 0.2s', cursor: 'pointer' }}>
                                        <td style={{ padding: '20px', borderRadius: '16px 0 0 16px', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc', borderLeft: '1px solid #f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#3730a3' }}>
                                                    {s.businessName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{s.businessName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{s.plan}</td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{new Date(s.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                                        <td style={{ padding: '20px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>
                                            ₦{s.value.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '20px', borderRadius: '0 16px 16px 0', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc', borderRight: '1px solid #f8fafc' }}>
                                            <span style={{
                                                padding: '6px 14px', borderRadius: 99, fontSize: 11, fontWeight: 800,
                                                background: s.status === 'Active' ? '#eaf4e3' : (s.status === 'Expiring Soon' ? '#fff7ed' : '#fee2e2'),
                                                color: s.status === 'Active' ? '#6c9e4e' : (s.status === 'Expiring Soon' ? '#c2410c' : '#b91c1c'),
                                                display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content'
                                            }}>
                                                <div style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} />
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 24 }}>
                        {/* Pagination is hidden since we are using a unified snapshot without separate meta for now */}
                    </div>
                </div>

                {/* ANOMALOUS REVENUE EVENTS */}
                <div style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)', borderRadius: 32, padding: '40px', border: '1px solid #e0e7ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>Anomalous Revenue Events</h3>
                        <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            Audit All Logs
                        </button>
                    </div>

                    {anomalousEvents.map((event: T.AnomalousEvent) => (
                        <RevenueEvent 
                            key={event.id}
                            title={event.type} 
                            description={`Client ID: ${event.clientId} - ${event.time}`} 
                            amount={(event.amount > 0 ? '+' : '') + '₦' + Math.abs(event.amount).toLocaleString()} 
                            status={event.status as any} 
                            iconType={event.status === 'ALERT' ? 'failed' : (event.amount > 1000 ? 'expansion' : 'new')} 
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
