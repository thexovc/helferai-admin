'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Search, UserPlus, Filter, CheckCircle2, Clock } from 'lucide-react';
import { useReferralsList } from '@/api/inventory/inventory.queries';
import { ReferralAuditItem } from '@/api/inventory/inventory.types';
import { formatDateTime } from '@/app/lib/utils';
import Pagination from '../Pagination';

export default function ReferralsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data: response, isLoading } = useReferralsList({
        page,
        pageSize,
        search,
        status: statusFilter
    });

    const rawReferrals = response?.data || [];
    // Sort latest first
    const referrals = [...rawReferrals].sort((a: any, b: any) => {
        const timeA = new Date(a.date || a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = response?.meta?.total || referrals.length;

    return (
        <div>
            <Topbar title="Referrals" subtitle="View and audit individual user referral trails and rewarded points." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Referrals Audit List</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Audit log of referral connections and conversions.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search by referrer or invited user name / code..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        style={{ height: 44, borderRadius: 12, border: '1px solid #e5e7eb', padding: '0 14px', fontSize: 13, background: '#fff', outline: 'none', color: '#374151' }}>
                        <option value="">All Statuses</option>
                        <option value="rewarded">Rewarded</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Referrer</th>
                                <th>Referred User</th>
                                <th>Referral Code</th>
                                <th>Date Invited</th>
                                <th>Status</th>
                                <th>Points Awarded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : referrals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No referral records found</td>
                                </tr>
                            ) : referrals.map((r: ReferralAuditItem) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.referrerName}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.referrerEmail}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.referredName}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.referredEmail}</div>
                                    </td>
                                    <td><span style={{ fontFamily: 'monospace', padding: '3px 8px', background: '#f3f4f6', borderRadius: 4, fontSize: 12 }}>{r.referralCode}</span></td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{formatDateTime(r.createdAt)}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                            background: r.status === 'rewarded' ? '#dcfce7' : '#fef3c7',
                                            color: r.status === 'rewarded' ? '#15803d' : '#b45309'
                                        }}>
                                            {r.status === 'rewarded' ? 'Rewarded' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: r.pointsAwarded > 0 ? '#16a34a' : '#9ca3af' }}>
                                            {r.pointsAwarded > 0 ? `+${r.pointsAwarded} pts` : '0 pts'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalCount / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={totalCount}
                            pageSize={pageSize}
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
