'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import Topbar from '../Topbar';
import { CacCheck, CacStatus, useCacAction, useCacChecks, useCheckAllCac } from '@/api/inventory/cac-checks';

const GREEN = '#6c9e4e';
const INK = '#1a1a2e';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const STATUS: Record<CacStatus, { label: string; bg: string; color: string }> = {
    auto_verified: { label: 'Auto-verified', bg: '#eaf4e3', color: '#3f7d2c' },
    approved: { label: 'Approved by admin', bg: '#dcfce7', color: '#15803d' },
    needs_review: { label: 'Needs review', bg: '#fef3c7', color: '#b45309' },
    not_found: { label: 'Not found on CAC', bg: '#fee2e2', color: '#b91c1c' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
    error: { label: "CAC didn't answer", bg: '#f3f4f6', color: '#4b5563' },
    checking: { label: 'Checking', bg: '#e0f2fe', color: '#0369a1' },
};

const TABS: { key: string; label: string }[] = [
    { key: '', label: 'All' },
    { key: 'needs_review', label: 'Needs review' },
    { key: 'auto_verified', label: 'Auto-verified' },
    { key: 'approved', label: 'Approved' },
    { key: 'not_found', label: 'Not found' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'error', label: "CAC didn't answer" },
];

const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const typeLabel = (t: string | null) =>
    !t ? '' : t === 'COMPANY' ? 'Company (RC)' : t === 'BUSINESS_NAME' ? 'Business name (BN)' : t === 'IT' ? 'Incorporated trustees' : t.replace(/_/g, ' ').toLowerCase();

function Badge({ status }: { status: CacStatus }) {
    const s = STATUS[status] || STATUS.checking;
    return (
        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {s.label}
        </span>
    );
}

export default function CacChecksPageClient() {
    const params = useSearchParams();
    const [status, setStatus] = useState(params.get('status') || '');
    const [searchText, setSearchText] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchText.trim()); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchText]);

    const { data, isLoading, error } = useCacChecks({ status, search, page, per_page: 25 });
    const action = useCacAction();
    const checkAll = useCheckAllCac();
    const rows: CacCheck[] = data?.data ?? [];
    const counts = data?.counts ?? {};
    const total = Object.values(counts).reduce((n, c) => n + (c || 0), 0);
    const [busy, setBusy] = useState<string | null>(null);

    const run = async (row: CacCheck, act: 'approve' | 'reject' | 'recheck') => {
        let note: string | undefined;
        if (act === 'reject') {
            const typed = window.prompt(`Reject ${row.merchant}'s number ${row.regNumber}? You can add a reason (optional):`, '');
            if (typed === null) return;
            note = typed.trim() || undefined;
        }
        setBusy(`${row.businessId}-${act}`);
        try {
            const res: any = await action.mutateAsync({ businessId: row.businessId, action: act, note });
            if (act === 'approve') toast.success(`${row.merchant} approved`);
            else if (act === 'reject') toast.success(`${row.merchant} rejected`);
            else toast.success(`Checked again: ${STATUS[(res?.status as CacStatus) || 'checking']?.label || 'done'}`);
        } catch (e: any) {
            toast.error(e?.message || 'Something went wrong');
        } finally {
            setBusy(null);
        }
    };

    const startAll = async () => {
        try {
            const res: any = await checkAll.mutateAsync();
            toast.success(res?.started ? `Checking ${res.count} merchant${res.count === 1 ? '' : 's'} with CAC. This takes about ${Math.max(1, Math.ceil((res.count * 2.5) / 60))} min.` : res?.message || 'Already checking');
        } catch (e: any) {
            toast.error(e?.message || 'Could not start');
        }
    };

    const th: React.CSSProperties = { padding: '12px 14px', fontSize: 12, fontWeight: 700, color: MUTED, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' };
    const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14, color: INK, borderTop: `1px solid ${LINE}`, verticalAlign: 'top' };
    const btn = (bg: string, color: string, border = bg): React.CSSProperties => ({
        display: 'inline-flex', alignItems: 'center', gap: 4, height: 32, padding: '0 12px', borderRadius: 999,
        background: bg, color, border: `1px solid ${border}`, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
    });

    return (
        <div>
            <Topbar title="CAC checks" subtitle="Merchants' registration numbers checked against the CAC public search." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {data && !data.ready && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 14, color: '#92400e' }}>
                        This page needs a database update first: run <b>prisma/fixes/add-cac-checks.sql</b> on the database.
                    </div>
                )}

                {/* Summary + check all */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Needs review', n: counts.needs_review || 0, color: '#b45309' },
                            { label: 'Verified', n: (counts.auto_verified || 0) + (counts.approved || 0), color: '#3f7d2c' },
                            { label: 'Not found / rejected', n: (counts.not_found || 0) + (counts.rejected || 0), color: '#b91c1c' },
                            { label: 'Not checked yet', n: data?.unchecked || 0, color: MUTED },
                        ].map((c) => (
                            <div key={c.label} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '10px 16px', minWidth: 120 }}>
                                <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{c.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.n}</div>
                            </div>
                        ))}
                    </div>
                    {(data?.unchecked || 0) > 0 && (
                        <button onClick={startAll} disabled={checkAll.isPending || data?.backfilling} style={{ ...btn(GREEN, '#fff'), height: 40, padding: '0 16px', fontSize: 13, opacity: checkAll.isPending || data?.backfilling ? 0.6 : 1 }}>
                            {data?.backfilling ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                            {data?.backfilling ? 'Checking with CAC...' : `Check ${data?.unchecked} merchant${data?.unchecked === 1 ? '' : 's'} not checked yet`}
                        </button>
                    )}
                </div>

                {/* Tabs + search */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {TABS.map((t) => {
                            const n = t.key ? counts[t.key as CacStatus] || 0 : total;
                            const on = status === t.key;
                            return (
                                <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
                                    style={{ ...btn(on ? INK : '#fff', on ? '#fff' : INK, on ? INK : LINE) }}>
                                    {t.label} <span style={{ opacity: 0.7 }}>{n}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: '#9ca3af' }} />
                        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search merchant, number or CAC name"
                            style={{ width: '100%', height: 40, padding: '0 12px 0 32px', borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                        <thead>
                            <tr>
                                <th style={th}>Merchant</th>
                                <th style={th}>Number they entered</th>
                                <th style={th}>Name on CAC</th>
                                <th style={th}>Match</th>
                                <th style={th}>Status</th>
                                <th style={th}>Checked</th>
                                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: MUTED }}><Loader2 size={18} className="animate-spin" style={{ display: 'inline' }} /> Loading...</td></tr>
                            )}
                            {!isLoading && error && (
                                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#b91c1c' }}>{(error as any)?.message || 'Could not load'}</td></tr>
                            )}
                            {!isLoading && !error && !rows.length && (
                                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: MUTED }}>Nothing here yet.</td></tr>
                            )}
                            {rows.map((r) => (
                                <tr key={r.businessId} style={{ background: r.status === 'needs_review' ? '#fffbeb' : undefined }}>
                                    <td style={td}>
                                        <Link href={`/inventory/businesses/${r.businessId}`} style={{ fontWeight: 700, color: INK, textDecoration: 'none' }}>{r.merchant}</Link>
                                        {r.email && <div style={{ fontSize: 12, color: MUTED }}>{r.email}</div>}
                                    </td>
                                    <td style={{ ...td, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{r.regNumber}</td>
                                    <td style={td}>
                                        {r.cacName ? (
                                            <>
                                                <div style={{ fontWeight: 600 }}>{r.cacName}</div>
                                                <div style={{ fontSize: 12, color: MUTED }}>
                                                    {[typeLabel(r.cacType), r.cacNumber && `No. ${r.cacNumber}`, r.cacStatus && `CAC status: ${r.cacStatus.toLowerCase()}`,
                                                        r.cacRegisteredAt && `registered ${new Date(r.cacRegisteredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`]
                                                        .filter(Boolean).join(' · ')}
                                                </div>
                                            </>
                                        ) : <span style={{ color: MUTED }}>-</span>}
                                    </td>
                                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.matchScore == null ? '-' : `${Math.round(r.matchScore * 100)}%`}</td>
                                    <td style={td}>
                                        <Badge status={r.status} />
                                        {r.note && <div style={{ fontSize: 12, color: MUTED, marginTop: 4, maxWidth: 240 }}>{r.note}</div>}
                                        {r.reviewedBy && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>by {r.reviewedBy}, {when(r.reviewedAt)}</div>}
                                    </td>
                                    <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 13, color: MUTED }}>{when(r.checkedAt)}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {r.status !== 'approved' && r.status !== 'auto_verified' && (
                                                <button onClick={() => run(r, 'approve')} disabled={!!busy} style={btn(GREEN, '#fff')}>
                                                    {busy === `${r.businessId}-approve` ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
                                                </button>
                                            )}
                                            {r.status !== 'rejected' && (
                                                <button onClick={() => run(r, 'reject')} disabled={!!busy} style={btn('#fff', '#b91c1c', '#fca5a5')}>
                                                    {busy === `${r.businessId}-reject` ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Reject
                                                </button>
                                            )}
                                            <button onClick={() => run(r, 'recheck')} disabled={!!busy} style={btn('#fff', INK, LINE)} title="Search CAC again">
                                                {busy === `${r.businessId}-recheck` ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Check again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pages */}
                {(data?.meta?.last_page || 1) > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: MUTED }}>
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ ...btn('#fff', INK, LINE), opacity: page <= 1 ? 0.5 : 1 }}>Previous</button>
                        Page {page} of {data?.meta.last_page}
                        <button disabled={page >= (data?.meta.last_page || 1)} onClick={() => setPage((p) => p + 1)} style={{ ...btn('#fff', INK, LINE), opacity: page >= (data?.meta.last_page || 1) ? 0.5 : 1 }}>Next</button>
                    </div>
                )}

                <p style={{ fontSize: 12, color: MUTED, marginTop: 16, lineHeight: 1.6 }}>
                    How it works: when a merchant saves an RC or BN number in Settings, Helfer searches the CAC public search. If the name on CAC matches the
                    merchant&apos;s business name and CAC shows the business as active, it&apos;s auto-verified. Otherwise it waits here for an admin, and admins
                    get a bell alert. Only verified or approved merchants can sell on the Marketplace, message vendors and open a store page.
                </p>
            </div>
        </div>
    );
}
