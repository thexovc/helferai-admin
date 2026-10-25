'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { LogIn, Building2, Smartphone, Monitor, Search } from 'lucide-react';
import Topbar from '../Topbar';
import Pagination from '../Pagination';
import MerchantLogo from './MerchantLogo';
import ToggleValue from './ToggleValue';
import DateRangeFilter, { type DateRange } from './DateRangeFilter';
import { compactCount, fullCount } from './formatNumbers';
import { inventoryClient } from '@/api/api-client';

const BASE = '/admin/api/inventory/analysis';
type Slice = { label: string; logins: number; merchants: number };

const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: 18 };
const day = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const qs = (o: Record<string, any>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

// Share of logins for each device, system or browser as horizontal bars
function ShareBars({ title, slices, color }: { title: string; slices: Slice[]; color: string }) {
    const total = slices.reduce((n, s) => n + s.logins, 0) || 1;
    return (
        <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>{title}</div>
            {slices.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af' }}>No logins in this period</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slices.map(s => {
                    const pct = Math.round((s.logins / total) * 100);
                    return (
                        <div key={s.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                <span style={{ color: '#374151', fontWeight: 600 }}>{s.label}</span>
                                <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}><b style={{ color: '#1a1a2e' }}>{pct}%</b> · {fullCount(s.logins)} logins · {fullCount(s.merchants)} merchant{s.merchants === 1 ? '' : 's'}</span>
                            </div>
                            <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6' }}>
                                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function AnalysisPageClient() {
    const [range, setRange] = useState<DateRange>({});
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    React.useEffect(() => setPage(1), [search, range.from, range.to]);

    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'analysis', 'login-devices', range.from, range.to],
        queryFn: () => inventoryClient.get<any>(`${BASE}/login-devices?${qs({ from: range.from, to: range.to })}`),
        placeholderData: keepPreviousData,
    });
    const s = data?.summary;
    const term = search.trim().toLowerCase();
    const all: any[] = (data?.merchants || []).filter((m: any) => !term || `${m.name} ${m.email}`.toLowerCase().includes(term));
    const rows = all.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div>
            <Topbar title="Analysis" subtitle="How merchants use the HelferAI app, starting with the devices they log in with." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a1a2e', flex: 1 }}>Login devices</h3>
                    <div style={{ marginBottom: -14 }}><DateRangeFilter onChange={setRange} /></div>
                </div>
                {s?.trackedSince && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: -10 }}>
                        Devices are recorded from {day(s.trackedSince)}.{s.loginsWithoutDevice > 0 && ` ${fullCount(s.loginsWithoutDevice)} older logins in this period have no device saved and are left out.`}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    {[
                        { label: 'Logins with a device', value: s?.logins, icon: <LogIn size={18} />, color: '#6c9e4e' },
                        { label: 'Merchants', value: s?.merchants, icon: <Building2 size={18} />, color: '#0284c7' },
                        { label: 'Top device', text: s?.byType?.[0]?.label, icon: <Smartphone size={18} />, color: '#f59e0b' },
                        { label: 'Top system · browser', text: s?.byOs?.[0] ? `${s.byOs[0].label} · ${s.byBrowser?.[0]?.label}` : undefined, icon: <Monitor size={18} />, color: '#7c5cbf' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.color}` }}>
                            <div style={{ color: k.color, marginBottom: 6 }}>{k.icon}</div>
                            <div style={{ fontSize: 'value' in k ? 22 : 16, fontWeight: 800, color: '#1a1a2e', minHeight: 28 }}>
                                {isLoading ? '...' : 'value' in k ? <ToggleValue short={compactCount(k.value || 0)} full={fullCount(k.value || 0)} /> : (k.text || '—')}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    <ShareBars title="Phone, tablet or computer" slices={s?.byType || []} color="#f59e0b" />
                    <ShareBars title="System" slices={s?.byOs || []} color="#6c9e4e" />
                    <ShareBars title="Browser" slices={s?.byBrowser || []} color="#7c5cbf" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #f5f5f5' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1a1a2e', flex: 1 }}>Each merchant&apos;s main device <span style={{ fontWeight: 400, color: '#9ca3af' }}>({all.length})</span></h3>
                        <div style={{ position: 'relative', minWidth: 220 }}>
                            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 11 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant"
                                style={{ height: 36, width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px 0 30px', fontSize: 13, outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                            <thead><tr>{['Merchant', 'Logins', 'Main device', 'Devices used', 'Last login'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {isLoading && <tr><td colSpan={5} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>}
                                {!isLoading && rows.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 28 }}>No merchant logins in this period</td></tr>}
                                {rows.map(r => (
                                    <tr key={r.businessId}>
                                        <td style={td}>
                                            <Link href={`/inventory/businesses/${r.businessId}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                                <MerchantLogo name={r.name} logo={r.logo} size={30} radius={8} />
                                                <span><b style={{ color: '#1a1a2e' }}>{r.name}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{r.email}</div></span>
                                            </Link>
                                        </td>
                                        <td style={{ ...td, fontWeight: 800 }}>{fullCount(r.logins)}</td>
                                        <td style={td}>{r.mainDevice}<div style={{ fontSize: 11, color: '#9ca3af' }}>{r.mainDeviceShare}% of logins</div></td>
                                        <td style={td}>{r.devices}</td>
                                        <td style={{ ...td, whiteSpace: 'nowrap' }}>{day(r.lastLoginAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(all.length / pageSize))} onPageChange={setPage} totalItems={all.length} pageSize={pageSize}
                        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                </div>
            </div>
        </div>
    );
}
