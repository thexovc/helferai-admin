'use client';
import React, { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Edit2, Trash2, ShoppingBag, Tag, Package, DollarSign } from 'lucide-react';
import { useInventoryProducts } from '@/api/inventory/inventory.queries';
import Pagination from '../Pagination';
import { formatCurrency } from '@/app/lib/utils';
import { toast } from 'sonner';
import Modal from '../Modal';

export default function ProductsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: productsResponse, isLoading } = useInventoryProducts(page, pageSize);
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: 0,
        stockLevel: 0,
        status: 'Active'
    });

    useEffect(() => {
        if (productsResponse?.data) {
            setProducts(productsResponse.data);
        }
    }, [productsResponse]);

    const handleOpenModal = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                category: product.category,
                price: product.price,
                stockLevel: product.stockLevel,
                status: product.status
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: `SKU-${Math.floor(Math.random() * 100000)}`,
                category: 'General',
                price: 0,
                stockLevel: 0,
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = () => {
        if (!formData.name || !formData.category) {
            toast.error('Product name and category are required');
            return;
        }

        if (editingProduct) {
            setProducts(prev => prev.map(p => p.sku === editingProduct.sku ? { ...p, ...formData } : p));
            toast.success(`Product "${formData.name}" updated successfully`);
        } else {
            const newProduct = {
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            setProducts(prev => [newProduct, ...prev]);
            toast.success(`Product "${formData.name}" created successfully`);
        }
        setIsModalOpen(false);
    };

    const handleDeleteProduct = (p: any) => {
        if (confirm(`Are you sure you want to delete ${p.name}? This will remove it from inventory.`)) {
            setProducts(prev => prev.filter(item => item.sku !== p.sku));
            toast.success(`${p.name} deleted successfully`);
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Topbar title="Products" subtitle="Master list of all inventory items and SKUs." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Products</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your products.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,158,78,0.2)' }}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            placeholder="Search products..."
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
                                <th>Product Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && products.length === 0 ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td colSpan={7}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found</td>
                                </tr>
                            ) : (
                                filtered.map((p: any) => (
                                    <tr key={p.sku} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{p.name}</td>
                                        <td style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                                        <td><span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, color: '#374151' }}>{p.category}</span></td>
                                        <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{formatCurrency(p.price)}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: p.stockLevel < 10 ? '#dc2626' : p.stockLevel < 20 ? '#f59e0b' : '#16a34a'
                                            }}>
                                                {p.stockLevel}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                background: p.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                                                color: p.status === 'Active' ? '#15803d' : '#6b7280',
                                                borderRadius: 99, fontSize: 11, fontWeight: 700
                                            }}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(p)}
                                                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div style={{ padding: '12px 20px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={Math.ceil((productsResponse?.meta?.total || products.length) / pageSize)}
                            onPageChange={setPage}
                            totalItems={productsResponse?.meta?.total || products.length}
                            pageSize={pageSize}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveProduct} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {editingProduct ? 'Save Changes' : 'Create Product'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            <Package size={14} /> Product Name
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Wireless Mouse"
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                SKU
                            </label>
                            <input
                                value={formData.sku}
                                onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f3f4f6', color: '#6b7280' }}
                                disabled
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Tag size={14} /> Category
                            </label>
                            <input
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="e.g. Electronics"
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <DollarSign size={14} /> Price (₦)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Stock Level</label>
                            <input
                                type="number"
                                value={formData.stockLevel}
                                onChange={e => setFormData(prev => ({ ...prev, stockLevel: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 10px', fontSize: 14, outline: 'none', background: '#f9fafb' }}>
                            {['Active', 'Inactive', 'Discontinued'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
