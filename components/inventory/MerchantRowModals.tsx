'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryClient } from '@/api/api-client';
import { inventoryKeys, useSubscriptionPlans } from '@/api/inventory/inventory.queries';
import { inventoryApi } from '@/api/inventory/inventory.api';
import { fullNaira } from './formatNumbers';

// View and Edit windows for the rows in a merchant's tabs (users, subscriptions,
// products, sales, WhatsApp numbers, integrations). Expenses use RecordExpenseModal.

const inputStyle: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const toNumber = (v: string) => Number(String(v).replace(/[^0-9.]/g, '')) || 0;
const toYMD = (v?: string | Date | null) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};
const showDate = (v?: string | Date | null) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const base = (businessId: string) => `/admin/api/inventory/businesses/${businessId}`;

export type RowKind = 'users' | 'subscriptions' | 'products' | 'sales' | 'expenses' | 'whatsapp' | 'integrations';

function Footer({ onClose, onSave, saving, valid, label }: { onClose: () => void; onSave: () => void; saving: boolean; valid: boolean; label: string }) {
    return (
        <>
            <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={onSave} disabled={!valid || saving}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                {saving ? 'Saving...' : label}
            </button>
        </>
    );
}

// Runs a save, shows the outcome and refreshes the merchant's tabs
function useSaver(onClose: () => void) {
    const queryClient = useQueryClient();
    const [saving, setSaving] = React.useState(false);
    const run = async (fn: () => Promise<any>, success: string) => {
        setSaving(true);
        try {
            await fn();
            toast.success(success);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };
    return { saving, run };
}

/* ---------------- View ---------------- */

const fieldsFor = (kind: RowKind, r: any): [string, React.ReactNode][] => {
    const money = (v: any) => fullNaira(Number(v || 0));
    switch (kind) {
        case 'users': return [['Name', r.name], ['Email', r.email], ['Role', r.role], ['Status', r.status], ['Joined', showDate(r.createdAt)]];
        case 'subscriptions': return [['Plan', r.plan], ['Amount', money(r.amount)], ['Status', r.status], ['Payment', r.paymentStatus], ['Starts', showDate(r.startsAt)], ['Ends', showDate(r.endsAt)], ['Created', showDate(r.createdAt)]];
        case 'products': return [['Name', r.name], ['SKU', r.sku], ['Category', r.category], ['Brand', r.brand], ['Vendor', r.vendor || '—'], ['Store', r.store || '—'], ['Cost price', money(r.costPrice)], ['Selling price', money(r.sellingPrice)], ['In stock', Number(r.openingStock || 0).toLocaleString()], ['Batches', r.batchesCount ?? 0], ['Unit', r.unit], ['Low-stock alert', r.lowStockAlert ?? '—'], ['Added', showDate(r.createdAt)]];
        case 'expenses': return [['Date', showDate(r.date)], ['Purpose', r.purpose], ['Amount', money(r.amount)], ['Account', r.account], ['Employee', r.employee || '—'], ['Approved by', r.approvedBy || '—'], ['Store', r.store || '—'], ['Reference', r.referenceNumber || '—'], ['Description', r.description || '—'], ['Receipt', r.receiptUrl ? <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3f7d2c', fontWeight: 700 }}>Open receipt</a> : '—'], ['Recorded', showDate(r.createdAt)]];
        case 'whatsapp': return [['Name', r.name], ['Number', r.phoneNumber], ['Status', r.status], ['Notes', r.notes || '—'], ['Connected', showDate(r.createdAt)]];
        case 'integrations': return [['Name', r.name], ['Status', r.status], ['Connected', showDate(r.connectedAt)], ['Type', r.slug || '—']];
        default: return [];
    }
};

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>{k}</span>
                    <span style={{ color: '#111827', fontWeight: 600, textAlign: 'right' }}>{v ?? '—'}</span>
                </div>
            ))}
        </div>
    );
}

