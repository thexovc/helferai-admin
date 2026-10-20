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
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import DashboardCard from './DashboardCard';
import ConversionFunnel from './ConversionFunnel';
import RecentActions from './RecentActions';

// Full amount for tooltips and totals, e.g. ₦16,000
const fmtNaira = (v: number) => `₦${Math.round(v).toLocaleString()}`;
// Short axis labels, e.g. ₦0, ₦4K, ₦1.5M
const fmtNairaShort = (v: number) => v >= 1000000 ? `₦${+(v / 1000000).toFixed(1)}M` : v >= 1000 ? `₦${+(v / 1000).toFixed(1)}K` : `₦${v}`;

const RevenueTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtNaira(d.value)}</div>
            <div style={{ color: '#cbd5e1', marginTop: 2 }}>{d.count} paid subscription{d.count === 1 ? '' : 's'}</div>
        </div>
    );
};

const CountTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#1a1a2e', padding: '10px 14px', borderRadius: 12, color: '#fff', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ fontWeight: 600 }}>{Number(p.value).toLocaleString()} businesses</div>
            ))}
        </div>
    );
};

// Local YYYY-MM-DD (toISOString would shift the day to UTC)
const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 'Default' is the current month to date
const getRangeDates = (range: string, customStart: string, customEnd: string): { startDate?: string; endDate?: string } => {
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
        default: return { startDate: toYMD(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: toYMD(today) };
    }
};

// 'totalSubscribingBusiness' -> 'Total Subscribing Business', 'mrr' -> 'MRR'
const metricName = (key: string) =>
    ['mrr', 'arr', 'rr', 'arpu'].includes(key)
        ? key.toUpperCase()
        : key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

