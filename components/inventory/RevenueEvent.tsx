'use client';
import React from 'react';
import { TrendingUp, UserPlus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface RevenueEventProps {
    title: string;
    description: string;
    amount: string;
    status: 'CONFIRMED' | 'PENDING' | 'ALERT';
    iconType: 'expansion' | 'new' | 'failed';
}

const IconBox = ({ type, color }: { type: string; color: string }) => {
    const Icon = type === 'expansion' ? TrendingUp : type === 'new' ? UserPlus : AlertCircle;
    return (
        <div style={{
            width: 42, height: 42, borderRadius: 12, background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0
        }}>
            <Icon size={20} />
        </div>
    );
};

export default function RevenueEvent({ title, description, amount, status, iconType }: RevenueEventProps) {
    const statusColor = status === 'CONFIRMED' ? '#22c55e' : status === 'PENDING' ? '#3b82f6' : '#ef4444';
    const mainColor = iconType === 'expansion' ? '#22c55e' : iconType === 'new' ? '#3b82f6' : '#ef4444';

    return (
        <div style={{
            background: '#fff', borderRadius: 16, padding: '16px 24px',
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12,
            border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
            <IconBox type={iconType} color={mainColor} />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{description}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: status === 'ALERT' ? '#ef4444' : '#1a1a2e' }}>{amount}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: statusColor, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {status === 'CONFIRMED' ? <CheckCircle2 size={10} /> : status === 'PENDING' ? <Clock size={10} /> : <AlertCircle size={10} />}
                    {status}
                </div>
            </div>
        </div>
    );
}
