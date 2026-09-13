'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Ruler, Edit2, Trash2, Tag } from 'lucide-react';
import { useInventoryUnits } from '@/api/inventory/inventory.queries';
import { useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/api/inventory/inventory.mutations';
import { Unit } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function UnitsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');

    const { data: unitsResponse, isLoading } = useInventoryUnits(page, pageSize, search);

    const createUnitMutation = useCreateUnit();
    const updateUnitMutation = useUpdateUnit();
    const deleteUnitMutation = useDeleteUnit();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const handleOpenModal = (unit?: Unit) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                name: unit.name,
                abbreviation: unit.abbreviation || '',
                status: (unit.status as 'Active' | 'Inactive') || 'Active',
            });
        } else {
            setEditingUnit(null);
            setFormData({
                name: '',
                abbreviation: '',
                status: 'Active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveUnit = async () => {
        if (!formData.name || !formData.abbreviation) {
            toast.error('Unit name and abbreviation are required');
            return;
        }

        try {
            if (editingUnit) {
                await updateUnitMutation.mutateAsync({
                    id: editingUnit.id,
                    dto: { name: formData.name, abbreviation: formData.abbreviation }
                });
            } else {
                await createUnitMutation.mutateAsync({
                    name: formData.name,
                    abbreviation: formData.abbreviation
                });
            }
            setIsModalOpen(false);
        } catch (err) {
            // Handled by mutation
        }
    };

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; unit: Unit | null }>({
        isOpen: false,
        unit: null,
    });

    const handleDelete = (unit: Unit) => {
        setDeleteModal({ isOpen: true, unit });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.unit) return;
        try {
            await deleteUnitMutation.mutateAsync(deleteModal.unit.id);
            setDeleteModal({ isOpen: false, unit: null });
        } catch (err) { }
    };

    const rawUnits = unitsResponse?.data || [];
    // Sort latest first
    const units = [...rawUnits].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = unitsResponse?.meta?.total || units.length;

    return (
        <div>
            <Topbar title="Units" subtitle="Define measurement units for your inventory items." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ruler size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Units</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your measurement units.</p>
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
                            placeholder="Search units..."
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
                                <th>Unit Name</th>
                                <th>Abbreviation</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={4}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No units found</td>
                                </tr>
                            ) : units.map((unit: Unit) => (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{unit.name}</td>
                                    <td><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#374151', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{unit.abbreviation}</span></td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: unit.status === 'Active' ? '#eaf4e3' : '#fee2e2',
                                            color: unit.status === 'Active' ? '#6c9e4e' : '#dc2626'
                                        }}>
                                            {unit.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleOpenModal(unit)}
                                                style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(unit)}
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
                title={editingUnit ? 'Edit Unit' : 'Add New Unit'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveUnit}
                            disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createUnitMutation.isPending || updateUnitMutation.isPending ? 'Saving...' : editingUnit ? 'Save Changes' : 'Create Unit'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Unit Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Kilograms"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Tag size={14} /> Abbreviation
                        </label>
                        <input
                            value={formData.abbreviation}
                            onChange={e => setFormData(prev => ({ ...prev, abbreviation: e.target.value }))}
                            placeholder="e.g. kg"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Unit Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, unit: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteUnitMutation.isPending}
                title="Delete Measurement Unit"
                description={`Are you sure you want to delete the unit "${deleteModal.unit?.name}" (${deleteModal.unit?.abbreviation})?`}
                details={
                    deleteModal.unit
                        ? [
                              { label: 'Unit Name', value: deleteModal.unit.name },
                              { label: 'Abbreviation', value: deleteModal.unit.abbreviation },
                              { label: 'Products Linked', value: `${deleteModal.unit.productCount || 0} products` },
                          ]
                        : []
                }
                confirmText="Delete Unit"
                variant="danger"
            />
        </div>
    );
}
