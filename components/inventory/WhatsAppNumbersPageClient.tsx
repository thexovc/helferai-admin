'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Phone, Edit2, Trash2, Building2 } from 'lucide-react';
import { useInventoryWhatsappNumbers } from '@/api/inventory/inventory.queries';
import { useCreateWhatsappNumber, useUpdateWhatsappNumber, useDeleteWhatsappNumber } from '@/api/inventory/inventory.mutations';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import { WhatsappNumber } from '@/api/inventory/inventory.types';

export default function WhatsAppNumbersPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const { data: numbersResponse, isLoading } = useInventoryWhatsappNumbers(page, pageSize, search);

    const createWhatsappMutation = useCreateWhatsappNumber();
    const updateWhatsappMutation = useUpdateWhatsappNumber();
    const deleteWhatsappMutation = useDeleteWhatsappNumber();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNumber, setEditingNumber] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        number: '',
        businessName: '',
        status: 'Active',
    });

    const handleOpenModal = (num?: any) => {
        if (num) {
            setEditingNumber(num);
            setFormData({
                number: num.phoneNumber || num.number || '',
                businessName: num.businessName || '',
                status: num.status || 'Active',
            });
        } else {
            setEditingNumber(null);
            setFormData({
                number: '',
                businessName: '',
                status: 'Active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveNumber = async () => {
        if (!formData.number) {
            toast.error('Phone number is required');
            return;
        }

        try {
            if (editingNumber) {
                await updateWhatsappMutation.mutateAsync({
                    id: editingNumber.id,
                    dto: {
                        phoneNumber: formData.number,
                        businessName: formData.businessName,
                        status: formData.status
                    }
                });
            } else {
                await createWhatsappMutation.mutateAsync({
                    phoneNumber: formData.number,
                    businessName: formData.businessName,
                    status: formData.status
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; number: any | null }>({
        isOpen: false,
        number: null,
    });

    const handleDeleteNumber = (num: any) => {
        setDeleteModal({ isOpen: true, number: num });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.number) return;
        try {
            await deleteWhatsappMutation.mutateAsync(deleteModal.number.id);
            setDeleteModal({ isOpen: false, number: null });
        } catch (err) { }
    };

    const rawNumbers = numbersResponse?.data || [];
    // Sort latest first
    const numbers = [...rawNumbers].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || a.lastActive || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || b.lastActive || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = numbersResponse?.meta?.total || numbers.length;

    return (
        <div>
            <Topbar title="WhatsApp Numbers" subtitle="Manage connected WhatsApp business numbers for communication." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Phone size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>WhatsApp Numbers</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your whatsapp numbers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search whatsapp numbers..."
                            style={{
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16,
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Phone Number</th>
                                <th>Merchant Name</th>
                                <th>Status</th>
                                <th>Last Active</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={5}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : numbers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No numbers found</td>
                                </tr>
                            ) : numbers.map((n: any) => (
                                <tr key={n.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{n.phoneNumber || n.number}</td>
                                    <td>{n.businessName || 'General'}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: n.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                            color: n.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {n.status}
                                        </span>
                                    </td>
                                    <td>{n.lastActive ? new Date(n.lastActive).toLocaleString() : 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(n)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNumber(n)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete/Disconnect">
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNumber ? 'Edit WhatsApp Number' : 'Connect New Number'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveNumber}
                            disabled={createWhatsappMutation.isPending || updateWhatsappMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createWhatsappMutation.isPending || updateWhatsappMutation.isPending ? 'Saving...' : editingNumber ? 'Save Changes' : 'Connect Number'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Phone size={14} /> Phone Number
                        </label>
                        <input
                            value={formData.number}
                            onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                            placeholder="e.g. +234 812 345 6789"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Merchant Name
                        </label>
                        <input
                            value={formData.businessName}
                            onChange={e => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                            placeholder="e.g. Acme Corp"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete WhatsApp Number Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, number: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteWhatsappMutation.isPending}
                title="Disconnect & Delete WhatsApp Number"
                description={`Are you sure you want to disconnect and delete the WhatsApp number "${deleteModal.number?.number || deleteModal.number?.phoneNumber}"? Automated WhatsApp messaging for "${deleteModal.number?.businessName}" will stop.`}
                details={
                    deleteModal.number
                        ? [
                              { label: 'Phone Number', value: deleteModal.number.number || deleteModal.number.phoneNumber },
                              { label: 'Merchant Name', value: deleteModal.number.businessName },
                              { label: 'Status', value: deleteModal.number.status },
                          ]
                        : []
                }
                confirmText="Disconnect & Delete"
                variant="danger"
            />
        </div>
    );
}
