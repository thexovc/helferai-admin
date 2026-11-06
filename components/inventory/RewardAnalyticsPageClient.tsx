'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Award, Search, Trophy, X } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import Pagination from '../Pagination';
import MerchantLogo from './MerchantLogo';
import ToggleValue from './ToggleValue';
import DateRangeFilter, { type DateRange } from './DateRangeFilter';
import { compactCount, fullCount } from './formatNumbers';
import { inventoryClient } from '@/api/api-client';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

const BASE = '/admin/api/inventory/referrals/reward-analytics';
type Rule = { type: string; label: string; points: number; rewards: number };

const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const when = (v?: string | null) => (v ? new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const day = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const qs = (o: Record<string, any>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

// Points by rule as horizontal bars
function RuleBars({ rules, onPick, picked }: { rules: Rule[]; onPick?: (type: string) => void; picked?: string }) {
    const max = Math.max(1, ...rules.map(r => r.points));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map(r => (
                <div key={r.type} onClick={() => onPick?.(picked === r.type ? '' : r.type)}
                    style={{ cursor: onPick ? 'pointer' : 'default', opacity: picked && picked !== r.type ? 0.45 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{r.label}</span>
                        <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}><b style={{ color: '#1a1a2e' }}>{fullCount(r.points)}</b> pts · {fullCount(r.rewards)}×</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6' }}>
                        <div style={{ width: `${(r.points / max) * 100}%`, height: '100%', borderRadius: 99, background: '#6c9e4e' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MerchantRewardsModal({ businessId, range, onClose }: { businessId: string; range: DateRange; onClose: () => void }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [type, setType] = useState('');
    React.useEffect(() => setPage(1), [type]);
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'reward-analytics', businessId, page, pageSize, type, range.from, range.to],
        queryFn: () => inventoryClient.get<any>(`${BASE}/${businessId}?${qs({ page, pageSize, type, from: range.from, to: range.to })}`),
        placeholderData: keepPreviousData,
    });
    const m = data?.merchant;
    const s = data?.summary;
    return (
        <Modal isOpen onClose={onClose} title={m ? `${m.name} · rewards` : 'Rewards'} maxWidth={900}
            footer={<button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>}>
            {isLoading || !data ? <div style={{ color: '#9ca3af', fontSize: 13, padding: 20 }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <MerchantLogo name={m.name} logo={m.logo} size={44} radius={12} />
                        <div style={{ flex: 1 }}>
                            <Link href={`/inventory/businesses/${m.businessId}`} style={{ fontWeight: 800, color: '#1a1a2e', textDecoration: 'none' }}>{m.name}</Link>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.email} · {m.logins} login{m.logins === 1 ? '' : 's'}{m.tier ? ` · ${m.tier} tier` : ''}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                        {[
                            ['Total points', fullCount(s.totalPoints)],
                            ['Rewards', fullCount(s.rewards)],
                            ['First earned', day(s.firstEarnedAt)],
                            ['Last earned', day(s.lastEarnedAt)],
                        ].map(([k, v]) => (
                            <div key={k} style={{ border: '1px solid #f0f0f0', borderRadius: 10, padding: '10px 12px' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{v}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{k}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>
                            Points by rule <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(click a rule to filter the list)</span>
                        </div>
                        <RuleBars rules={s.byRule} onPick={setType} picked={type} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>Rewards earned</div>
                            {type && (
                                <button onClick={() => setType('')} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: '#f0f7eb', color: '#3f7d2c', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                    {s.byRule.find((r: Rule) => r.type === type)?.label} <X size={12} />
                                </button>
                            )}
                        </div>
                        <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 10 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                <thead><tr>{['Date', 'Rule', 'Points', 'Earned by', 'Details'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {data.data.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 24 }}>No rewards</td></tr>}
                                    {data.data.map((r: any) => (
                                        <tr key={r.id}>
                                            <td style={{ ...td, whiteSpace: 'nowrap' }}>{when(r.earnedAt)}</td>
                                            <td style={td}>{r.rule}</td>
                                            <td style={{ ...td, fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap' }}>+{fullCount(r.points)}</td>
                                            <td style={td}>{r.earnedBy}</td>
                                            <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>{r.description || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={page} totalPages={data.meta.totalPages} onPageChange={setPage} totalItems={data.meta.total} pageSize={pageSize}
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default function RewardAnalyticsPageClient() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('points');
    const [range, setRange] = useState<DateRange>({});
    const [viewing, setViewing] = useState<string | null>(null);
    const debounced = useDebouncedValue(search);
    React.useEffect(() => setPage(1), [debounced, sort, range.from, range.to]);

    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'reward-analytics', page, pageSize, debounced, sort, range.from, range.to],
        queryFn: () => inventoryClient.get<any>(`${BASE}?${qs({ page, pageSize, search: debounced, sort, from: range.from, to: range.to })}`),
        placeholderData: keepPreviousData,
    });
    const s = data?.summary;
    const rows: any[] = data?.data || [];

    return (
        <div>
            <Topbar title="Reward Analytics" subtitle="Points merchants have earned in the HelferAI app, and what they earned them for." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    {[
                        { label: 'Points earned', value: s?.totalPoints, icon: <Award size={18} />, color: '#6c9e4e' },
                        { label: 'Rewards given', value: s?.rewards, icon: <Trophy size={18} />, color: '#f59e0b' },
                        { label: 'Merchants earning', value: s?.merchants, icon: <Award size={18} />, color: '#0284c7' },
                        { label: 'Top rule', text: s?.byRule?.[0]?.label, icon: <Trophy size={18} />, color: '#7c5cbf' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.color}` }}>
                            <div style={{ color: k.color, marginBottom: 6 }}>{k.icon}</div>
                            <div style={{ fontSize: k.text ? 14 : 22, fontWeight: 800, color: '#1a1a2e', minHeight: 28 }}>
                                {isLoading ? '...' : k.text ?? <ToggleValue short={compactCount(k.value || 0)} full={fullCount(k.value || 0)} />}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{k.label}</div>
                        </div>
                    ))}
                </div>

                {s?.byRule?.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: 18 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 12 }}>Points by rule</div>
                        <RuleBars rules={s.byRule} />
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #f5f5f5' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1a1a2e', flex: 1 }}>Merchants <span style={{ fontWeight: 400, color: '#9ca3af' }}>({data?.meta?.total ?? '...'})</span></h3>
                        <div style={{ position: 'relative', minWidth: 220 }}>
                            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 10, top: 11 }} />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant"
                                style={{ height: 36, width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px 0 30px', fontSize: 13, outline: 'none' }} />
                        </div>
                        <select value={sort} onChange={e => setSort(e.target.value)} style={{ height: 36, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', fontSize: 13, background: '#fff' }}>
                            <option value="points">Most points</option>
                            <option value="recent">Earned most recently</option>
                            <option value="name">Name A–Z</option>
                        </select>
                        <div style={{ marginBottom: -14 }}><DateRangeFilter onChange={setRange} /></div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                            <thead><tr>{['#', 'Merchant', 'Total points', 'Rewards', 'Top rule', 'Tier', 'Last earned', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {isLoading && <tr><td colSpan={8} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>}
                                {!isLoading && rows.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 28 }}>No merchants earned points in this period</td></tr>}
                                {rows.map(r => (
                                    <tr key={r.businessId} onClick={() => setViewing(r.businessId)} style={{ cursor: 'pointer' }}>
                                        <td style={{ ...td, color: '#9ca3af', width: 40 }}>{r.rank}</td>
                                        <td style={td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <MerchantLogo name={r.name} logo={r.logo} size={30} radius={8} />
                                                <span><b style={{ color: '#1a1a2e' }}>{r.name}</b><div style={{ fontSize: 11, color: '#9ca3af' }}>{r.email}</div></span>
                                            </div>
                                        </td>
                                        <td style={{ ...td, fontWeight: 800, color: '#15803d', whiteSpace: 'nowrap' }}>{fullCount(r.totalPoints)}</td>
                                        <td style={td}>{fullCount(r.rewards)}</td>
                                        <td style={td}>{r.topRule ? <>{r.topRule}<div style={{ fontSize: 11, color: '#9ca3af' }}>{fullCount(r.topRulePoints)} pts</div></> : '—'}</td>
                                        <td style={td}>{r.tier ? <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#f3f4f6', color: r.tierColor || '#374151' }}>{r.tier}</span> : '—'}</td>
                                        <td style={{ ...td, whiteSpace: 'nowrap' }}>{day(r.lastEarnedAt)}</td>
                                        <td style={td}><span style={{ color: '#3f7d2c', fontWeight: 700, fontSize: 12 }}>View rewards →</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} totalItems={data?.meta?.total || 0} pageSize={pageSize}
                        onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                </div>
            </div>
            {viewing && <MerchantRewardsModal businessId={viewing} range={range} onClose={() => setViewing(null)} />}
        </div>
    );
}
