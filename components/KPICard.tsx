'use client';
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    subtitle?: string;
    icon?: React.ReactNode;
    accent?: string;
    large?: boolean;
}

export default function KPICard({ label, value, trend, trendUp, subtitle, icon, accent = '#6c9e4e', large }: Props) {
    return (
        <div style={{
            background: '#fff', borderRadius: 16, padding: large ? '28px 32px' : '20px 24px',
            boxShadow: '0 2px 8px rgba(108,158,78,0.08)', border: '1px solid #f0f0f0',
            display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden',
            transition: 'box-shadow 0.2s', cursor: 'default',
        }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,158,78,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(108,158,78,0.08)')}
        >
            {/* accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: accent, borderRadius: '16px 0 0 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                {icon && <div style={{ color: accent, opacity: 0.8 }}>{icon}</div>}
            </div>
            <div style={{ fontSize: large ? 36 : 28, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.1 }}>{value}</div>
            {(trend || subtitle) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {trend && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            color: trendUp ? '#16a34a' : '#dc2626',
                            fontSize: 12, fontWeight: 600,
                        }}>
                            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {trend}
                        </span>
                    )}
                    {subtitle && <span style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
