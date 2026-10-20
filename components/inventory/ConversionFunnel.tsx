'use client';
import React from 'react';

interface FunnelStepProps {
    label: string;
    value: number;
    note?: string;
    progress: number;
    color: string;
}

const FunnelStep = ({ label, value, note, progress, color }: FunnelStepProps) => (
    <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e', whiteSpace: 'nowrap' }}>
                {value.toLocaleString()}
                {note && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: '#64748b' }}>{note}</span>}
            </span>
        </div>
        <div style={{ position: 'relative', height: 32, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`,
                background: color, borderRadius: 8, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
        </div>
    </div>
);

export interface FunnelData {
    registered: number;
    trialing: number;
    paying: number;
    stillTrialing?: number;
    trialEnded?: number;
    trialToPaidRate?: number | null;
}

// Share as a whole-number-ish percentage; 0 when there is nothing to divide by
const pct = (part: number, whole: number) => whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

export default function ConversionFunnel({ data }: { data?: FunnelData }) {
    const reg = data?.registered ?? 0;
    const tri = data?.trialing ?? 0;
    const pay = data?.paying ?? 0;
    const stillTrialing = data?.stillTrialing;
    const trialEnded = data?.trialEnded;
    const trialToPaid = data?.trialToPaidRate;

    return (
        <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
            height: '100%'
        }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Conversion Funnel</h3>
            <p style={{ margin: '0 0 28px', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Businesses that joined in this period</p>

            {reg === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0' }}>No new businesses in this period</div>
            ) : (
                <>
                    <FunnelStep label="Signed up" value={reg} progress={100} color="#6c9e4e" />
                    <FunnelStep label="Started a free trial" value={tri} note={`${pct(tri, reg)}% of sign-ups`} progress={pct(tri, reg)} color="#b7d7a0" />
                    <FunnelStep label="Became paying" value={pay} note={`${pct(pay, reg)}% of sign-ups`} progress={pct(pay, reg)} color="#3f7d2c" />

                    {stillTrialing !== undefined && trialEnded !== undefined && (
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                            <span>Still on trial: <b style={{ color: '#1a1a2e' }}>{stillTrialing}</b></span>
                            <span>Trial ended without paying: <b style={{ color: '#ef4444' }}>{trialEnded}</b></span>
                        </div>
                    )}
                </>
            )}

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>Sign-up to paying</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{pct(pay, reg)}%</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{pay} of {reg}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>Finished trials that paid</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{trialToPaid === null || trialToPaid === undefined ? '–' : `${trialToPaid}%`}</div>
                    {trialEnded !== undefined && (
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{pay} of {pay + trialEnded}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
