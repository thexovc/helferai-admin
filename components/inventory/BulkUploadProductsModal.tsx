'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api';

// The HelferAI app's own example sheet (copied from public/examples in HelferAI-Inventory-V2)
const TEMPLATE_URL = '/examples/inventory_bulk_upload_example.xlsx';

const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = TEMPLATE_URL;
    a.download = 'inventory_bulk_upload_example.xlsx';
    a.click();
};

type Conflict = {
    sku: string;
    source: 'file' | 'existing';
    message: string;
    current: { label: string; name?: string };
    uploaded: { label: string; name?: string };
    defaultAction: 'overwrite' | 'keep_existing';
};
type NameMatch = {
    key: string;
    source: 'file' | 'existing';
    productName: string;
    rows: { rowNumber: number; sku: string; quantity: number; costPrice: number; stockedDate?: string }[];
    totalQuantity: number;
    reason: string;
    defaultAction: 'add_as_batch' | 'standalone';
};
type CheckResult = { rows: number; conflicts: Conflict[]; nameMatches: NameMatch[]; uploadedAs?: string };

const postFile = async (path: string, file: File, extra?: Record<string, string>) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(extra || {}).forEach(([k, v]) => form.append(k, v));
    const token = typeof window !== 'undefined' ? localStorage.getItem('inventoryToken') : null;
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json.data;
};

const choiceBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: active ? '1px solid #6c9e4e' : '1px solid #e5e7eb',
    background: active ? '#eaf4e3' : '#fff', color: active ? '#3f7d2c' : '#6b7280',
});

