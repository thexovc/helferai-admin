'use client';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Eye, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../Modal';
import Pagination from '../Pagination';
import { TableSkeleton } from '../Skeleton';
import { inventoryClient } from '@/api/api-client';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';
import { fullNaira } from './formatNumbers';

// The Brands, Categories and Customers & Suppliers tabs on a merchant's page
export type ListKind = 'brands' | 'categories' | 'customers' | 'suppliers' | 'contacts';

const inputStyle: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const thStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5' };
const showDate = (v?: string | null) => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const none = <span style={{ color: '#9ca3af' }}>—</span>;

const CONFIG: Record<ListKind, { single: string; columns: string[]; cells: (r: any) => React.ReactNode[]; details: (r: any) => [string, React.ReactNode][] }> = {
    brands: {
        single: 'brand',
        columns: ['Name', 'Products', 'Added'],
        cells: r => [<b key="n">{r.name}</b>, Number(r.products).toLocaleString(), showDate(r.createdAt)],
        details: r => [['Name', r.name], ['Products', Number(r.products).toLocaleString()], ['Added', showDate(r.createdAt)]],
    },
    categories: {
        single: 'category',
        columns: ['Name', 'Products', 'Added'],
        cells: r => [<b key="n">{r.name}</b>, Number(r.products).toLocaleString(), showDate(r.createdAt)],
        details: r => [['Name', r.name], ['Products', Number(r.products).toLocaleString()], ['Added', showDate(r.createdAt)]],
    },
    customers: {
        single: 'customer',
        columns: ['Name', 'Phone', 'Email', 'Type', 'Sales', 'Total bought', 'Owing', 'Added'],
        cells: r => [
            <div key="n"><b>{r.name}</b>{r.companyName && <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.companyName}</div>}</div>,
            r.phone || none, r.email || none, r.type === 'business' ? 'Business' : 'Individual',
            Number(r.sales).toLocaleString(), <span key="t" style={{ whiteSpace: 'nowrap' }}>{fullNaira(r.totalSpent)}</span>,
            r.owing > 0 ? <span key="o" style={{ color: '#dc2626', fontWeight: 700, whiteSpace: 'nowrap' }}>{fullNaira(r.owing)}</span> : none,
            showDate(r.createdAt),
        ],
        details: r => [['Name', r.name], ['Type', r.type === 'business' ? 'Business' : 'Individual'], ['Company', r.companyName || '—'], ['Display name', r.displayName || '—'], ['Phone', r.phone || '—'], ['Email', r.email || '—'], ['Address', r.address || '—'], ['Sales', Number(r.sales).toLocaleString()], ['Total bought', fullNaira(r.totalSpent)], ['Owing', fullNaira(r.owing)], ['Added', showDate(r.createdAt)]],
    },
    contacts: {
        single: 'contact',
        columns: ['Full name', 'Display name', 'Email address', 'Contact number', 'Relationship', 'Sales', 'Products'],
        cells: r => [
            <div key="n"><b>{r.name}</b>{r.companyName && <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.companyName}</div>}</div>,
            r.displayName || none, r.email || none, r.phone || none,
            <span key="r" style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: r.relationship === 'customer' ? '#eaf4e3' : '#eef2ff', color: r.relationship === 'customer' ? '#3f7d2c' : '#4338ca' }}>{r.relationship === 'customer' ? 'Customer' : 'Supplier'}</span>,
            r.sales === null ? none : Number(r.sales).toLocaleString(),
            r.products === null ? none : Number(r.products).toLocaleString(),
        ],
        details: r => r.relationship === 'customer'
            ? [['Relationship', 'Customer'], ['Full name', r.name], ['Display name', r.displayName || '—'], ['Type', r.type === 'business' ? 'Business' : 'Individual'], ['Company', r.companyName || '—'], ['Email address', r.email || '—'], ['Contact number', r.phone || '—'], ['Address', r.address || '—'], ['Sales', Number(r.sales).toLocaleString()], ['Added', showDate(r.createdAt)]]
            : [['Relationship', 'Supplier'], ['Full name', r.name], ['Contact number', r.phone || '—'], ['Supplier #', r.vendorNumber || '—'], ['Products', Number(r.products).toLocaleString()], ['Batches', Number(r.batches || 0).toLocaleString()], ['Added', showDate(r.createdAt)]],
    },
    suppliers: {
        single: 'supplier',
        columns: ['Name', 'Phone', 'Supplier #', 'Products', 'Batches', 'Added'],
        cells: r => [<b key="n">{r.name}</b>, r.phone || none, r.vendorNumber || none, Number(r.products).toLocaleString(), Number(r.batches).toLocaleString(), showDate(r.createdAt)],
        details: r => [['Name', r.name], ['Phone', r.phone || '—'], ['Supplier #', r.vendorNumber || '—'], ['Products', Number(r.products).toLocaleString()], ['Batches', Number(r.batches).toLocaleString()], ['Added', showDate(r.createdAt)]],
    },
};

