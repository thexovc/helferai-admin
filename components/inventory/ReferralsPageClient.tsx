'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, UserPlus } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import Pagination from '../Pagination';
import MerchantLogo from './MerchantLogo';
import ToggleValue from './ToggleValue';
import { compactCount, fullCount } from './formatNumbers';
import { inventoryClient } from '@/api/api-client';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

const BASE = '/admin/api/inventory/referrals/merchants';
const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const day = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const qs = (o: Record<string, any>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
const codeChip = (code?: string | null) => code
    ? <span style={{ fontFamily: 'monospace', padding: '3px 8px', background: '#f3f4f6', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{code}</span>
    : <span style={{ color: '#9ca3af', fontSize: 12 }}>No code yet</span>;

// Who a merchant referred, with when each business joined
function ReferredModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'referral-merchants', businessId],
        queryFn: () => inventoryClient.get<any>(`${BASE}/${businessId}`),
    });
    const m = data?.merchant;
    return (
        <Modal isOpen onClose={onClose} title={m ? `${m.name} · referrals` : 'Referrals'} maxWidth={900}
            footer={<button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>}>
            {isLoading || !data ? <div style={{ color: '#9ca3af', fontSize: 13, padding: 20 }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <MerchantLogo name={m.name} logo={m.logo} size={44} radius={12} />
                        <div style={{ flex: 1 }}>
                            <Link href={`/inventory/businesses/${m.businessId}`} style={{ fontWeight: 800, color: '#1a1a2e', textDecoration: 'none' }}>{m.name}</Link>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Referral code</div>
                            {codeChip(m.referralCode)}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                        {[
                            ['Merchants referred', fullCount(data.summary.referred)],
                            ['Signup bonus paid', fullCount(data.summary.rewarded)],
                            ['Points from referrals', fullCount(data.summary.pointsFromReferrals)],
                        ].map(([k, v]) => (
                            <div key={k} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{v}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{k}</div>
                            </div>
                        ))}
                    </div>
                    {data.summary.byRule.length > 0 && (
                        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
                            Points came from: {data.summary.byRule.map((r: any) => `${r.label} (${fullCount(r.points)})`).join(' · ')}
                        </div>
                    )}
                    <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 10 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                            <thead><tr>{['Business referred', 'Date joined', 'Plan now', 'Sales', 'Products', 'Signup bonus'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {data.data.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 24 }}>This merchant hasn&apos;t referred anyone yet</td></tr>}
                                {data.data.map((r: any) => (
                                    <tr key={r.id}>
                                        <td style={td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <MerchantLogo name={r.businessName || r.ownerName} logo={r.logo} size={28} radius={7} />
                                                <span>
                                                    {r.businessId
                                                        ? <Link href={`/inventory/businesses/${r.businessId}`} style={{ fontWeight: 700, color: '#1a1a2e', textDecoration: 'none' }}>{r.businessName || r.ownerName}</Link>
                                                        : <b>{r.ownerName}</b>}
                                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{[r.ownerName, r.ownerEmail].filter(Boolean).join(' · ')}</div>
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ ...td, whiteSpace: 'nowrap' }}>{day(r.joinedAt)}</td>
                                        <td style={td}>{r.currentPlan || <span style={{ color: '#9ca3af' }}>None</span>}</td>
                                        <td style={td}>{fullCount(r.sales)}</td>
                                        <td style={td}>{fullCount(r.products)}</td>
                                        <td style={td}>
                                            {r.status === 'rewarded'
                                                ? <span style={{ color: '#15803d', fontWeight: 700 }}>Paid{r.signupPoints ? ` · ${fullCount(r.signupPoints)} pts` : ''}</span>
                                                : <span style={{ color: '#b45309', fontWeight: 600 }}>Not paid</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default function ReferralsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [show, setShow] = useState('');
    const [sort, setSort] = useState('referred');
    const [viewing, setViewing] = useState<string | null>(null);
    const debounced = useDebouncedValue(search);
    React.useEffect(() => setPage(1), [debounced, show, sort]);

    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'referral-merchants', page, pageSize, debounced, show, sort],
        queryFn: () => inventoryClient.get<any>(`${BASE}?${qs({ page, pageSize, search: debounced, show, sort })}`),
        placeholderData: keepPreviousData,
    });
    const s = data?.summary;
    const rows: any[] = data?.data || [];

    return (
        <div>
            <Topbar title="Referrals" subtitle="Every merchant's referral code, who they've referred, and the points it earned them." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={24} /></div>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Referrals Audit List</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Click a merchant to see the businesses they referred.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                    {[
                        { label: 'Merchants with a code', value: s?.withCode, sub: s ? `of ${fullCount(s.merchants)} merchants` : '', show: 'with_code' },
                        { label: 'Merchants who referred', value: s?.referrers, sub: 'Referred at least one business', show: 'referrers' },
                        { label: 'Businesses referred', value: s?.referred, sub: 'Signed up with a code', show: '' },
                        { label: 'Points from referrals', value: s?.pointsFromReferrals, sub: 'Earned by referrers', show: '' },
                    ].map(k => (
                        <button key={k.label} onClick={() => k.show && setShow(show === k.show ? '' : k.show)}
                            style={{ textAlign: 'left', background: '#fff', borderRadius: 14, padding: '14px 16px', border: k.show && show === k.show ? '1.5px solid #6c9e4e' : '1px solid #f0f0f0', cursor: k.show ? 'pointer' : 'default' }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }} onClick={e => e.stopPropagation()}>
                                {isLoading ? '...' : <ToggleValue short={compactCount(k.value || 0)} full={fullCount(k.value || 0)} />}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{k.label}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{k.sub}</div>
                        </button>
                    ))}
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #f5f5f5' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1a1a2e', flex: 1 }}>Merchants <span style={{ fontWeight: 400, color: '#9ca3af' }}>({data?.meta?.total ?? '...'})</span></h3>
                        <div style={{ position: 'relative', minWidth: 240 }}>
                            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 11 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant or code"
                                style={{ height: 36, width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px 0 30px', fontSize: 13, outline: 'none' }} />
                        </div>
                        <select value={show} onChange={e => setShow(e.target.value)} style={{ height: 36, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', fontSize: 13, background: '#fff' }}>
                            <option value="">All merchants</option>
                            <option value="referrers">Have referred someone</option>
                            <option value="with_code">Have a code</option>
                            <option value="no_code">No code yet</option>
                        </select>
                        <select value={sort} onChange={e => setSort(e.target.value)} style={{ height: 36, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', fontSize: 13, background: '#fff' }}>
                            <option value="referred">Most referred</option>
                            <option value="points">Most points from referrals</option>
                            <option value="name">Name A–Z</option>
                        </select>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                            <thead><tr>{['Merchant', 'Referral code', 'Merchants referred', 'Points from referrals', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {isLoading && <tr><td colSpan={5} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>}
                                {!isLoading && rows.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 28 }}>No merchants found</td></tr>}
                                {rows.map(r => (
                                    <tr key={r.businessId} onClick={() => setViewing(r.businessId)} style={{ cursor: 'pointer' }}>
                                        <td style={td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <MerchantLogo name={r.name} logo={r.logo} size={30} radius={8} />
                                                <span><b style={{ color: '#1a1a2e' }}>{r.name}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{r.email}</div></span>
                                            </div>
                                        </td>
                                        <td style={td}>{codeChip(r.referralCode)}</td>
                                        <td style={td}>
                                            <b style={{ color: r.referredCount ? '#1a1a2e' : '#9ca3af' }}>{fullCount(r.referredCount)}</b>
                                            {r.rewardedCount > 0 && <span style={{ fontSize: 11, color: '#15803d' }}> · {r.rewardedCount} paid</span>}
                                        </td>
                                        <td style={{ ...td, fontWeight: 700, color: r.pointsFromReferrals ? '#15803d' : '#9ca3af' }}>{fullCount(r.pointsFromReferrals)} pts</td>
                                        <td style={td}><span style={{ color: '#3f7d2c', fontWeight: 700, fontSize: 12 }}>View referrals →</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} totalItems={data?.meta?.total || 0} pageSize={pageSize}
                        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                </div>
            </div>
            {viewing && <ReferredModal businessId={viewing} onClose={() => setViewing(null)} />}
        </div>
    );
}
