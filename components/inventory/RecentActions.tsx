'use client';
import React from 'react';
import { Building2, ArrowUpRight, CheckCircle2, UserPlus, Info } from 'lucide-react';

interface ActionItemProps {
    businessName: string;
    action: string;
    time: string;
    icon: any;
    color: string;
}

const ActionItem = ({ businessName, action, time, icon: Icon, color }: ActionItemProps) => (
    <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        <div style={{
            width: 36, height: 36, borderRadius: 10, background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, flexShrink: 0
        }}>
            <Icon size={18} />
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>{businessName}</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{action}</div>
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{time}</div>
    </div>
);

export default function RecentActions() {
    return (
        <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
            height: '100%'
        }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Recent Actions</h3>

            <ActionItem businessName="NexaStream Corp" action="Upgraded to Enterprise Plan" time="2m ago" icon={ArrowUpRight} color="#7c5cbf" />
            <ActionItem businessName="Lumina Retail" action="New business registered" time="15m ago" icon={UserPlus} color="#6c9e4e" />
            <ActionItem businessName="Swift Logistics" action="Payment successful (₦45,000)" time="1h ago" icon={CheckCircle2} color="#22c55e" />
            <ActionItem businessName="Oceanic Blue" action="Trial expired" time="3h ago" icon={Info} color="#ef4444" />
            <ActionItem businessName="Vantage Solutions" action="Added 5 new products" time="5h ago" icon={Building2} color="#7c5cbf" />
        </div>
    );
}
