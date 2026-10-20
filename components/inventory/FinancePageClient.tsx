'use client';
import React from 'react';
import Link from 'next/link';
import Topbar from '../Topbar';
import { useInventoryFinance, useFinanceSubscriptions } from '@/api/inventory/inventory.queries';
import * as T from '@/api/inventory/inventory.types';
import { Clock, Search, ChevronDown } from 'lucide-react';
import { KPISkeleton } from '../Skeleton';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import DashboardCard from './DashboardCard';
import RevenueEvent from './RevenueEvent';
import Pagination from '../Pagination';

// Short axis labels, e.g. ₦0, ₦4K, ₦1.5M
const fmtK = (v: number) => v >= 1000000 ? `₦${+(v / 1000000).toFixed(1)}M` : v >= 1000 ? `₦${+(v / 1000).toFixed(1)}K` : `₦${v}`;
// Full amount, e.g. ₦16,000
const fmtNaira = (v: number) => `₦${Math.round(v || 0).toLocaleString()}`;

const TIERS = [
    { key: 'Basic', color: '#94a3b8' },
    { key: 'Smart', color: '#7c5cbf' },
    { key: 'Genius', color: '#6c9e4e' },
    { key: 'Platinum', color: '#f59e0b' },
];

const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtNaira(payload[0].value)}</div>
        </div>
    );
};

// Local YYYY-MM-DD (toISOString would shift the day to UTC)
const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 'All time' starts well before the first record; the server trims it to the first one
const getRangeDates = (range: string, customStart: string, customEnd: string) => {
    const today = new Date();
    const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
    const monthsAgo = (n: number) => { const d = new Date(today); d.setMonth(d.getMonth() - n); return d; };
    switch (range) {
        case 'Today': return { startDate: toYMD(today), endDate: toYMD(today) };
        case 'Yesterday': return { startDate: toYMD(daysAgo(1)), endDate: toYMD(daysAgo(1)) };
        case '7D': return { startDate: toYMD(daysAgo(6)), endDate: toYMD(today) };
        case '30D': return { startDate: toYMD(daysAgo(29)), endDate: toYMD(today) };
        case '3M': return { startDate: toYMD(monthsAgo(3)), endDate: toYMD(today) };
        case '6M': return { startDate: toYMD(monthsAgo(6)), endDate: toYMD(today) };
        case '12M': return { startDate: toYMD(monthsAgo(12)), endDate: toYMD(today) };
        case 'Custom': return { startDate: customStart, endDate: customEnd };
        default: return { startDate: '2000-01-01', endDate: toYMD(today) };
    }
};

// Parse YYYY-MM-DD as a local date so the label doesn't slip a day
const formatDateRange = (start: string, end: string) => {
    const fmt = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return start === end ? fmt(start) : `${fmt(start)} - ${fmt(end)}`;
};

