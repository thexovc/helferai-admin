'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api';

// Same columns the main app's bulk upload reads
const TEMPLATE_HEADERS = ['product_name', 'sku', 'category', 'brand', 'unit', 'vendor', 'selling_price', 'cost_price', 'opening_stock', 'tax_percentage', 'color', 'size', 'description'];
const TEMPLATE_EXAMPLE = ['iPhone 15 Pro 256GB', 'IP15P-256', 'Smartphones', 'Apple', 'pcs', 'ANGLE 90 Gadgets', '1250000', '1150000', '3', '0', 'Black', '', 'Unlocked, UK used'];

const downloadTemplate = () => {
    const csv = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE].map(r => r.map(c => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.csv';
    a.click();
    URL.revokeObjectURL(url);
};

export default function BulkUploadProductsModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const [file, setFile] = React.useState<File | null>(null);
    const [uploading, setUploading] = React.useState(false);
    const [result, setResult] = React.useState<{ rows: number; uploadedAs?: string } | null>(null);

    React.useEffect(() => {
        if (!isOpen) return;
        setFile(null);
        setResult(null);
    }, [isOpen]);

    const upload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const token = typeof window !== 'undefined' ? localStorage.getItem('inventoryToken') : null;
            const res = await fetch(`${API_BASE}/admin/api/inventory/businesses/${businessId}/products/bulk-upload`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: form,
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.message || 'Upload failed');
            setResult(json.data);
            toast.success(`Upload started: ${json.data?.rows ?? ''} rows`);
            // The job runs in the background; refresh the products tab shortly after
            setTimeout(() => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }), 8000);
        } catch (err: any) {
            toast.error(err?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Bulk Upload Products${businessName ? ` · ${businessName}` : ''}`}
            footer={
                result ? (
                    <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Done</button>
                ) : (
                    <>
                        <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={upload} disabled={!file || uploading}
                            style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: file ? 'pointer' : 'not-allowed', opacity: file ? 1 : 0.5 }}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </>
                )
            }
        >
            {result ? (
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <b>{result.rows.toLocaleString()} rows</b> are being added in the background, the same way as an upload from the HelferAI app.
                    New products are created and existing ones (same name or SKU) are updated.
                    {result.uploadedAs && <> When it finishes, a summary with any problem rows is emailed to <b>{result.uploadedAs}</b>.</>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                        Upload an Excel (.xlsx, .xls) or CSV file in the same format as the HelferAI app&apos;s bulk upload.
                        Only <b>product name</b> and <b>selling price</b> are required; categories, brands, units and vendors are matched by name, or created if new.
                    </div>
                    <button onClick={downloadTemplate} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 8, border: '1px solid #c7ddb8', background: '#f0f7eb', color: '#3f7d2c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Download template (.csv)
                    </button>
                    <label style={{ display: 'block', border: '2px dashed #d1d5db', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                        <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{file ? file.name : 'Choose a file'}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{file ? `${(file.size / 1024).toFixed(0)} KB` : 'Excel or CSV, up to 50 MB'}</div>
                    </label>
                    <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                        Products go straight into this merchant&apos;s stock list.
                    </div>
                </div>
            )}
        </Modal>
    );
}
