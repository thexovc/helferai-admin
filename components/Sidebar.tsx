'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Building2, Users, Settings, Shield, ChevronLeft,
    ChevronRight, Package, BarChart3, Sparkles, UserCircle, LineChart,
    LogOut, Home, X, Tag, Layers, ShoppingBag, Scale, Building, Puzzle,
    Phone, Trophy, UserPlus, Gift, Send, Mail, ShieldCheck, ClipboardList,
    MessageSquare, Camera, DollarSign, CreditCard
} from 'lucide-react';
import { useLayout } from '@/app/lib/LayoutContext';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

interface NavGroup {
    title?: string;
    items: NavItem[];
}

interface Props {
    product: 'inventory' | 'studio';
}

const inventoryNav: NavGroup[] = [
    { items: [{ href: '/inventory/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' }] },
    {
        title: 'Finance', items: [
            { href: '/inventory/finance', icon: <DollarSign size={18} />, label: 'Finance' },
        ],
    },
    {
        title: 'Integrations', items: [
            { href: '/inventory/business-integrations', icon: <Building size={18} />, label: 'Business Integrations' },
            { href: '/inventory/integrations', icon: <Puzzle size={18} />, label: 'Integrations' },
            { href: '/inventory/whatsapp-numbers', icon: <Phone size={18} />, label: 'WhatsApp Numbers' },
        ],
    },
    {
        title: 'Inventory', items: [
            { href: '/inventory/brands', icon: <Tag size={18} />, label: 'Brands' },
            { href: '/inventory/categories', icon: <Layers size={18} />, label: 'Categories' },
            { href: '/inventory/products', icon: <ShoppingBag size={18} />, label: 'Products' },
            { href: '/inventory/units', icon: <Scale size={18} />, label: 'Units' },
        ],
    },

    {
        title: 'Business Management', items: [
            { href: '/inventory/businesses', icon: <Building2 size={18} />, label: 'Businesses' },
            { href: '/inventory/subscriptions', icon: <CreditCard size={18} />, label: 'Subscriptions' },
        ],
    },
    {
        title: 'Referral System', items: [
            { href: '/inventory/referral-analytics', icon: <BarChart3 size={18} />, label: 'Referral Analytics' },
            { href: '/inventory/referral-tiers', icon: <Trophy size={18} />, label: 'Referral Tiers' },
            { href: '/inventory/referrals', icon: <UserPlus size={18} />, label: 'Referrals' },
            { href: '/inventory/referral-configs', icon: <Settings size={18} />, label: 'Referral Point Configs' },
            { href: '/inventory/referral-rewards', icon: <Gift size={18} />, label: 'Referral Rewards' },
        ],
    },
    {
        title: 'Communication', items: [
            { href: '/inventory/send-broadcast', icon: <Send size={18} />, label: 'Send Broadcast' },
            { href: '/inventory/broadcast-history', icon: <Mail size={18} />, label: 'Broadcast History' },
        ],
    },

    {
        title: 'Analytics', items: [
            { href: '/inventory/activity-logs', icon: <ClipboardList size={18} />, label: 'User Activity Logs' },
        ],
    },
    {
        title: 'Content Management', items: [
            { href: '/inventory/testimonials', icon: <MessageSquare size={18} />, label: 'Testimonials' },
        ],
    },
    {
        title: 'Platform', items: [
            { href: '/inventory/admins', icon: <Shield size={18} />, label: 'Admins (RBAC)' },
            { href: '/inventory/users', icon: <Users size={18} />, label: 'Users' },
            { href: '/inventory/settings', icon: <Settings size={18} />, label: 'Settings' },
        ],
    },
];


const studioNav: NavGroup[] = [
    {
        items: [
            { href: '/studio/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
            { href: '/studio/users', icon: <Users size={18} />, label: 'Users' },
            { href: '/studio/try-ons', icon: <Camera size={18} />, label: 'Try-Ons' },
            { href: '/studio/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
        ]
    },
    {
        title: 'Finance', items: [
            { href: '/studio/finance', icon: <DollarSign size={18} />, label: 'Finance' },
        ],
    },
    {
        title: 'Platform', items: [
            { href: '/studio/admins', icon: <Shield size={18} />, label: 'Admins (RBAC)' },
            { href: '/studio/users', icon: <Users size={18} />, label: 'Admin Users' },
            { href: '/studio/settings', icon: <Settings size={18} />, label: 'Settings' },
        ],
    },
];

export default function Sidebar({ product }: Props) {
    const { mobileOpen, setMobileOpen } = useLayout();
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const nav = product === 'inventory' ? inventoryNav : studioNav;
    const isInventory = product === 'inventory';
    const accentColor = isInventory ? '#6c9e4e' : '#7c5cbf';
    const lightBg = isInventory ? '#eaf4e3' : '#f0ebff';

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen?.(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.4)', zIndex: 90, backdropFilter: 'blur(4px)',
                    }}
                />
            )}

            <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`} style={{
                width: mobileOpen ? 280 : (collapsed ? 80 : 260), background: '#fff',
                borderRight: '1px solid #f0f0f0',
                boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
            }}>
                {/* Logo */}
                <div style={{ padding: (collapsed && !mobileOpen) ? '20px 0' : '16px var(--content-padding)', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: (collapsed && !mobileOpen) ? 'center' : 'space-between', minHeight: 64, flexShrink: 0 }}>
                    {(mobileOpen || !collapsed) && (
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: accentColor, letterSpacing: '-0.02em' }}>
                                HelferAI
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                {isInventory ? 'Inventory Admin' : 'Studio Admin'}
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 4 }}>
                        {mobileOpen ? (
                            <button onClick={() => setMobileOpen?.(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, display: 'flex' }}>
                                <X size={18} />
                            </button>
                        ) : (
                            <button className="desktop-toggle" onClick={() => setCollapsed(c => !c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, display: 'flex' }}>
                                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Switch Product */}
                {!collapsed && (
                    <div style={{ padding: '12px 12px', borderBottom: '1px solid #f5f5f5' }}>
                        <Link href="/select" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: lightBg, borderRadius: 8, textDecoration: 'none', color: accentColor, fontSize: 12, fontWeight: 600 }}>
                            <Home size={14} /> Switch Product
                        </Link>
                    </div>
                )}

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 0' : '8px 0' }}>
                    {nav.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 4 }}>
                            {group.title && !collapsed && (
                                <div style={{ padding: '12px 20px 4px', fontSize: 10, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {group.title}
                                </div>
                            )}
                            {group.items.map(item => {
                                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link key={item.href} href={item.href} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: collapsed ? '12px' : '10px 20px',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        background: active ? lightBg : 'transparent',
                                        color: active ? accentColor : '#6b7280',
                                        textDecoration: 'none', fontWeight: active ? 600 : 400,
                                        fontSize: 13, borderRadius: collapsed ? 0 : 0,
                                        transition: 'all 0.15s',
                                        borderRight: active ? `3px solid ${accentColor}` : '3px solid transparent',
                                    }}>
                                        <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div style={{ padding: collapsed ? '12px 0' : '12px', borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>
                    <Link href="/signin" style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: collapsed ? '10px' : '10px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: '#ef4444', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                        borderRadius: 8, transition: 'background 0.15s',
                    }}>
                        <LogOut size={16} />
                        {!collapsed && 'Logout'}
                    </Link>
                </div>
            </aside>
        </>
    );
}
