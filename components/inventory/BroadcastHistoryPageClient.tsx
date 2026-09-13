'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Search, Megaphone, Eye, Mail, MessageSquare } from 'lucide-react';
import { useInventoryBroadcasts } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import Modal from '../Modal';
import { formatDateTime } from '@/app/lib/utils';
import { Broadcast } from '@/api/inventory/inventory.types';

export default function BroadcastHistoryPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: broadcastsResponse, isLoading } = useInventoryBroadcasts(page, pageSize);
    const broadcasts = broadcastsResponse?.data || [];
    const meta = broadcastsResponse?.meta || { total: 0, page: 1, pageSize: 10 };
    const [search, setSearch] = useState('');
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

    const filteredBroadcasts = broadcasts.filter((b: Broadcast) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.channel.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Broadcast History" subtitle="Review past broadcasts, formatted email campaigns, and delivery analytics." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Broadcast & Email History</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Review delivered campaigns, content formatting, and audience reach.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search broadcast history by title or channel..."
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
                                <th>Subject / Title</th>
                                <th>Channel</th>
                                <th>Date Sent</th>
                                <th>Delivered / Target</th>
                                <th>Read Rate</th>
                                <th>Status</th>
                                <th style={{ width: 70 }}>Action</th>
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
                                filteredBroadcasts.map((b: Broadcast) => {
                                    const isEmail = b.channel?.toLowerCase() === 'email';
                                    return (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {isEmail ? <Mail size={15} color="#6c9e4e" /> : <MessageSquare size={15} color="#2563eb" />}
                                                    <span>{b.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '3px 9px',
                                                    background: isEmail ? '#eaf4e3' : '#dbeafe',
                                                    color: isEmail ? '#15803d' : '#1d4ed8',
                                                    borderRadius: 6,
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>
                                                    {b.channel || 'General'}
                                                </span>
                                            </td>
                                            <td style={{ color: '#6b7280', fontSize: 13 }}>{formatDateTime(b.sentAt)}</td>
                                            <td style={{ color: '#1a1a2e', fontWeight: 600 }}>{(b.recipients || 0).toLocaleString()} users</td>
                                            <td style={{ color: '#6c9e4e', fontWeight: 600 }}>{b.readRate || '0%'}</td>
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
                                            <td>
                                                <button
                                                    onClick={() => setSelectedBroadcast(b)}
                                                    style={{
                                                        background: '#f0f9ff', border: 'none', color: '#0284c7',
                                                        cursor: 'pointer', padding: '6px 10px', borderRadius: 6,
                                                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600
                                                    }}
                                                    title="View Message Content"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(meta.total / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={meta.total}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            {/* View Modal */}
            <Modal
                isOpen={!!selectedBroadcast}
                onClose={() => setSelectedBroadcast(null)}
                title={selectedBroadcast ? selectedBroadcast.title : 'Broadcast Details'}
                maxWidth="700px"
                footer={
                    <button onClick={() => setSelectedBroadcast(null)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                }
            >
                {selectedBroadcast && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: '#eaf4e3', color: '#166534', fontSize: 12, fontWeight: 700 }}>
                                Channel: {selectedBroadcast.channel || 'Email'}
                            </span>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 600 }}>
                                Recipients: {selectedBroadcast.recipients?.toLocaleString()} users
                            </span>
                            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                                Sent: {formatDateTime(selectedBroadcast.sentAt || '')}
                            </span>
                        </div>

                        {/* Content */}
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ background: '#f9fafb', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
                                Message Body
                            </div>
                            <div style={{ padding: 20, maxHeight: 380, overflowY: 'auto' }}>
                                {selectedBroadcast.channel?.toLowerCase() === 'email' || (selectedBroadcast.message && selectedBroadcast.message.includes('<')) ? (
                                    <div
                                        style={{ fontSize: 14, lineHeight: 1.65, color: '#374151' }}
                                        dangerouslySetInnerHTML={{ __html: selectedBroadcast.message || '' }}
                                    />
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#1a1a2e', lineHeight: 1.6, fontSize: 14 }}>
                                        {selectedBroadcast.message || 'No content preview available'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
