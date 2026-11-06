'use client';
import React from 'react';
import Sidebar from '../../components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutProvider } from '../lib/LayoutContext';
import { inventoryNav } from '../../components/Sidebar';
import { useMyAccess, pageKeyOf } from '@/api/auth/useMyAccess';

// Pages outside the admin's role show a short notice instead
function PageAccess({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { me, canOpen } = useMyAccess();
    const key = pageKeyOf(pathname);
    const known = inventoryNav.some(g => g.items.some(i => pageKeyOf(i.href) === key));
    const first = inventoryNav.flatMap(g => g.items).find(i => canOpen(pageKeyOf(i.href)));
    React.useEffect(() => {
        if (me && known && !canOpen(key) && key === 'dashboard' && first) router.replace(first.href);
    }, [me, key]); // eslint-disable-line react-hooks/exhaustive-deps
    if (!me || !known || canOpen(key)) return <>{children}</>;
    return (
        <div style={{ padding: 'var(--content-padding)' }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: 32, textAlign: 'center', marginTop: 40 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>You don&apos;t have access to this page</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>Your role ({me.role}) doesn&apos;t include it. Ask a Super Admin to add it to your role.</div>
            </div>
        </div>
    );
}

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <div style={{ minHeight: '100vh', background: '#f4f7f4' }}>
                <Sidebar product="inventory" />
                <main className="main-content">
                    <PageAccess>{children}</PageAccess>
                </main>
            </div>
        </LayoutProvider>
    );
}
