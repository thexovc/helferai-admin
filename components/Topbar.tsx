import { Bell, Search, User, Menu } from 'lucide-react';
import { useLayout } from '@/app/lib/LayoutContext';

interface Props {
    title: string;
    subtitle?: string;
    product?: 'inventory' | 'studio' | 'admin';
}

export default function Topbar({ title, subtitle, product = 'admin' }: Props) {
    const { setMobileOpen } = useLayout();
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
                <button style={{ position: 'relative', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
                    <Bell size={16} />
                    <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, background: accent, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                </button>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                        <User size={16} />
                    </div>
                    <div className="desktop-only" style={{ lineHeight: 1.2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>Daniel O.</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>SuperAdmin</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
