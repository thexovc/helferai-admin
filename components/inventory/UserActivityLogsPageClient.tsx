'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Search, Activity, MoreVertical, Eye, Clock } from 'lucide-react';
import { useInventoryActivityLogs } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import { formatDateTime } from '@/app/lib/utils';


export default function UserActivityLogsPageClient() {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const { data: logsResponse, isLoading } = useInventoryActivityLogs(page, pageSize);
    const logs = logsResponse?.data || [];
    const meta = logsResponse?.meta || { total: 0, page: 1, pageSize: 10 };
    const [search, setSearch] = React.useState('');

    const filtered = (logs || []).filter(l => {
        const matchSearch =
            l.adminName.toLowerCase().includes(search.toLowerCase()) ||
            (l.targetId || '').toLowerCase().includes(search.toLowerCase()) ||
            l.action.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    });

    return (
        <div>
            <Topbar title="User Activity Logs" subtitle="Audit trail of all administrative and user actions." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>User Activity Logs</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your user activity logs.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search user activity logs..."
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
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>IP Address</th>
                                <th>Timestamp</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No logs found</td>
                                </tr>
                            ) : (
                                filtered.map((l: any) => (
                                    <tr key={l.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{l.adminName}</td>
                                        <td style={{ color: '#374151' }}>{l.action}</td>
                                        <td style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{l.targetId}</td>
                                        <td style={{ color: '#6b7280', fontSize: 12 }}>{l.ip}</td>
                                        <td style={{ color: '#9ca3af', fontSize: 12 }}>{formatDateTime(l.timestamp)}</td>
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

                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(meta.total / pageSize)}
                        onPageChange={setPage}
                        totalItems={meta.total}
                        pageSize={pageSize}
                    />
                </div>

            </div>
        </div>
    );
}
