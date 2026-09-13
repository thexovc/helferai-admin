'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Send, Eye, Copy, Mail, MessageSquare, Trash2, Smartphone, Monitor } from 'lucide-react';
import { useInventoryBroadcasts } from '@/api/inventory/inventory.queries';
import { useDeleteBroadcast } from '@/api/inventory/inventory.mutations';
import { Broadcast } from '@/api/inventory/inventory.types';
import { formatDateTime } from '@/app/lib/utils';
import Pagination from '../Pagination';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import EmailComposerModal from '../EmailComposerModal';

export default function SendBroadcastPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const { data: response, isLoading } = useInventoryBroadcasts(page, pageSize, search);

    const deleteBroadcastMutation = useDeleteBroadcast();

    // Modal State
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; broadcast: Broadcast | null }>({
        isOpen: false,
        broadcast: null,
    });

    const handleAction = (type: 'view' | 'delete', b: Broadcast) => {
        if (type === 'delete') {
            setDeleteModal({ isOpen: true, broadcast: b });
        } else {
            setSelectedBroadcast(b);
            setIsViewModalOpen(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.broadcast) return;
        try {
            await deleteBroadcastMutation.mutateAsync(deleteModal.broadcast.id);
            setDeleteModal({ isOpen: false, broadcast: null });
        } catch (err) { }
    };

    const rawBroadcasts = response?.data || [];
    // Sort latest first
    const broadcasts = [...rawBroadcasts].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.sentAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.sentAt || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = response?.meta?.total || broadcasts.length;

    return (
        <div>
            <Topbar title="Send Broadcast" subtitle="Compose and dispatch formatted emails and broadcast announcements to customers." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Broadcasts & Formatted Emails</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Send rich HTML emails, announcements, and messages to your customers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsComposerOpen(true)}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10,
                            padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.25)'
                        }}>
                        <Plus size={18} /> New Broadcast / Email
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search campaigns by subject or title..."
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
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Subject / Title</th>
                                <th>Target Channel</th>
                                <th>Segment</th>
                                <th>Recipients</th>
                                <th>Sent / Created At</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={7}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : broadcasts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No broadcasts found</td>
                                </tr>
                            ) : broadcasts.map((b: Broadcast) => {
                                const isEmail = b.channel?.toLowerCase() === 'email';
                                return (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {isEmail ? <Mail size={16} color="#6c9e4e" /> : <MessageSquare size={16} color="#2563eb" />}
                                                <span>{b.title}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: isEmail ? '#eaf4e3' : '#dbeafe',
                                                color: isEmail ? '#15803d' : '#1d4ed8',
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}>
                                                {b.channel || 'General'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, color: '#4b5563' }}>{b.segment || 'All Customers'}</td>
                                        <td style={{ fontWeight: 600 }}>{(b.recipients || 0).toLocaleString()} users</td>
                                        <td style={{ fontSize: 13, color: '#6b7280' }}>{b.sentAt ? formatDateTime(b.sentAt) : 'Draft'}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                                background: b.status === 'Sent' ? '#dcfce7' : b.status === 'Sending' ? '#fef3c7' : '#f3f4f6',
                                                color: b.status === 'Sent' ? '#15803d' : b.status === 'Sending' ? '#b45309' : '#6b7280'
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => handleAction('view', b)}
                                                    style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 7, borderRadius: 6, display: 'flex' }}
                                                    title="View Email Preview"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction('delete', b)}
                                                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 7, borderRadius: 6, display: 'flex' }}
                                                    title="Delete Broadcast Record"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil(totalCount / pageSize) || 1}
                            onPageChange={setPage}
                            totalItems={totalCount}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            {/* Email Composer Modal */}
            <EmailComposerModal
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
            />

            {/* View / Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={selectedBroadcast ? selectedBroadcast.title : 'Broadcast Details'}
                maxWidth="720px"
                footer={
                    <button onClick={() => setIsViewModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                }
            >
                {selectedBroadcast && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14 }}>
                        {/* Meta badges */}
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: '#eaf4e3', color: '#166534', fontSize: 12, fontWeight: 700 }}>
                                Channel: {selectedBroadcast.channel || 'Email'}
                            </span>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 600 }}>
                                Segment: {selectedBroadcast.segment || 'All Customers'}
                            </span>
                            <span style={{ padding: '4px 10px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontSize: 12, fontWeight: 700 }}>
                                {selectedBroadcast.status}
                            </span>
                            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                                Sent: {formatDateTime(selectedBroadcast.sentAt || selectedBroadcast.createdAt || '')}
                            </span>
                        </div>

                        {/* Content display: Rich HTML or text */}
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ background: '#f9fafb', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', fontSize: 12, fontWeight: 700, color: '#4b5563' }}>
                                Message Content Preview
                            </div>
                            <div style={{ padding: 20, maxHeight: 380, overflowY: 'auto' }}>
                                {selectedBroadcast.channel?.toLowerCase() === 'email' || (selectedBroadcast.message && selectedBroadcast.message.includes('<')) ? (
                                    <div
                                        style={{ fontSize: 14, lineHeight: 1.65, color: '#374151' }}
                                        dangerouslySetInnerHTML={{ __html: selectedBroadcast.message || '' }}
                                    />
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#1a1a2e', lineHeight: 1.6 }}>
                                        {selectedBroadcast.message || 'No content preview available'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f9fafb', padding: 14, borderRadius: 10 }}>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Total Recipients:</span>
                                <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>{selectedBroadcast.recipients.toLocaleString()}</div>
                            </div>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Status:</span>
                                <div style={{ fontWeight: 700, color: '#16a34a' }}>{selectedBroadcast.status}</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, broadcast: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteBroadcastMutation.isPending}
                title="Delete Broadcast Record"
                description={`Are you sure you want to delete the broadcast record "${deleteModal.broadcast?.title}"?`}
                details={
                    deleteModal.broadcast
                        ? [
                            { label: 'Subject', value: deleteModal.broadcast.title },
                            { label: 'Channel', value: deleteModal.broadcast.channel || 'Email' },
                            { label: 'Recipients', value: `${deleteModal.broadcast.recipients} users` },
                            { label: 'Sent At', value: formatDateTime(deleteModal.broadcast.sentAt || deleteModal.broadcast.createdAt || new Date().toISOString()) },
                        ]
                        : []
                }
                confirmText="Delete Record"
                variant="danger"
            />
        </div>
    );
}
