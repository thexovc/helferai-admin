'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import {
    Search, Headphones, Mail, Phone, Clock, Trash2, Eye,
    MessageSquare, CheckCircle2, AlertCircle, RefreshCw,
    ExternalLink, Filter, Building2, User
} from 'lucide-react';
import {
    useInventoryContactRequests,
    useInventoryContactRequestStats
} from '@/api/inventory/inventory.queries';
import {
    useUpdateContactRequest,
    useDeleteContactRequest
} from '@/api/inventory/inventory.mutations';
import { ContactRequest } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
    pending: { label: 'Pending', bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
    read: { label: 'Read / In Review', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
    responded: { label: 'Responded', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
    closed: { label: 'Closed', bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' },
};

export default function ContactRequestsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data: requestsResponse, isLoading, refetch } = useInventoryContactRequests({
        page,
        per_page: pageSize,
        search,
        status: statusFilter || undefined,
    });

    const { data: stats, isLoading: isStatsLoading } = useInventoryContactRequestStats();

    const updateMutation = useUpdateContactRequest();
    const deleteMutation = useDeleteContactRequest();

    const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ContactRequest | null>(null);

    const items = requestsResponse?.data || [];
    const meta = requestsResponse?.meta || { total: 0, page: 1, per_page: 10, last_page: 1 };

    const handleView = (item: ContactRequest) => {
        setSelectedRequest(item);
        setIsViewModalOpen(true);
        // Automatically mark as read if it is still pending
        if (item.status === 'pending') {
            updateMutation.mutate({ id: item.id, dto: { status: 'read' } });
        }
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        updateMutation.mutate({ id, dto: { status: newStatus } });
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest({ ...selectedRequest, status: newStatus as any });
        }
    };

    const handleDeleteClick = (item: ContactRequest) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        await deleteMutation.mutateAsync(itemToDelete.id);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Extract Priority from job_title if present
    const parseTopicAndPriority = (jobTitle?: string | null) => {
        if (!jobTitle) return { priority: 'Normal', topic: 'General Inquiry' };
        const priorityMatch = jobTitle.match(/\[Priority:\s*([^\]]+)\]/i);
        const priority = priorityMatch ? priorityMatch[1].trim() : 'Normal';
        const topic = jobTitle.replace(/\[Priority:\s*[^\]]+\]/i, '').trim() || 'Support Request';
        return { priority, topic };
    };

    return (
        <div style={{ padding: 'var(--content-padding, 24px)', maxWidth: 1400, margin: '0 auto' }}>
            <Topbar
                title="Support & Contact Inquiries"
                subtitle="Review merchant tickets, questions, and inquiries sent via the app"
            />

            {/* KPI Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24, marginBottom: 24 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Headphones size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Total Inquiries</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginTop: 2 }}>{stats?.total ?? (isStatsLoading ? '...' : 0)}</div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Pending / New</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309', marginTop: 2 }}>{stats?.pending ?? (isStatsLoading ? '...' : 0)}</div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>In Review</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#0369a1', marginTop: 2 }}>{stats?.read ?? (isStatsLoading ? '...' : 0)}</div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Responded</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d', marginTop: 2 }}>{stats?.responded ?? (isStatsLoading ? '...' : 0)}</div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3f4f6', color: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Closed</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#374151', marginTop: 2 }}>{stats?.closed ?? (isStatsLoading ? '...' : 0)}</div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                {/* Search */}
                <div style={{ position: 'relative', minWidth: 260, flex: 1, maxWidth: 400 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search by sender, email, company..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        style={{
                            width: '100%',
                            height: 40,
                            paddingLeft: 38,
                            paddingRight: 12,
                            borderRadius: 10,
                            border: '1.5px solid #e5e7eb',
                            fontSize: 13,
                            outline: 'none',
                            background: '#f9fafb',
                            color: '#111827',
                        }}
                    />
                </div>

                {/* Status Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {[
                        { key: '', label: 'All Status' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'read', label: 'In Review' },
                        { key: 'responded', label: 'Responded' },
                        { key: 'closed', label: 'Closed' },
                    ].map((tab) => {
                        const active = statusFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(tab.key);
                                    setPage(1);
                                }}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 9999,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: `1.5px solid ${active ? '#10170C' : '#e5e7eb'}`,
                                    background: active ? '#10170C' : '#fff',
                                    color: active ? '#fff' : '#4b5563',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => refetch()}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 9999,
                            border: '1.5px solid #e5e7eb',
                            background: '#fff',
                            color: '#4b5563',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={13} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Inquiries Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Sender</th>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Topic / Priority</th>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Message</th>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '12px 18px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                                        Loading support inquiries...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f3f4f6', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                            <Headphones size={24} />
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>No inquiries found</div>
                                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                                            {search || statusFilter ? 'Try clearing your filters' : 'When merchants send support messages, they will appear here'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const { priority, topic } = parseTopicAndPriority(item.job_title);
                                    const statusObj = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                                    const isUrgent = priority.toLowerCase() === 'urgent';
                                    const isHigh = priority.toLowerCase() === 'high';

                                    return (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s ease' }}>
                                            {/* Date */}
                                            <td style={{ padding: '14px 18px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                                {formatDate(item.createdAt)}
                                            </td>

                                            {/* Sender & Business */}
                                            <td style={{ padding: '14px 18px', minWidth: 200 }}>
                                                <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>{item.fullName}</div>
                                                {item.companyName && (
                                                    <div style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <Building2 size={12} color="#6b7280" />
                                                        <span style={{ fontWeight: 500 }}>{item.companyName}</span>
                                                    </div>
                                                )}
                                                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                                                    <a href={`mailto:${item.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{item.email}</a>
                                                    {item.phoneNumber && ` · ${item.phoneNumber}`}
                                                </div>
                                            </td>

                                            {/* Topic & Priority */}
                                            <td style={{ padding: '14px 18px', minWidth: 160 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 6,
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        background: isUrgent ? '#fee2e2' : isHigh ? '#ffedd5' : '#e0f2fe',
                                                        color: isUrgent ? '#b91c1c' : isHigh ? '#c2410c' : '#0369a1',
                                                    }}>
                                                        {priority}
                                                    </span>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                                                        {topic}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Message preview */}
                                            <td style={{ padding: '14px 18px', maxWidth: 300 }}>
                                                <div style={{
                                                    fontSize: 12,
                                                    color: '#4b5563',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: 1.4,
                                                }}>
                                                    {item.message?.replace(/Topic:[^\n]+\nPriority:[^\n]+\n\nMessage:\n?/i, '') || item.message || '-'}
                                                </div>
                                            </td>

                                            {/* Status Badge & Dropdown */}
                                            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: 8,
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        border: `1px solid ${statusObj.border}`,
                                                        background: statusObj.bg,
                                                        color: statusObj.color,
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="read">In Review</option>
                                                    <option value="responded">Responded</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleView(item)}
                                                        title="View message details"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 8,
                                                            border: '1px solid #e5e7eb',
                                                            background: '#fff',
                                                            color: '#374151',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(item)}
                                                        title="Delete inquiry"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 8,
                                                            border: '1px solid #fee2e2',
                                                            background: '#fff',
                                                            color: '#dc2626',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={page}
                    totalPages={meta.last_page || 1}
                    totalItems={meta.total || 0}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPage(1);
                    }}
                />
            </div>

            {/* View Details Modal */}
            {selectedRequest && (
                <Modal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eaf5e7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Headphones size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Support Inquiry Details</div>
                                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>Ticket #{selectedRequest.id} · Received {formatDate(selectedRequest.createdAt)}</div>
                            </div>
                        </div>
                    }
                    maxWidth={620}
                    footer={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Update Status:</span>
                                <select
                                    value={selectedRequest.status}
                                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                                    style={{
                                        padding: '5px 10px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        border: '1.5px solid #d1d5db',
                                        background: '#fff',
                                        color: '#111827',
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="read">In Review</option>
                                    <option value="responded">Responded</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: 9999,
                                    border: '1.5px solid #d1d5db',
                                    background: '#fff',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: '#374151',
                                    cursor: 'pointer',
                                }}
                            >
                                Done
                            </button>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Sender Card */}
                        <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Sender Name</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>{selectedRequest.fullName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Company / Business</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 2 }}>{selectedRequest.companyName || 'Not specified'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', marginTop: 2 }}>{selectedRequest.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Phone / WhatsApp</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 2 }}>{selectedRequest.phoneNumber || 'None provided'}</div>
                            </div>
                        </div>

                        {/* Quick Contact Action Bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                            <a
                                href={`mailto:${selectedRequest.email}?subject=HelferAI Support: Regarding your inquiry`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '10px 14px',
                                    borderRadius: 10,
                                    border: '1.5px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}
                            >
                                <Mail size={15} />
                                Reply via Email
                            </a>

                            {selectedRequest.phoneNumber ? (
                                <a
                                    href={`https://wa.me/${selectedRequest.phoneNumber.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedRequest.fullName)},%20this%20is%20HelferAI%20Support`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: '1.5px solid #bbf7d0',
                                        background: '#f0fdf4',
                                        color: '#15803d',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                    }}
                                >
                                    <MessageSquare size={15} />
                                    Chat on WhatsApp
                                </a>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>
                                    No phone number
                                </div>
                            )}
                        </div>

                        {/* Category & Topic */}
                        <div>
                            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Subject / Category</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', padding: '10px 14px', borderRadius: 8, background: '#f3f4f6' }}>
                                {selectedRequest.job_title || 'General Support Inquiry'}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div>
                            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Message Content</div>
                            <div style={{
                                fontSize: 13,
                                color: '#1f2937',
                                lineHeight: 1.6,
                                padding: 16,
                                borderRadius: 12,
                                border: '1px solid #e5e7eb',
                                background: '#fff',
                                whiteSpace: 'pre-wrap',
                                maxHeight: 250,
                                overflowY: 'auto',
                            }}>
                                {selectedRequest.message || '(Empty message)'}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Support Inquiry"
                description="Are you sure you want to delete this inquiry? This action cannot be undone."
                variant="danger"
                confirmText="Delete Ticket"
                isLoading={deleteMutation.isPending}
                details={itemToDelete ? [
                    { label: 'Sender', value: itemToDelete.fullName },
                    { label: 'Email', value: itemToDelete.email },
                    { label: 'Company', value: itemToDelete.companyName || 'None' },
                ] : []}
            />
        </div>
    );
}