export default function BulkUploadProductsModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const [file, setFile] = React.useState<File | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [check, setCheck] = React.useState<CheckResult | null>(null);
    const [skuChoice, setSkuChoice] = React.useState<Record<string, 'overwrite' | 'keep_existing'>>({});
    const [batchChoice, setBatchChoice] = React.useState<Record<string, 'add_as_batch' | 'standalone'>>({});
    const [result, setResult] = React.useState<{ rows: number; batchesAdded?: number; uploadedAs?: string } | null>(null);

    React.useEffect(() => {
        if (!isOpen) return;
        setFile(null); setCheck(null); setResult(null); setSkuChoice({}); setBatchChoice({});
    }, [isOpen]);

    const base = `/admin/api/inventory/businesses/${businessId}/products/bulk-upload`;

    const upload = async (skus = skuChoice, batches = batchChoice) => {
        if (!file) return;
        setBusy(true);
        try {
            const data = await postFile(base, file, { resolutions: JSON.stringify({ conflicts: skus, batches }) });
            setResult(data);
            toast.success(`Upload started: ${data?.rows ?? 0} rows`);
            // The job runs in the background; refresh the products tab shortly after
            setTimeout(() => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }), 8000);
        } catch (err: any) {
            toast.error(err?.message || 'Upload failed');
        } finally {
            setBusy(false);
        }
    };

    // Same order as the app: check the file first, ask about anything it finds, then upload
    const checkFile = async () => {
        if (!file) return;
        setBusy(true);
        try {
            const data: CheckResult = await postFile(`${base}/check`, file);
            const skus: Record<string, 'overwrite' | 'keep_existing'> = {};
            data.conflicts.forEach(c => { skus[c.sku] = skus[c.sku] || c.defaultAction; });
            const batches: Record<string, 'add_as_batch' | 'standalone'> = {};
            data.nameMatches.forEach(m => { batches[m.key] = m.defaultAction; });
            setSkuChoice(skus);
            setBatchChoice(batches);
            if (data.conflicts.length === 0 && data.nameMatches.length === 0) {
                setBusy(false);
                await upload(skus, batches);
                return;
            }
            setCheck(data);
        } catch (err: any) {
            toast.error(err?.message || 'Could not read the file');
        } finally {
            setBusy(false);
        }
    };

    // One row per SKU in the review list
    const skuRows = check ? Object.values(check.conflicts.reduce((acc, c) => {
        (acc[c.sku] = acc[c.sku] || []).push(c);
        return acc;
    }, {} as Record<string, Conflict[]>)) : [];

    const footer = result ? (
        <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Done</button>
    ) : (
        <>
            <button onClick={check ? () => setCheck(null) : onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>
                {check ? 'Back' : 'Cancel'}
            </button>
            <button onClick={() => (check ? upload() : checkFile())} disabled={!file || busy}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: file ? 'pointer' : 'not-allowed', opacity: file ? 1 : 0.5 }}>
                {busy ? (check ? 'Uploading...' : 'Checking...') : check ? 'Upload with these choices' : 'Upload'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Upload Products${businessName ? ` · ${businessName}` : ''}`} footer={footer}>
            {result ? (
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <b>{result.rows.toLocaleString()} rows</b> are being added in the background, the same way as an upload from the HelferAI app.
                    {!!result.batchesAdded && <> {result.batchesAdded} row{result.batchesAdded === 1 ? ' was' : 's were'} added as new batches of existing products.</>}
                    {result.uploadedAs && <> When it finishes, a summary with any problem rows is emailed to <b>{result.uploadedAs}</b>.</>}
                </div>
            ) : check ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '60vh', overflowY: 'auto' }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                        The file has <b>{check.rows.toLocaleString()} rows</b>. Choose what to do with these before uploading.
                    </div>

                    {skuRows.length > 0 && (
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>SKU conflicts ({skuRows.length})</div>
                            {skuRows.map(group => {
                                const c = group[0];
                                const choice = skuChoice[c.sku];
                                return (
                                    <div key={c.sku} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{c.sku}</div>
                                        {group.map((g, i) => (
                                            <div key={i} style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                                {g.message}
                                                <div>{g.current.label}: <b>{g.current.name || '—'}</b> · {g.uploaded.label}: <b>{g.uploaded.name || '—'}</b></div>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <button style={choiceBtn(choice === 'overwrite')} onClick={() => setSkuChoice(p => ({ ...p, [c.sku]: 'overwrite' }))}>
                                                {c.source === 'existing' ? 'Overwrite with file' : 'Upload all rows'}
                                            </button>
                                            <button style={choiceBtn(choice === 'keep_existing')} onClick={() => setSkuChoice(p => ({ ...p, [c.sku]: 'keep_existing' }))}>
                                                {c.source === 'existing' ? 'Keep existing' : 'Skip this SKU'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {check.nameMatches.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>Possible batches ({check.nameMatches.length})</div>
                                <button style={{ ...choiceBtn(false), fontSize: 11 }}
                                    onClick={() => setBatchChoice(Object.fromEntries(check.nameMatches.map(m => [m.key, 'standalone'])))}>
                                    Keep all separate
                                </button>
                            </div>
                            {check.nameMatches.map(m => {
                                const choice = batchChoice[m.key];
                                return (
                                    <div key={m.key} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{m.productName}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{m.reason}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                            {m.rows.map(r => `Row ${r.rowNumber}: ${r.quantity} unit${r.quantity === 1 ? '' : 's'}${r.costPrice ? ` at ₦${r.costPrice.toLocaleString()}` : ''}${r.sku && r.sku !== 'N/A' ? ` (${r.sku})` : ''}`).join(' · ')}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <button style={choiceBtn(choice === 'add_as_batch')} onClick={() => setBatchChoice(p => ({ ...p, [m.key]: 'add_as_batch' }))}>
                                                {m.source === 'existing' ? 'Add as batch to existing product' : `One product, ${m.rows.length} batches`}
                                            </button>
                                            <button style={choiceBtn(choice === 'standalone')} onClick={() => setBatchChoice(p => ({ ...p, [m.key]: 'standalone' }))}>
                                                Separate products
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                        Upload an Excel (.xlsx, .xls) or CSV file in the same format as the HelferAI app&apos;s bulk upload.
                        It&apos;s checked first for repeated SKUs, repeated product names (batches) and products that already exist, just like in the app.
                    </div>
                    <button onClick={downloadTemplate} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 8, border: '1px solid #c7ddb8', background: '#f0f7eb', color: '#3f7d2c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Download template (.xlsx)
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
