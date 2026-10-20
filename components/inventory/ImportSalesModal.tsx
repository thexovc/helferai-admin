'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { fullNaira } from './formatNumbers';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api';

// The HelferAI app's own example sheet (copied from public/examples in HelferAI-Inventory-V2)
const TEMPLATE_URL = '/examples/sales_bulk_upload_example.xlsx';

const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = TEMPLATE_URL;
    a.download = 'sales_bulk_upload_example.xlsx';
    a.click();
};

type Conflict = {
    receipt_number: string;
    changesDetected: string[];
    current: { amount: number; customer: string };
    uploaded: { amount: number };
    defaultAction: 'overwrite' | 'keep';
};
type CheckResult = { totalRecords: number; validCount: number; conflictCount: number; conflicts: Conflict[]; uploadedAs?: string };

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

export default function ImportSalesModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const [file, setFile] = React.useState<File | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [check, setCheck] = React.useState<CheckResult | null>(null);
    const [choice, setChoice] = React.useState<Record<string, 'overwrite' | 'keep'>>({});
    const [result, setResult] = React.useState<{ rows: number; uploadedAs?: string } | null>(null);

    React.useEffect(() => {
        if (!isOpen) return;
        setFile(null); setCheck(null); setResult(null); setChoice({});
    }, [isOpen]);

    const base = `/admin/api/inventory/businesses/${businessId}/sales/import`;

    const upload = async (choices = choice) => {
        if (!file) return;
        setBusy(true);
        try {
            const keep = Object.entries(choices).filter(([, c]) => c === 'keep').map(([r]) => r);
            const data = await postFile(base, file, { keep_receipts: JSON.stringify(keep) });
            setResult(data);
            toast.success(`Import started: ${data?.rows ?? 0} rows`);
            // The import runs in the background; refresh the sales tab shortly after
            setTimeout(() => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }), 8000);
        } catch (err: any) {
            toast.error(err?.message || 'Import failed');
        } finally {
            setBusy(false);
        }
    };

    // Same order as the app: check for receipts the merchant already has, ask, then import
    const checkFile = async () => {
        if (!file) return;
        setBusy(true);
        try {
            const data: CheckResult = await postFile(`${base}/check`, file);
            const choices: Record<string, 'overwrite' | 'keep'> = {};
            data.conflicts.forEach(c => { choices[c.receipt_number] = c.defaultAction; });
            setChoice(choices);
            if (data.conflicts.length === 0) {
                setBusy(false);
                await upload(choices);
                return;
            }
            setCheck(data);
        } catch (err: any) {
            toast.error(err?.message || 'Could not read the file');
        } finally {
            setBusy(false);
        }
    };

    const footer = result ? (
        <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Done</button>
    ) : (
        <>
            <button onClick={check ? () => setCheck(null) : onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>
                {check ? 'Back' : 'Cancel'}
            </button>
            <button onClick={() => (check ? upload() : checkFile())} disabled={!file || busy}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: file ? 'pointer' : 'not-allowed', opacity: file ? 1 : 0.5 }}>
                {busy ? (check ? 'Importing...' : 'Checking...') : check ? 'Import with these choices' : 'Import'}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Import Sales${businessName ? ` · ${businessName}` : ''}`} footer={footer}>
            {result ? (
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <b>{result.rows.toLocaleString()} rows</b> are being imported in the background, the same way as an import from the HelferAI app.
                    {result.uploadedAs && <> When it finishes, a summary with any problem rows is emailed to <b>{result.uploadedAs}</b>.</>}
                </div>
            ) : check ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                            The file has <b>{check.totalRecords.toLocaleString()} rows</b>. These receipt numbers already exist with a different amount:
                        </div>
                        <button style={{ ...choiceBtn(false), fontSize: 11, whiteSpace: 'nowrap' }}
                            onClick={() => setChoice(Object.fromEntries(check.conflicts.map(c => [c.receipt_number, 'keep'])))}>
                            Keep all existing
                        </button>
                    </div>
                    {check.conflicts.map(c => (
                        <div key={c.receipt_number} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', fontFamily: 'monospace' }}>{c.receipt_number}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                Now: <b>{fullNaira(c.current.amount)}</b> for {c.current.customer} · In file: <b>{fullNaira(c.uploaded.amount)}</b>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button style={choiceBtn(choice[c.receipt_number] === 'overwrite')} onClick={() => setChoice(p => ({ ...p, [c.receipt_number]: 'overwrite' }))}>Overwrite with file</button>
                                <button style={choiceBtn(choice[c.receipt_number] === 'keep')} onClick={() => setChoice(p => ({ ...p, [c.receipt_number]: 'keep' }))}>Keep existing</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                        Upload an Excel (.xlsx, .xls) or CSV file in the same format as the HelferAI app&apos;s sales import.
                        Rows with the same receipt number become one sale. Receipt numbers the merchant already has are checked first, just like in the app.
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
                        Sales are recorded on this merchant&apos;s account and their stock is reduced, exactly like an import in the app.
                    </div>
                </div>
            )}
        </Modal>
    );
}
