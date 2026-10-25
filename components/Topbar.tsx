'use client';
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, Search, User, Menu, Building2, CreditCard, ShieldAlert, CalendarClock, UserPlus, Hourglass, Gift } from 'lucide-react';
import { useLayout } from '@/app/lib/LayoutContext';
import { inventoryClient } from '@/api/api-client';
import PushToggle from './PushToggle';

type Alert = { id: string; kind: 'merchant' | 'payment' | 'security' | 'expiring' | 'staff' | 'trial' | 'referral'; title: string; detail: string; at: string; endsAt?: string; link: string };
const SEEN_KEY = 'adminAlertsSeenAt';
const ago = (d: string) => {
    const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 60) return `${Math.max(1, m)} min ago`;
    if (m < 1440) return `${Math.round(m / 60)} h ago`;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const KIND = {
    merchant: { icon: Building2, bg: '#eaf4e3', color: '#3f7d2c' },
    payment: { icon: CreditCard, bg: '#e0f2fe', color: '#0369a1' },
    security: { icon: ShieldAlert, bg: '#fee2e2', color: '#b91c1c' },
    expiring: { icon: CalendarClock, bg: '#fef3c7', color: '#b45309' },
    trial: { icon: Hourglass, bg: '#fef3c7', color: '#b45309' },
    staff: { icon: UserPlus, bg: '#f3e8ff', color: '#7c3aed' },
    referral: { icon: Gift, bg: '#eaf4e3', color: '#3f7d2c' },
};

// Bell: what happened on the pages this admin's role can open (new merchants,
// staff, payments, plans and trials ending, referrals, failed admin sign-ins);
// the count is what arrived since they last opened it
function AlertsBell({ accent }: { accent: string }) {
    const [open, setOpen] = React.useState(false);
    const [seenAt, setSeenAt] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => { try { setSeenAt(Number(localStorage.getItem(SEEN_KEY)) || 0); } catch { } }, []);
    React.useEffect(() => {
        const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);
    const { data } = useQuery({
        queryKey: ['admin-auth', 'alerts'],
        queryFn: () => inventoryClient.get<{ items: Alert[] }>('/admin/auth/alerts'),
        refetchInterval: 60_000,
        retry: false,
    });
    const items = data?.items || [];
    const unread = items.filter(i => new Date(i.at).getTime() > seenAt).length;
    const toggle = () => {
        setOpen(o => !o);
        if (!open) {
            const now = Date.now();
            try { localStorage.setItem(SEEN_KEY, String(now)); } catch { }
            setTimeout(() => setSeenAt(now), 1500);
        }
    };
    return (
        <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={toggle} title="Notifications" style={{ position: 'relative', background: open ? '#f0f7eb' : '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <Bell size={16} />
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 4px', background: accent, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>}
            </button>
            {open && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 'min(340px, calc(100vw - 24px))', maxHeight: 440, overflowY: 'auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 200 }}>
                    <div style={{ padding: '12px 14px', fontSize: 13, fontWeight: 800, color: '#1a1a2e', borderBottom: '1px solid #f0f0f0' }}>Recent activity</div>
                    <PushToggle accent={accent} />
                    {items.length === 0 ? <div style={{ padding: 20, fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>Nothing new yet.</div> : items.map(i => {
                        const k = KIND[i.kind] || KIND.merchant; const Icon = k.icon;
                        const isNew = new Date(i.at).getTime() > seenAt;
                        return (
                            <Link key={i.id} href={i.link} onClick={() => setOpen(false)} style={{ display: 'flex', gap: 10, padding: '10px 14px', textDecoration: 'none', borderBottom: '1px solid #f8f8f8', background: isNew ? '#fafdf7' : '#fff' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={15} /></div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{i.title}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.detail}</div>
                                </div>
                                <div style={{ fontSize: 11, color: i.endsAt ? '#b45309' : '#9ca3af', whiteSpace: 'nowrap' }}>{i.endsAt ? new Date(i.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ago(i.at)}</div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface Props {
    title: string;
    subtitle?: string;
    product?: 'inventory' | 'studio' | 'admin';
}

export default function Topbar({ title, subtitle, product = 'admin' }: Props) {
    const { setMobileOpen } = useLayout();
    // The admin who is signed in (saved at login)
    const [me, setMe] = React.useState<{ name?: string; role?: string } | null>(null);
    React.useEffect(() => {
        try { setMe(JSON.parse(localStorage.getItem(product === 'studio' ? 'adminUser' : 'inventoryUser') || 'null')); } catch { }
    }, [product]);
    const accent = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    return (
        <header style={{
            height: 'clamp(56px, 8vh, 64px)', background: '#fff', borderBottom: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 var(--content-padding)', position: 'sticky', top: 0, zIndex: 50,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)', gap: 12
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="mobile-only"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex', flexShrink: 0 }}
                >
                    <Menu size={20} />
                </button>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <h1 style={{ fontSize: 'clamp(16px, 2vw, 18px)', fontWeight: 700, color: '#1a1a2e', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h1>
                    {subtitle && <p className="desktop-only" style={{ fontSize: 12, color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 16px)', flexShrink: 0 }}>
                {/* Search */}
                <div className="desktop-only" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 10, color: '#9ca3af' }} />
                    <input placeholder="Search…" style={{
                        paddingLeft: 32, paddingRight: 12, height: 36, borderRadius: 8,
                        border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 13,
                        outline: 'none', width: 'clamp(140px, 15vw, 200px)', color: '#1a1a2e',
                    }} />
                </div>
                {/* Bell */}
                {product === 'studio' ? null : <AlertsBell accent={accent} />}
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        <User size={16} />
                    </div>
                    <div className="desktop-only" style={{ lineHeight: 1.2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{me?.name || 'Admin'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{me?.role || ''}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
