'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Search, BarChart3, MoreVertical } from 'lucide-react';
import { SkeletonPulse, KPISkeleton, TableSkeleton } from '../Skeleton';
import { useInventoryReferrals } from '@/api/inventory';


export default function ReferralAnalyticsPageClient() {
    const { data: analytics, isLoading } = useInventoryReferrals();
    const [search, setSearch] = React.useState('');

    if (isLoading || !analytics) {
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

    const filteredReferrers = analytics.topReferrers.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Referral Analytics" subtitle="Track performance metrics and ROI of your referral programs." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
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
                        { label: 'Total Invites', value: analytics.totalInvites.toLocaleString(), color: '#6c9e4e' },
                        { label: 'Total Conversions', value: analytics.conversions.toLocaleString(), color: '#3b82f6' },
                        { label: 'Conversion Rate', value: analytics.conversionRate, color: '#7c5cbf' },
                        { label: 'Points Distributed', value: analytics.pointsDistributed.toLocaleString(), color: '#f59e0b' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search top referrers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <h3 style={{ padding: '16px 20px', margin: 0, fontSize: 16, fontWeight: 700, background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>Top Referrers</h3>
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
                            {filteredReferrers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No referrers found</td>
                                </tr>
                            ) : (
                                filteredReferrers.map((r, i) => (
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


                    {/* Pagination Footer */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Showing 1 to 5 of 24 entries</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#9ca3af', cursor: 'pointer' }} disabled>Previous</button>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#1a1a2e', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
