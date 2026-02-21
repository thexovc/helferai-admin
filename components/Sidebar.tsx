'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Building2, Users, Settings, Shield, ChevronLeft,
    ChevronRight, Package, BarChart3, Sparkles, UserCircle, LineChart,
    LogOut, Home, X
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
    product: 'inventory' | 'studio' | 'admin';
}

const inventoryNav: NavGroup[] = [
    { items: [{ href: '/inventory/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' }] },
    {
        title: 'Management', items: [
            { href: '/inventory/businesses', icon: <Building2 size={18} />, label: 'Businesses' },
            { href: '/inventory/ai', icon: <Sparkles size={18} />, label: 'AI' },
        ],
    },
    {
        title: 'Platform', items: [
            { href: '/admins', icon: <Shield size={18} />, label: 'Admins (RBAC)' },
            { href: '/users', icon: <Users size={18} />, label: 'Users' },
            { href: '/settings', icon: <Settings size={18} />, label: 'Settings' },
        ],
    },
];

const studioNav: NavGroup[] = [
    { items: [{ href: '/studio/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' }] },
    {
        title: 'Management', items: [
            { href: '/studio/users', icon: <UserCircle size={18} />, label: 'Users' },
            { href: '/studio/analysis', icon: <LineChart size={18} />, label: 'Analysis' },
        ],
    },
    {
        title: 'Platform', items: [
            { href: '/admins', icon: <Shield size={18} />, label: 'Admins (RBAC)' },
            { href: '/users', icon: <Users size={18} />, label: 'Admin Users' },
            { href: '/settings', icon: <Settings size={18} />, label: 'Settings' },
        ],
    },
];

const adminNav: NavGroup[] = [
    {
        title: 'Global', items: [
            { href: '/admins', icon: <Shield size={18} />, label: 'Admins (RBAC)' },
            { href: '/users', icon: <Users size={18} />, label: 'Users' },
            { href: '/settings', icon: <Settings size={18} />, label: 'Settings' },
        ],
    },
];

export default function Sidebar({ product }: Props) {
    const { mobileOpen, setMobileOpen } = useLayout();
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const nav = product === 'inventory' ? inventoryNav : product === 'studio' ? studioNav : adminNav;
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
                                {isInventory ? 'Inventory Admin' : product === 'studio' ? 'Studio Admin' : 'Admin Portal'}
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
