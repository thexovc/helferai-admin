'use client';
import React from 'react';
import Topbar from '../Topbar';
import {
    useInventoryFinance,
    useInventoryFinanceSubscriptions,
} from '@/api/inventory/inventory.queries';
import * as T from '@/api/inventory/inventory.types';
import {
    Clock,
    Search,
    Filter,
    MoreHorizontal,
    ChevronDown,
    X,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
} from 'lucide-react';
import { KPISkeleton } from '../Skeleton';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import DashboardCard from './DashboardCard';
import RevenueEvent from './RevenueEvent';
import { fmtMillions } from '@/utils';


const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
};

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#1a1a2e',
                padding: '10px 14px',
                borderRadius: 12,
                color: '#fff',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color || '#6c9e4e', fontWeight: 600 }}>
                    {typeof p.value === 'number' && p.dataKey === 'value'
                        ? fmtMillions(p.value, '₦')
                        : `${p.name}: ${p.value}`}
                </div>
            ))}
        </div>
    );
};

// ─── Slide-out Filter Drawer ──────────────────────────────────────────────────

interface DrawerFilters {
    search: string;
    planFilter: string;
    statusFilter: string;
    startDateFrom: string;
    startDateTo: string;
    expiryDateFrom: string;
    expiryDateTo: string;
}

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: DrawerFilters;
    onApply: (f: DrawerFilters) => void;
}

