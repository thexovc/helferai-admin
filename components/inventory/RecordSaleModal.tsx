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
const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const toNumber = (v: string) => Number(String(v).replace(/[^0-9.]/g, '')) || 0;

type Line = { productId: string; name: string; stock: number; costPrice: number; quantity: string; price: string };

export default function RecordSaleModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const [customerSearch, setCustomerSearch] = React.useState('');
    const [productSearch, setProductSearch] = React.useState('');
    const [customer, setCustomer] = React.useState<{ id: string; name: string } | null>(null);
    const [lines, setLines] = React.useState<Line[]>([]);
    const [paymentStatus, setPaymentStatus] = React.useState<'paid' | 'pending' | 'outstanding'>('paid');
    const [amountPaid, setAmountPaid] = React.useState('');
    const [paymentMethodId, setPaymentMethodId] = React.useState('');
    const [salespersonId, setSalespersonId] = React.useState('');
    const [receiptDate, setReceiptDate] = React.useState(toYMD(new Date()));
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) return;
        setCustomerSearch(''); setProductSearch(''); setCustomer(null); setLines([]);
        setPaymentStatus('paid'); setAmountPaid(''); setPaymentMethodId(''); setSalespersonId('');
        setReceiptDate(toYMD(new Date()));
    }, [isOpen]);

    const dCustomer = useDebouncedValue(customerSearch);
    const dProduct = useDebouncedValue(productSearch);
    const optionsQuery = (search: string, part: string) => ({
        queryKey: [...inventoryKeys.business(businessId), 'sale-options', part, search],
        queryFn: () => inventoryApi.getBusinessSaleOptions(businessId, search),
        enabled: isOpen && !!businessId,
    });
    const { data: customerOpts } = useQuery(optionsQuery(dCustomer, 'customers'));
    const { data: productOpts } = useQuery(optionsQuery(dProduct, 'products'));

    const total = lines.reduce((sum, l) => sum + toNumber(l.quantity) * toNumber(l.price), 0);
    const paidNow = paymentStatus === 'paid' ? total : paymentStatus === 'pending' ? 0 : Math.min(total, toNumber(amountPaid));
    const valid = !!customer && lines.length > 0 && lines.every(l => toNumber(l.quantity) > 0 && toNumber(l.quantity) <= l.stock) && !!receiptDate
        && (paymentStatus !== 'outstanding' || (toNumber(amountPaid) > 0 && toNumber(amountPaid) < total));

    const addProduct = (p: { id: string; name: string; sellingPrice: number; costPrice: number; stock: number }) => {
        if (lines.some(l => l.productId === p.id)) return;
        setLines(prev => [...prev, { productId: p.id, name: p.name, stock: p.stock, costPrice: p.costPrice, quantity: '1', price: String(p.sellingPrice) }]);
        setProductSearch('');
    };
    const updateLine = (i: number, patch: Partial<Line>) => setLines(prev => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

    const save = async () => {
        if (!valid || !customer) return;
        setSaving(true);
        try {
            const sale = await inventoryApi.createBusinessSale(businessId, {
                customer_id: Number(customer.id),
                payment_status: paymentStatus,
                receipt_date: receiptDate,
                payment_method_id: paymentMethodId ? Number(paymentMethodId) : undefined,
                sales_person_id: salespersonId ? Number(salespersonId) : undefined,
                outstanding_balance: paymentStatus === 'outstanding' ? Math.max(0, total - toNumber(amountPaid)) : undefined,
                products: lines.map(l => {
                    const qty = toNumber(l.quantity);
                    const price = toNumber(l.price);
                    return {
                        product_id: Number(l.productId),
                        quantity: qty,
                        selling_price: price,
                        price_currency: 'NGN',
                        total: qty * price,
                        total_currency: 'NGN',
                        cost_price: l.costPrice,
                    };
                }),
            });
            toast.success(`Sale ${sale?.receiptNumber || sale?.receipt_number || ''} recorded`);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Could not record the sale');
        } finally {
            setSaving(false);
        }
    };

    const listBox: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, marginTop: 6, maxHeight: 160, overflowY: 'auto', background: '#fff' };
    const listItem: React.CSSProperties = { padding: '8px 12px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', gap: 8 };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Record Sale${businessName ? ` · ${businessName}` : ''}`}
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
                {/* Customer */}
                <div>
                    <label style={labelStyle}>Customer *</label>
                    {customer ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: '#eaf4e3' }}>
                            <b style={{ fontSize: 14 }}>{customer.name}</b>
                            <button onClick={() => setCustomer(null)} style={{ border: 'none', background: 'none', color: '#3f7d2c', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Change</button>
                        </div>
                    ) : (
                        <>
                            <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="Search the merchant's customers by name or phone" style={inputStyle} />
                            <div style={listBox}>
                                {(customerOpts?.customers || []).length === 0 && <div style={{ ...listItem, color: '#9ca3af', cursor: 'default' }}>No customers found. Add them in the app first.</div>}
                                {(customerOpts?.customers || []).map(c => (
                                    <div key={c.id} style={listItem} onClick={() => setCustomer({ id: c.id, name: c.name })}>
                                        <span>{c.name}</span><span style={{ color: '#9ca3af' }}>{c.phone || ''}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Products */}
                <div>
                    <label style={labelStyle}>Products *</label>
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products by name or SKU, then click to add" style={inputStyle} />
                    {productSearch && (
                        <div style={listBox}>
                            {(productOpts?.products || []).length === 0 && <div style={{ ...listItem, color: '#9ca3af', cursor: 'default' }}>No products found</div>}
                            {(productOpts?.products || []).map(p => (
                                <div key={p.id} style={{ ...listItem, opacity: p.stock > 0 ? 1 : 0.5 }} onClick={() => addProduct(p)}>
                                    <span>{p.name} <span style={{ color: '#9ca3af', fontSize: 11 }}>{p.sku}</span></span>
                                    <span style={{ whiteSpace: 'nowrap' }}>{fullNaira(p.sellingPrice)} · {p.stock} in stock</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {lines.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 13 }}>
                            <thead><tr>{['Product', 'Qty', 'Unit price (₦)', 'Line total', ''].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#6b7280', padding: '6px 4px' }}>{h}</th>)}</tr></thead>
                            <tbody>
                                {lines.map((l, i) => {
                                    const over = toNumber(l.quantity) > l.stock;
                                    return (
                                        <tr key={l.productId} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '6px 4px' }}>{l.name}{over && <div style={{ color: '#dc2626', fontSize: 11 }}>Only {l.stock} in stock</div>}</td>
                                            <td style={{ padding: '6px 4px', width: 70 }}><input value={l.quantity} onChange={e => updateLine(i, { quantity: e.target.value.replace(/[^0-9]/g, '') })} style={{ ...inputStyle, height: 32 }} /></td>
                                            <td style={{ padding: '6px 4px', width: 130 }}><input value={l.price} onChange={e => updateLine(i, { price: e.target.value.replace(/[^0-9.]/g, '') })} style={{ ...inputStyle, height: 32 }} /></td>
                                            <td style={{ padding: '6px 4px', fontWeight: 700, whiteSpace: 'nowrap' }}>{fullNaira(toNumber(l.quantity) * toNumber(l.price))}</td>
                                            <td style={{ padding: '6px 4px' }}><button onClick={() => setLines(prev => prev.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Payment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Payment</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)} style={inputStyle}>
                            <option value="paid">Paid in full</option>
                            <option value="outstanding">Part paid</option>
                            <option value="pending">Not paid yet</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Amount paid (₦)</label>
                        <input value={paymentStatus === 'outstanding' ? amountPaid : String(paidNow)} disabled={paymentStatus !== 'outstanding'}
                            onChange={e => setAmountPaid(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" style={inputStyle} />
                    </div>
                </div>
                {paymentStatus === 'outstanding' && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: -8 }}>Balance owed: <b>{fullNaira(Math.max(0, total - toNumber(amountPaid)))}</b></div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Payment method</label>
                        <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(customerOpts?.paymentMethods || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Sold by</label>
                        <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)} style={inputStyle}>
                            <option value="">Not set</option>
                            {(customerOpts?.salespeople || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Date</label>
                        <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} style={inputStyle} />
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                    Recorded exactly like a sale in the HelferAI app: stock is taken off and a receipt number is created.
                </div>
            </div>
        </Modal>
    );
}