function ItemForm({ kind, row, businessId, businessName, onClose }: { kind: ListKind; row?: any; businessId: string; businessName?: string; onClose: () => void }) {
    const queryClient = useQueryClient();
    const [f, setF] = React.useState<any>({
        name: row?.name || '', displayName: row?.displayName || '', phone: row?.phone || '', vendorNumber: row?.vendorNumber || '',
        type: row?.type || 'individual', companyName: row?.companyName || '', email: row?.email || '', address: row?.address || '',
    });
    // On the combined tab the row (or the admin, for a new one) says which list it belongs to
    const [relationship, setRelationship] = React.useState<'customer' | 'supplier'>(row?.relationship || 'customer');
    const combined = kind === 'contacts';
    if (combined) kind = relationship === 'customer' ? 'customers' : 'suppliers';
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p: any) => ({ ...p, [k]: e.target.value }));
    const [saving, setSaving] = React.useState(false);
    const single = CONFIG[kind].single;
    const shown = combined ? relationship : single;
    const valid = f.name.trim().length > 0 && (kind !== 'customers' || !f.email || /\S+@\S+\.\S+/.test(f.email));
    const save = async () => {
        setSaving(true);
        try {
            const url = `/admin/api/inventory/businesses/${businessId}/lists/${kind}${row ? `/${row.id}` : ''}`;
            await (row ? inventoryClient.patch(url, f) : inventoryClient.post(url, f));
            toast.success(`${f.name.trim()} ${row ? 'updated' : 'added'}`);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch (err: any) {
            toast.error(err?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };
    return (
        <Modal isOpen onClose={onClose} title={`${row ? 'Edit' : 'Add'} ${shown}${businessName && !row ? ` · ${businessName}` : ''}`}
            footer={<>
                <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={save} disabled={!valid || saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                    {saving ? 'Saving...' : row ? 'Save changes' : `Add ${shown}`}
                </button>
            </>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!row && combined && (
                    <div>
                        <label style={labelStyle}>Relationship</label>
                        <select value={relationship} onChange={e => setRelationship(e.target.value as any)} style={inputStyle}>
                            <option value="customer">Customer</option>
                            <option value="supplier">Supplier</option>
                        </select>
                    </div>
                )}
                <div><label style={labelStyle}>{kind === 'customers' || combined ? 'Full name' : 'Name'} *</label><input value={f.name} onChange={set('name')} style={inputStyle} /></div>
                {kind === 'suppliers' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={labelStyle}>Contact number</label><input value={f.phone} onChange={set('phone')} inputMode="tel" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Supplier #</label><input value={f.vendorNumber} onChange={set('vendorNumber')} style={inputStyle} /></div>
                    </div>
                )}
                {kind === 'customers' && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Type</label>
                                <select value={f.type} onChange={set('type')} style={inputStyle}>
                                    <option value="individual">Individual</option>
                                    <option value="business">Business</option>
                                </select>
                            </div>
                            <div><label style={labelStyle}>Company</label><input value={f.companyName} onChange={set('companyName')} style={inputStyle} /></div>
                        </div>
                        <div><label style={labelStyle}>Display name</label><input value={f.displayName} onChange={set('displayName')} placeholder="Shown on receipts; the full name if left blank" style={inputStyle} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={labelStyle}>Contact number</label><input value={f.phone} onChange={set('phone')} inputMode="tel" style={inputStyle} /></div>
                            <div><label style={labelStyle}>Email address</label><input value={f.email} onChange={set('email')} style={inputStyle} /></div>
                        </div>
                        <div><label style={labelStyle}>Address</label><textarea value={f.address} onChange={set('address')} rows={2} style={{ ...inputStyle, height: 'auto', padding: '10px 12px', fontFamily: 'inherit' }} /></div>
                    </>
                )}
            </div>
        </Modal>
    );
}

export default function MerchantListTab({ kind, businessId, businessName }: { kind: ListKind; businessId: string; businessName?: string }) {
    const queryClient = useQueryClient();
    const cfg = CONFIG[kind];
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');
    const debounced = useDebouncedValue(search);
    const [form, setForm] = React.useState<{ row?: any } | null>(null);
    const [viewing, setViewing] = React.useState<any>(null);
    const [relationship, setRelationship] = React.useState('all');
    const pageSize = 10;
    // Where a row's edits and deletes go: on the combined tab, its own list
    const rowKind = (r: any) => (kind === 'contacts' ? (r.relationship === 'customer' ? 'customers' : 'suppliers') : kind);

    React.useEffect(() => { setPage(1); setSearch(''); }, [kind]);
    React.useEffect(() => { setPage(1); }, [debounced, relationship]);

    const { data, isLoading } = useQuery({
        queryKey: [...inventoryKeys.business(businessId), 'list', kind, page, debounced, relationship],
        queryFn: () => inventoryClient.get<any>(`/admin/api/inventory/businesses/${businessId}/lists/${kind}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(debounced)}&relationship=${relationship}`),
    });
    const rows: any[] = data?.data || [];
    const total = data?.meta?.total || 0;

    const remove = async (r: any) => {
        const what = kind === 'contacts' ? r.relationship : cfg.single;
        if (!confirm(`Delete ${what} "${r.name}"? Anything still using it has to be moved first.`)) return;
        try {
            await inventoryClient.delete(`/admin/api/inventory/businesses/${businessId}/lists/${rowKind(r)}/${r.id}`);
            toast.success(`${r.name} deleted`);
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
        } catch (err: any) {
            toast.error(err?.message || 'Could not delete');
        }
    };

    const iconBtn = (bg: string, color: string): React.CSSProperties => ({ padding: 5, background: bg, border: 'none', borderRadius: 6, cursor: 'pointer', color, display: 'flex' });

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setForm({})}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#6c9e4e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <Plus size={14} /> Create New
                </button>
                <div style={{ position: 'relative', flex: '0 1 280px' }}>
                    <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 11 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={kind === 'contacts' ? 'Search name, phone or email' : `Search ${kind}`} style={{ ...inputStyle, height: 36, paddingLeft: 30 }} />
                </div>
                {kind === 'contacts' && (
                    <select value={relationship} onChange={e => setRelationship(e.target.value)} style={{ ...inputStyle, height: 36, width: 170 }}>
                        <option value="all">Customers &amp; suppliers</option>
                        <option value="customers">Customers only</option>
                        <option value="suppliers">Suppliers only</option>
                    </select>
                )}
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {kind === 'contacts'
                        ? `${Number(data?.meta?.customers || 0).toLocaleString()} customers · ${Number(data?.meta?.suppliers || 0).toLocaleString()} suppliers`
                        : `${total.toLocaleString()} ${total === 1 ? cfg.single : kind}`}
                </span>
            </div>
            {form && <ItemForm kind={kind} row={form.row} businessId={businessId} businessName={businessName} onClose={() => setForm(null)} />}
            {viewing && (
                <Modal isOpen onClose={() => setViewing(null)} title={`${(kind === 'contacts' ? viewing.relationship : cfg.single).replace(/^./, (c: string) => c.toUpperCase())} details`}
                    footer={<button onClick={() => setViewing(null)} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>}>
                    {cfg.details(viewing).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                            <span style={{ color: '#6b7280' }}>{k}</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                        </div>
                    ))}
                </Modal>
            )}
            {isLoading ? <TableSkeleton rows={5} cols={cfg.columns.length + 1} /> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: kind === 'customers' || kind === 'contacts' ? 1000 : undefined }}>
                        <thead><tr>{[...cfg.columns, 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr><td colSpan={cfg.columns.length + 1} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: 28 }}>
                                    {debounced ? `Nothing matches "${debounced}"` : `This merchant has no ${kind === 'contacts' ? 'customers or suppliers' : kind} yet`}
                                </td></tr>
                            )}
                            {rows.map((r, i) => (
                                <tr key={`${r.relationship || kind}-${r.id}`} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                                    {cfg.cells(r).map((c, j) => <td key={j} style={tdStyle}>{c}</td>)}
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button title="View" onClick={() => setViewing(r)} style={iconBtn('#f0f9f0', '#6c9e4e')}><Eye size={12} /></button>
                                            <button title="Edit" onClick={() => setForm({ row: r })} style={iconBtn('#f0f9ff', '#0284c7')}><Edit2 size={12} /></button>
                                            <button title="Delete" onClick={() => remove(r)} style={iconBtn('#fee2e2', '#dc2626')}><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div style={{ marginTop: 20 }}>
                <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize)} onPageChange={setPage} totalItems={total} pageSize={pageSize} />
            </div>
        </div>
    );
}
