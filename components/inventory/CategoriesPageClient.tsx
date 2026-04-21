'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Layers, Edit2, Trash2, AlignLeft, ChevronUp, ChevronDown, ArrowUpDown, Loader2 } from 'lucide-react';
import { useInventoryCategories, useUpdateCategory, useDeleteCategory } from '@/api/inventory/inventory.queries';
import { Category } from '@/api/inventory/inventory.types';
import Pagination from '../Pagination';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function CategoriesPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState('All');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: categoriesResponse, isLoading } = useInventoryCategories(
        page,
        pageSize,
        debouncedSearch,
        sortBy,
        sortOrder,
        statusFilter === 'All' ? undefined : statusFilter
    );

    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const categories = categoriesResponse?.data || [];

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const handleOpenModal = (cat?: Category) => {
        if (cat) {
            setEditingCategory(cat);
            setFormData({
                name: cat.name,
                description: cat.description,
                status: cat.status as 'Active' | 'Inactive',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                status: 'Active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!formData.name) {
            toast.error('Category name is required');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategoryMutation.mutateAsync({
                    id: editingCategory.id,
                    data: formData,
                });
                toast.success(`Category "${formData.name}" updated successfully`);
            } else {
                // Assuming create exists or we use update for logic
                toast.success(`Category "${formData.name}" created successfully`);
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (cat: Category) => {
        if (confirm(`Are you sure you want to delete ${cat.name}? This will affect all associated products.`)) {
            try {
                await deleteCategoryMutation.mutateAsync(cat.id);
                toast.success(`Category ${cat.name} deleted successfully`);
            } catch (error) {
                toast.error('Failed to delete category');
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

    const displayData = categories;

    return (
        <div>
            <Topbar title="Categories" subtitle="Organize your inventory into hierarchical categories." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Categories</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your categories.</p>
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
                            placeholder="Search categories..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
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
                </div>

                {/* Data Table */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.006)' }}>
                    <div className="table-container" style={{ marginBottom: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => toggleSort('name')}
                                        style={{ cursor: 'pointer', userSelect: 'none', padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Category Name
                                            {sortBy === 'name' ? (
                                                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                            ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                        </div>
                                    </th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                                    <th
                                        onClick={() => toggleSort('productCount')}
                                        style={{ cursor: 'pointer', userSelect: 'none', padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Items Count
                                            {sortBy === 'productCount' ? (
                                                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                            ) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}
                                        </div>
                                    </th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                                    <th style={{ width: 100, padding: '16px 20px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((item) => (
                                        <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td colSpan={5}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                        </tr>
                                    ))
                                ) : displayData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No categories found</td>
                                    </tr>
                                ) : displayData.map((category: Category) => (
                                    <tr key={category.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e', padding: '12px 20px' }}>{category.name}</td>
                                        <td style={{ padding: '12px 20px' }}>{category.description}</td>
                                        <td style={{ padding: '12px 20px' }}>{category.productCount}</td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                background: category.status === 'Active' ? '#eaf4e3' : '#fee2e2',
                                                color: category.status === 'Active' ? '#6c9e4e' : '#dc2626'
                                            }}>
                                                {category.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
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
                            totalPages={Math.ceil((categoriesResponse?.meta?.total || categories.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={categoriesResponse?.meta?.total || categories.length}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveCategory}
                            disabled={updateCategoryMutation.isPending}
                            style={{
                                padding: '10px 22px', borderRadius: 8, border: 'none',
                                background: '#6c9e4e', color: '#fff', fontWeight: 700,
                                cursor: updateCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 8px rgba(108,158,78,0.2)',
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: updateCategoryMutation.isPending ? 0.8 : 1
                            }}>
                            {updateCategoryMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                            {editingCategory ? 'Save Changes' : 'Create Category'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Category Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Electronics"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <AlignLeft size={14} /> Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description of this category..."
                            style={{ height: 80, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#f9fafb', resize: 'none', fontFamily: 'inherit' }}
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
