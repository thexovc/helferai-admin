'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); setSent(true); }, 1200);
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #f4f7f4, #eaf4e3)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.4s ease' }}>
                <div style={{ background: '#fff', borderRadius: 20, padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
                    <Link href="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 13, marginBottom: 24 }}>
                        <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                    {!sent ? (
                        <>
                            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px' }}>Forgot Password</h1>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>Enter your admin email and we'll send a reset link.</p>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@helferai.com" required style={{ width: '100%', height: 48, borderRadius: 10, border: '1.5px solid #e5e7eb', padding: '0 16px 0 44px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' }}
                                            onFocus={e => (e.target.style.borderColor = '#6c9e4e')}
                                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6c9e4e, #5b8441)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,158,78,0.35)' }}>
                                    {loading ? 'Sending…' : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#eaf4e3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <CheckCircle size={28} color="#6c9e4e" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>Check your email</h2>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px' }}>A password reset link has been sent to <strong>{email}</strong></p>
                            <Link href="/signin" style={{ display: 'inline-block', padding: '12px 28px', background: '#6c9e4e', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
