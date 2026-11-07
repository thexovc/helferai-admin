'use client';
import React, { useMemo, useState } from 'react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import { ArrowRightLeft, Coins, Edit2, Info, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyRate, useCurrencyRates, useRefreshRates, useUpdateCurrency } from '@/api/inventory/currencies';

const GREEN = '#6c9e4e';
const INK = '#1a1a2e';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const naira = (n: number | null | undefined) => {
    if (n === null || n === undefined || !Number.isFinite(n)) return '-';
    const small = Math.abs(n) < 10;
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: small ? 4 : 2 })}`;
};

const ago = (iso: string | null | undefined) => {
    if (!iso) return 'never';
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const h = Math.round(mins / 60);
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

type Side = 'mid' | 'buy' | 'sell';
const SIDE_LABEL: Record<Side, string> = { mid: 'Mid rate', buy: 'Buy rate', sell: 'Sell rate' };

function Tip({ text }: { text: string }) {
    return (
        <span title={text} aria-label={text} style={{ display: 'inline-flex', color: '#9ca3af', cursor: 'help', verticalAlign: 'middle' }}>
            <Info size={13} />
        </span>
    );
}

export default function CurrenciesPageClient() {
    const { data, isLoading, error } = useCurrencyRates();
    const refresh = useRefreshRates();
    const update = useUpdateCurrency();
    const rates: CurrencyRate[] = Array.isArray(data) ? data : [];
    const lastFetched = rates.map((r) => r.fetched_at).filter(Boolean).sort().pop() || null;

    // Converter
    const [amount, setAmount] = useState('10000');
    const [from, setFrom] = useState('NGN');
    const [to, setTo] = useState('USD');
    const [side, setSide] = useState<Side>('mid');
    const converted = useMemo(() => {
        const a = rates.find((r) => r.code === from);
        const b = rates.find((r) => r.code === to);
        const pick = (r?: CurrencyRate) => (!r ? null : side === 'buy' ? r.buy_rate : side === 'sell' ? r.sell_rate : r.mid_rate);
        const fr = pick(a);
        const tr = pick(b);
        const n = Number(String(amount).replace(/[,\s]/g, ''));
        if (!fr || !tr || !Number.isFinite(n)) return null;
        return { result: (n * fr) / tr, rate: fr / tr, a, b };
    }, [rates, from, to, side, amount]);

    // Edit modal
    const [editing, setEditing] = useState<CurrencyRate | null>(null);
    const [form, setForm] = useState({ manual: '', buy: '', sell: '', enabled: true });
    const openEdit = (r: CurrencyRate) => {
        setEditing(r);
        setForm({
            manual: r.manual_rate != null ? String(r.manual_rate) : '',
            buy: String(r.buy_margin),
            sell: String(r.sell_margin),
            enabled: r.enabled,
        });
    };
    const save = async () => {
        if (!editing) return;
        const manual = form.manual.trim() === '' ? null : Number(form.manual.replace(/[,\s₦]/g, ''));
        const buy = Number(form.buy);
        const sell = Number(form.sell);
        if (manual !== null && !(manual > 0)) return toast.error('Your own rate must be a number more than 0, or empty to use the market rate');
        if (!(buy >= 0 && buy <= 50) || !(sell >= 0 && sell <= 50)) return toast.error('Margins must be between 0 and 50 percent');
        try {
            await update.mutateAsync({ code: editing.code, dto: { manual_rate: manual, buy_margin: buy, sell_margin: sell, enabled: form.enabled } });
            toast.success(`${editing.code} saved`);
            setEditing(null);
        } catch (e: any) {
            toast.error(e?.message || 'Could not save');
        }
    };
    const preview = useMemo(() => {
        if (!editing) return null;
        const manual = form.manual.trim() === '' ? null : Number(form.manual.replace(/[,\s₦]/g, ''));
        const mid = manual && manual > 0 ? manual : editing.market_rate;
        if (!mid) return null;
        const b = Number(form.buy) || 0;
        const s = Number(form.sell) || 0;
        return { mid, buy: mid * (1 - b / 100), sell: mid * (1 + s / 100) };
    }, [editing, form]);

    const doRefresh = async () => {
        try {
            await refresh.mutateAsync();
            toast.success('Market rates updated');
        } catch (e: any) {
            toast.error(e?.message || 'Could not reach the exchange rate service');
        }
    };

    const input: React.CSSProperties = {
        width: '100%', height: 42, padding: '0 12px', borderRadius: 8, border: `1px solid ${LINE}`,
        fontSize: 14, color: INK, background: '#fff', boxSizing: 'border-box',
    };
    const th: React.CSSProperties = { padding: '12px 14px', fontSize: 12, fontWeight: 700, color: MUTED, textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.03em' };
    const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14, color: INK, whiteSpace: 'nowrap', borderTop: `1px solid ${LINE}` };

    return (
        <div>
            <Topbar title="Currencies" subtitle="Exchange rates Helfer uses to show prices in each store's currency." product="inventory" />

            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Coins size={24} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Currencies</h2>
                            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
                                All rates are Naira for 1 unit. Market rates last checked {ago(lastFetched)}; they refresh every hour.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={doRefresh}
                        disabled={refresh.isPending}
                        style={{
                            background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14,
                            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: refresh.isPending ? 0.7 : 1,
                        }}
                    >
                        {refresh.isPending ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} Refresh market rates
                    </button>
                </div>

                {/* How it works */}
                <div style={{ background: '#f7faf4', border: '1px solid #dce7c9', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#45523a', marginBottom: 20, lineHeight: 1.55 }}>
                    Merchants' prices are always saved in Naira. A store set to another currency shows them converted with the <b>mid rate</b>.
                    The <b>buy rate</b> (mid minus buy margin) is what Helfer would pay in Naira for 1 unit; the <b>sell rate</b> (mid plus sell margin) is what Helfer would charge.
                    Type your own rate (e.g. the parallel-market rate) to use it instead of the market feed.
                </div>

                {/* Converter */}
                <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: INK, marginBottom: 12 }}>
                        <ArrowRightLeft size={18} color={GREEN} /> Converter
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
                            Amount
                            <input style={{ ...input, marginTop: 6 }} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </label>
                        <label style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
                            From
                            <select style={{ ...input, marginTop: 6 }} value={from} onChange={(e) => setFrom(e.target.value)}>
                                {rates.map((r) => <option key={r.code} value={r.code}>{r.code} · {r.name}</option>)}
                            </select>
                        </label>
                        <label style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
                            To
                            <select style={{ ...input, marginTop: 6 }} value={to} onChange={(e) => setTo(e.target.value)}>
                                {rates.map((r) => <option key={r.code} value={r.code}>{r.code} · {r.name}</option>)}
                            </select>
                        </label>
                        <label style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
                            Using
                            <select style={{ ...input, marginTop: 6 }} value={side} onChange={(e) => setSide(e.target.value as Side)}>
                                {(Object.keys(SIDE_LABEL) as Side[]).map((s) => <option key={s} value={s}>{SIDE_LABEL[s]}</option>)}
                            </select>
                        </label>
                    </div>
                    <div style={{ marginTop: 14, fontSize: 20, fontWeight: 800, color: INK, wordBreak: 'break-word' }}>
                        {converted
                            ? <>
                                {converted.result.toLocaleString('en-NG', { maximumFractionDigits: 2 })} {to}
                                <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: MUTED, marginTop: 2 }}>
                                    1 {from} = {converted.rate.toLocaleString('en-NG', { maximumFractionDigits: 6 })} {to} ({SIDE_LABEL[side].toLowerCase()})
                                </span>
                            </>
                            : <span style={{ fontSize: 14, fontWeight: 500, color: MUTED }}>{isLoading ? 'Loading rates…' : 'No rate for this pair yet.'}</span>}
                    </div>
                </div>

                {/* Rates table */}
                <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                            <thead style={{ background: '#f9fafb' }}>
                                <tr>
                                    <th style={th}>Currency</th>
                                    <th style={th}>Mid rate <Tip text="The rate stores use to show prices: your own rate if set, otherwise the market rate." /></th>
                                    <th style={th}>Buy rate <Tip text="Naira Helfer would pay for 1 unit: mid rate minus the buy margin." /></th>
                                    <th style={th}>Sell rate <Tip text="Naira Helfer would charge for 1 unit: mid rate plus the sell margin." /></th>
                                    <th style={th}>Market rate <Tip text="From the live exchange rate feed, checked every hour." /></th>
                                    <th style={th}>Margins <Tip text="Buy / sell margin in percent." /></th>
                                    <th style={th}>Status</th>
                                    <th style={th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr><td style={{ ...td, textAlign: 'center', color: MUTED }} colSpan={8}>Loading rates…</td></tr>
                                )}
                                {!isLoading && error && (
                                    <tr><td style={{ ...td, textAlign: 'center', color: '#b42318' }} colSpan={8}>{(error as Error).message || 'Could not load rates'}</td></tr>
                                )}
                                {rates.map((r) => {
                                    const base = r.source === 'base';
                                    return (
                                        <tr key={r.code} style={{ opacity: r.enabled ? 1 : 0.55 }}>
                                            <td style={td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{r.symbol}</span>
                                                    <span>
                                                        <b>{r.code}</b>
                                                        <span style={{ display: 'block', fontSize: 12, color: MUTED }}>{r.name}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ ...td, fontWeight: 700 }}>{base ? 'Base (₦1)' : naira(r.mid_rate)}</td>
                                            <td style={td}>{base ? '-' : naira(r.buy_rate)}</td>
                                            <td style={td}>{base ? '-' : naira(r.sell_rate)}</td>
                                            <td style={{ ...td, color: MUTED }}>
                                                {base ? '-' : naira(r.market_rate)}
                                                {!base && <span style={{ display: 'block', fontSize: 11 }}>{ago(r.fetched_at)}</span>}
                                            </td>
                                            <td style={{ ...td, color: MUTED }}>{base ? '-' : `${r.buy_margin}% / ${r.sell_margin}%`}</td>
                                            <td style={td}>
                                                {base ? (
                                                    <Badge color="#374151" bg="#f3f4f6">Base</Badge>
                                                ) : !r.enabled ? (
                                                    <Badge color="#6b7280" bg="#f3f4f6">Hidden</Badge>
                                                ) : r.source === 'manual' ? (
                                                    <Badge color="#92400e" bg="#fef3c7">Admin rate</Badge>
                                                ) : r.source === 'market' ? (
                                                    <Badge color="#166534" bg="#dcfce7">Market</Badge>
                                                ) : (
                                                    <Badge color="#b42318" bg="#fee4e2">No rate</Badge>
                                                )}
                                                {r.updated_by && <span style={{ display: 'block', fontSize: 11, color: MUTED, marginTop: 3 }}>by {r.updated_by}, {ago(r.updated_at)}</span>}
                                            </td>
                                            <td style={{ ...td, textAlign: 'right' }}>
                                                {!base && (
                                                    <button
                                                        onClick={() => openEdit(r)}
                                                        aria-label={`Edit ${r.code}`}
                                                        style={{ background: 'none', border: `1px solid ${LINE}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: INK }}
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                title={editing ? `${editing.code} · ${editing.name}` : ''}
                maxWidth={460}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button onClick={() => setEditing(null)} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={save} disabled={update.isPending} style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: update.isPending ? 0.7 : 1 }}>
                            {update.isPending ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                }
            >
                {editing && (
                    <div style={{ display: 'grid', gap: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                            Your own rate (₦ for 1 {editing.code})
                            <input
                                style={{ ...input, marginTop: 6 }}
                                inputMode="decimal"
                                placeholder={editing.market_rate ? `Empty = market rate (${naira(editing.market_rate)})` : 'Empty = market rate'}
                                value={form.manual}
                                onChange={(e) => setForm({ ...form, manual: e.target.value })}
                            />
                            <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: MUTED, marginTop: 4 }}>Leave empty to follow the live market rate.</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                                Buy margin (%)
                                <input style={{ ...input, marginTop: 6 }} inputMode="decimal" value={form.buy} onChange={(e) => setForm({ ...form, buy: e.target.value })} />
                            </label>
                            <label style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                                Sell margin (%)
                                <input style={{ ...input, marginTop: 6 }} inputMode="decimal" value={form.sell} onChange={(e) => setForm({ ...form, sell: e.target.value })} />
                            </label>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: INK, cursor: 'pointer' }}>
                            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} style={{ width: 18, height: 18 }} />
                            Merchants can use this currency
                        </label>
                        {preview && (
                            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: INK, display: 'grid', gap: 4 }}>
                                <span>Mid: <b>{naira(preview.mid)}</b></span>
                                <span>Buy: <b>{naira(preview.buy)}</b> · Sell: <b>{naira(preview.sell)}</b></span>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
    return (
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color, background: bg, borderRadius: 999, padding: '3px 10px' }}>{children}</span>
    );
}
