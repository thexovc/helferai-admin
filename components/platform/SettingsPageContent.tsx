'use client';
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Topbar from '../Topbar';
import PushToggle from '../PushToggle';
import { inventoryClient } from '@/api/api-client';
import { useMyAccess } from '@/api/auth/useMyAccess';
import { Lock, Monitor, LogOut, Eye, EyeOff, Bell, History, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

type ActivityItem = { id: string; action: string; ok: boolean; ip: string | null; userAgent: string | null; at: string | null };
type MyActivity = { signIns: ActivityItem[]; actions: ActivityItem[] };

const inputStyle: React.CSSProperties = { height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const muted: React.CSSProperties = { fontSize: 13, color: '#6b7280', margin: 0 };

// "iPhone · Safari" from a browser's user agent
function deviceName(ua: string | null) {
    if (!ua) return '';
    const device = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
        : /Macintosh|Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows PC' : /Linux/.test(ua) ? 'Linux' : 'Device';
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
        : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
    return browser ? `${device} · ${browser}` : device;
}

function timeAgo(at: string | null) {
    if (!at) return '';
    const s = Math.max(0, (Date.now() - new Date(at).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
    if (s < 7 * 86400) return `${Math.floor(s / 86400)} day${s < 2 * 86400 ? '' : 's'} ago`;
    return new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Defined outside the page so its contents (and the typed passwords) aren't wiped on every re-render
function SectionCard({ title, icon, accent, lightBg, children }: { title: string; icon: React.ReactNode; accent: string; lightBg: string; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>{icon}</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: 20 }}>{children}</div>
        </div>
    );
}

function PasswordInput({ value, onChange, show, onToggle, accent, autoComplete }: { value: string; onChange: (v: string) => void; show?: boolean; onToggle?: () => void; accent: string; autoComplete: string }) {
    return (
        <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: onToggle ? 42 : 14 }}
                onFocus={e => (e.target.style.borderColor = accent)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            {onToggle && (
                <button type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 8 }}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            )}
        </div>
    );
}

function ActivityRow({ item, title, last }: { item: ActivityItem; title: string; last: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: last ? 'none' : '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.ok ? '#22c55e' : '#ef4444', flexShrink: 0, marginTop: 6 }} />
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500, overflowWrap: 'anywhere' }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', overflowWrap: 'anywhere' }}>{[deviceName(item.userAgent), item.ip].filter(Boolean).join(' · ')}</div>
                </div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(item.at)}</div>
        </div>
    );
}

export default function SettingsPageContent({ product }: Props) {
    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';
    const card = { accent: accentColor, lightBg };

    const { me } = useMyAccess();
    const activity = useQuery({
        queryKey: ['admin-auth', 'my-activity'],
        queryFn: () => inventoryClient.get<MyActivity>('/admin/auth/my-activity'),
    });

    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const changePassword = useMutation({
        mutationFn: () => inventoryClient.put('/admin/auth/password', { currentPassword: current, newPassword: next }),
        onSuccess: () => {
            toast.success('Password changed. Use the new one next time you sign in.');
            setCurrent(''); setNext(''); setConfirm('');
            activity.refetch();
        },
        onError: (e: any) => toast.error(e?.message || 'Could not change your password'),
    });

    function handleSavePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!current || !next || !confirm) return toast.error('Please fill in all three password boxes');
        if (next.length < 8) return toast.error('New password must be at least 8 characters');
        if (next !== confirm) return toast.error('The new passwords don\'t match');
        if (next === current) return toast.error('The new password must be different from the current one');
        changePassword.mutate();
    }

    const signOut = () => {
        try {
            const keys = product === 'inventory' ? ['inventoryToken', 'inventoryUser'] : ['adminToken', 'adminUser'];
            keys.forEach(k => localStorage.removeItem(k));
        } catch { }
        window.location.href = '/select';
    };

    const empty = (text: string) => <p style={muted}>{text}</p>;
    const list = (items: ActivityItem[] | undefined, titleOf: (i: ActivityItem) => string, none: string) =>
        activity.isLoading ? empty('Loading…')
            : activity.isError ? empty('Could not load this right now.')
                : !items?.length ? empty(none)
                    : items.map((i, n) => <ActivityRow key={i.id} item={i} title={titleOf(i)} last={n === items.length - 1} />);

    return (
        <div>
            <Topbar title="Settings" subtitle="Your account & security" product={product} />
            <div style={{ padding: 'var(--content-padding)', maxWidth: 800, margin: '0 auto' }}>
                <SectionCard title="Your Account" icon={<UserCircle size={16} />} {...card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{me?.name || '…'}</div>
                            <div style={{ ...muted, overflowWrap: 'anywhere' }}>{me?.email}</div>
                            {me?.role && <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, padding: '2px 8px', background: lightBg, color: accentColor, borderRadius: 99, fontWeight: 700 }}>{me.role}</span>}
                        </div>
                        <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            <LogOut size={14} /> Sign out of this device
                        </button>
                    </div>
                </SectionCard>

                <SectionCard title="Change Password" icon={<Lock size={16} />} {...card}>
                    <form onSubmit={handleSavePassword}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Current Password</label>
                                <PasswordInput value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} accent={accentColor} autoComplete="current-password" />
                            </div>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <PasswordInput value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext(v => !v)} accent={accentColor} autoComplete="new-password" />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <PasswordInput value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} accent={accentColor} autoComplete="new-password" />
                            </div>
                        </div>
                        <p style={{ ...muted, fontSize: 12, marginTop: 10 }}>At least 8 characters.</p>
                        <button type="submit" disabled={changePassword.isPending} style={{ marginTop: 14, padding: '10px 24px', background: accentColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: changePassword.isPending ? 'default' : 'pointer', opacity: changePassword.isPending ? 0.7 : 1, boxShadow: `0 2px 8px ${accentColor}4d` }}>
                            {changePassword.isPending ? 'Saving…' : 'Update Password'}
                        </button>
                    </form>
                </SectionCard>

                <SectionCard title="Alerts on This Device" icon={<Bell size={16} />} {...card}>
                    <p style={{ ...muted, marginBottom: 10 }}>Get the bell alerts (new merchants, payments, expiring plans) as phone or computer notifications.</p>
                    <PushToggle accent={accentColor} />
                </SectionCard>

                <SectionCard title="Recent Sign-ins" icon={<Monitor size={16} />} {...card}>
                    {list(activity.data?.signIns, i => (i.ok ? 'Signed in' : 'Failed sign-in attempt'), 'No sign-ins recorded yet.')}
                </SectionCard>

                <SectionCard title="Your Recent Changes" icon={<History size={16} />} {...card}>
                    {list(activity.data?.actions, i => i.action, 'You haven\'t made any changes yet.')}
                </SectionCard>
            </div>
        </div>
    );
}