function SaleDetails({ businessId, saleId }: { businessId: string; saleId: string }) {
    const { data: s, isLoading } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'sale', saleId],
        queryFn: () => inventoryClient.get<any>(`${base(businessId)}/sales/${saleId}`),
    });
    if (isLoading || !s) return <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading...</div>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Rows rows={[
                ['Receipt #', <span key="r" style={{ fontFamily: 'monospace' }}>{s.receiptNumber}</span>],
                ['Date', showDate(s.receiptDate)],
                ['Customer', [s.customer, s.customerPhone].filter(Boolean).join(' · ') || '—'],
                ['Sold by', s.salesperson || '—'],
                ['Store', s.store || '—'],
                ['Payment', `${s.paymentStatus}${s.paymentMethod ? ` · ${s.paymentMethod}` : ''}`],
                ['Processing', s.processingStatus],
            ]} />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr>{['Item', 'Qty', 'Price', 'Amount'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#6b7280', padding: '6px 4px', borderBottom: '1px solid #f0f0f0' }}>{h}</th>)}</tr></thead>
                <tbody>
                    {s.items.map((i: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8f8f8' }}>
                            <td style={{ padding: '6px 4px' }}>{i.name}{i.sku && <div style={{ fontSize: 11, color: '#9ca3af' }}>{i.sku}</div>}</td>
                            <td style={{ padding: '6px 4px' }}>{i.quantity}</td>
                            <td style={{ padding: '6px 4px', whiteSpace: 'nowrap' }}>{fullNaira(i.unitPrice)}</td>
                            <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', fontWeight: 700 }}>{fullNaira(i.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Rows rows={[
                ['Discount', fullNaira(s.totalDiscount)],
                ['Tax', fullNaira(s.totalTax)],
                ...(s.deliveryFee ? [['Delivery', fullNaira(s.deliveryFee)] as [string, React.ReactNode]] : []),
                ['Total', <b key="t">{fullNaira(s.totalAmount)}</b>],
                ['Paid', fullNaira(s.amountPaid)],
                ['Balance', s.amountDue > 0 ? <span key="b" style={{ color: '#dc2626' }}>{fullNaira(s.amountDue)}</span> : fullNaira(0)],
            ]} />
        </div>
    );
}

export function ViewRowModal({ kind, row, businessId, onClose }: { kind: RowKind; row: any; businessId: string; onClose: () => void }) {
    const titles: Record<RowKind, string> = { users: 'User', subscriptions: 'Subscription', products: 'Product', sales: 'Sale', expenses: 'Expense', whatsapp: 'WhatsApp Number', integrations: 'Integration' };
    return (
        <Modal isOpen onClose={onClose} title={`${titles[kind]} details`} maxWidth={kind === 'sales' ? 640 : 520}
            footer={<button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>}>
            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                {kind === 'sales' ? <SaleDetails businessId={businessId} saleId={row.id} /> : <Rows rows={fieldsFor(kind, row)} />}
            </div>
        </Modal>
    );
}

/* ---------------- Edit: user ---------------- */

export function EditUserModal({ row, businessId, onClose }: { row: any; businessId: string; onClose: () => void }) {
    const { data: roles } = useQuery({ queryKey: [...inventoryKeys.business(businessId), 'roles'], queryFn: () => inventoryApi.getBusinessRoles(businessId) });
    const [name, setName] = React.useState(row.name || '');
    const [email, setEmail] = React.useState(row.email || '');
    const [roleId, setRoleId] = React.useState(row.roleId || '');
    const [status, setStatus] = React.useState((row.status || 'active').toLowerCase());
    const [password, setPassword] = React.useState('');
    const { saving, run } = useSaver(onClose);
    const valid = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && (password === '' || password.length >= 6);
    const save = () => run(() => inventoryApi.updateBusinessUser(businessId, row.id, {
        name: name.trim(), email: email.trim(), status, ...(roleId ? { roleId } : {}), ...(password ? { password } : {}),
    }), `${name.trim()} updated`);
    return (
        <Modal isOpen onClose={onClose} title="Edit user" footer={<Footer onClose={onClose} onSave={save} saving={saving} valid={valid} label="Save changes" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelStyle}>Name</label><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Email</label><input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Role</label>
                        <select value={roleId} onChange={e => setRoleId(e.target.value)} style={inputStyle}>
                            {!roleId && <option value="">Keep current ({row.role})</option>}
                            {(roles || []).map((r: any) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive (can&apos;t log in)</option>
                        </select>
                    </div>
                </div>
                <div><label style={labelStyle}>New password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep the current one" style={inputStyle} /></div>
            </div>
        </Modal>
    );
}

/* ---------------- Edit: subscription ---------------- */

export function EditSubscriptionModal({ row, onClose }: { row: any; onClose: () => void }) {
    const { data: plans } = useSubscriptionPlans();
    const [planId, setPlanId] = React.useState(row.planId || '');
    const [startDate, setStartDate] = React.useState(toYMD(row.startsAt));
    const [endDate, setEndDate] = React.useState(toYMD(row.endsAt));
    const [status, setStatus] = React.useState(row.status === 'Active' ? 'active' : 'expired');
    const [paymentStatus, setPaymentStatus] = React.useState(row.paymentStatus || 'paid');
    const { saving, run } = useSaver(onClose);
    const valid = !!planId && !!startDate && !!endDate && startDate < endDate;
    const save = () => run(() => inventoryApi.updateSubscription(row.id, { planId, startDate, endDate, status, paymentStatus }), 'Subscription updated');
    return (
        <Modal isOpen onClose={onClose} title="Edit subscription" footer={<Footer onClose={onClose} onSave={save} saving={saving} valid={valid} label="Save changes" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                    <label style={labelStyle}>Plan</label>
                    <select value={planId} onChange={e => setPlanId(e.target.value)} style={inputStyle}>
                        {(plans || []).map((p: any) => <option key={p.id} value={String(p.id)}>{p.name} · {fullNaira(Number(p.price || 0))}</option>)}
                    </select>
                </div>
                <div style={grid2}>
                    <div><label style={labelStyle}>Start date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>End date</label><input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Payment</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} style={inputStyle}>
                            {/* Keep whatever the record already says, even if it's not one of the usual three */}
                            {Array.from(new Set(['paid', 'pending', 'failed', row.paymentStatus].filter(Boolean))).map(v => (
                                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

/* ---------------- Edit: product ---------------- */

export function EditProductModal({ row, businessId, onClose }: { row: any; businessId: string; onClose: () => void }) {
    const { data: options } = useQuery({ queryKey: [...inventoryKeys.business(businessId), 'product-options'], queryFn: () => inventoryApi.getBusinessProductOptions(businessId) });
    const [name, setName] = React.useState(row.name || '');
    const [price, setPrice] = React.useState(String(row.sellingPrice ?? ''));
    const [costPrice, setCostPrice] = React.useState(String(row.costPrice ?? ''));
    const [categoryId, setCategoryId] = React.useState(row.categoryId || '');
    const [brandId, setBrandId] = React.useState(row.brandId || '');
    const [unitId, setUnitId] = React.useState(row.unitId || '');
    const { saving, run } = useSaver(onClose);
    const valid = name.trim().length > 0 && toNumber(price) > 0;
    const save = () => run(() => inventoryApi.updateProduct(row.id, {
        name: name.trim(), price: toNumber(price), costPrice: toNumber(costPrice),
        categoryId: categoryId || undefined, brandId: brandId || undefined, unitId: unitId || undefined,
    }), `${name.trim()} updated`);
    return (
        <Modal isOpen onClose={onClose} title="Edit product" footer={<Footer onClose={onClose} onSave={save} saving={saving} valid={valid} label="Save changes" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelStyle}>Product name</label><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} /></div>
                <div style={grid2}>
                    <div><label style={labelStyle}>Selling price (₦)</label><input inputMode="decimal" value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Cost price (₦)</label><input inputMode="decimal" value={costPrice} onChange={e => setCostPrice(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} /></div>
                </div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={inputStyle}>
                            <option value="">No category</option>
                            {(options?.categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <div>
                    <label style={labelStyle}>Unit</label>
                    <select value={unitId} onChange={e => setUnitId(e.target.value)} style={inputStyle}>
                        <option value="">Pieces (default)</option>
                        {(options?.units || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                    Stock ({Number(row.openingStock || 0).toLocaleString()}) isn&apos;t edited here: it changes through sales, batches and stock adjustments, as in the app.
                </div>
            </div>
        </Modal>
    );
}

/* ---------------- Edit: sale ---------------- */

export function EditSaleModal({ row, businessId, onClose }: { row: any; businessId: string; onClose: () => void }) {
    const { data: opts } = useQuery({ queryKey: [...inventoryKeys.business(businessId), 'sale-options', 'customers', ''], queryFn: () => inventoryApi.getBusinessSaleOptions(businessId, '') });
    const { data: sale } = useQuery({ queryKey: [...inventoryKeys.business(businessId), 'sale', row.id], queryFn: () => inventoryClient.get<any>(`${base(businessId)}/sales/${row.id}`) });
    const [paymentStatus, setPaymentStatus] = React.useState(row.paymentStatus || 'paid');
    const [amountPaid, setAmountPaid] = React.useState(String(row.amountPaid || ''));
    const [paymentMethodId, setPaymentMethodId] = React.useState('');
    const [salespersonId, setSalespersonId] = React.useState('');
    const [processing, setProcessing] = React.useState(row.processingStatus || 'pending');
    const [date, setDate] = React.useState(toYMD(row.receiptDate || row.createdAt));
    React.useEffect(() => {
        if (!sale) return;
        setPaymentMethodId(sale.paymentMethodId || '');
        setSalespersonId(sale.salespersonId || '');
    }, [sale]);
    const total = Number(row.totalAmount || 0);
    const { saving, run } = useSaver(onClose);
    const valid = !!date && (paymentStatus !== 'outstanding' || (toNumber(amountPaid) > 0 && toNumber(amountPaid) < total));
    const save = () => run(() => inventoryClient.patch(`${base(businessId)}/sales/${row.id}`, {
        payment_status: paymentStatus,
        amount_paid: paymentStatus === 'outstanding' ? toNumber(amountPaid) : undefined,
        payment_method_id: paymentMethodId || null,
        sales_person_id: salespersonId || null,
        processing_status: processing,
        receipt_date: date,
    }), `Sale ${row.receiptNumber} updated`);
    return (
        <Modal isOpen onClose={onClose} title={`Edit sale ${row.receiptNumber}`} footer={<Footer onClose={onClose} onSave={save} saving={saving} valid={valid} label="Save changes" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13, color: '#374151' }}>Total <b>{fullNaira(total)}</b>{row.customer ? <> for <b>{row.customer}</b></> : null}</div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Payment status</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} style={inputStyle}>
                            <option value="paid">Paid</option>
                            <option value="outstanding">Outstanding (part paid)</option>
                            <option value="pending">Pending (not paid)</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Amount paid (₦)</label>
                        <input value={paymentStatus === 'outstanding' ? amountPaid : String(paymentStatus === 'paid' ? total : 0)} disabled={paymentStatus !== 'outstanding'}
                            onChange={e => setAmountPaid(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                    </div>
                </div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Payment method</label>
                        <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(opts?.paymentMethods || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Sold by</label>
                        <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(opts?.salespeople || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={grid2}>
                    <div>
                        <label style={labelStyle}>Processing</label>
                        <select value={processing} onChange={e => setProcessing(e.target.value)} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div><label style={labelStyle}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                    Items and prices stay as recorded, so stock isn&apos;t touched. To change items, delete the sale (stock goes back) and record it again.
                </div>
            </div>
        </Modal>
    );
}

/* ---------------- Create / edit: WhatsApp number ---------------- */

export function WhatsAppNumberModal({ row, businessId, businessName, onClose }: { row?: any; businessId: string; businessName?: string; onClose: () => void }) {
    const [name, setName] = React.useState(row?.name || businessName || '');
    const [phone, setPhone] = React.useState(row?.phoneNumber || '');
    const [status, setStatus] = React.useState((row?.status || 'active').toLowerCase());
    const { saving, run } = useSaver(onClose);
    const valid = name.trim().length > 0 && phone.replace(/\D/g, '').length >= 7;
    const save = () => run(
        () => row
            ? inventoryApi.updateWhatsappNumber(row.id, { name: name.trim(), phoneNumber: phone.trim(), status } as any)
            : inventoryApi.createWhatsappNumber({ businessId, name: name.trim(), phoneNumber: phone.trim(), status } as any),
        row ? 'WhatsApp number updated' : 'WhatsApp number added',
    );
    return (
        <Modal isOpen onClose={onClose} title={`${row ? 'Edit' : 'Add'} WhatsApp number${businessName ? ` · ${businessName}` : ''}`}
            footer={<Footer onClose={onClose} onSave={save} saving={saving} valid={valid} label={row ? 'Save changes' : 'Add number'} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelStyle}>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sales line" style={inputStyle} /></div>
                <div><label style={labelStyle}>WhatsApp number</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 2348012345678" inputMode="tel" style={inputStyle} /></div>
                <div>
                    <label style={labelStyle}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
                    Use the full number with country code, the way the merchant would add it in the app.
                </div>
            </div>
        </Modal>
    );
}

/* ---------------- Delete ---------------- */

// What the trash button does on each tab, and the question asked first
export const deleteActionFor = (kind: RowKind, row: any, businessId: string): { question: string; run: () => Promise<any>; done: string } | null => {
    switch (kind) {
        case 'users':
            // Business users aren't deleted (their sales and expenses point to them), only switched off
            return { question: `Deactivate ${row.name}? They won't be able to log in. You can switch them back on with Edit.`, run: () => inventoryApi.updateBusinessUser(businessId, row.id, { status: 'inactive' }), done: `${row.name} deactivated` };
        case 'subscriptions':
            return { question: `Delete the ${row.plan} subscription record? This can't be undone.`, run: () => inventoryApi.deleteSubscription(row.id), done: 'Subscription deleted' };
        case 'products':
            return { question: `Delete ${row.name}? Like in the app, products that have sales can't be deleted.`, run: () => inventoryClient.delete(`${base(businessId)}/products/${row.id}`), done: `${row.name} deleted` };
        case 'sales':
            return { question: `Delete sale ${row.receiptNumber} (${fullNaira(Number(row.totalAmount || 0))})? The items go back into stock, as in the app.`, run: () => inventoryClient.delete(`${base(businessId)}/sales/${row.id}`), done: `Sale ${row.receiptNumber} deleted` };
        case 'expenses':
            return { question: `Delete the ${fullNaira(Number(row.amount || 0))} ${row.purpose} expense${row.referenceNumber ? ` (${row.referenceNumber})` : ''}?`, run: () => inventoryClient.delete(`${base(businessId)}/expenses/${row.id}`), done: 'Expense deleted' };
        case 'whatsapp':
            return { question: `Remove WhatsApp number ${row.phoneNumber}?`, run: () => inventoryApi.deleteWhatsappNumber(row.id), done: 'WhatsApp number removed' };
        default:
            return null;
    }
};
