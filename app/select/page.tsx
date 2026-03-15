'use client';
import React from 'react';
import Link from 'next/link';
import { Package, Wand2, ArrowRight, Shield } from 'lucide-react';

export default function SelectPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f4f7f4 0%, #eaf4e3 40%, #f0ebff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ position: 'fixed', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'rgba(108,158,78,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(124,92,191,0.06)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(108,158,78,0.1)', borderRadius: 99, marginBottom: 16 }}>
                    <Shield size={14} color="#6c9e4e" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6c9e4e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Portal</span>
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Select Admin Area</h1>
                <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, margin: '0 auto' }}>Choose which product admin environment you'd like to access.</p>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800, width: '100%' }}>
                {/* Inventory */}
                <Link href="/signin?platform=inventory" style={{ textDecoration: 'none', flex: 1, minWidth: 280, maxWidth: 360 }}>
                    <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(108,158,78,0.10)', border: '2px solid transparent', transition: 'all 0.25s', cursor: 'pointer', height: '100%' }}
                        onMouseEnter={e => { e.currentTarget.style.border = '2px solid #6c9e4e'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,158,78,0.22)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,158,78,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #6c9e4e, #5b8441)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 24px rgba(108,158,78,0.3)' }}>
                            <Package size={30} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>HelferAI Inventory</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.7 }}>Manage businesses, subscriptions, billing, inventory data, and business analytics.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
                            {['Dashboard', 'Businesses', 'Subscriptions', 'AI'].map(tag => (
                                <span key={tag} style={{ padding: '4px 10px', background: '#eaf4e3', color: '#5b8441', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{tag}</span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6c9e4e', fontWeight: 700, fontSize: 14 }}>
                            Enter Inventory Admin <ArrowRight size={16} />
                        </div>
                    </div>
                </Link>

                {/* Studio */}
                <Link href="/signin?platform=studio" style={{ textDecoration: 'none', flex: 1, minWidth: 280, maxWidth: 360 }}>
                    <div style={{ background: '#fff', borderRadius: 24, padding: 36, boxShadow: '0 4px 24px rgba(124,92,191,0.10)', border: '2px solid transparent', transition: 'all 0.25s', cursor: 'pointer', height: '100%' }}
                        onMouseEnter={e => { e.currentTarget.style.border = '2px solid #7c5cbf'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,92,191,0.22)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.border = '2px solid transparent'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,92,191,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #7c5cbf, #6347a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 24px rgba(124,92,191,0.30)' }}>
                            <Wand2 size={30} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>HelferAI Studio</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.7 }}>Manage studio users, AI try-on analytics, API usage, and creative platform data.</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
                            {['Dashboard', 'Users', 'Try-On', 'Analysis'].map(tag => (
                                <span key={tag} style={{ padding: '4px 10px', background: '#f0ebff', color: '#7c5cbf', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{tag}</span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c5cbf', fontWeight: 700, fontSize: 14 }}>
                            Enter Studio Admin <ArrowRight size={16} />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Global admin links */}
            <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[{ href: '/admins', label: 'Manage Roles & Permissions' }, { href: '/users', label: 'Admin Users' }, { href: '/settings', label: 'Settings' }].map(item => (
                    <Link key={item.href} href={item.href} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.8)', border: '1px solid #e5e7eb', borderRadius: 10, color: '#374151', textDecoration: 'none', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.8)')}>
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
