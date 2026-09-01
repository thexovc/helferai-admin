'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Search, Quote, Star, Plus, Edit2, Trash2, User, Building2 } from 'lucide-react';
import { useInventoryTestimonials } from '@/api/inventory/inventory.queries';
import { useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from '@/api/inventory/inventory.mutations';
import { Testimonial } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function TestimonialsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const { data: testimonialsResponse, isLoading } = useInventoryTestimonials(page, pageSize);

    const createMutation = useCreateTestimonial();
    const updateMutation = useUpdateTestimonial();
    const deleteMutation = useDeleteTestimonial();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        author: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
        isActive: true
    });

    const handleOpenModal = (item?: Testimonial) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                author: item.author || item.userName || '',
                role: item.role || '',
                company: item.company || '',
                content: item.content || '',
                rating: item.rating || 5,
                isActive: item.status === 'Published' || item.isActive !== false
            });
        } else {
            setEditingItem(null);
            setFormData({
                author: '',
                role: '',
                company: '',
                content: '',
                rating: 5,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.author || !formData.content) {
            toast.error('Author and testimonial content are required');
            return;
        }

        try {
            if (editingItem) {
                await updateMutation.mutateAsync({
                    id: editingItem.id,
                    dto: formData
                });
            } else {
                await createMutation.mutateAsync(formData);
            }
            setIsModalOpen(false);
        } catch (err) { }
    };

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: Testimonial | null }>({
        isOpen: false,
        item: null,
    });

    const handleDelete = (item: Testimonial) => {
        setDeleteModal({ isOpen: true, item });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.item) return;
        try {
            await deleteMutation.mutateAsync(deleteModal.item.id);
            setDeleteModal({ isOpen: false, item: null });
        } catch (err) { }
    };

    const rawTestimonials = testimonialsResponse?.data || [];
    // Sort latest first
    const testimonials = [...rawTestimonials].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || a.date || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || b.date || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = testimonialsResponse?.meta?.total || testimonials.length;

    const filtered = testimonials.filter(t =>
        (t.author || t.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.content || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.company || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Testimonials" subtitle="Manage user testimonials and reviews for public display." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Quote size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Testimonials</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage user reviews and customer success stories.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                        }}>
                        <Plus size={18} /> Add Testimonial
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search testimonials..."
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
                                <th>Author / User</th>
                                <th>Company & Role</th>
                                <th>Rating</th>
                                <th>Content</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={7}><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No testimonials found</td>
                                </tr>
                            ) : filtered.map((t: Testimonial) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{t.author || t.userName}</td>
                                    <td style={{ color: '#6b7280', fontSize: 13 }}>{t.company ? `${t.role || 'Member'} at ${t.company}` : (t.role || '—')}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                                            <Star size={14} fill="currentColor" />
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>{(t.rating || 5).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.content}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: t.status === 'Published' || t.isActive ? '#eaf4e3' : '#f3f4f6',
                                            color: t.status === 'Published' || t.isActive ? '#6c9e4e' : '#6b7280'
                                        }}>
                                            {t.status || (t.isActive ? 'Active' : 'Inactive')}
                                        </span>
                                    </td>
                                    <td>{t.date || t.createdAt ? new Date(t.date || t.createdAt!).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(t)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t)}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Testimonial'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <User size={14} /> Author Name
                        </label>
                        <input
                            value={formData.author}
                            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="e.g. John Doe"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                Role / Title
                            </label>
                            <input
                                value={formData.role}
                                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                placeholder="e.g. Operations Lead"
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Building2 size={14} /> Company
                            </label>
                            <input
                                value={formData.company}
                                onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="e.g. Apex Logistics"
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Star size={14} /> Rating (1-5)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={5}
                            value={formData.rating}
                            onChange={e => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Testimonial Content</label>
                        <textarea
                            value={formData.content}
                            onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Customer review statement..."
                            style={{ height: 100, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Testimonial Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, item: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                title="Delete Testimonial"
                description={`Are you sure you want to delete the testimonial submitted by "${deleteModal.item?.author || deleteModal.item?.userName}"?`}
                details={
                    deleteModal.item
                        ? [
                              { label: 'Author', value: deleteModal.item.author || deleteModal.item.userName },
                              { label: 'Role / Company', value: `${deleteModal.item.role || ''} (${deleteModal.item.company || '—'})` },
                              { label: 'Rating', value: `${deleteModal.item.rating} / 5 Stars` },
                              { label: 'Excerpt', value: `"${(deleteModal.item.content || '').slice(0, 60)}..."` },
                          ]
                        : []
                }
                confirmText="Delete Testimonial"
                variant="danger"
            />
        </div>
    );
}
