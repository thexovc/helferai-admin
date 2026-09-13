'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { Plus, Search, Edit2, Trash2, ShoppingBag, Tag, Package, DollarSign } from 'lucide-react';
import { useInventoryProducts, useInventoryCategories, useInventoryBrands } from '@/api/inventory/inventory.queries';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/api/inventory/inventory.mutations';
import Pagination from '../Pagination';
import { formatCurrency } from '@/app/lib/utils';
import { toast } from 'sonner';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';
import SearchableSelect from '../SearchableSelect';

export default function ProductsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const { data: productsResponse, isLoading } = useInventoryProducts(page, pageSize, debouncedSearch);
    const { data: categoriesData } = useInventoryCategories(1, 100);
    const { data: brandsData } = useInventoryBrands({ page: 1, pageSize: 100 });

    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        categoryId: '',
        brandId: '',
        price: 0,
        costPrice: 0,
        stockLevel: 0,
        status: 'Active'
    });

    const handleOpenModal = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                categoryId: product.categoryId || '',
                brandId: product.brandId || '',
                price: product.price || 0,
                costPrice: product.costPrice || 0,
                stockLevel: product.stockLevel || 0,
                status: product.status || 'Active'
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: `SKU-${Math.floor(Math.random() * 100000)}`,
                categoryId: categoriesData?.data?.[0]?.id || '',
                brandId: brandsData?.data?.[0]?.id || '',
                price: 0,
                costPrice: 0,
                stockLevel: 0,
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.name) {
            toast.error('Product name is required');
            return;
        }

        try {
            if (editingProduct) {
                await updateProductMutation.mutateAsync({
                    id: editingProduct.id || editingProduct.sku,
                    dto: {
                        name: formData.name,
                        sku: formData.sku,
                        price: formData.price,
                        costPrice: formData.costPrice,
                        stockLevel: formData.stockLevel,
                        categoryId: formData.categoryId || undefined,
                        brandId: formData.brandId || undefined,
                    }
                });
            } else {
                await createProductMutation.mutateAsync({
                    name: formData.name,
                    sku: formData.sku,
                    price: formData.price,
                    costPrice: formData.costPrice,
                    stockLevel: formData.stockLevel,
                    categoryId: formData.categoryId || undefined,
                    brandId: formData.brandId || undefined,
                });
            }
            setIsModalOpen(false);
        } catch (err: any) {
            // Handled by mutation toast
        }
    };

    // Delete Confirm Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: any | null }>({
        isOpen: false,
        product: null,
    });

    const handleDeleteProduct = (p: any) => {
        setDeleteModal({ isOpen: true, product: p });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.product) return;
        try {
            await deleteProductMutation.mutateAsync(deleteModal.product.id || deleteModal.product.sku);
            setDeleteModal({ isOpen: false, product: null });
        } catch (err) { }
    };

    const rawProducts = productsResponse?.data || [];
    // Sort latest first
    const products = [...rawProducts].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
    });
    const totalCount = productsResponse?.meta?.total || products.length;

    return (
        <div>
            <Topbar title="Products" subtitle="Master list of all inventory items and SKUs with multi-tenant batch tracking." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Products</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize inventory products and batch stock.</p>
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
                            placeholder="Search products by name or SKU..."
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
                                <th>Product Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Brand</th>
                                <th>Selling Price</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th style={{ width: 100 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((item) => (
                                    <tr key={item}>
                                        <td colSpan={8}><div style={{ height: 40, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found</td>
                                </tr>
                            ) : (
                                products.map((p: any) => (
                                    <tr key={p.id || p.sku} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                            {p.name}
                                            {p.businessName && p.businessName !== 'N/A' && (
                                                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>{p.businessName}</div>
                                            )}
                                        </td>
                                        <td style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                                        <td><span style={{ padding: '4px 10px', background: '#f3f4f6', borderRadius: 6, fontSize: 12, color: '#374151' }}>{p.category || 'General'}</span></td>
                                        <td><span style={{ fontSize: 12, color: '#6b7280' }}>{p.brand || 'General'}</span></td>
                                        <td style={{ fontWeight: 700, color: '#1a1a2e' }}>{formatCurrency(p.price)}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: p.stockLevel < 10 ? '#dc2626' : p.stockLevel < 20 ? '#f59e0b' : '#16a34a'
                                            }}>
                                                {p.stockLevel} {p.unit || 'pcs'}
                                            </span>
                                            {p.batchesCount !== undefined && p.batchesCount > 0 && (
                                                <div style={{ fontSize: 10, color: '#9ca3af' }}>{p.batchesCount} {p.batchesCount === 1 ? 'batch' : 'batches'}</div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                background: p.status === 'In Stock' || p.status === 'Active' ? '#dcfce7' : p.status === 'Low Stock' ? '#fef3c7' : '#fee2e2',
                                                color: p.status === 'In Stock' || p.status === 'Active' ? '#15803d' : p.status === 'Low Stock' ? '#b45309' : '#dc2626',
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
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button
                            onClick={handleSaveProduct}
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(108,158,78,0.2)' }}>
                            {createProductMutation.isPending || updateProductMutation.isPending ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
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
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <Tag size={14} /> Category
                            </label>
                            <SearchableSelect
                                value={formData.categoryId}
                                onChange={val => setFormData(prev => ({ ...prev, categoryId: val }))}
                                placeholder="Select category..."
                                searchPlaceholder="Search categories..."
                                options={categoriesData?.data?.map(c => ({
                                    value: c.id,
                                    label: c.name
                                })) || []}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                <DollarSign size={14} /> Selling Price (₦)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Opening / Stock Level</label>
                            <input
                                type="number"
                                value={formData.stockLevel}
                                onChange={e => setFormData(prev => ({ ...prev, stockLevel: Number(e.target.value) }))}
                                style={{ height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Product Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, product: null })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteProductMutation.isPending}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteModal.product?.name}"? This item will be removed from your active inventory catalogue.`}
                details={
                    deleteModal.product
                        ? [
                              { label: 'Product Name', value: deleteModal.product.name },
                              { label: 'SKU', value: deleteModal.product.sku },
                              { label: 'Price', value: formatCurrency(deleteModal.product.price || 0) },
                              { label: 'Current Stock', value: `${deleteModal.product.stockLevel || 0} units` },
                          ]
                        : []
                }
                confirmText="Delete Product"
                variant="danger"
            />
        </div>
    );
}
