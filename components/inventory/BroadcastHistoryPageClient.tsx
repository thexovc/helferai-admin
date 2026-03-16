'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Search, Filter, Megaphone, MoreVertical, Eye } from 'lucide-react';
import { useInventoryBroadcasts } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import { formatDateTime } from '@/app/lib/utils';


export default function BroadcastHistoryPageClient() {
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const { data: broadcastsResponse, isLoading } = useInventoryBroadcasts(page, pageSize);
    const broadcasts = broadcastsResponse?.data || [];
    const meta = broadcastsResponse?.meta || { total: 0, page: 1, pageSize: 10 };
    const [search, setSearch] = React.useState('');

    const filteredBroadcasts = broadcasts.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.channel.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Broadcast History" subtitle="Review past broadcasts and delivery analytics." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Broadcast History</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your broadcast history.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search broadcast history..."
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
                                <th>Broadcast Name</th>
                                <th>Date Sent</th>
                                <th>Channel</th>
                                <th>Delivered</th>
                                <th>Read Rate</th>
                                <th>Status</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td colSpan={7}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filteredBroadcasts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No history found</td>
                                </tr>
                            ) : (
                                filteredBroadcasts.map((b: any) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{b.title}</td>
                                        <td style={{ color: '#6b7280', fontSize: 13 }}>{formatDateTime(b.sentAt)}</td>
                                        <td><span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, color: '#374151' }}>{b.channel}</span></td>
                                        <td style={{ color: '#1a1a2e', fontWeight: 600 }}>{b.recipients.toLocaleString()}</td>
                                        <td style={{ color: '#6c9e4e', fontWeight: 600 }}>{b.readRate}</td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                background: b.status === 'Sent' ? '#dcfce7' : '#f3f4f6',
                                                color: b.status === 'Sent' ? '#15803d' : '#6b7280',
                                                borderRadius: 99, fontSize: 11, fontWeight: 700
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
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
