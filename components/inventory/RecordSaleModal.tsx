'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Modal from '../Modal';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { inventoryApi } from '@/api/inventory/inventory.api';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import { fullNaira } from './formatNumbers';

const inputStyle: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const listBox: React.CSSProperties = { position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%', border: '1px solid #e5e7eb', borderRadius: 10, marginTop: 4, maxHeight: 220, overflowY: 'auto', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' };
const listItem: React.CSSProperties = { padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', gap: 8 };

const pad = (n: number) => String(n).padStart(2, '0');
const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toNumber = (v: string) => Number(String(v).replace(/[^0-9.]/g, '')) || 0;
// Same shape as the app's receipt numbers: SA + yyMMddHHmmss + 4 random digits
const newReceiptNumber = () => {
    const d = new Date();
    return `SA${String(d.getFullYear()).slice(-2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${Math.floor(1000 + Math.random() * 9000)}`;
};

type ProductOption = { id: string; name: string; sku: string; sellingPrice: number; costPrice: number; stock: number };
type Line = { key: number; product: ProductOption | null; quantity: string; price: string };

// Dropdown of the merchant's in-stock products, with a search box at the top
function ProductPicker({ businessId, value, onChange, takenIds }: {
    businessId: string; value: ProductOption | null; onChange: (p: ProductOption) => void; takenIds: string[];
}) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const debounced = useDebouncedValue(search);
    const ref = React.useRef<HTMLDivElement>(null);
    const { data, isFetching } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'sale-options', 'products', debounced],
        queryFn: () => inventoryApi.getBusinessSaleOptions(businessId, debounced),
        enabled: open,
    });

    React.useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [open]);

    const products = (data?.products || []).filter(p => !takenIds.includes(p.id) || p.id === value?.id);
    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)}
                style={{ ...inputStyle, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', color: value ? '#111827' : '#9ca3af' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value ? value.name : 'Choose a product'}</span>
                <span style={{ color: '#9ca3af', fontSize: 11 }}>▼</span>
            </button>
            {open && (
                <div style={{ ...listBox, position: 'static' }}>
                    <div style={{ padding: 8, borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: '#fff' }}>
                        <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Type to search name or SKU" style={{ ...inputStyle, height: 32 }} />
                    </div>
                    {products.length === 0 && <div style={{ ...listItem, color: '#9ca3af', cursor: 'default' }}>{isFetching ? 'Loading...' : 'No products in stock'}</div>}
                    {products.map(p => (
                        <div key={p.id} style={listItem} onClick={() => { onChange(p); setOpen(false); setSearch(''); }}>
                            <span>{p.name} <span style={{ color: '#9ca3af', fontSize: 11 }}>{p.sku}</span></span>
                            <span style={{ whiteSpace: 'nowrap', color: '#374151' }}>{fullNaira(p.sellingPrice)} · <b>{p.stock.toLocaleString()} in stock</b></span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RecordSaleModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const nextKey = React.useRef(1);
    const blankLine = (): Line => ({ key: nextKey.current++, product: null, quantity: '1', price: '' });

    const [receiptNumber, setReceiptNumber] = React.useState('');
    const [customerSearch, setCustomerSearch] = React.useState('');
    const [customer, setCustomer] = React.useState<{ id: string; name: string } | null>(null);
    const [lines, setLines] = React.useState<Line[]>([]);
    const [discount, setDiscount] = React.useState('');
    const [discountType, setDiscountType] = React.useState<'percentage' | 'fixed'>('percentage');
    const [tax, setTax] = React.useState('');
    const [taxType, setTaxType] = React.useState<'percentage' | 'fixed'>('percentage');
    const [paymentMethodId, setPaymentMethodId] = React.useState('');
    const [paymentStatus, setPaymentStatus] = React.useState<'paid' | 'outstanding' | 'pending'>('paid');
    const [amountPaid, setAmountPaid] = React.useState('');
    const [salespersonId, setSalespersonId] = React.useState('');
    const [receiptDate, setReceiptDate] = React.useState(toYMD(new Date()));
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        setReceiptNumber(newReceiptNumber()); setCustomerSearch(''); setCustomer(null); setLines([blankLine()]);
        setDiscount(''); setDiscountType('percentage'); setTax(''); setTaxType('percentage');
        setPaymentMethodId(''); setPaymentStatus('paid'); setAmountPaid(''); setSalespersonId('');
        setReceiptDate(toYMD(new Date()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const dCustomer = useDebouncedValue(customerSearch);
    const { data: opts } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'sale-options', 'customers', dCustomer],
        queryFn: () => inventoryApi.getBusinessSaleOptions(businessId, dCustomer),
        enabled: isOpen && !!businessId,
    });

    // Same order as the app: subtotal, less discount, plus tax on what's left
    const filled = lines.filter(l => l.product);
    const subtotal = filled.reduce((sum, l) => sum + toNumber(l.quantity) * toNumber(l.price), 0);
    const discountAmount = discountType === 'fixed' ? toNumber(discount) : (subtotal * toNumber(discount)) / 100;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxType === 'fixed' ? toNumber(tax) : (afterDiscount * toNumber(tax)) / 100;
    const total = afterDiscount + taxAmount;
    const balance = paymentStatus === 'paid' ? 0 : paymentStatus === 'pending' ? total : Math.max(0, total - toNumber(amountPaid));

    const valid = !!customer && filled.length > 0 && !!receiptDate
        && filled.every(l => toNumber(l.quantity) > 0 && toNumber(l.quantity) <= (l.product?.stock || 0))
        && (paymentStatus !== 'outstanding' || (toNumber(amountPaid) > 0 && toNumber(amountPaid) < total))
        && (discountType !== 'percentage' || toNumber(discount) <= 100);

    const updateLine = (key: number, patch: Partial<Line>) => setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)));

    const save = async () => {
        if (!valid || !customer) return;
        setSaving(true);
        try {
            const sale = await inventoryApi.createBusinessSale(businessId, {
                customer_id: Number(customer.id),
                receipt_number: receiptNumber.trim() || undefined,
                receipt_date: receiptDate,
                payment_status: paymentStatus,
                payment_method_id: paymentMethodId ? Number(paymentMethodId) : undefined,
                sales_person_id: salespersonId ? Number(salespersonId) : undefined,
                outstanding_balance: paymentStatus === 'paid' ? undefined : balance,
                discount_type: discountType,
                tax_type: taxType,
                // The app keeps the sale-wide discount and tax on each line
                products: filled.map(l => {
                    const qty = toNumber(l.quantity);
                    const price = toNumber(l.price);
                    return {
                        product_id: Number(l.product!.id),
                        quantity: qty,
                        selling_price: price,
                        price_currency: 'NGN',
                        discount: toNumber(discount),
                        discount_type: discountType,
                        tax_percentage: toNumber(tax),
                        tax_type: taxType,
                        total: qty * price,
                        total_currency: 'NGN',
                        cost_price: l.product!.costPrice,
                    };
                }),
            });
            toast.success(`Sale ${sale?.receiptNumber || sale?.receipt_number || receiptNumber} recorded`);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Could not record the sale');
        } finally {
            setSaving(false);
        }
    };

    const takenIds = filled.map(l => l.product!.id);
    const summaryRow = (label: string, value: string, bold = false) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 500, color: bold ? '#111827' : '#4b5563' }}>
            <span>{label}</span><span>{value}</span>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Record Sale${businessName ? ` · ${businessName}` : ''}`}
            maxWidth={760}
            footer={
                <>
                    <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={save} disabled={!valid || saving}
                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                        {saving ? 'Saving...' : `Record Sale · ${fullNaira(total)}`}
                    </button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                {/* Receipt */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Receipt number</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="e.g. SA2610201810304787" style={{ ...inputStyle, fontFamily: 'monospace' }} />
                            <button type="button" onClick={() => setReceiptNumber(newReceiptNumber())}
                                style={{ padding: '0 12px', borderRadius: 10, border: '1px solid #c7ddb8', background: '#fff', color: '#3f7d2c', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Auto-generate
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} style={inputStyle} />
                    </div>
                </div>

                {/* Customer */}
                <div>
                    <label style={labelStyle}>Customer *</label>
                    {customer ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: '#eaf4e3' }}>
                            <b style={{ fontSize: 14 }}>{customer.name}</b>
                            <button onClick={() => setCustomer(null)} style={{ border: 'none', background: 'none', color: '#3f7d2c', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Change</button>
                        </div>
                    ) : (
                        <div>
                            <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Search the merchant's customers by name or phone" style={inputStyle} />
                            <div style={{ ...listBox, position: 'static', maxHeight: 150, boxShadow: 'none' }}>
                                {(opts?.customers || []).length === 0 && <div style={{ ...listItem, color: '#9ca3af', cursor: 'default' }}>No customers found. Add them in the app first.</div>}
                                {(opts?.customers || []).map(c => (
                                    <div key={c.id} style={listItem} onClick={() => setCustomer({ id: c.id, name: c.name })}>
                                        <span>{c.name}</span><span style={{ color: '#9ca3af' }}>{c.phone || ''}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products */}
                <div>
                    <label style={labelStyle}>Products *</label>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead><tr>{['Product', 'Qty', 'Unit price (₦)', 'Total', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#6b7280', padding: '4px' }}>{h}</th>)}</tr></thead>
                        <tbody>
                            {lines.map(l => {
                                const over = !!l.product && toNumber(l.quantity) > l.product.stock;
                                return (
                                    <tr key={l.key}>
                                        <td style={{ padding: 4, minWidth: 320, verticalAlign: 'top' }}>
                                            <ProductPicker businessId={businessId} value={l.product} takenIds={takenIds}
                                                onChange={p => updateLine(l.key, { product: p, price: String(p.sellingPrice) })} />
                                            {l.product && <div style={{ fontSize: 11, color: over ? '#dc2626' : '#6b7280', marginTop: 2 }}>{l.product.stock.toLocaleString()} in stock{over ? ', not enough' : ''}</div>}
                                        </td>
                                        <td style={{ padding: 4, width: 80, verticalAlign: 'top' }}>
                                            <input value={l.quantity} inputMode="numeric" onChange={e => updateLine(l.key, { quantity: e.target.value.replace(/[^0-9]/g, '') })} style={{ ...inputStyle, height: 36 }} />
                                        </td>
                                        <td style={{ padding: 4, width: 130, verticalAlign: 'top' }}>
                                            <input value={l.price} inputMode="decimal" onChange={e => updateLine(l.key, { price: e.target.value.replace(/[^0-9.]/g, '') })} style={{ ...inputStyle, height: 36 }} />
                                        </td>
                                        <td style={{ padding: '12px 4px', fontWeight: 700, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{fullNaira(toNumber(l.quantity) * toNumber(l.price))}</td>
                                        <td style={{ padding: '10px 4px', verticalAlign: 'top' }}>
                                            {lines.length > 1 && <button onClick={() => setLines(prev => prev.filter(x => x.key !== l.key))} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <button type="button" onClick={() => setLines(prev => [...prev, blankLine()])}
                        style={{ marginTop: 6, border: 'none', background: 'none', color: '#3f7d2c', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 4 }}>
                        + Add another product
                    </button>
                </div>

                {/* Discount and tax */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Discount</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input value={discount} inputMode="decimal" onChange={e => setDiscount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" style={inputStyle} />
                            <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} style={{ ...inputStyle, width: 90 }}>
                                <option value="percentage">%</option>
                                <option value="fixed">₦</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Tax</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input value={tax} inputMode="decimal" onChange={e => setTax(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" style={inputStyle} />
                            <select value={taxType} onChange={e => setTaxType(e.target.value as any)} style={{ ...inputStyle, width: 90 }}>
                                <option value="percentage">%</option>
                                <option value="fixed">₦</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Payment method</label>
                        <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(opts?.paymentMethods || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Payment status *</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)} style={inputStyle}>
                            <option value="paid">Paid</option>
                            <option value="outstanding">Outstanding (part paid)</option>
                            <option value="pending">Pending (not paid)</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Amount paid (₦)</label>
                        <input value={paymentStatus === 'outstanding' ? amountPaid : String(paymentStatus === 'paid' ? total : 0)} disabled={paymentStatus !== 'outstanding'}
                            onChange={e => setAmountPaid(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Sold by</label>
                        <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(opts?.salespeople || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 10, background: '#f9fafb', border: '1px solid #f0f0f0' }}>
                    {summaryRow('Subtotal', fullNaira(subtotal))}
                    {summaryRow(`Discount${discountType === 'percentage' && discount ? ` (${toNumber(discount)}%)` : ''}`, `− ${fullNaira(discountAmount)}`)}
                    {summaryRow(`Tax${taxType === 'percentage' && tax ? ` (${toNumber(tax)}%)` : ''}`, `+ ${fullNaira(taxAmount)}`)}
                    {summaryRow('Total', fullNaira(total), true)}
                    {balance > 0 && summaryRow('Balance owed', fullNaira(balance))}
                </div>

                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                    Recorded exactly like a sale in the HelferAI app: stock is taken off the merchant&apos;s products.
                </div>
            </div>
        </Modal>
    );
}
