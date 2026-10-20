'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../Modal';
import { useInventoryCategories, inventoryKeys } from '@/api/inventory/inventory.queries';
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
    // This merchant's own categories
    const { data: categoriesResp } = useInventoryCategories(1, 100, '', isOpen ? businessId : '');
    const categories = (categoriesResp as any)?.data || [];

    const [name, setName] = React.useState('');
    const [sku, setSku] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [costPrice, setCostPrice] = React.useState('');
    const [stock, setStock] = React.useState('');
    const [categoryId, setCategoryId] = React.useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        setName(''); setSku(''); setPrice(''); setCostPrice(''); setStock(''); setCategoryId('');
    }, [isOpen]);

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
                <div>
                    <label style={labelStyle}>Category</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                        <option value="">No category</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
        </Modal>
    );
}
