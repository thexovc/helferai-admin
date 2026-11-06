'use client';
import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRange = { from?: string; to?: string };

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const PRESETS: { key: string; label: string; range: () => DateRange }[] = [
    { key: 'all', label: 'All time', range: () => ({}) },
    { key: 'today', label: 'Today', range: () => ({ from: ymd(new Date()), to: ymd(new Date()) }) },
    { key: 'yesterday', label: 'Yesterday', range: () => ({ from: ymd(daysAgo(1)), to: ymd(daysAgo(1)) }) },
    { key: '7d', label: 'Last 7 days', range: () => ({ from: ymd(daysAgo(6)), to: ymd(new Date()) }) },
    { key: '30d', label: 'Last 30 days', range: () => ({ from: ymd(daysAgo(29)), to: ymd(new Date()) }) },
    { key: 'month', label: 'This month', range: () => { const d = new Date(); return { from: ymd(new Date(d.getFullYear(), d.getMonth(), 1)), to: ymd(d) }; } },
    { key: 'lastmonth', label: 'Last month', range: () => { const d = new Date(); return { from: ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: ymd(new Date(d.getFullYear(), d.getMonth(), 0)) }; } },
    { key: 'year', label: 'This year', range: () => { const d = new Date(); return { from: ymd(new Date(d.getFullYear(), 0, 1)), to: ymd(d) }; } },
    { key: 'custom', label: 'Custom range', range: () => ({}) },
];

const box: React.CSSProperties = { height: 36, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 10px', fontSize: 13, background: '#fff', color: '#374151', outline: 'none' };

// Date filter for a merchant's Products, Sales and Expenses tabs
export default function DateRangeFilter({ onChange }: { onChange: (range: DateRange) => void }) {
    const [preset, setPreset] = React.useState('all');
    const [from, setFrom] = React.useState('');
    const [to, setTo] = React.useState('');

    const pick = (key: string) => {
        setPreset(key);
        if (key === 'custom') {
            const r = { from: from || ymd(daysAgo(29)), to: to || ymd(new Date()) };
            setFrom(r.from); setTo(r.to); onChange(r);
            return;
        }
        onChange(PRESETS.find(p => p.key === key)!.range());
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
                <Calendar size={14} color={preset === 'all' ? '#9ca3af' : '#3f7d2c'} style={{ position: 'absolute', left: 10, top: 11, pointerEvents: 'none' }} />
                <select value={preset} onChange={e => pick(e.target.value)}
                    style={{ ...box, paddingLeft: 30, fontWeight: 600, borderColor: preset === 'all' ? '#e5e7eb' : '#c7ddb8', background: preset === 'all' ? '#fff' : '#f0f7eb', cursor: 'pointer' }}>
                    {PRESETS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
            </div>
            {preset === 'custom' && (
                <>
                    <input type="date" value={from} max={to || undefined} onChange={e => { setFrom(e.target.value); onChange({ from: e.target.value || undefined, to: to || undefined }); }} style={box} />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
                    <input type="date" value={to} min={from || undefined} onChange={e => { setTo(e.target.value); onChange({ from: from || undefined, to: e.target.value || undefined }); }} style={box} />
                </>
            )}
        </div>
    );
}
