'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Filter, Ruler, Edit2, Trash2, Tag } from 'lucide-react';
import { useInventoryUnits } from '@/api/inventory/inventory.queries';
import { Unit } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function UnitsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: unitsResponse, isLoading } = useInventoryUnits(page, pageSize);
    const [units, setUnits] = useState<Unit[]>([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    useEffect(() => {
        if (unitsResponse?.data) {
            setUnits(unitsResponse.data);
        }
    }, [unitsResponse]);

    const handleOpenModal = (unit?: Unit) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                name: unit.name,
                abbreviation: unit.abbreviation,
                status: unit.status as 'Active' | 'Inactive',
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

    const handleSaveUnit = () => {
        if (!formData.name || !formData.abbreviation) {
            toast.error('Unit name and abbreviation are required');
            return;
        }

        if (editingUnit) {
            setUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...formData } : u));
            toast.success(`Unit "${formData.name}" updated successfully`);
        } else {
            const newUnit: Unit = {
                id: `unit-${Date.now()}`,
                ...formData,
            };
            setUnits(prev => [newUnit, ...prev]);
            toast.success(`Unit "${formData.name}" created successfully`);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (unit: Unit) => {
        if (confirm(`Are you sure you want to delete ${unit.name}? This will affect all associated products.`)) {
            setUnits(prev => prev.filter(u => u.id !== unit.id));
            toast.success(`Unit ${unit.name} deleted successfully`);
        }
    };

    const filtered = units.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.abbreviation.toLowerCase().includes(search.toLowerCase())
    );

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
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your units.</p>
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
                            onChange={e => setSearch(e.target.value)}
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
                            {isLoading && units.length === 0 ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={4}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No units found</td>
                                </tr>
                            ) : filtered.map((unit: Unit) => (
                                <tr key={unit.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{unit.name}</td>
                                    <td>{unit.abbreviation}</td>
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
                            totalPages={Math.ceil((unitsResponse?.meta?.total || units.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={unitsResponse?.meta?.total || units.length}
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
                        <button onClick={handleSaveUnit} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {editingUnit ? 'Save Changes' : 'Create Unit'}
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
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                            {['Active', 'Inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
