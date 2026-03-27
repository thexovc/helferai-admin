'use client';
import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricProps {
    variant: 'metric';
    label: string;
    value: string | number;
    trend: string;
    trendUp: boolean;
    subtitle?: string;
}

interface StatusProps {
    variant: 'status';
    label: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    accent: string;
    progress: number; // 0 to 100
}

type Props = MetricProps | StatusProps;

export default function DashboardCard(props: Props) {
    if (props.variant === 'metric') {
        const { label, value, trend, trendUp, subtitle } = props;
        return (
            <div style={{
                background: '#fff', borderRadius: 16, padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0',
                display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s'
            }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a2e' }}>{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', borderRadius: 99,
                        background: trendUp ? '#eaf4e3' : '#fee2e2',
                        color: trendUp ? '#6c9e4e' : '#dc2626',
                        fontSize: 12, fontWeight: 700
                    }}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                    {subtitle && <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{subtitle}</div>}
                </div>
            </div>
        );
    }

    const { label, value, subValue, icon: Icon, accent, progress } = props;
    return (
        <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0',
            display: 'flex', flexDirection: 'column', gap: 16, transition: 'all 0.2s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12, background: `${accent}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent
                }}>
                    <Icon size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{label}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a2e' }}>{value}</div>
                {subValue && <div style={{ fontSize: 14, fontWeight: 600, color: accent }}>{subValue}</div>}
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div style={{ height: 6, width: '100%', background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: accent, borderRadius: 99, transition: 'width 1s ease-out' }} />
                </div>
            </div>
        </div>
    );
}
