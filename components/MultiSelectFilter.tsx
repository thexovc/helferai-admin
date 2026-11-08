'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Option = string | { value: string; label: string };

interface Props {
    label: string;
    // Plain strings, or { value, label } when the value sent differs from the text shown
    options: Option[];
    selected: string[];
    onChange: (values: string[]) => void;
    height?: number;
}

// A labelled dropdown where several values can be ticked. Nothing ticked = All.
export default function MultiSelectFilter({ label, options, selected, onChange, height = 34 }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', esc);
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
    }, [open]);

    const opts = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
    const labelOf = (v: string) => opts.find(o => o.value === v)?.label ?? v;
    const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
    const summary = selected.length === 0 ? 'All' : selected.length === 1 ? labelOf(selected[0]) : `${selected.length} selected`;
    const active = selected.length > 0;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)} title={active ? selected.map(labelOf).join(', ') : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height, borderRadius: height > 40 ? 12 : 8, padding: '0 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                    border: `1px solid ${active ? '#6c9e4e' : '#e5e7eb'}`, background: active ? '#f3f8ef' : '#f9fafb', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>{label}:</span>
                <span style={{ fontWeight: 600, color: active ? '#5b8441' : '#374151', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</span>
                <ChevronDown size={13} style={{ color: '#9ca3af', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
            </button>
            {open && (
                <div style={{ position: 'absolute', top: height + 4, left: 0, zIndex: 50, minWidth: 200, maxHeight: 300, overflowY: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
                        <button type="button" onClick={() => onChange([])} disabled={!active}
                            style={{ border: 'none', background: 'none', fontSize: 12, color: active ? '#6c9e4e' : '#d1d5db', fontWeight: 600, cursor: active ? 'pointer' : 'default', padding: 0 }}>
                            Show all
                        </button>
                    </div>
                    {opts.map(o => {
                        const on = selected.includes(o.value);
                        return (
                            <button type="button" key={o.value} onClick={() => toggle(o.value)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', border: 'none', borderRadius: 6, background: on ? '#f3f8ef' : 'transparent', cursor: 'pointer', fontSize: 13, color: '#1a1a2e', textAlign: 'left' }}>
                                <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${on ? '#6c9e4e' : '#d1d5db'}`, background: on ? '#6c9e4e' : '#fff' }}>
                                    {on && <Check size={11} color="#fff" strokeWidth={3} />}
                                </span>
                                {o.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
