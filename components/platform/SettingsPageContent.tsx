'use client';
import React, { useState } from 'react';
import Topbar from '../Topbar';
import { ACTIVE_SESSIONS } from '@/app/lib/data';
import { Lock, Shield, Monitor, LogOut, Eye, EyeOff, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
    product: 'inventory' | 'studio' | 'admin';
}

export default function SettingsPageContent({ product }: Props) {
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(true);
    const [saved, setSaved] = useState(false);

    const accentColor = product === 'studio' ? '#7c5cbf' : '#6c9e4e';
    const lightBg = product === 'studio' ? '#f0ebff' : '#eaf4e3';

    const inputStyle: React.CSSProperties = { height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' };

    function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

    const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>{icon}</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h2>
            </div>
            <div style={{ padding: 24 }}>{children}</div>
        </div>
    );

    return (
        <div>
            <Topbar title="Settings" subtitle="Security & account preferences" product={product} />
            <div style={{ padding: 'var(--content-padding)', maxWidth: 800, margin: '0 auto' }}>
                {/* Success Toast */}
                {saved && (
                    <div style={{ marginBottom: 16, padding: '12px 20px', background: lightBg, border: `1px solid ${accentColor}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: '#374151', fontSize: 14, fontWeight: 500 }}>
                        <CheckCircle size={16} color={accentColor} /> Settings saved successfully!
                    </div>
                )}

                {/* Change Password */}
                <SectionCard title="Change Password" icon={<Lock size={16} />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showCurrentPass ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 42 }} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                                <button onClick={() => setShowCurrentPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                                    {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showNewPass ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 42 }} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                                <button onClick={() => setShowNewPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                                    {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
                            <input type="password" placeholder="••••••••" style={inputStyle} onFocus={e => (e.target.style.borderColor = accentColor)} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                        </div>
                    </div>
                    <button onClick={handleSave} style={{ marginTop: 20, padding: '10px 24px', background: accentColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 2px 8px ${accentColor}4d` }}>
                        Update Password
                    </button>
                </SectionCard>

                {/* 2FA */}
                <SectionCard title="Two-Factor Authentication" icon={<Shield size={16} />}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>
                                2FA is currently <span style={{ color: twoFAEnabled ? '#22c55e' : '#ef4444' }}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Adds an extra layer of security to your admin account.</p>
                        </div>
                        <button onClick={() => setTwoFAEnabled(v => !v)} style={{ padding: '10px 20px', background: twoFAEnabled ? '#fee2e2' : lightBg, color: twoFAEnabled ? '#dc2626' : accentColor, border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                    {twoFAEnabled && (
                        <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <CheckCircle size={15} color="#22c55e" />
                            <span style={{ fontSize: 13, color: '#15803d' }}>Your account is protected with 2FA via email OTP.</span>
                        </div>
                    )}
                </SectionCard>

                {/* Active Sessions */}
                <SectionCard title="Active Sessions" icon={<Monitor size={16} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {ACTIVE_SESSIONS.map(session => (
                            <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: session.current ? lightBg : '#fafafa', borderRadius: 12, border: session.current ? `1.5px solid ${accentColor}` : '1px solid #f0f0f0' }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: session.current ? lightBg : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Wifi size={16} color={session.current ? accentColor : '#9ca3af'} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', display: 'flex', gap: 8, alignItems: 'center' }}>
                                            {session.device}
                                            {session.current && <span style={{ fontSize: 10, padding: '2px 7px', background: accentColor, color: '#fff', borderRadius: 99, fontWeight: 700 }}>CURRENT</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{session.location} · {session.ip} · {session.time}</div>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button style={{ padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Revoke</button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <LogOut size={14} /> Logout from All Devices
                    </button>
                </SectionCard>

                {/* Activity */}
                <SectionCard title="Recent Activity" icon={<AlertTriangle size={16} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { action: 'Sign in from MacBook Pro', time: '2 minutes ago', ip: '102.90.45.12', ok: true },
                            { action: 'Password changed', time: '3 days ago', ip: '102.90.45.12', ok: true },
                            { action: 'Failed sign-in attempt', time: '5 days ago', ip: '185.11.22.44', ok: false },
                            { action: 'Role updated: Support → Admin', time: '1 week ago', ip: '102.90.45.12', ok: true },
                        ].map((act, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f5f5f5' : 'none' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: act.ok ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: '#374151' }}>{act.action}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{act.time}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{act.ip}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