function FilterDrawer({ open, onClose, filters, onApply }: FilterDrawerProps) {
    const [local, setLocal] = React.useState<DrawerFilters>(filters);

    // Sync when parent resets
    React.useEffect(() => setLocal(filters), [filters]);

    const set = (key: keyof DrawerFilters, value: string) =>
        setLocal(prev => ({ ...prev, [key]: value }));

    const handleApply = () => {
        onApply(local);
        onClose();
    };

    const handleClear = () => {
        const empty: DrawerFilters = {
            search: '',
            planFilter: 'All',
            statusFilter: 'All',
            startDateFrom: '',
            startDateTo: '',
            expiryDateFrom: '',
            expiryDateTo: '',
        };
        setLocal(empty);
        onApply(empty);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 200,
                        backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* Drawer panel */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: 380,
                    background: '#fff',
                    zIndex: 300,
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
                    transform: open ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px 28px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>
                            Filter Subscriptions
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                            Refine the subscription table
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                    {/* Search */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Business Name</label>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={14}
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                }}
                            />
                            <input
                                value={local.search}
                                onChange={e => set('search', e.target.value)}
                                placeholder="Search business…"
                                style={{ ...inputStyle, paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    {/* Plan */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Plan Type</label>
                        <select
                            value={local.planFilter}
                            onChange={e => set('planFilter', e.target.value)}
                            style={selectStyle}
                        >
                            <option value="All">All Plans</option>
                            <option value="Basic Helfer">Basic Helfer</option>
                            <option value="Smart Helfer">Smart Helfer</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Status</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['All', 'Active', 'Expiring Soon', 'Expired'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => set('statusFilter', s)}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: 99,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        border: '1.5px solid',
                                        borderColor: local.statusFilter === s ? '#6c9e4e' : '#e2e8f0',
                                        background: local.statusFilter === s ? '#eaf4e3' : '#fff',
                                        color: local.statusFilter === s ? '#6c9e4e' : '#64748b',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0 24px' }} />

                    {/* Start Date range */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Subscription Start Date</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <div style={subLabelStyle}>From</div>
                                <input
                                    type="date"
                                    value={local.startDateFrom}
                                    onChange={e => set('startDateFrom', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <div style={subLabelStyle}>To</div>
                                <input
                                    type="date"
                                    value={local.startDateTo}
                                    onChange={e => set('startDateTo', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Expiry Date range */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Expiry Date</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <div style={subLabelStyle}>From</div>
                                <input
                                    type="date"
                                    value={local.expiryDateFrom}
                                    onChange={e => set('expiryDateFrom', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <div style={subLabelStyle}>To</div>
                                <input
                                    type="date"
                                    value={local.expiryDateTo}
                                    onChange={e => set('expiryDateTo', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '20px 28px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        gap: 12,
                        flexShrink: 0,
                        background: '#fafbfc',
                    }}
                >
                    <button onClick={handleClear} style={secondaryBtnStyle}>
                        Clear All
                    </button>
                    <button onClick={handleApply} style={primaryBtnStyle}>
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Shared micro-styles ──────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 800,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 10,
};
const subLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 5,
};
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13,
    fontWeight: 500,
    color: '#1a1a2e',
    outline: 'none',
    boxSizing: 'border-box',
};
const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
};
const primaryBtnStyle: React.CSSProperties = {
    flex: 1,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
};
const secondaryBtnStyle: React.CSSProperties = {
    flex: '0 0 auto',
    background: '#fff',
    color: '#64748b',
    border: '1.5px solid #e2e8f0',
    padding: '12px 20px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
};

// ─── Active filter pills ──────────────────────────────────────────────────────

function ActiveFilterPills({
    filters,
    onRemove,
}: {
    filters: DrawerFilters;
    onRemove: (key: keyof DrawerFilters) => void;
}) {
    const pills: { key: keyof DrawerFilters; label: string }[] = [];
    if (filters.search) pills.push({ key: 'search', label: `"${filters.search}"` });
    if (filters.planFilter && filters.planFilter !== 'All')
        pills.push({ key: 'planFilter', label: filters.planFilter });
    if (filters.statusFilter && filters.statusFilter !== 'All')
        pills.push({ key: 'statusFilter', label: filters.statusFilter });
    if (filters.startDateFrom) pills.push({ key: 'startDateFrom', label: `Start ≥ ${filters.startDateFrom}` });
    if (filters.startDateTo) pills.push({ key: 'startDateTo', label: `Start ≤ ${filters.startDateTo}` });
    if (filters.expiryDateFrom) pills.push({ key: 'expiryDateFrom', label: `Expiry ≥ ${filters.expiryDateFrom}` });
    if (filters.expiryDateTo) pills.push({ key: 'expiryDateTo', label: `Expiry ≤ ${filters.expiryDateTo}` });

    if (!pills.length) return null;

    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {pills.map(p => (
                <span
                    key={p.key}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px 4px 12px',
                        borderRadius: 99,
                        background: '#eaf4e3',
                        border: '1px solid #c8e6b4',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#4a7c32',
                    }}
                >
                    {p.label}
                    <button
                        onClick={() => onRemove(p.key)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            color: '#6c9e4e',
                        }}
                    >
                        <X size={11} />
                    </button>
                </span>
            ))}
        </div>
    );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────

function PaginationBar({
    page,
    totalPages,
    total,
    pageSize,
    onPage,
}: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPage: (p: number) => void;
}) {
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    // Build page number array with ellipsis
    const pages: (number | '…')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push('…');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++)
            pages.push(i);
        if (page < totalPages - 2) pages.push('…');
        pages.push(totalPages);
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 24,
                flexWrap: 'wrap',
                gap: 12,
            }}
        >
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                Showing <strong style={{ color: '#1a1a2e' }}>{from}–{to}</strong> of{' '}
                <strong style={{ color: '#1a1a2e' }}>{total}</strong> subscriptions
            </span>

            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <PaginationBtn
                    disabled={page === 1}
                    onClick={() => onPage(page - 1)}
                    icon={<ChevronLeft size={14} />}
                />
                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>
                            …
                        </span>
                    ) : (
                        <PaginationBtn
                            key={p}
                            active={p === page}
                            onClick={() => onPage(p as number)}
                            label={String(p)}
                        />
                    ),
                )}
                <PaginationBtn
                    disabled={page === totalPages}
                    onClick={() => onPage(page + 1)}
                    icon={<ChevronRight size={14} />}
                />
            </div>
        </div>
    );
}

function PaginationBtn({
    onClick,
    active,
    disabled,
    label,
    icon,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label?: string;
    icon?: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: active ? 'none' : '1px solid #e2e8f0',
                background: active ? '#1a1a2e' : disabled ? '#f8fafc' : '#fff',
                color: active ? '#fff' : disabled ? '#cbd5e1' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
            }}
        >
            {icon || label}
        </button>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        Active: { bg: '#eaf4e3', color: '#6c9e4e' },
        'Expiring Soon': { bg: '#fff7ed', color: '#c2410c' },
        Expired: { bg: '#fee2e2', color: '#b91c1c' },
    };
    const style = map[status] || { bg: '#f1f5f9', color: '#64748b' };
    return (
        <span
            style={{
                padding: '5px 12px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                background: style.bg,
                color: style.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
            }}
        >
            <span
                style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor', flexShrink: 0 }}
            />
            {status}
        </span>
    );
}

