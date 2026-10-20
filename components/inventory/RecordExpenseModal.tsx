'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { inventoryApi } from '@/api/inventory/inventory.api';

const API_BASE = process.env.NEXT_PUBLIC_INVENTORY_API_URL || 'http://localhost:3000/api';

const inputStyle: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

const pad = (n: number) => String(n).padStart(2, '0');
const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toNumber = (v: string) => Number(String(v).replace(/[^0-9.]/g, '')) || 0;
const withCommas = (v: string) => {
    const [whole, dec] = v.replace(/[^0-9.]/g, '').split('.');
    const w = whole ? Number(whole).toLocaleString() : '';
    return dec !== undefined ? `${w}.${dec.slice(0, 2)}` : w;
};
// Same shape as the app's expense references: EX + yyMMddHHmmss + 4 random digits
const newReference = () => {
    const d = new Date();
    return `EX${String(d.getFullYear()).slice(-2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${Math.floor(1000 + Math.random() * 9000)}`;
};

// Pass `expense` (a row from the Expenses tab) to edit it instead of recording a new one
export default function RecordExpenseModal({ isOpen, onClose, businessId, businessName, expense }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string; expense?: any;
}) {
    const queryClient = useQueryClient();
    const { data: opts } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'expense-options'],
        queryFn: () => inventoryApi.getBusinessExpenseOptions(businessId),
        enabled: isOpen && !!businessId,
    });

    const [purposeId, setPurposeId] = React.useState('');
    const [date, setDate] = React.useState(toYMD(new Date()));
    const [employeeId, setEmployeeId] = React.useState('');
    const [supervisorId, setSupervisorId] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [accountId, setAccountId] = React.useState('');
    const [reference, setReference] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [receipt, setReceipt] = React.useState<File | null>(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        if (expense) {
            setPurposeId(expense.purposeId || ''); setDate(expense.date ? new Date(expense.date).toISOString().slice(0, 10) : toYMD(new Date()));
            setAmount(withCommas(String(expense.amount ?? ''))); setAccountId(expense.accountId || '');
            setReference(expense.referenceNumber || ''); setDescription(expense.description || ''); setReceipt(null);
            return;
        }
        setPurposeId(''); setDate(toYMD(new Date())); setEmployeeId(''); setSupervisorId('');
        setAmount(''); setAccountId(''); setReference(newReference()); setDescription(''); setReceipt(null);
    }, [isOpen, expense]);

    // The expense stores logins, the form picks staff: match them up once staff load
    React.useEffect(() => {
        if (!isOpen || !expense || !opts?.people) return;
        const byUser = (uid?: string | null) => opts.people.find(p => uid && p.userId === uid)?.id || '';
        setEmployeeId(byUser(expense.employeeUserId));
        setSupervisorId(byUser(expense.approvedByUserId));
    }, [isOpen, expense, opts]);

    const valid = !!purposeId && !!date && !!employeeId && !!supervisorId && toNumber(amount) > 0 && !!accountId && reference.trim().length > 0;

    const save = async () => {
        if (!valid) return;
        setSaving(true);
        try {
            // Sent as a form so the receipt image can go with it, like in the app
            const form = new FormData();
            form.append('purpose_id', purposeId);
            form.append('employee_id', employeeId);
            form.append('supervisor_id', supervisorId);
            form.append('date', date);
            form.append('amount', String(toNumber(amount)));
            form.append('currency', 'NGN');
            form.append('account_id', accountId);
            form.append('reference_number', reference.trim());
            if (description.trim()) form.append('description', description.trim());
            if (receipt) form.append('receipt', receipt);
            const token = localStorage.getItem('inventoryToken');
            const res = await fetch(`${API_BASE}/admin/api/inventory/businesses/${businessId}/expenses${expense ? `/${expense.id}` : ''}`, {
                method: expense ? 'PATCH' : 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: form,
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.message || 'Could not record the expense');
            toast.success(`Expense ${reference.trim()} ${expense ? 'updated' : 'recorded'}`);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Could not record the expense');
        } finally {
            setSaving(false);
        }
    };

    const people = opts?.people || [];
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${expense ? 'Edit' : 'Record'} Expense${businessName ? ` · ${businessName}` : ''}`}
            maxWidth={620}
            footer={
                <>
                    <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={save} disabled={!valid || saving}
                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                        {saving ? 'Saving...' : expense ? 'Save changes' : 'Record Expense'}
                    </button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Purpose of expense *</label>
                        <select value={purposeId} onChange={e => setPurposeId(e.target.value)} style={inputStyle}>
                            <option value="">Select a purpose</option>
                            {(opts?.purposes || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Employee name *</label>
                        <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} style={inputStyle}>
                            <option value="">Select a staff member</option>
                            {people.map(p => <option key={p.id} value={p.id} disabled={!p.hasLogin}>{p.name}{p.hasLogin ? '' : ' (no app login)'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Supervisor *</label>
                        <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} style={inputStyle}>
                            <option value="">Select a staff member</option>
                            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Amount (₦) *</label>
                        <input inputMode="decimal" value={amount} onChange={e => setAmount(withCommas(e.target.value))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Account *</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle}>
                            <option value="">Select an account</option>
                            {(opts?.accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Reference number *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. EX2610192040506458" style={{ ...inputStyle, fontFamily: 'monospace' }} />
                        <button type="button" onClick={() => setReference(newReference())}
                            style={{ padding: '0 12px', borderRadius: 10, border: '1px solid #c7ddb8', background: '#fff', color: '#3f7d2c', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Auto-generate
                        </button>
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this for?" rows={3}
                        style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div>
                    <label style={labelStyle}>Receipt</label>
                    <label style={{ display: 'block', border: '2px dashed #d1d5db', borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                            onChange={e => {
                                const f = e.target.files?.[0] || null;
                                if (f && f.size > 10 * 1024 * 1024) { toast.error('Receipt size should not exceed 10MB'); return; }
                                setReceipt(f);
                            }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{receipt ? receipt.name : expense?.receiptUrl ? 'Replace the attached receipt (optional)' : 'Attach a receipt (optional)'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Image or PDF, up to 10 MB</div>
                    </label>
                </div>
                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                    {expense ? 'Saved exactly like an edit in the HelferAI app.' : 'Recorded exactly like an expense in the HelferAI app, filed under the employee you pick.'}
                </div>
            </div>
        </Modal>
    );
}
