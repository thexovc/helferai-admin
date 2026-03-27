'use client';
import React from 'react';
import Topbar from '../Topbar';
import KPICard from '../KPICard';
import { useInventoryBusinesses, useInventoryKpis, useInventoryCharts } from '@/api/inventory';
import * as T from '@/api/inventory/inventory.types';
import { Building2, TrendingUp, Users, AlertCircle, XCircle, Calendar, DollarSign, Repeat, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { KPISkeleton, ChartSkeleton } from '../Skeleton';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const fmtMillions = (v: number) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color }}>{fmtMillions(p.value)}</div>
            ))}
        </div>
    );
};

export default function InventoryDashboardClient() {
    const { data: businesses, isLoading: loadingBusinesses } = useInventoryBusinesses();
    const { data: kpis, isLoading: loadingKpis } = useInventoryKpis();
    const { data: charts, isLoading: loadingCharts } = useInventoryCharts();

    const isLoading = loadingBusinesses || loadingKpis || loadingCharts;

    if (isLoading || !businesses || !kpis || !charts) {
        return (
            <div>
                <Topbar title="Inventory Overview" subtitle="Real-time performance and inventory health metrics." product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                        {Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <ChartSkeleton />
                        <ChartSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    const businessList = businesses.data || [];
    const total = businessList.length;
    const active = businessList.filter((b: any) => b.status === 'Active').length;
    const trial = businessList.filter((b: any) => b.status === 'Trial').length;
    const expired = businessList.filter((b: any) => b.status === 'Expired').length;
    const cancelled = businessList.filter((b: any) => b.status === 'Cancelled').length;

    // Support both old and new KPI structures
    const overview = kpis.overview || (kpis as any as T.InventoryOverview);
    const hasOverview = !!overview?.totalBusiness;

    // Adapt chart data for Recharts
    const chartData = {
        mrrTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.mrr })),
        monthlyRevenue: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.revenue })),
        arpuTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.arpu })),
        renewalForecast: (charts.pendingRenewalsTimeline || []).map((d: any) => ({ month: d.week, value: d.amount })),
    };

    return (
        <div>
            <Topbar title="Inventory Dashboard" subtitle="Business & revenue overview" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* TOP KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {hasOverview ? (
                        <>
                            <KPICard label="Total Business" value={overview.totalBusiness?.value ?? 0} trend={overview.totalBusiness?.trend} trendUp={overview.totalBusiness?.trendUp} large accent="#6c9e4e" icon={<Building2 size={20} />} />
                            <KPICard label="Subscribing" value={overview.totalSubscribingBusiness?.value ?? 0} trend={overview.totalSubscribingBusiness?.trend} trendUp={overview.totalSubscribingBusiness?.trendUp} large accent="#22c55e" icon={<TrendingUp size={20} />} />
                            <KPICard label="Trial Users" value={overview.trialUsers?.value ?? 0} trend={overview.trialUsers?.trend} trendUp={overview.trialUsers?.trendUp} accent="#f59e0b" icon={<Calendar size={20} />} />
                            <KPICard label="Expired" value={overview.expiredSubscription?.value ?? 0} trend={overview.expiredSubscription?.trend} trendUp={overview.expiredSubscription?.trendUp} accent="#ef4444" icon={<AlertCircle size={20} />} />
                            <KPICard label="Conversion" value={`${overview.conversionRate?.value ?? 0}%`} trend={overview.conversionRate?.trend} trendUp={overview.conversionRate?.trendUp} accent="#7c5cbf" icon={<Zap size={20} />} />
                            <KPICard label="Active Today" value={overview.activeToday?.value ?? 0} trend={overview.activeToday?.trend} trendUp={overview.activeToday?.trendUp} accent="#0ea5e9" icon={<Users size={20} />} />
                        </>
                    ) : (
                        <>
                            <KPICard label="MRR" value={`₦${((kpis.mrr?.value || 0) / 1000000).toFixed(2)}M`} trend={`${kpis.mrr?.trend || '+0%'} vs last month`} trendUp={kpis.mrr?.trendUp ?? true} large accent="#6c9e4e" icon={<TrendingUp size={20} />} />
                            <KPICard label="ARR" value={`₦${((kpis.arr?.value || 0) / 1000000).toFixed(1)}M`} subtitle="Annual projection" large accent="#6c9e4e" icon={<Calendar size={20} />} />
                            <KPICard label="Revenue Today" value={`₦${((kpis.revenueToday?.value || 0) / 1000).toFixed(0)}K`} trend={`${kpis.revenueToday?.trend || '+0%'} vs yesterday`} trendUp={kpis.revenueToday?.trendUp ?? true} accent="#22c55e" icon={<DollarSign size={20} />} />
                            <KPICard label="Revenue This Month" value={`₦${((kpis.revenueMonth?.value || 0) / 1000000).toFixed(2)}M`} trend={`${kpis.revenueMonth?.trend || '+0%'} vs last`} trendUp={kpis.revenueMonth?.trendUp ?? true} accent="#22c55e" icon={<DollarSign size={20} />} />
                            <KPICard label="ARPU" value={`₦${(kpis.arpu?.value || 0).toLocaleString()}`} trend={`${kpis.arpu?.trend || '+0%'} trend`} trendUp={kpis.arpu?.trendUp ?? true} accent="#7c5cbf" icon={<Users size={20} />} />
                            <KPICard label="Pending Renewals" value={`₦${((kpis.pendingRenewals?.value || 0) / 1000000).toFixed(2)}M`} subtitle="Next 30 days" accent="#f59e0b" icon={<Repeat size={20} />} />
                        </>
                    )}
                </div>

                {/* Business Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {hasOverview ? (
                        [
                            { label: 'Cancelled', value: overview.cancelledBusinesses?.value ?? 0, trend: overview.cancelledBusinesses?.trend, up: overview.cancelledBusinesses?.trendUp, icon: <XCircle size={16} />, color: '#6b7280' },
                            { label: 'New This Month', value: overview.newBusinessThisMonth?.value ?? 0, trend: overview.newBusinessThisMonth?.trend, up: overview.newBusinessThisMonth?.trendUp, icon: <Users size={16} />, color: '#7c5cbf' },
                            { label: 'New Paying', value: overview.newPayingBusinesses?.value ?? 0, trend: overview.newPayingBusinesses?.trend, up: overview.newPayingBusinesses?.trendUp, icon: <DollarSign size={16} />, color: '#0ea5e9' },
                            { label: 'Active/Inactive Ratio', value: overview.activeVsInactiveRatio?.value ?? 0, trend: overview.activeVsInactiveRatio?.trend, up: overview.activeVsInactiveRatio?.trendUp, icon: <TrendingUp size={16} />, color: '#6c9e4e' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ color: s.color, background: `${s.color}10`, padding: 6, borderRadius: 8, marginBottom: 8 }}>{s.icon}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: s.up ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {s.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {s.trend || '+0%'}
                                    </div>
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))
                    ) : (
                        [
                            { label: 'Total Businesses', value: total, icon: <Building2 size={16} />, color: '#6c9e4e' },
                            { label: 'Subscribing', value: active, icon: <TrendingUp size={16} />, color: '#22c55e' },
                            { label: 'Trial Users', value: trial, icon: <Calendar size={16} />, color: '#f59e0b' },
                            { label: 'Expired', value: expired, icon: <AlertCircle size={16} />, color: '#ef4444' },
                            { label: 'Cancelled', value: cancelled, icon: <XCircle size={16} />, color: '#6b7280' },
                            { label: 'New This Month', value: kpis.newThisMonth?.value ?? 0, icon: <Users size={16} />, color: '#7c5cbf' },
                            { label: 'New Paying', value: kpis.newPaying?.value ?? 0, icon: <DollarSign size={16} />, color: '#0ea5e9' },
                            { label: 'Conversion Rate', value: kpis.conversionRate?.value ?? '0%', icon: <TrendingUp size={16} />, color: '#6c9e4e' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: s.color }}>{s.icon}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Charts Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 20,
                    marginBottom: 20
                }}>
                    {/* MRR Trend */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>MRR Trend</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData.mrrTrend}>
                                <defs>
                                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6c9e4e" stopOpacity={0.18} />
                                        <stop offset="95%" stopColor="#6c9e4e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => `₦${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#6c9e4e" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Revenue Bar */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Monthly Revenue</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData.monthlyRevenue} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => `₦${v / 1000000}M`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#6c9e4e" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 20
                }}>
                    {/* ARPU Trend */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>ARPU Trend</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData.arpuTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="value" stroke="#7c5cbf" strokeWidth={2.5} dot={{ r: 4, fill: '#7c5cbf' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Renewal Forecast */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Renewal Forecast</h3>
                        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#9ca3af' }}>Next 4 weeks expected renewals</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData.renewalForecast} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => `₦${v / 1000}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
