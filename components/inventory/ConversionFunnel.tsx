'use client';
import React from 'react';
import { TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';

interface FunnelStepProps {
    label: string;
    value: number | string;
    percentage?: string;
    progress: number;
    color: string;
}

const FunnelStep = ({ label, value, percentage, progress, color }: FunnelStepProps) => (
    <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>{value}</span>
        </div>
        <div style={{ position: 'relative', height: 40, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`,
                background: color, borderRadius: 8, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
            {percentage && (
                <div style={{
                    position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 12, fontWeight: 800, color: '#ef4444'
                }}>
                    {percentage}
                </div>
            )}
        </div>
    </div>
);

export default function ConversionFunnel({ data }: { data?: { registered: number; trialing: number; paying: number } }) {
    const reg = data?.registered ?? 2480;
    const tri = data?.trialing ?? 1120;
    const pay = data?.paying ?? 856;

    const triPercent = ((tri / reg) * 100).toFixed(1);
    const payPercent = ((pay / reg) * 100).toFixed(1);
    const overallYield = payPercent;

    return (
        <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
            height: '100%'
        }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Conversion Funnel</h3>
            <p style={{ margin: '0 0 32px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Registered to Paying conversion path</p>

            <div style={{ paddingRight: 40 }}>
                <FunnelStep label="Registered" value={reg.toLocaleString()} progress={100} color="#6c9e4e" />
                <FunnelStep label="Trialing" value={tri.toLocaleString()} progress={(tri / reg) * 100} color="#eaf4e3" percentage={`${triPercent}%`} />
                <FunnelStep label="Paying" value={pay.toLocaleString()} progress={(pay / reg) * 100} color="#6c9e4e" percentage={`${payPercent}%`} />
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>Overall Yield</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{overallYield}%</div>
                </div>
                <button style={{
                    background: '#6c9e4e', color: '#fff', border: 'none', padding: '10px 18px',
                    borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6
                }}>
                    Improve Retention
                </button>
            </div>
        </div>
    );
}
