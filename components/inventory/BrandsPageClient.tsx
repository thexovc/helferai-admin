'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Tag, Edit2, Trash2, Building2 } from 'lucide-react';
import { useInventoryBrands } from '@/api/inventory/inventory.queries';
import { Brand } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function BrandsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: brandsResponse, isLoading } = useInventoryBrands(page, pageSize);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        manufacturer: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    useEffect(() => {
        if (brandsResponse?.data) {
            setBrands(brandsResponse.data);
        }
    }, [brandsResponse]);

    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                manufacturer: brand.manufacturer,
                status: brand.status as 'Active' | 'Inactive',
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

    const handleSaveBrand = () => {
        if (!formData.name || !formData.manufacturer) {
            toast.error('Brand name and manufacturer are required');
            return;
        }

        if (editingBrand) {
            setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...formData } : b));
            toast.success(`Brand "${formData.name}" updated successfully`);
        } else {
            const newBrand: Brand = {
                id: `brand-${Date.now()}`,
                ...formData,
                productCount: 0,
                createdAt: new Date().toISOString()
            };
            setBrands(prev => [newBrand, ...prev]);
            toast.success(`Brand "${formData.name}" created successfully`);
        }
        setIsModalOpen(false);
    };

    const handleAction = (type: 'edit' | 'delete', brand: Brand) => {
        if (type === 'delete') {
            if (confirm(`Are you sure you want to delete ${brand.name}? This will affect all associated products.`)) {
                setBrands(prev => prev.filter(b => b.id !== brand.id));
                toast.success(`Brand ${brand.name} deleted successfully`);
            }
        } else {
            handleOpenModal(brand);
        }
    };

    const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.manufacturer.toLowerCase().includes(search.toLowerCase())
    );

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
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your brands.</p>
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
                                <th>Brand Name</th>
                                <th>Manufacturer</th>
                                <th>Products Count</th>
                                <th>Status</th>
                                <th>Date Added</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && brands.length === 0 ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td colSpan={6}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No brands found</td>
                                </tr>
                            ) : filtered.map((brand: Brand) => (
                                <tr key={brand.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{brand.name}</td>
                                    <td>{brand.manufacturer}</td>
                                    <td>{brand.productCount}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                            background: brand.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                            color: brand.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {brand.status}
                                        </span>
                                    </td>
                                    <td>{new Date(brand.createdAt).toLocaleDateString()}</td>
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
                            totalPages={Math.ceil((brandsResponse?.meta?.total || brands.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={brandsResponse?.meta?.total || brands.length}
                            pageSize={pageSize}
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
                        <button onClick={handleSaveBrand} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {editingBrand ? 'Save Changes' : 'Create Brand'}
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
