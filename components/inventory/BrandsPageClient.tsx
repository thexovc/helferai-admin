'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Tag, Edit2, Trash2, Building2, ChevronUp, ChevronDown, ArrowUpDown, Loader2, Calendar } from 'lucide-react';
import { useInventoryBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/api/inventory/inventory.queries';
import { Brand } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function BrandsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [debouncedStartDate, setDebouncedStartDate] = useState('');
    const [debouncedEndDate, setDebouncedEndDate] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Debounce date inputs
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedStartDate(startDate);
            setDebouncedEndDate(endDate);
            if (startDate || endDate) setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [startDate, endDate]);

    const { data: brandsResponse, isLoading } = useInventoryBrands(
        page,
        pageSize,
        debouncedSearch,
        sortBy,
        sortOrder,
        statusFilter === 'All' ? undefined : statusFilter,
        debouncedStartDate,
        debouncedEndDate
    );
    const brands = brandsResponse?.data || [];

    const handleClearDateFilters = () => {
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

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

    const handleSaveBrand = async () => {
        if (!formData.name) {
            toast.error('Brand name is required');
            return;
        }

        try {
            if (editingBrand) {
                await updateBrandMutation.mutateAsync({
                    id: editingBrand.id,
                    data: formData,
                });
                toast.success(`Brand "${formData.name}" updated successfully`);
            } else {
                await createBrandMutation.mutateAsync(formData);
                toast.success(`Brand "${formData.name}" created successfully`);
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save brand');
        }
    };

    const handleDelete = async (brand: Brand) => {
        if (confirm(`Are you sure you want to delete ${brand.name}? This will affect all associated products.`)) {
            try {
                await deleteBrandMutation.mutateAsync(brand.id);
                toast.success(`Brand ${brand.name} deleted successfully`);
            } catch (error) {
                toast.error('Failed to delete brand');
            }
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            if (sortOrder === 'asc') setSortOrder('desc');
            else if (sortOrder === 'desc') {
                setSortBy(undefined);
                setSortOrder(undefined);
            }
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const isPending = createBrandMutation.isPending || updateBrandMutation.isPending;

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
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
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

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            height: 44, padding: '0 16px', borderRadius: 12, border: '1px solid #e5e7eb',
                            background: '#fff', outline: 'none', fontSize: 14, color: '#1a1a2e',
                            minWidth: 140, cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0 12px', height: 44 }}>
                        <Calendar size={16} color="#9ca3af" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e' }}
                        />
                        <span style={{ color: '#9ca3af' }}>-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e' }}
                        />
                    </div>

                    {(startDate || endDate || debouncedStartDate || debouncedEndDate) && (
                        <button
                            onClick={handleClearDateFilters}
                            style={{
                                height: 44, padding: '0 16px', borderRadius: 12, background: '#f3f4f6',
                                color: '#6b7280', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}>
                            Clear
                        </button>
                    )}
                </div>

                {/* Data Table */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.006)' }}>
                    <div className="table-container" style={{ marginBottom: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer', userSelect: 'none', padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Brand Name
                                            {sortBy === 'name' ? (
                                                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                            ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                        </div>
                                    </th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Manufacturer</th>
                                    <th onClick={() => toggleSort('productCount')} style={{ cursor: 'pointer', userSelect: 'none', padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Products Count
                                            {sortBy === 'productCount' ? (
                                                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                            ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                        </div>
                                    </th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                    <th onClick={() => toggleSort('createdAt')} style={{ cursor: 'pointer', userSelect: 'none', padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Date Added
                                            {sortBy === 'createdAt' ? (
                                                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                            ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                        </div>
                                    </th>
                                    <th style={{ width: 100, padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((item) => (
                                        <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td colSpan={6} style={{ padding: '12px 20px' }}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        </tr>
                                    ))
                                ) : brands.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No brands found</td>
                                    </tr>
                                ) : brands.map((brand: Brand) => (
                                    <tr key={brand.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e', padding: '12px 20px' }}>{brand.name}</td>
                                        <td style={{ padding: '12px 20px' }}>{brand.manufacturer}</td>
                                        <td style={{ padding: '12px 20px' }}>{brand.productCount}</td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                background: brand.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                color: brand.status === 'Active' ? '#166534' : '#991b1b'
                                            }}>
                                                {brand.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleOpenModal(brand)}
                                                    style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand)}
                                                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer - Full Width */}
                    <div style={{ padding: '16px 20px', background: '#fdfdfd', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={brandsResponse?.meta?.totalPages || 1}
                            onPageChange={setPage}
                            totalItems={brandsResponse?.meta?.total || 0}
                            pageSize={pageSize}
                        />
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
                                disabled={isPending}
                                style={{
                                    padding: '10px 22px', borderRadius: 8, border: 'none',
                                    background: '#6c9e4e', color: '#fff', fontWeight: 700,
                                    cursor: isPending ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 2px 8px rgba(108,158,78,0.2)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    opacity: isPending ? 0.8 : 1
                                }}>
                                {isPending && <Loader2 size={18} className="animate-spin" />}
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
                    </div>
                </Modal>
            </div>
        </div>
    );
}