const csvCell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function InventoryDashboardClient() {
    const [selectedRange, setSelectedRange] = React.useState('Default');
    const [showDateDropdown, setShowDateDropdown] = React.useState(false);
    // Applied custom range, plus the draft values being edited in the dropdown
    const [customStart, setCustomStart] = React.useState('');
    const [customEnd, setCustomEnd] = React.useState('');
    const [draftStart, setDraftStart] = React.useState('');
    const [draftEnd, setDraftEnd] = React.useState('');

    const { startDate, endDate } = getRangeDates(selectedRange, customStart, customEnd);
    const { data: dashboard, isLoading, isFetching, isError } = useInventoryDashboard(startDate, endDate);

    // Dates shown in the header; 'Default' is this month so far
    const today = new Date();
    const shownStart = startDate ?? toYMD(new Date(today.getFullYear(), today.getMonth(), 1));
    const shownEnd = endDate ?? toYMD(today);

    const toggleDropdown = () => {
        if (!showDateDropdown) {
            setDraftStart(shownStart);
            setDraftEnd(shownEnd);
        }
        setShowDateDropdown(!showDateDropdown);
    };

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        setShowDateDropdown(false);
    };

    const draftValid = !!draftStart && !!draftEnd && draftStart <= draftEnd;
    const applyCustomRange = () => {
        if (!draftValid) return;
        setCustomStart(draftStart);
        setCustomEnd(draftEnd);
        setSelectedRange('Custom');
        setShowDateDropdown(false);
    };

    if (isLoading || !dashboard) {
        return (
            <div>
                <Topbar title="Inventory Overview" subtitle="Real-time performance and inventory health metrics." product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    {isError && !isLoading ? (
                        <div style={{ padding: 24, borderRadius: 12, background: '#fef2f2', color: '#b91c1c', fontSize: 14, fontWeight: 600 }}>
                            Couldn&apos;t load the dashboard. Check your connection or sign in again.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                            {Array(4).fill(0).map((_: number, i: number) => <KPISkeleton key={i} />)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { kpis, charts, recentActions } = dashboard;
    const overview = kpis; // The response puts them directly under kpis

    // Adapt chart data for Recharts
    const chartData = {
        mrrTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.mrr })),
        monthlyRevenue: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.revenue, count: d.paidSubscriptions ?? 0 })),
        arpuTrend: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.arpu || 0 })),
        renewalForecast: (charts.pendingRenewalsTimeline || []).map((d: any) => ({ month: d.week, value: d.amount })),
        businessGrowth: (charts.monthlyTrends || []).map((d: any) => ({ month: d.month, value: d.totalBusiness ?? 0 })),
        retentionData: charts.retentionChurn || []
    };

    // Parse YYYY-MM-DD as a local date so the label doesn't slip a day
    const formatDateRange = (start: string, end: string) => {
        const fmt = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return start === end ? fmt(start) : `${fmt(start)} - ${fmt(end)}`;
    };

    const comparisonSubtitle = selectedRange === 'Default' ? 'vs last month' : 'vs previous period';

    // The charts are split by day, week or month depending on the period length
    const granularity: string = charts.granularity || 'month';
    const revenueTotal = chartData.monthlyRevenue.reduce((sum: number, d: any) => sum + d.value, 0);

    // The active count covers the whole selected period, so name it after the period
    const activeLabels: Record<string, string> = { Today: 'Active Today', Yesterday: 'Active Yesterday', Default: 'Active This Month' };
    const activeLabel = activeLabels[selectedRange] ?? 'Active in Period';

    // Bars under the status cards show each count as a share of all businesses
    const totalCount = Number(overview.totalBusiness?.value || 0);
    const shareOfTotal = (v?: number) => totalCount > 0 ? Math.min(100, Math.round((Number(v || 0) / totalCount) * 100)) : 0;

    const exportReport = () => {
        const rows: unknown[][] = [
            ['HelferAI Inventory Report'],
            ['Period', formatDateRange(shownStart, shownEnd)],
            ['Generated', new Date().toLocaleString()],
            [],
            ['Metric', 'Value', 'Trend'],
            ...Object.entries(kpis || {}).map(([key, v]: [string, any]) => [metricName(key), v?.value ?? '', v?.trend ?? '']),
            [],
            ['Period', 'Subscription Income', 'MRR', 'ARPU', 'Total Businesses', 'New Businesses', 'Subscribing', 'Sales by Businesses'],
            ...(charts.monthlyTrends || []).map((d: any) => [d.month, d.revenue, d.mrr, d.arpu, d.totalBusiness ?? '', d.newBusinesses ?? '', d.subscribing ?? '', d.salesVolume ?? '']),
            [],
            ['Period', 'Active', 'Inactive'],
            ...(charts.retentionChurn || []).map((d: any) => [d.week, d.active, d.inactive]),
        ];
        const csv = rows.map(r => r.map(csvCell).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${shownStart}-to-${shownEnd}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
                        {formatDateRange(shownStart, shownEnd)}
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
                                            value={draftStart}
                                            max={toYMD(today)}
                                            onChange={e => setDraftStart(e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} 
                                        />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>END DATE</div>
                                        <input 
                                            type="date" 
                                            value={draftEnd}
                                            max={toYMD(today)}
                                            onChange={e => setDraftEnd(e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} 
                                        />
                                    </div>
                                    {!draftValid && draftStart && draftEnd && (
                                        <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Start date must be before end date.</div>
                                    )}
                                    <button
                                        onClick={applyCustomRange}
                                        disabled={!draftValid}
                                        style={{ background: '#6c9e4e', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, cursor: draftValid ? 'pointer' : 'not-allowed', opacity: draftValid ? 1 : 0.5, marginTop: 8 }}
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
                    {isFetching && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Updating…</span>
                    )}
                </div>
                <button onClick={exportReport} style={{
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
                    <DashboardCard variant="metric" label="Total Businesses" value={overview.totalBusiness?.value?.toLocaleString() ?? '0'} trend={overview.totalBusiness?.trend ?? ''} trendUp={overview.totalBusiness?.trendUp ?? true} subtitle="overall growth" />
                    <DashboardCard variant="metric" label={selectedRange === 'Default' ? 'New This Month' : 'New in Period'} value={overview.newBusinessThisMonth?.value ?? '0'} trend={overview.newBusinessThisMonth?.trend ?? ''} trendUp={overview.newBusinessThisMonth?.trendUp ?? true} subtitle={comparisonSubtitle} />
                    <DashboardCard variant="metric" label={activeLabel} value={overview.activeToday?.value ?? '0'} trend={overview.activeToday?.trend ?? ''} trendUp={overview.activeToday?.trendUp ?? true} subtitle="businesses using HelferAI" />
                    <DashboardCard variant="metric" label="MRR" value={`₦${(overview.mrr?.value / 1000).toFixed(1)}k`} trend={overview.mrr?.trend ?? ''} trendUp={overview.mrr?.trendUp ?? true} subtitle={comparisonSubtitle} />
                </div>

                {/* SECOND KPI ROW - Status Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <DashboardCard variant="status" label="Subscribing Orgs" value={overview.totalSubscribingBusiness?.value?.toLocaleString() ?? '0'} subValue={overview.totalSubscribingBusiness?.trend ?? ''} icon={Building2} accent="#3b82f6" progress={shareOfTotal(overview.totalSubscribingBusiness?.value)} />
                    <DashboardCard variant="status" label="Trials Started" value={overview.trialUsers?.value ?? '0'} subValue="in this period" icon={Calendar} accent="#a16207" progress={shareOfTotal(overview.trialUsers?.value)} />
                    <DashboardCard variant="status" label="Cancelled" value={overview.cancelledBusinesses?.value ?? '0'} subValue="Loss rate" icon={XCircle} accent="#ef4444" progress={shareOfTotal(overview.cancelledBusinesses?.value)} />
                    <DashboardCard variant="status" label="Trial → Paid" value={`${overview.conversionRate?.value ?? '0'}%`} subValue="of ended trials paid" icon={TrendingUp} accent="#22c55e" progress={Math.min(100, Math.round(Number(overview.conversionRate?.value || 0)))} />
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
                            <BarChart data={chartData.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tickFormatter={fmtNairaShort} allowDecimals={false} width={56} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#6c9e4e" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Business Growth Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Business Growth</h3>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>Total businesses at the end of each {granularity}</div>
                            </div>
                            <div style={{ color: '#94a3b8' }}><Repeat size={20} /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.businessGrowth} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip content={<CountTooltip />} />
                                <Bar dataKey="value" fill="#eaf4e3" radius={[8, 8, 8, 8]}>
                                    {chartData.businessGrowth.map((_item: any, index: number) => (
                                        <Cell key={index} fill={index === chartData.businessGrowth.length - 1 ? '#6c9e4e' : '#eaf4e3'} />
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
                            <div style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>Active vs inactive businesses at the end of each {granularity}</div>
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
                    {/* Businesses that joined in the selected period, and how far they got */}
                    <ConversionFunnel data={{
                        registered: charts.conversionFunnel?.registered ?? overview.totalBusiness?.value ?? 0,
                        trialing: charts.conversionFunnel?.trialing ?? overview.trialUsers?.value ?? 0,
                        paying: charts.conversionFunnel?.paying ?? overview.totalSubscribingBusiness?.value ?? 0
                    }} />
                    <RecentActions actions={recentActions} />
                </div>

            </div>
        </div>
    );
}
