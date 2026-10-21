'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Topbar from '../Topbar';
import { Search, Activity } from 'lucide-react';
import Pagination from '../Pagination';
import { formatDateTime } from '@/app/lib/utils';
import { inventoryClient } from '@/api/api-client';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

const qs = (o: Record<string, any>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
const selectStyle: React.CSSProperties = { height: 44, borderRadius: 12, border: '1px solid #e5e7eb', padding: '0 12px', fontSize: 13, background: '#fff', color: '#374151', outline: 'none' };

// Activity of people with access to this admin area: sign-ins (and failed
// attempts) and every change they make. Merchant app activity isn't shown here.
export default function UserActivityLogsPageClient() {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [search, setSearch] = React.useState('');
    const [adminId, setAdminId] = React.useState('');
    const [type, setType] = React.useState('');
    const debounced = useDebouncedValue(search);
    React.useEffect(() => setPage(1), [debounced, adminId, type]);

    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'admin-activity', page, pageSize, debounced, adminId, type],
        queryFn: () => inventoryClient.get<any>(`/admin/api/inventory/activity-logs/admins?${qs({ page, pageSize, search: debounced, adminId, type })}`),
        placeholderData: keepPreviousData,
    });
    const logs: any[] = data?.logs || [];
    const total = data?.meta?.total || 0;
    const admins: any[] = data?.admins || [];

    return (
        <div>
            <Topbar title="User Activity Logs" subtitle="What admin users have done in this admin area." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Admin activity</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Sign-ins and every change made by the {admins.length || ''} admin users, newest first.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search what was done, e.g. subscription, Helfer HQ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', height: 44, paddingLeft: 44, paddingRight: 16, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', outline: 'none', fontSize: 14, color: '#1a1a2e' }}
                        />
                    </div>
                    <select value={adminId} onChange={e => setAdminId(e.target.value)} style={selectStyle}>
                        <option value="">All admins</option>
                        {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                        <option value="">Sign-ins and changes</option>
                        <option value="logins">Sign-ins only</option>
                        <option value="changes">Changes only</option>
                        <option value="failed">Failed attempts</option>
                    </select>
                </div>

                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Admin</th>
                                <th>What they did</th>
                                <th>Result</th>
                                <th>IP Address</th>
                                <th>Device</th>
                                <th>When</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af', lineHeight: 1.6 }}>
                                        No admin activity yet.<br />Sign-ins and changes are recorded from now on.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((l) => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                            {l.adminName}
                                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>{[l.adminRole, l.adminEmail].filter(Boolean).join(' · ')}</div>
                                        </td>
                                        <td style={{ color: '#374151' }}>
                                            <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 700, marginRight: 6, background: l.type === 'Login' ? '#eef2ff' : '#f0f7eb', color: l.type === 'Login' ? '#4338ca' : '#3f7d2c' }}>{l.type === 'Login' ? 'SIGN-IN' : 'CHANGE'}</span>
                                            {l.businessId ? <Link href={`/inventory/businesses/${l.businessId}`} style={{ color: '#374151' }}>{l.action}</Link> : l.action}
                                            {l.error && <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>{l.error}</div>}
                                        </td>
                                        <td>
                                            <span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: l.outcome === 'Success' ? '#dcfce7' : '#fee2e2', color: l.outcome === 'Success' ? '#15803d' : '#b91c1c' }}>{l.outcome}</span>
                                        </td>
                                        <td style={{ color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{l.ip || '—'}</td>
                                        <td style={{ color: '#6b7280', fontSize: 12 }}>{l.device || '—'}</td>
                                        <td style={{ color: '#6b7280', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDateTime(l.timestamp)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(total / pageSize)}
                        onPageChange={setPage}
                        totalItems={total}
                        pageSize={pageSize}
                        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                    />
                </div>
            </div>
        </div>
    );
}
