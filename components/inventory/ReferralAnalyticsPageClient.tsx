'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Search, BarChart3, MoreVertical } from 'lucide-react';
import { KPISkeleton, TableSkeleton } from '../Skeleton';
import { useInventoryReferrals } from '@/api/inventory';
import Pagination from '@/components/Pagination';

const POINTS_FILTERS = [
    { label: 'All', value: '' },
    { label: '< 5', value: 'lt_5' },
    { label: '> 5', value: 'gt_5' },
    { label: '> 20', value: 'gt_20' },
    { label: '> 50', value: 'gt_50' },
];

export default function ReferralAnalyticsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pointsFilter, setPointsFilter] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: analytics, isLoading, isFetching } = useInventoryReferrals({
        search: debouncedSearch,
        pointsFilter,
        page,
        pageSize,
    });

    if (isLoading && !analytics) {
        return (
            <div>
                <Topbar title="Referral Analytics" subtitle="Track performance metrics and ROI of your referral programs." product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        {Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)}
                    </div>
                    <TableSkeleton rows={5} cols={4} />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Topbar title="Referral Analytics" subtitle="Track performance metrics and ROI of your referral programs." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referral Analytics</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Performance overview of the referral system.</p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {[
                        { label: 'Total Invites', value: analytics?.totalInvites?.toLocaleString() ?? '—', color: '#6c9e4e' },
                        { label: 'Total Conversions', value: analytics?.conversions?.toLocaleString() ?? '—', color: '#3b82f6' },
                        { label: 'Conversion Rate', value: analytics?.conversionRate ?? '—', color: '#7c5cbf' },
                        { label: 'Points Distributed', value: analytics?.pointsDistributed?.toLocaleString() ?? '—', color: '#f59e0b' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: isFetching ? '#6c9e4e' : '#9ca3af' }} />
                        <input
                            placeholder="Search referrers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: `1px solid ${isFetching ? '#6c9e4e' : '#e5e7eb'}`,
                                background: '#fff', outline: 'none', fontSize: 14, color: '#1a1a2e',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {/* Points Filter Pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {POINTS_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => { setPointsFilter(f.value); setPage(1); }}
                                style={{
                                    padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                    background: pointsFilter === f.value ? '#6c9e4e' : '#f3f4f6',
                                    color: pointsFilter === f.value ? '#fff' : '#6b7280',
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <h3 style={{ padding: '16px 20px', margin: 0, fontSize: 16, fontWeight: 700, background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                        Top Referrers
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Referrer Name</th>
                                <th>Total Referrals</th>
                                <th>Points Earned</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isFetching ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td><div style={{ height: 14, width: 140, background: '#f0f0f0', borderRadius: 4 }} className="animate-pulse-soft" /></td>
                                        <td><div style={{ height: 14, width: 60, background: '#f0f0f0', borderRadius: 4 }} className="animate-pulse-soft" /></td>
                                        <td><div style={{ height: 14, width: 80, background: '#f0f0f0', borderRadius: 4 }} className="animate-pulse-soft" /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f0f0f0', margin: '0 auto' }} className="animate-pulse-soft" />
                                        </td>
                                    </tr>
                                ))
                            ) : !analytics?.topReferrers?.length ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No referrers found</td>
                                </tr>
                            ) : (
                                analytics.topReferrers.map((r: any, i: any) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.name}</td>
                                        <td style={{ color: '#374151' }}>{r.referrals}</td>
                                        <td style={{ color: '#6c9e4e', fontWeight: 700 }}>{r.points.toLocaleString()}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        <Pagination
                            currentPage={page}
                            totalPages={analytics?.meta?.totalPages ?? 1}
                            onPageChange={setPage}
                            totalItems={analytics?.meta?.total ?? 0}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}