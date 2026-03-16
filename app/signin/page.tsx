'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { useAdminLogin, useInventoryLogin } from '@/api/auth/auth.queries';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Package, Wand2 } from 'lucide-react';

function SignInContent() {
    const [showPass, setShowPass] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const platform = searchParams.get('platform') || 'studio';

    const adminLogin = useAdminLogin();
    const inventoryLogin = useInventoryLogin();

    const isInventory = platform === 'inventory';
    const platformName = isInventory ? 'Inventory' : 'Studio';
    const platformColor = isInventory ? '#6c9e4e' : '#7c5cbf';
    const platformGradient = isInventory ? 'linear-gradient(135deg, #6c9e4e, #5b8441)' : 'linear-gradient(135deg, #7c5cbf, #6347a0)';
    const PlatformIcon = isInventory ? Package : Wand2;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            if (isInventory) {
                await inventoryLogin.mutateAsync({ email, password });
                toast.success('Logged into Inventory service');
            } else {
                await adminLogin.mutateAsync({ email, password });
                toast.success('Logged into Studio service');
            }

            if (email.includes('2fa')) {
                setShow2FA(true);
                setLoading(false);
                return;
            }

            router.push(isInventory ? '/inventory/dashboard' : '/studio/dashboard');
        } catch (err: any) {
            toast.error(err.message || `Login failed for ${platformName}`);
        } finally {
            setLoading(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', height: 48, borderRadius: 10, border: '1.5px solid #e5e7eb',
        padding: '0 16px 0 44px', fontSize: 14, outline: 'none', background: '#f9fafb',
        color: '#1a1a2e', transition: 'border-color 0.2s',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #f4f7f4 0%, #eaf4e3 50%, #f0f4ff 100%)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            {/* Background decoration */}
            <div style={{ position: 'fixed', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(108,158,78,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,92,191,0.06)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.4s ease' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: platformGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 24px ${isInventory ? 'rgba(108,158,78,0.3)' : 'rgba(124,92,191,0.3)'}` }}>
                        <PlatformIcon size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>HelferAI {platformName}</h1>
                    <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Sign in to your {platformName.toLowerCase()} account</p>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
                    {!show2FA ? (
                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@helferai.com" style={inputStyle} required
                                        onFocus={e => (e.target.style.borderColor = '#6c9e4e')}
                                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: 44 }} required
                                        onFocus={e => (e.target.style.borderColor = '#6c9e4e')}
                                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot */}
                            <div style={{ textAlign: 'right', marginBottom: 24 }}>
                                <Link href="/forgot-password" style={{ fontSize: 13, color: '#6c9e4e', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading} style={{
                                width: '100%', height: 48, borderRadius: 10, border: 'none',
                                background: loading ? '#9ca3af' : platformGradient,
                                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : `0 4px 16px ${isInventory ? 'rgba(108,158,78,0.35)' : 'rgba(124,92,191,0.35)'}`,
                                transition: 'all 0.2s',
                            }}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        /* 2FA UI */
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <Shield size={22} color="#6c9e4e" />
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>Two-Factor Authentication</h2>
                                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Enter the 6-digit code sent to your email</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <input key={i} maxLength={1} style={{ width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700, border: '1.5px solid #e5e7eb', borderRadius: 10, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                                        onFocus={e => (e.target.style.borderColor = '#6c9e4e')}
                                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                                        onChange={e => { if (e.target.value && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus(); }} />
                                ))}
                            </div>
                            <button onClick={() => window.location.href = '/select'} style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6c9e4e, #5b8441)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,158,78,0.35)' }}>
                                Verify Code
                            </button>
                            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
                                Didn't receive a code? <button onClick={() => { }} style={{ background: 'none', border: 'none', color: '#6c9e4e', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Resend</button>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
                    © 2026 HelferAI · All rights reserved
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <React.Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', background: '#f4f7f4', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} color="#6c9e4e" className="animate-spin" />
        </div>}>
            <SignInContent />
        </React.Suspense>
    );
}