export default function InventoryFinancePageClient() {
    const [selectedRange, setSelectedRange] = React.useState('All time');
    const [showDateDropdown, setShowDateDropdown] = React.useState(false);
    const [customStart, setCustomStart] = React.useState('');
    const [customEnd, setCustomEnd] = React.useState('');
    const [draftStart, setDraftStart] = React.useState('');
    const [draftEnd, setDraftEnd] = React.useState('');

    const [page, setPage] = React.useState(1);
    const pageSize = 10;
    const [search, setSearch] = React.useState('');
    const [planFilter, setPlanFilter] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');

    const { startDate, endDate } = getRangeDates(selectedRange, customStart, customEnd);
    const { data: financeData, isLoading, isFetching, isError } = useInventoryFinance(startDate, endDate);
    const { data: subsPage, isFetching: subsLoading } = useFinanceSubscriptions(page, pageSize, search, planFilter, statusFilter);

    const today = toYMD(new Date());
    const draftValid = !!draftStart && !!draftEnd && draftStart <= draftEnd;

    const toggleDropdown = () => {
        if (!showDateDropdown) {
            setDraftStart(startDate);
            setDraftEnd(endDate);
        }
        setShowDateDropdown(!showDateDropdown);
    };
    const applyCustomRange = () => {
        if (!draftValid) return;
        setCustomStart(draftStart);
        setCustomEnd(draftEnd);
        setSelectedRange('Custom');
        setShowDateDropdown(false);
    };

    if (isLoading || !financeData) {
        return (
            <div>
                <Topbar title="Financial Dashboard" subtitle="Core business performance & growth analysis" product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    {isError && !isLoading ? (
                        <div style={{ padding: 24, borderRadius: 12, background: '#fef2f2', color: '#b91c1c', fontSize: 14, fontWeight: 600 }}>
                            Couldn&apos;t load the finance data. Check your connection or sign in again.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                            {Array(6).fill(0).map((_: number, i: number) => <KPISkeleton key={i} />)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { kpis, charts, anomalousEvents } = financeData;
    const granularity = charts.granularity || 'month';
    const allTime = selectedRange === 'All time';
    const comparison = selectedRange === 'All time' ? 'all time' : 'vs previous period';

    const revenueOverTime = (charts.monthlyRevenue || []).map((d: any) => ({ month: d.month, value: d.amount }));
    const revenueTotal = revenueOverTime.reduce((sum: number, d: any) => sum + d.value, 0);
    const subGrowthData = (charts.subscriptionGrowth || []).map((d: any) => ({
        month: d.month,
        Basic: d.basic,
        Smart: d.smart,
        Genius: d.genius,
        Platinum: d.platinum ?? 0
    }));

    const renewalsCount = kpis.pendingRenewals?.value ?? 0;
    const payingCount = kpis.payingSubscriptions?.value ?? 0;
    const subs = subsPage?.data || [];
    const subsMeta = subsPage?.meta;

    const selectStyle: React.CSSProperties = { padding: '0 16px', height: 44, borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 13, fontWeight: 600, color: '#64748b', outline: 'none' };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
            {/* Header with Date Selector */}
            <div style={{
                padding: '16px var(--content-padding)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                background: '#fff',
                borderBottom: '1px solid #f1f5f9',
                position: 'relative',
                zIndex: 50
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a1a2e' }}>Financial Dashboard</h1>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Core Business Performance & Growth Analysis</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div
                        onClick={toggleDropdown}
                        style={{
                            padding: '8px 16px', borderRadius: 8, background: '#f8fafc',
                            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10,
                            fontSize: 13, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer',
                            userSelect: 'none', position: 'relative'
                        }}
                    >
                        {selectedRange === 'All time' ? 'All time' : formatDateRange(startDate, endDate)} <ChevronDown size={14} color="#94a3b8" />
                        {showDateDropdown && (
                            <div
                                onClick={e => e.stopPropagation()}
                                style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 16, width: 280, zIndex: 100
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>Select Custom Range</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[['START DATE', draftStart, setDraftStart], ['END DATE', draftEnd, setDraftEnd]].map(([label, value, setter]: any) => (
                                        <div key={label}>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>{label}</div>
                                            <input type="date" value={value} max={today} onChange={e => setter(e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
                                        </div>
                                    ))}
                                    {!draftValid && draftStart && draftEnd && (
                                        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Start date must be before end date.</div>
                                    )}
                                    <button onClick={applyCustomRange} disabled={!draftValid}
                                        style={{ background: '#6c9e4e', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, cursor: draftValid ? 'pointer' : 'not-allowed', opacity: draftValid ? 1 : 0.5, marginTop: 8 }}>
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['Today', 'Yesterday', '7D', '30D', '3M', '6M', '12M', 'All time'].map(p => (
                            <button key={p} onClick={() => { setSelectedRange(p); setShowDateDropdown(false); }} style={{
                                background: selectedRange === p ? '#fff' : 'transparent',
                                border: selectedRange === p ? '1px solid #e2e8f0' : 'none',
                                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                color: selectedRange === p ? '#1a1a2e' : '#94a3b8', cursor: 'pointer',
                                borderRadius: 6
                            }}>{p}</button>
                        ))}
                    </div>
                    {isFetching && <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Updating…</span>}
                </div>
            </div>

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* FINANCIAL KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <DashboardCard variant="metric" label="MRR" value={`₦${((kpis.mrr?.value || 0) / 1000).toFixed(1)}k`} trend={allTime ? '' : (kpis.mrr?.trend ?? '')} trendUp={kpis.mrr?.trendUp ?? true} subtitle={comparison} />
                    <DashboardCard variant="metric" label="ARR" value={`₦${((kpis.arr?.value || 0) / 1000000).toFixed(2)}M`} trend={allTime ? '' : (kpis.arr?.trend ?? '')} trendUp={kpis.arr?.trendUp ?? true} subtitle={comparison} />
                    <DashboardCard variant="metric" label="Revenue in Period" value={fmtNaira(kpis.revenuePeriod?.value ?? 0)} trend={allTime ? '' : (kpis.revenuePeriod?.trend ?? '')} trendUp={kpis.revenuePeriod?.trendUp ?? true} subtitle={comparison} />
                    <DashboardCard variant="metric" label="Revenue Today" value={fmtNaira(kpis.revenueToday?.value ?? 0)} trend={kpis.revenueToday?.trend ?? ''} trendUp={kpis.revenueToday?.trendUp ?? true} subtitle="vs yesterday" />
                    <DashboardCard variant="metric" label="ARPU" value={fmtNaira(kpis.arpu?.value ?? 0)} trend={allTime ? '' : (kpis.arpu?.trend ?? '')} trendUp={kpis.arpu?.trendUp ?? true} subtitle={comparison} />
                    <DashboardCard variant="status" label="Renewals Due" value={fmtNaira(kpis.pendingRenewalsValue?.value ?? 0)}
                        subValue={`${renewalsCount} in the next 30 days`} icon={Clock} accent="#f59e0b"
                        progress={payingCount > 0 ? Math.min(100, Math.round((renewalsCount / payingCount) * 100)) : 0} />
                </div>

                {/* CHARTS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
                    {/* Revenue Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Revenue</h3>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>Subscription income HelferAI collected each {granularity}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>{fmtNaira(revenueTotal)}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>in this period</div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tickFormatter={fmtK} allowDecimals={false} width={56} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#6c9e4e" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Subscription Growth Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Subscription Growth</h3>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>Subscriptions running at the end of each {granularity}, by plan</div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {TIERS.map(t => (
                                    <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#64748b' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 99, background: t.color }} /> {t.key}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                {TIERS.map((t, i) => (
                                    <Bar key={t.key} dataKey={t.key} stackId="a" fill={t.color} maxBarSize={48} radius={i === TIERS.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SUBSCRIPTION MANAGEMENT */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Subscription Management</h3>
                            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>
                                {subsMeta ? `${subsMeta.total.toLocaleString()} subscriptions, newest first` : 'Loading subscriptions…'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', minWidth: 260 }}>
                                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search business…" style={{ paddingLeft: 42, paddingRight: 16, width: '100%', height: 44, borderRadius: 12, border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 13, outline: 'none', color: '#1a1a2e', fontWeight: 500 }} />
                            </div>
                            <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }} style={selectStyle}>
                                <option value="">All plans</option>
                                {['Basic', 'Smart', 'Genius', 'Platinum', 'Enterprise'].map(p => <option key={p} value={p}>{p} Helfer</option>)}
                            </select>
                            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
                                <option value="">All statuses</option>
                                <option>Active</option>
                                <option>Expiring Soon</option>
                                <option>Expired</option>
                            </select>
                            {subsLoading && <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Updating…</span>}
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
                                {subs.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 32 }}>{subsPage ? 'No subscriptions match these filters' : 'Loading…'}</td></tr>
                                )}
                                {subs.map((s: T.FinanceSubscription) => (
                                    <tr key={s.id} style={{ background: '#fff' }}>
                                        <td style={{ padding: '20px', borderRadius: '16px 0 0 16px', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc', borderLeft: '1px solid #f8fafc' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#3730a3' }}>
                                                    {s.businessName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{s.businessName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{s.plan}</td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{s.startDate ? new Date(s.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}</td>
                                        <td style={{ padding: '20px', fontSize: 13, fontWeight: 600, color: '#64748b' }}>{s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}</td>
                                        <td style={{ padding: '20px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>
                                            {fmtNaira(s.value)}
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
                    {subsMeta && (
                        <div style={{ marginTop: 16 }}>
                            <Pagination currentPage={page} totalPages={subsMeta.totalPages ?? 1} onPageChange={setPage} totalItems={subsMeta.total} pageSize={pageSize} />
                        </div>
                    )}
                </div>

                {/* REVENUE EVENTS */}
                <div style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)', borderRadius: 32, padding: '40px', border: '1px solid #e0e7ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>Revenue Events</h3>
                            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>Latest payments, failed payments and cancellations in this period</div>
                        </div>
                        <Link href="/inventory/activity-logs" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#1a1a2e', textDecoration: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            Audit All Logs
                        </Link>
                    </div>

                    {anomalousEvents.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '24px 0' }}>No payment events in this period</div>
                    )}
                    {anomalousEvents.map((event: T.AnomalousEvent) => (
                        <RevenueEvent
                            key={event.id}
                            title={event.type}
                            description={`${event.businessName || `Client ${event.clientId}`} · ${event.time}`}
                            amount={(event.amount > 0 ? '+' : '-') + fmtNaira(Math.abs(event.amount))}
                            status={event.status === 'ALERT' ? 'ALERT' : 'CONFIRMED'}
                            iconType={event.status === 'ALERT' ? 'failed' : 'new'}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
