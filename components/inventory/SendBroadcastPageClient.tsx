'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Send, Eye, Copy, MessageSquare, Users, Trash2 } from 'lucide-react';
import { useInventoryBroadcasts, useInventoryBusinesses } from '@/api/inventory/inventory.queries';
import { useSendBroadcast, useDeleteBroadcast } from '@/api/inventory/inventory.mutations';
import { Broadcast } from '@/api/inventory/inventory.types';
import { formatDateTime } from '@/app/lib/utils';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import SearchableSelect from '../SearchableSelect';

export default function SendBroadcastPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [businessSearch, setBusinessSearch] = useState('');
    const { data: response, isLoading } = useInventoryBroadcasts(page, pageSize, search);
    const { data: businessesData, isFetching: isBusinessesFetching } = useInventoryBusinesses(1, 50, businessSearch);

    const sendBroadcastMutation = useSendBroadcast();
    const deleteBroadcastMutation = useDeleteBroadcast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        channel: 'WhatsApp',
        message: '',
        businessId: '',
        segment: 'All Customers'
    });

    const handleOpenModal = () => {
        setFormData({
            title: '',
            channel: 'WhatsApp',
            message: '',
            businessId: '',
            segment: 'All Customers'
        });
        setIsModalOpen(true);
    };

    const handleSendBroadcast = async () => {
        if (!formData.title || !formData.message) {
            toast.error('Title and message are required');
            return;
        }

        try {
            await sendBroadcastMutation.mutateAsync({
                title: formData.title,
                message: formData.message,
                target: formData.segment,
                businessId: formData.businessId || undefined
            });
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; broadcast: Broadcast | null }>({
        isOpen: false,
        broadcast: null,
    });

    const handleAction = (type: 'view' | 'duplicate' | 'delete', b: Broadcast) => {
        if (type === 'delete') {
            setDeleteModal({ isOpen: true, broadcast: b });
        } else if (type === 'duplicate') {
            setFormData({
                title: `${b.title} (Copy)`,
                channel: b.channel || 'WhatsApp',
                message: b.message || '',
                businessId: '',
                segment: 'All Customers'
            });
            setIsModalOpen(true);
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
            <Topbar title="Send Broadcast" subtitle="Compose and send bulk messages to targeted business audiences." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Send Broadcast</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and send broadcast messages to businesses.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> New Broadcast
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search broadcasts..."
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
                                <th>Broadcast Title</th>
                                <th>Target Channel</th>
                                <th>Recipients</th>
                                <th>Sent / Created At</th>
                                <th>Read Rate</th>
                                <th>Status</th>
                                <th style={{ width: 120 }}>Actions</th>
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
                            ) : broadcasts.map((b: Broadcast) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{b.title}</td>
                                    <td><span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, color: '#374151' }}>{b.channel || 'General'}</span></td>
                                    <td>{(b.recipients || 0).toLocaleString()}</td>
                                    <td>{b.sentAt ? formatDateTime(b.sentAt) : 'Draft'}</td>
                                    <td style={{ color: '#6c9e4e', fontWeight: 600 }}>{b.readRate || '0%'}</td>
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
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="View">
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAction('duplicate', b)}
                                                style={{ background: '#f3f4f6', border: 'none', color: '#374151', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Duplicate">
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAction('delete', b)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
                        />
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Compose New Broadcast"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSendBroadcast}
                            disabled={sendBroadcastMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {sendBroadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Broadcast Subject / Title
                        </label>
                        <input
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. System Maintenance Notice"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Target Segment</label>
                            <SearchableSelect
                                value={formData.segment}
                                onChange={val => setFormData(prev => ({ ...prev, segment: val }))}
                                placeholder="Select segment..."
                                options={['All Customers', 'Active Subscribers', 'Trial Users', 'Expired Businesses', 'Specific Business'].map(s => ({ value: s, label: s }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Business (Optional)</label>
                            <SearchableSelect
                                value={formData.businessId}
                                onChange={val => setFormData(prev => ({ ...prev, businessId: val }))}
                                onSearch={setBusinessSearch}
                                isLoading={isBusinessesFetching}
                                placeholder="All Businesses"
                                searchPlaceholder="Type business name or email..."
                                options={[
                                    { value: '', label: 'All Businesses' },
                                    ...(businessesData?.data?.map(b => ({
                                        value: b.id,
                                        label: b.name,
                                        subLabel: b.email || (b as any).ownerEmail
                                    })) || [])
                                ]}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <MessageSquare size={14} /> Message Content
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Type your announcement content here..."
                            style={{ height: 120, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={selectedBroadcast ? selectedBroadcast.title : 'Broadcast Details'}
                footer={
                    <button onClick={() => setIsViewModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                }
            >
                {selectedBroadcast && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
                        <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 8 }}>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Message Content</div>
                            <div style={{ whiteSpace: 'pre-wrap', color: '#1a1a2e' }}>{selectedBroadcast.message || 'No content preview available'}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Total Recipients:</span>
                                <div style={{ fontWeight: 700 }}>{selectedBroadcast.recipients}</div>
                            </div>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Delivery Rate:</span>
                                <div style={{ fontWeight: 700, color: '#16a34a' }}>{selectedBroadcast.deliveryRate || '100%'}</div>
                            </div>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Read Rate:</span>
                                <div style={{ fontWeight: 700, color: '#0284c7' }}>{selectedBroadcast.readRate || '0%'}</div>
                            </div>
                            <div>
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Status:</span>
                                <div><span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>{selectedBroadcast.status}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Broadcast Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, broadcast: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteBroadcastMutation.isPending}
                title="Delete Broadcast Message"
                description={`Are you sure you want to delete the broadcast record "${deleteModal.broadcast?.title}"?`}
                details={
                    deleteModal.broadcast
                        ? [
                              { label: 'Subject', value: deleteModal.broadcast.title },
                              { label: 'Target Segment', value: deleteModal.broadcast.segment || 'All Customers' },
                              { label: 'Recipients', value: `${deleteModal.broadcast.recipients} users` },
                              { label: 'Sent At', value: formatDateTime(deleteModal.broadcast.sentAt || deleteModal.broadcast.createdAt || new Date().toISOString()) },
                          ]
                        : []
                }
                confirmText="Delete Broadcast"
                variant="danger"
            />
        </div>
    );
}
