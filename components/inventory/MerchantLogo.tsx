'use client';
import React from 'react';

// The merchant's uploaded logo, or the first letter of their name if they have none
// (or the image fails to load)
export default function MerchantLogo({ name, logo, size = 32, radius = 8 }: {
    name?: string; logo?: string | null; size?: number; radius?: number;
}) {
    const [failed, setFailed] = React.useState(false);
    React.useEffect(() => setFailed(false), [logo]);
    const box: React.CSSProperties = { width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    if (logo && !failed) {
        return (
            <div style={{ ...box, background: '#fff', border: '1px solid #eef0ec' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={name ? `${name} logo` : 'Merchant logo'} onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        );
    }
    return (
        <div style={{ ...box, background: 'linear-gradient(135deg, #6c9e4e, #5b8441)' }}>
            <span style={{ fontSize: Math.round(size * 0.38), fontWeight: 800, color: '#fff' }}>{(name || '?').trim()[0]?.toUpperCase()}</span>
        </div>
    );
}
