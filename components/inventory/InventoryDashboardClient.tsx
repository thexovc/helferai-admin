'use client';
import React from 'react';
import Topbar from '../Topbar';
import { useInventoryDashboard } from '@/api/inventory';
import * as T from '@/api/inventory/inventory.types';
import {
    Building2, TrendingUp, Users, AlertCircle, XCircle, Calendar,
    DollarSign, Repeat, ArrowUpRight, ArrowDownRight, Zap, Download,
    ChevronDown, UserCheck, Flame, PieChart as PieIcon
} from 'lucide-react';
import { KPISkeleton } from '../Skeleton';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts';
import DashboardCard from './DashboardCard';
import ConversionFunnel from './ConversionFunnel';
import RecentActions from './RecentActions';
import { fmtMillions } from '@/utils';


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

    // Initialize with 30 days range
    const [startDate, setStartDate] = React.useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = React.useState(() => new Date().toISOString().split('T')[0]);

    const [tempStart, setTempStart] = React.useState(startDate);
    const [tempEnd, setTempEnd] = React.useState(endDate);

    const { data: dashboard, isLoading } = useInventoryDashboard(startDate, endDate);

    // Toggle dropdown
    const toggleDropdown = () => {
        setTempStart(startDate);
        setTempEnd(endDate);
        setShowDateDropdown(!showDateDropdown);
    };

    // Handle range selection
    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        if (range === 'Custom') return;

        const end = new Date();
        let start = new Date();

        switch (range) {
            case 'Today':
                start = new Date(end);
                break;
            case 'Yesterday':
                start = new Date(end);
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case '7D':
                start.setDate(start.getDate() - 7);
                break;
            case '30D':
                start.setDate(start.getDate() - 30);
                break;
            case '3M':
                start.setMonth(start.getMonth() - 3);
                break;
            case '6M':
                start.setMonth(start.getMonth() - 6);
                break;
            case '12M':
                start.setFullYear(start.getFullYear() - 1);
                break;
            case 'Default':
                start = new Date(end.getFullYear(), end.getMonth(), 1); // Start of month
                break;
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setShowDateDropdown(false);
    };

    if (isLoading || !dashboard) {
        return (
            <div>
                {/* <Topbar title="Inventory Overview" subtitle="Real-time performance and inventory health metrics." product="inventory" /> */}
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                        {Array(4).fill(0).map((_: number, i: number) => <KPISkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    const { kpis, charts, recentActions } = dashboard;
    const overview = kpis;

    const getRangeLabel = () => {
        if (selectedRange === 'Today') return 'Today';
        if (selectedRange === 'Yesterday') return 'Yesterday';
        if (selectedRange === 'Default') return 'This Month';
        if (selectedRange === 'Custom') return 'in Selected Period';
        if (selectedRange.endsWith('D')) return `Last ${selectedRange.replace('D', '')} Days`;
        if (selectedRange.endsWith('M')) return `Last ${selectedRange.replace('M', '')} Months`;
        return selectedRange;
    };
    const rangeLabel = getRangeLabel();

    const getComparePeriodLabel = () => {
        if (selectedRange === 'Today') return 'yesterday';
        if (selectedRange === 'Yesterday') return 'day before';
        if (selectedRange === '7D') return 'prev. 7 days';
        if (selectedRange === '30D') return 'prev. 30 days';
        if (selectedRange === '3M') return 'prev. 3 months';
        if (selectedRange === '6M') return 'prev. 6 months';
        if (selectedRange === '12M') return 'prev. year';
        if (selectedRange === 'Default') return 'prev. month';
        return 'prev. period';
    };
    const compareLabel = getComparePeriodLabel();

    // Adapt chart data for Recharts
    const chartData = {
        mrrTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.mrr })),
        monthlyRevenue: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.revenue })),
        arpuTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.arpu || 0 })),
        renewalForecast: (charts.pendingRenewalsTimeline || []).map((d: any) => ({ month: d.week, value: d.amount })),
        retentionData: (charts.retentionChurn || []).map((d: any) => ({
            week: d.week,
            active: d.active,
            inactive: d.inactive
        }))
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
                        {selectedRange === 'Custom' ? formatDateRange(startDate, endDate) : (['Today', 'Yesterday', 'Default'].includes(selectedRange) ? formatDateRange(startDate, endDate) : `Last ${selectedRange}`)}
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
                                            value={tempStart}
                                            onChange={e => setTempStart(e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>END DATE</div>
                                        <input
                                            type="date"
                                            value={tempEnd}
                                            onChange={e => setTempEnd(e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            setStartDate(tempStart);
                                            setEndDate(tempEnd);
                                            setSelectedRange('Custom');
                                            setShowDateDropdown(false);
                                        }}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <DashboardCard variant="metric" label="Total Businesses" value={fmtMillions(overview.totalBusiness?.value ?? 0)} trend={overview.totalBusiness?.trend ?? ''} trendUp={overview.totalBusiness?.trendUp ?? true} subtitle="total growth" />
                    <DashboardCard variant="metric" label={`New ${rangeLabel}`} value={fmtMillions(overview.newBusinessThisMonth?.value ?? 0)} trend={overview.newBusinessThisMonth?.trend ?? ''} trendUp={overview.newBusinessThisMonth?.trendUp ?? true} subtitle={`vs ${compareLabel}`} />
                    <DashboardCard variant="metric" label={`Active ${rangeLabel}`} value={overview.activeToday?.value?.toLocaleString() ?? '0'} trend={overview.activeToday?.trend ?? ''} trendUp={overview.activeToday?.trendUp ?? true} subtitle={`vs ${compareLabel}`} />
                    <DashboardCard variant="metric" label="Total MRR" value={fmtMillions(overview.mrr?.value ?? 0, "₦")} trend={overview.mrr?.trend ?? ''} trendUp={overview.mrr?.trendUp ?? true} subtitle="system wide" />
                    <DashboardCard variant="metric" label="RR" value={fmtMillions(overview.rr?.value ?? 0, "₦")} trend={overview.rr?.trend ?? ''} trendUp={overview.rr?.trendUp ?? true} subtitle={`vs ${compareLabel}`} />
                </div>

                {/* SECOND KPI ROW - Status Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <DashboardCard variant="status" label="Subscribing Orgs" value={overview.totalSubscribingBusiness?.value?.toLocaleString() ?? '0'} subValue={overview.totalSubscribingBusiness?.trend ?? ''} icon={Building2} accent="#3b82f6" progress={100} />
                    <DashboardCard variant="status" label="Active Trials" value={overview.trialUsers?.value ?? '0'} subValue="Trial active" icon={Calendar} accent="#a16207" progress={75} />
                    <DashboardCard variant="status" label="Cancelled" value={overview.cancelledBusinesses?.value ?? '0'} subValue="Loss rate" icon={XCircle} accent="#ef4444" progress={10} />
                    <DashboardCard variant="status" label="Trial → Paid" value={`${overview.conversionRate?.value ?? '0'}%`} subValue="conversion rate" icon={TrendingUp} accent="#22c55e" progress={45} />
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
                                    {chartData.monthlyRevenue.map((_item: any, index: number) => (
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
                    <ConversionFunnel data={charts.conversionFunnel || {
                        registered: overview.totalBusiness?.value ?? 0,
                        trialing: overview.trialUsers?.value ?? 0,
                        paying: overview.totalSubscribingBusiness?.value ?? 0
                    }} />
                    <RecentActions actions={recentActions} />
                </div>

            </div>
        </div>
    );
}
