'use client';
import React from 'react';
import Topbar from '../../../components/Topbar';
import KPICard from '../../../components/KPICard';
import { InventoryService } from '../../lib/services/inventory';
import { formatCurrency } from '../../lib/utils';
import { Building2, TrendingUp, Users, AlertCircle, XCircle, Calendar, DollarSign, Repeat } from 'lucide-react';
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

export default function InventoryDashboard() {
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const load = async () => {
            const businesses = await InventoryService.getBusinesses();
            const kpis = await InventoryService.getDashboardKPIs();
            const charts = await InventoryService.getChartData();
            setData({ businesses, kpis, charts });
        };
        load();
    }, []);

    if (!data) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Dashboard...</div>;

    const { businesses, kpis, charts } = data;
    const total = businesses.length;
    const active = businesses.filter((b: any) => b.status === 'Active').length;
    const trial = businesses.filter((b: any) => b.status === 'Trial').length;
    const expired = businesses.filter((b: any) => b.status === 'Expired').length;
    const cancelled = businesses.filter((b: any) => b.status === 'Cancelled').length;

    return (
        <div>
            <Topbar title="Inventory Dashboard" subtitle="Business & revenue overview" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* TOP KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <KPICard label="MRR" value={kpis.mrr.value} trend={`${kpis.mrr.trend} vs last month`} trendUp large accent="#6c9e4e" icon={<TrendingUp size={20} />} />
                    <KPICard label="ARR" value={kpis.arr.value} subtitle="Annual projection" large accent="#6c9e4e" icon={<Calendar size={20} />} />
                    <KPICard label="Revenue Today" value={kpis.revenueToday.value} trend={`${kpis.revenueToday.trend} vs yesterday`} trendUp accent="#22c55e" icon={<DollarSign size={20} />} />
                    <KPICard label="Revenue This Month" value={kpis.revenueMonth.value} trend={`${kpis.revenueMonth.trend} vs last`} trendUp accent="#22c55e" icon={<DollarSign size={20} />} />
                    <KPICard label="ARPU" value={kpis.arpu.value} trend={`${kpis.arpu.trend} trend`} trendUp accent="#7c5cbf" icon={<Users size={20} />} />
                    <KPICard label="Pending Renewals" value={kpis.pendingRenewals.value} subtitle="Next 30 days" accent="#f59e0b" icon={<Repeat size={20} />} />
                </div>

                {/* Business Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Total Businesses', value: total, icon: <Building2 size={16} />, color: '#6c9e4e' },
                        { label: 'Subscribing', value: active, icon: <TrendingUp size={16} />, color: '#22c55e' },
                        { label: 'Trial Users', value: trial, icon: <Calendar size={16} />, color: '#f59e0b' },
                        { label: 'Expired', value: expired, icon: <AlertCircle size={16} />, color: '#ef4444' },
                        { label: 'Cancelled', value: cancelled, icon: <XCircle size={16} />, color: '#6b7280' },
                        { label: 'New This Month', value: 3, icon: <Users size={16} />, color: '#7c5cbf' },
                        { label: 'New Paying', value: 2, icon: <DollarSign size={16} />, color: '#0ea5e9' },
                        { label: 'Conversion Rate', value: '62%', icon: <TrendingUp size={16} />, color: '#6c9e4e' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: s.color }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
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
                            <AreaChart data={charts.mrrTrend}>
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
                            <BarChart data={charts.monthlyRevenue} barSize={28}>
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
                            <LineChart data={charts.arpuTrend}>
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
                            <BarChart data={charts.renewalForecast} barSize={36}>
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
