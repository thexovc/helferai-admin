'use client';
import React from 'react';
import Topbar from '../Topbar';
import { useInventoryBusinesses, useInventoryKpis, useInventoryCharts } from '@/api/inventory';
import * as T from '@/api/inventory/inventory.types';
import { 
    Building2, TrendingUp, Users, AlertCircle, XCircle, Calendar, 
    DollarSign, Repeat, ArrowUpRight, ArrowDownRight, Zap, Download, 
    ChevronDown, UserCheck, Flame, PieChart as PieIcon
} from 'lucide-react';
import { KPISkeleton, ChartSkeleton } from '../Skeleton';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts';
import DashboardCard from './DashboardCard';
import ConversionFunnel from './ConversionFunnel';
import RecentActions from './RecentActions';

const fmtMillions = (v: number) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>{fmtMillions(p.value)}</div>
            ))}
        </div>
    );
};

export default function InventoryDashboardClient() {
    const [selectedRange, setSelectedRange] = React.useState('30D');
    const [showDateDropdown, setShowDateDropdown] = React.useState(false);
    const [startDate, setStartDate] = React.useState('2023-08-01');
    const [endDate, setEndDate] = React.useState('2023-08-31');

    const { data: businesses, isLoading: loadingBusinesses } = useInventoryBusinesses();
    const { data: kpis, isLoading: loadingKpis } = useInventoryKpis();
    const { data: charts, isLoading: loadingCharts } = useInventoryCharts();

    const isLoading = loadingBusinesses || loadingKpis || loadingCharts;

    // Toggle dropdown
    const toggleDropdown = () => setShowDateDropdown(!showDateDropdown);

    // Handle range selection
    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        // In a real app, this would trigger a new data fetch or filter
        if (range !== 'Custom') {
            setShowDateDropdown(false);
        }
    };

    if (isLoading || !businesses || !kpis || !charts) {
        return (
            <div>
                <Topbar title="Inventory Overview" subtitle="Real-time performance and inventory health metrics." product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                        {Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    const businessList = businesses.data || [];
    const overview = kpis.overview || (kpis as any as T.InventoryOverview);

    // Adapt chart data for Recharts
    const chartData = {
        mrrTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.mrr })),
        monthlyRevenue: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.revenue })),
        arpuTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.arpu })),
        renewalForecast: (charts.pendingRenewalsTimeline || []).map((d: any) => ({ month: d.week, value: d.amount })),
        retentionData: [
            { week: 'W1', active: 85, inactive: 15 },
            { week: 'W2', active: 82, inactive: 18 },
            { week: 'W3', active: 78, inactive: 22 },
            { week: 'W4', active: 75, inactive: 25 },
            { week: 'W5', active: 72, inactive: 28 },
            { week: 'W6', active: 70, inactive: 30 },
            { week: 'W7', active: 68, inactive: 32 },
            { week: 'W8', active: 65, inactive: 35 },
            { week: 'W9', active: 63, inactive: 37 },
            { week: 'W10', active: 60, inactive: 40 },
            { week: 'W11', active: 58, inactive: 42 },
            { week: 'W12', active: 55, inactive: 45 },
        ]
    };

    const formatDateRange = (start: string, end: string) => {
        const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${s} - ${e}`;
    };

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
                borderBottom: '1px solid #f1f5f9',
                position: 'relative',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div 
                        onClick={toggleDropdown}
                        style={{ 
                            padding: '8px 16px', borderRadius: 8, background: '#f8fafc', 
                            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10,
                            fontSize: 13, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer',
                            userSelect: 'none', position: 'relative'
                        }}
                    >
                        {selectedRange === 'Custom' ? formatDateRange(startDate, endDate) : (selectedRange === '30D' ? 'Aug 1, 2023 - Aug 31, 2023' : `Last ${selectedRange}`)}
                        <ChevronDown size={14} color="#94a3b8" />
                        
                        {/* Date Picker Dropdown */}
                        {showDateDropdown && (
                            <div 
                                onClick={e => e.stopPropagation()}
                                style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: 8,
                                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 16, width: 280,
                                    zIndex: 100
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>Select Custom Range</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>START DATE</div>
                                        <input 
                                            type="date" 
                                            value={startDate} 
                                            onChange={e => { setStartDate(e.target.value); setSelectedRange('Custom'); }}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} 
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>END DATE</div>
                                        <input 
                                            type="date" 
                                            value={endDate} 
                                            onChange={e => { setEndDate(e.target.value); setSelectedRange('Custom'); }}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setShowDateDropdown(false)}
                                        style={{ background: '#6c9e4e', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['Today', 'Yesterday', '7D', '30D', '3M', '6M', '12M', 'Default'].map(p => (
                            <button 
                                key={p} 
                                onClick={() => handleRangeChange(p)}
                                style={{ 
                                    background: selectedRange === p ? '#fff' : 'transparent', 
                                    border: selectedRange === p ? '1px solid #e2e8f0' : 'none', 
                                    padding: '6px 12px', fontSize: 12, fontWeight: 700,
                                    color: selectedRange === p ? '#1a1a2e' : '#94a3b8', cursor: 'pointer',
                                    borderRadius: 6,
                                    boxShadow: selectedRange === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <button style={{ 
                    background: '#6c9e4e', color: '#fff', border: 'none', padding: '10px 20px', 
                    borderRadius: 10, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', 
                    gap: 8, cursor: 'pointer', boxShadow: '0 4px 10px rgba(108, 158, 78, 0.2)'
                }}>
                    <Download size={16} /> Export Report
                </button>
            </div>

            <div style={{ padding: 'var(--content-padding)' }}>
                
                {/* FIRST KPI ROW - Basic Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <DashboardCard variant="metric" label="Total Businesses" value={overview.totalBusiness?.value?.toLocaleString() ?? '2,418'} trend="+5.2% ↗" trendUp={true} subtitle="overall growth" />
                    <DashboardCard variant="metric" label="New This Month" value={overview.newBusinessThisMonth?.value ?? '124'} trend="12 +" trendUp={true} subtitle="vs last month" />
                    <DashboardCard variant="metric" label="Active Today" value={overview.activeToday?.value ?? '842'} trend="34.8% ⚡" trendUp={true} subtitle="daily active rate" />
                    <DashboardCard variant="metric" label="New Paying (L30D)" value={overview.newPayingBusinesses?.value ?? '32'} trend="+4% ↗" trendUp={true} subtitle="conversion uptick" />
                </div>

                {/* SECOND KPI ROW - Status Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <DashboardCard variant="status" label="Subscribing Orgs" value={overview.totalSubscribingBusiness?.value?.toLocaleString() ?? '1,842'} subValue="+48 new" icon={Building2} accent="#3b82f6" progress={100} />
                    <DashboardCard variant="status" label="Active Trials" value={overview.trialUsers?.value ?? '312'} subValue="80% active" icon={Calendar} accent="#a16207" progress={75} />
                    <DashboardCard variant="status" label="Churned (L30D)" value={overview.cancelledBusinesses?.value ?? '14'} subValue="0.8% rate" icon={XCircle} accent="#ef4444" progress={10} />
                    <DashboardCard variant="status" label="Trial → Paid" value={`${overview.conversionRate?.value ?? '24.6'}%`} subValue="+2.1%" icon={TrendingUp} accent="#22c55e" progress={45} />
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
                            <div style={{ color: '#94a3b8' }}><Repeat size={20} /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData.monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6c9e4e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6c9e4e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tickFormatter={v => `₦${v / 1000000}M`} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#6c9e4e" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Business Growth Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Business Growth</h3>
                            </div>
                            <div style={{ color: '#94a3b8' }}><Repeat size={20} /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.monthlyRevenue} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#eaf4e3" radius={[8, 8, 8, 8]}>
                                    {chartData.monthlyRevenue.map((_, index) => (
                                        <Cell key={index} fill={index === chartData.monthlyRevenue.length - 2 ? '#6c9e4e' : '#eaf4e3'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RETENTION & CHURN VELOCITY CHART */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 40, border: '1.5px solid #3b82f6', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Retention & Churn Velocity</h3>
                            <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>Comparison of Active vs Inactive business profiles</div>
                        </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#64748b'
                    }}>
                        <div style={{ width: 12, height: 12, borderRadius: 99, background: '#6c9e4e' }} /> ACTIVE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 99, background: '#eaf4e3' }} /> INACTIVE
                    </div>
                    </div>
                    <ResponsiveContainer width="100%" height={360}>
                        <BarChart data={chartData.retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                            <Tooltip />
                            <Bar dataKey="active" stackId="a" fill="#6c9e4e" radius={[4, 4, 0, 0]} barSize={50} />
                            <Bar dataKey="inactive" stackId="a" fill="#eaf4e3" radius={[0, 0, 4, 4]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* BOTTOM ROW (Funnel and Actions) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, flexWrap: 'wrap' }}>
                    <ConversionFunnel />
                    <RecentActions />
                </div>

            </div>
        </div>
    );
}
