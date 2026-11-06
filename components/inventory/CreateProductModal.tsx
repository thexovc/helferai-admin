'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { inventoryApi } from '@/api/inventory/inventory.api';
import { useCreateProduct } from '@/api/inventory/inventory.mutations';

const inputStyle: React.CSSProperties = { height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

// Digits only; shows commas while typing (1,830,000)
const toNumber = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0;
const withCommas = (v: string) => {
    const [whole, dec] = v.replace(/[^0-9.]/g, '').split('.');
    const w = whole ? Number(whole).toLocaleString() : '';
    return dec !== undefined ? `${w}.${dec.slice(0, 2)}` : w;
};

export default function CreateProductModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const createProduct = useCreateProduct();
    // This merchant's own categories, brands, vendors, units and stores
    const { data: options } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'product-options'],
        queryFn: () => inventoryApi.getBusinessProductOptions(businessId),
        enabled: isOpen && !!businessId,
    });
    const categories = options?.categories || [];

    const [name, setName] = React.useState('');
    const [sku, setSku] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [costPrice, setCostPrice] = React.useState('');
    const [stock, setStock] = React.useState('');
    const [categoryId, setCategoryId] = React.useState('');
    const [brandId, setBrandId] = React.useState('');
    const [vendorId, setVendorId] = React.useState('');
    const [unitId, setUnitId] = React.useState('');
    const [storeId, setStoreId] = React.useState('');
    const [lowStock, setLowStock] = React.useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        setName(''); setSku(''); setPrice(''); setCostPrice(''); setStock(''); setCategoryId('');
        setBrandId(''); setVendorId(''); setUnitId(''); setStoreId(''); setLowStock('');
    }, [isOpen]);

    // Default to the merchant's main store once the list arrives
    React.useEffect(() => {
        if (isOpen && !storeId && options?.stores?.length) {
            setStoreId((options.stores.find(s => s.isDefault) || options.stores[0]).id);
        }
    }, [isOpen, options, storeId]);

    const valid = name.trim().length > 0 && toNumber(price) > 0;

    const save = async () => {
        if (!valid) return;
        try {
            await createProduct.mutateAsync({
                businessId,
                name: name.trim(),
                sku: sku.trim() || undefined,
                price: toNumber(price),
                // Left blank, the server assumes 70% of the selling price
                costPrice: costPrice ? toNumber(costPrice) : undefined,
                stockLevel: stock ? Math.round(toNumber(stock)) : 0,
                categoryId: categoryId || undefined,
                brandId: brandId || undefined,
                vendorId: vendorId || undefined,
                unitId: unitId || undefined,
                storeId: storeId || undefined,
                lowStockAlert: lowStock ? Math.round(toNumber(lowStock)) : undefined,
            });
            // Refresh this merchant's products tab and counts
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch {
            // The mutation shows the error
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add Product${businessName ? ` · ${businessName}` : ''}`}
            footer={
                <>
                    <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={save} disabled={!valid || createProduct.isPending}
                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                        {createProduct.isPending ? 'Saving...' : 'Add Product'}
                    </button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={labelStyle}>Product name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. iPhone 17 Pro Max 512GB" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Selling price (₦) *</label>
                        <input inputMode="decimal" value={price} onChange={e => setPrice(withCommas(e.target.value))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Cost price (₦)</label>
                        <input inputMode="decimal" value={costPrice} onChange={e => setCostPrice(withCommas(e.target.value))} placeholder="Optional" style={inputStyle} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Opening stock</label>
                        <input inputMode="numeric" value={stock} onChange={e => setStock(withCommas(e.target.value.replace(/\./g, '')))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>SKU</label>
                        <input value={sku} onChange={e => setSku(e.target.value)} placeholder="Made up if left blank" style={inputStyle} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                            <option value="">No category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Brand</label>
                        <select value={brandId} onChange={e => setBrandId(e.target.value)} style={inputStyle}>
                            <option value="">No brand</option>
                            {(options?.brands || []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Vendor</label>
                        <select value={vendorId} onChange={e => setVendorId(e.target.value)} style={inputStyle}>
                            <option value="">No vendor</option>
                            {(options?.vendors || []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Unit</label>
                        <select value={unitId} onChange={e => setUnitId(e.target.value)} style={inputStyle}>
                            <option value="">Pieces (default)</option>
                            {(options?.units || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Store</label>
                        <select value={storeId} onChange={e => setStoreId(e.target.value)} style={inputStyle}>
                            {(options?.stores || []).length === 0 && <option value="">No stores</option>}
                            {(options?.stores || []).map(st => <option key={st.id} value={st.id}>{st.name}{st.isDefault ? ' (main)' : ''}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Low-stock alert at</label>
                        <input inputMode="numeric" value={lowStock} onChange={e => setLowStock(withCommas(e.target.value.replace(/\./g, '')))} placeholder="e.g. 2" style={inputStyle} />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
