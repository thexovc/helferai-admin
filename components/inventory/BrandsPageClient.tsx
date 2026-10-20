'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Tag, Edit2, Trash2, Building2 } from 'lucide-react';
import { useInventoryBrands } from '@/api/inventory/inventory.queries';
import { useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/api/inventory/inventory.mutations';
import { Brand } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function BrandsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const { data: brandsResponse, isLoading } = useInventoryBrands({ page, pageSize, search });

    const createBrandMutation = useCreateBrand();
    const updateBrandMutation = useUpdateBrand();
    const deleteBrandMutation = useDeleteBrand();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        manufacturer: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                manufacturer: brand.manufacturer || '',
                status: (brand.status as 'Active' | 'Inactive') || 'Active',
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: '',
                manufacturer: '',
                status: 'Active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveBrand = async () => {
        if (!formData.name) {
            toast.error('Brand name is required');
            return;
        }

        try {
            if (editingBrand) {
                await updateBrandMutation.mutateAsync({
                    id: editingBrand.id,
                    dto: { name: formData.name, manufacturer: formData.manufacturer }
                });
            } else {
                await createBrandMutation.mutateAsync({
                    name: formData.name,
                    manufacturer: formData.manufacturer
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; brand: Brand | null }>({
        isOpen: false,
        brand: null,
    });

    const handleAction = (type: 'edit' | 'delete', brand: Brand) => {
        if (type === 'delete') {
            setDeleteModal({ isOpen: true, brand });
        } else {
            handleOpenModal(brand);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.brand) return;
        try {
            await deleteBrandMutation.mutateAsync(deleteModal.brand.id);
            setDeleteModal({ isOpen: false, brand: null });
        } catch (err) { }
    };

    const rawBrands = brandsResponse?.data || [];
    // Sort latest first
    const brands = [...rawBrands].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = brandsResponse?.meta?.total || brands.length;

    return (
        <div>
            <Topbar title="Brands" subtitle="Manage your product brands, logos, and manufacturer details." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Brands</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your product brands.</p>
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
                            placeholder="Search brands..."
                            value={search}
                            onChange={(e) => {
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
                                <th>Brand Name</th>
                                <th>Manufacturer</th>
                                <th>Products Count</th>
                                <th>Status</th>
                                <th>Date Added</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : brands.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No brands found</td>
                                </tr>
                            ) : brands.map((brand: Brand) => (
                                <tr key={brand.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{brand.name}</td>
                                    <td>{brand.manufacturer || 'N/A'}</td>
                                    <td>{brand.productCount || 0}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: brand.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                            color: brand.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {brand.status}
                                        </span>
                                    </td>
                                    <td>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleAction('edit', brand)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleAction('delete', brand)}
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
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBrand ? 'Edit Brand' : 'Add New Brand'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveBrand}
                            disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createBrandMutation.isPending || updateBrandMutation.isPending ? 'Saving...' : editingBrand ? 'Save Changes' : 'Create Brand'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Tag size={14} /> Brand Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Samsung"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Building2 size={14} /> Manufacturer
                        </label>
                        <input
                            value={formData.manufacturer}
                            onChange={e => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                            placeholder="e.g. Samsung Electronics"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Brand Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, brand: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteBrandMutation.isPending}
                title="Delete Brand"
                description={`Are you sure you want to delete the brand "${deleteModal.brand?.name}"? Associated products will no longer be linked to this brand.`}
                details={
                    deleteModal.brand
                        ? [
                              { label: 'Brand Name', value: deleteModal.brand.name },
                              { label: 'Manufacturer', value: deleteModal.brand.manufacturer || '—' },
                              { label: 'Products Linked', value: `${deleteModal.brand.productCount || 0} products` },
                          ]
                        : []
                }
                confirmText="Delete Brand"
                variant="danger"
            />
        </div>
    );
}