// ─── Main page component ──────────────────────────────────────────────────────

const EMPTY_FILTERS: DrawerFilters = {
    search: '',
    planFilter: 'All',
    statusFilter: 'All',
    startDateFrom: '',
    startDateTo: '',
    expiryDateFrom: '',
    expiryDateTo: '',
};

export default function InventoryFinancePageClient() {
    // ── Dashboard date range (KPIs + charts) ──────────────────────────────────
    const [selectedRange, setSelectedRange] = React.useState('30D');
    const [showDateDropdown, setShowDateDropdown] = React.useState(false);
    const [startDate, setStartDate] = React.useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = React.useState(() => new Date().toISOString().split('T')[0]);
    const [tempStart, setTempStart] = React.useState(startDate);
    const [tempEnd, setTempEnd] = React.useState(endDate);

    // ── Subscription table state ───────────────────────────────────────────────
    const [tablePage, setTablePage] = React.useState(1);
    const TABLE_PAGE_SIZE = 15;

    // Quick-search above the table (instant, no drawer needed)
    const [quickSearch, setQuickSearch] = React.useState('');
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [appliedFilters, setAppliedFilters] = React.useState<DrawerFilters>(EMPTY_FILTERS);

    // Merge quick search into the applied filters for the API call
    const tableFilters: DrawerFilters = { ...appliedFilters, search: quickSearch || appliedFilters.search };

    // Count active non-search filters for badge
    const activeFilterCount = [
        appliedFilters.planFilter !== 'All',
        appliedFilters.statusFilter !== 'All',
        !!appliedFilters.startDateFrom,
        !!appliedFilters.startDateTo,
        !!appliedFilters.expiryDateFrom,
        !!appliedFilters.expiryDateTo,
    ].filter(Boolean).length;

    // ── API calls ──────────────────────────────────────────────────────────────
    const { data: financeData, isLoading: dashLoading } = useInventoryFinance(startDate, endDate);

    const { data: subsData, isLoading: subsLoading } = useInventoryFinanceSubscriptions({
        search: tableFilters.search,
        planFilter: tableFilters.planFilter,
        statusFilter: tableFilters.statusFilter,
        startDateFrom: tableFilters.startDateFrom,
        startDateTo: tableFilters.startDateTo,
        expiryDateFrom: tableFilters.expiryDateFrom,
        expiryDateTo: tableFilters.expiryDateTo,
        page: tablePage,
        pageSize: TABLE_PAGE_SIZE,
    });

    // Reset to page 1 whenever filters change
    React.useEffect(() => setTablePage(1), [
        tableFilters.search,
        tableFilters.planFilter,
        tableFilters.statusFilter,
        tableFilters.startDateFrom,
        tableFilters.startDateTo,
        tableFilters.expiryDateFrom,
        tableFilters.expiryDateTo,
    ]);

    // ── Date range helpers ─────────────────────────────────────────────────────
    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
        if (range === 'Custom') return;
        const end = new Date();
        let start = new Date();
        switch (range) {
            case 'Today': break;
            case 'Yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case '7D': start.setDate(start.getDate() - 7); break;
            case '30D': start.setDate(start.getDate() - 30); break;
            case '3M': start.setMonth(start.getMonth() - 3); break;
            case '6M': start.setMonth(start.getMonth() - 6); break;
            case '12M': start.setFullYear(start.getFullYear() - 1); break;
            case 'Default': start = new Date(end.getFullYear(), end.getMonth(), 1); break;
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        setShowDateDropdown(false);
    };

    const formatDateRange = (s: string, e: string) => {
        const fmt = (d: string) =>
            new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${fmt(s)} – ${fmt(e)}`;
    };

    const removeFilter = (key: keyof DrawerFilters) => {
        const reset: Partial<DrawerFilters> = {};
        if (key === 'planFilter') reset.planFilter = 'All';
        else if (key === 'statusFilter') reset.statusFilter = 'All';
        else reset[key] = '';
        setAppliedFilters(prev => ({ ...prev, ...reset }));
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (dashLoading || !financeData) {
        return (
            <div>
                <Topbar
                    title="Financial Dashboard"
                    subtitle="Core business performance & growth analysis"
                    product="inventory"
                />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 20,
                            marginBottom: 30,
                        }}
                    >
                        {Array(6)
                            .fill(0)
                            .map((_: number, i: number) => (
                                <KPISkeleton key={i} />
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    const { kpis, charts, anomalousEvents } = financeData;

    const subGrowthData = (charts.subscriptionGrowth || []).map((d: any) => ({
        month: d.month,
        Basic: d.basic,
        Smart: d.smart,
        Genius: d.genius,
    }));

    const revenueOverTime = (charts.monthlyRevenue || []).map((d: any) => ({
        month: d.month,
        value: d.amount,
    }));

    const subscriptions: T.FinanceSubscription[] = subsData?.data || [];
    const subsMeta = subsData?.meta;

    return (
        <>
            {/* Filter Drawer */}
            <FilterDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={appliedFilters}
                onApply={f => {
                    setAppliedFilters(f);
                    // If drawer has a search, clear the quick search bar to avoid duplication
                    if (f.search) setQuickSearch('');
                }}
            />

            <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
                {/* ── Page Header with Date Range Selector ── */}
                <div
                    style={{
                        padding: '16px var(--content-padding)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                        background: '#fff',
                        borderBottom: '1px solid #f1f5f9',
                    }}
                >
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a1a2e' }}>
                            Financial Dashboard
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                            Core Business Performance & Growth Analysis
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {/* Date display / custom picker */}
                        <div
                            onClick={() => {
                                setTempStart(startDate);
                                setTempEnd(endDate);
                                setShowDateDropdown(p => !p);
                            }}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#1a1a2e',
                                cursor: 'pointer',
                                userSelect: 'none',
                                position: 'relative',
                            }}
                        >
                            {selectedRange === 'Custom' ||
                                ['Today', 'Yesterday', 'Default'].includes(selectedRange)
                                ? formatDateRange(startDate, endDate)
                                : `Last ${selectedRange}`}
                            <ChevronDown size={14} color="#94a3b8" />

                            {showDateDropdown && (
                                <div
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: 8,
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 12,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        padding: 16,
                                        width: 280,
                                        zIndex: 100,
                                    }}
                                >
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>
                                        Custom Range
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <div style={subLabelStyle}>START DATE</div>
                                            <input
                                                type="date"
                                                value={tempStart}
                                                onChange={e => setTempStart(e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <div style={subLabelStyle}>END DATE</div>
                                            <input
                                                type="date"
                                                value={tempEnd}
                                                onChange={e => setTempEnd(e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setStartDate(tempStart);
                                                setEndDate(tempEnd);
                                                setSelectedRange('Custom');
                                                setShowDateDropdown(false);
                                            }}
                                            style={primaryBtnStyle}
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick range pills */}
                        <div style={{ display: 'flex', gap: 4 }}>
                            {['Today', 'Yesterday', '7D', '30D', '3M', '6M', '12M', 'Default'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => handleRangeChange(p)}
                                    style={{
                                        background: selectedRange === p ? '#fff' : 'transparent',
                                        border: selectedRange === p ? '1px solid #e2e8f0' : 'none',
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: selectedRange === p ? '#1a1a2e' : '#94a3b8',
                                        cursor: 'pointer',
                                        borderRadius: 6,
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding: 'var(--content-padding)' }}>
                    {/* ── KPI Cards ── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 20,
                            marginBottom: 32,
                        }}
                    >
                        <DashboardCard
                            variant="metric"
                            label="MRR"
                            value={`${fmtMillions(kpis.mrr?.value, "₦")}`}
                            trend={kpis.mrr?.trend ?? ''}
                            trendUp={kpis.mrr?.trendUp ?? true}
                            subtitle="vs last month"
                        />
                        <DashboardCard
                            variant="metric"
                            label="ARR"
                            value={`${fmtMillions(kpis.arr?.value, "₦")}`}
                            trend={kpis.arr?.trend ?? ''}
                            trendUp={kpis.arr?.trendUp ?? true}
                            subtitle="vs last month"
                        />
                        <DashboardCard
                            variant="metric"
                            label="Revenue (Range)"
                            value={`${fmtMillions(kpis.revenueToday?.value, "₦")}`}
                            trend={kpis.revenueToday?.trend ?? ''}
                            trendUp={kpis.revenueToday?.trendUp ?? true}
                            subtitle="selected period vs prior"
                        />
                        <DashboardCard
                            variant="metric"
                            label="Rev. This Month"
                            value={`${fmtMillions(kpis.revenueMonth?.value, "₦")}`}
                            trend={kpis.revenueMonth?.trend ?? ''}
                            trendUp={kpis.revenueMonth?.trendUp ?? true}
                            subtitle="vs last month"
                        />
                        <DashboardCard
                            variant="metric"
                            label="ARPU"
                            value={`${fmtMillions(kpis.arpu?.value, "₦")}`}
                            trend={kpis.arpu?.trend ?? ''}
                            trendUp={kpis.arpu?.trendUp ?? true}
                            subtitle="vs last month"
                        />
                        <DashboardCard
                            variant="status"
                            label="Pending Renewals"
                            value={kpis.pendingRenewals?.value?.toLocaleString() ?? '0'}
                            subValue="Due in 30 days"
                            icon={Clock}
                            accent="#f59e0b"
                            progress={65}
                        />
                    </div>

                    {/* ── Charts ── */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: 24,
                            marginBottom: 32,
                        }}
                    >
                        {/* Monthly Revenue */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 20,
                                padding: 32,
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 24,
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>
                                        Monthly Revenue
                                    </h3>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>
                                        Gross billing performance by month
                                    </div>
                                </div>
                                <div style={{ color: '#94a3b8' }}>
                                    <MoreHorizontal size={20} />
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueOverTime} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickFormatter={v => `₦${v / 1_000_000}M`}
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" fill="#eaf4e3" radius={[8, 8, 8, 8]}>
                                        {revenueOverTime.map((_: any, index: number) => (
                                            <Cell
                                                key={index}
                                                fill={index === revenueOverTime.length - 2 ? '#6c9e4e' : '#eaf4e3'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Subscription Growth */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 20,
                                padding: 32,
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 24,
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>
                                        Subscription Growth
                                    </h3>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginTop: 4 }}>
                                        Distribution of businesses across tiers
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[
                                        { label: 'Basic', color: '#94a3b8' },
                                        { label: 'Smart', color: '#7c5cbf' },
                                        { label: 'Genius', color: '#6c9e4e' },
                                    ].map(t => (
                                        <div
                                            key={t.label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: '#64748b',
                                            }}
                                        >
                                            <div
                                                style={{ width: 8, height: 8, borderRadius: 99, background: t.color }}
                                            />
                                            {t.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subGrowthData} barSize={36}>
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Basic" stackId="a" fill="#94a3b8" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Smart" stackId="a" fill="#7c5cbf" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Genius" stackId="a" fill="#6c9e4e" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Subscription Management Table ── */}
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 24,
                            padding: 32,
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            marginBottom: 32,
                        }}
                    >
                        {/* Table Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 20,
                                flexWrap: 'wrap',
                                gap: 16,
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>
                                    Subscription Management
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                                    Oversee and filter active business lifecycles.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Quick search */}
                                <div style={{ position: 'relative', minWidth: 260 }}>
                                    <Search
                                        size={15}
                                        style={{
                                            position: 'absolute',
                                            left: 13,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                        }}
                                    />
                                    <input
                                        value={quickSearch}
                                        onChange={e => setQuickSearch(e.target.value)}
                                        placeholder="Search business…"
                                        style={{ ...inputStyle, paddingLeft: 40, height: 44, borderRadius: 12 }}
                                    />
                                </div>

                                {/* Filter button */}
                                <button
                                    onClick={() => setDrawerOpen(true)}
                                    style={{
                                        background: activeFilterCount > 0 ? '#1a1a2e' : '#fff',
                                        color: activeFilterCount > 0 ? '#fff' : '#475569',
                                        border: '1.5px solid',
                                        borderColor: activeFilterCount > 0 ? '#1a1a2e' : '#e2e8f0',
                                        height: 44,
                                        padding: '0 18px',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        position: 'relative',
                                    }}
                                >
                                    <SlidersHorizontal size={15} />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: 99,
                                                background: '#6c9e4e',
                                                color: '#fff',
                                                fontSize: 10,
                                                fontWeight: 900,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: 2,
                                            }}
                                        >
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Active filter pills */}
                        <ActiveFilterPills filters={appliedFilters} onRemove={removeFilter} />

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                                <thead>
                                    <tr>
                                        {[
                                            'BUSINESS NAME',
                                            'CURRENT PLAN',
                                            'START DATE',
                                            'EXPIRY DATE',
                                            'PLAN VALUE',
                                            'STATUS',
                                        ].map(h => (
                                            <th
                                                key={h}
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    color: '#94a3b8',
                                                    padding: '5px 20px 8px',
                                                    textAlign: h === 'PLAN VALUE' ? 'center' : 'left',
                                                    letterSpacing: '0.06em',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {subsLoading
                                        ? Array(6)
                                            .fill(0)
                                            .map((_, i) => (
                                                <tr key={i}>
                                                    {Array(6)
                                                        .fill(0)
                                                        .map((_, j) => (
                                                            <td key={j} style={{ padding: '18px 20px' }}>
                                                                <div
                                                                    style={{
                                                                        height: 14,
                                                                        borderRadius: 6,
                                                                        background: '#f1f5f9',
                                                                        width: j === 0 ? '60%' : '80%',
                                                                        animation: 'pulse 1.5s infinite',
                                                                    }}
                                                                />
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))
                                        : subscriptions.map((s: T.FinanceSubscription) => (
                                            <tr
                                                key={s.id}
                                                style={{
                                                    background: '#fafbfc',
                                                    borderRadius: 14,
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e =>
                                                    ((e.currentTarget as HTMLElement).style.background = '#f1f5f9')
                                                }
                                                onMouseLeave={e =>
                                                    ((e.currentTarget as HTMLElement).style.background = '#fafbfc')
                                                }
                                            >
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        borderRadius: '14px 0 0 14px',
                                                        border: '1px solid #f1f5f9',
                                                        borderRight: 'none',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div
                                                            style={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 10,
                                                                background: '#e0e7ff',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: 12,
                                                                fontWeight: 800,
                                                                color: '#3730a3',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {s.businessName
                                                                .split(' ')
                                                                .map((n: string) => n[0])
                                                                .join('')
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>
                                                            {s.businessName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        borderTop: '1px solid #f1f5f9',
                                                        borderBottom: '1px solid #f1f5f9',
                                                    }}
                                                >
                                                    {s.plan}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        borderTop: '1px solid #f1f5f9',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {formatDate(s.startDate)}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: '#64748b',
                                                        borderTop: '1px solid #f1f5f9',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {formatDate(s.expiryDate)}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        textAlign: 'center',
                                                        fontSize: 14,
                                                        fontWeight: 800,
                                                        color: '#1a1a2e',
                                                        borderTop: '1px solid #f1f5f9',
                                                        borderBottom: '1px solid #f1f5f9',
                                                    }}
                                                >
                                                    ₦{s.value.toLocaleString()}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '18px 20px',
                                                        borderRadius: '0 14px 14px 0',
                                                        border: '1px solid #f1f5f9',
                                                        borderLeft: 'none',
                                                    }}
                                                >
                                                    <StatusBadge status={s.status} />
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>

                            {!subsLoading && subscriptions.length === 0 && (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#94a3b8',
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                >
                                    No subscriptions match your filters.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {subsMeta && subsMeta.totalPages && subsMeta.totalPages > 1 && (
                            <PaginationBar
                                page={tablePage}
                                totalPages={subsMeta.totalPages}
                                total={subsMeta.total}
                                pageSize={TABLE_PAGE_SIZE}
                                onPage={setTablePage}
                            />
                        )}
                    </div>

                    {/* ── Anomalous Revenue Events ── */}
                    <div
                        style={{
                            background: 'linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)',
                            borderRadius: 32,
                            padding: '40px',
                            border: '1px solid #e0e7ff',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 32,
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>
                                Anomalous Revenue Events
                            </h3>
                            <button
                                style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    padding: '10px 20px',
                                    borderRadius: 12,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#1a1a2e',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                }}
                            >
                                Audit All Logs
                            </button>
                        </div>

                        {anomalousEvents.map((event: T.AnomalousEvent) => (
                            <RevenueEvent
                                key={event.id}
                                title={event.type}
                                description={`Client ID: ${event.clientId} – ${event.time}`}
                                amount={(event.amount > 0 ? '+' : '') + '₦' + Math.abs(event.amount).toLocaleString()}
                                status={event.status as any}
                                iconType={
                                    event.status === 'ALERT'
                                        ? 'failed'
                                        : event.amount > 1000
                                            ? 'expansion'
                                            : 'new'
                                }
                            />
                        ))}

                        {anomalousEvents.length === 0 && (
                            <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', margin: '40px 0' }}>
                                No anomalous events detected.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
