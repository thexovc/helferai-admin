'use client';
import React from 'react';
import { Building2, ArrowUpRight, CheckCircle2, UserPlus, Info, ShoppingCart, Package, Activity } from 'lucide-react';
import * as T from '@/api/inventory/inventory.types';

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

const getActionStyles = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('sale')) return { icon: ShoppingCart, color: '#22c55e' };
    if (act.includes('product')) return { icon: Package, color: '#7c5cbf' };
    if (act.includes('upgrade')) return { icon: ArrowUpRight, color: '#7c5cbf' };
    if (act.includes('register')) return { icon: UserPlus, color: '#6c9e4e' };
    if (act.includes('activity')) return { icon: Activity, color: '#3b82f6' };
    return { icon: Info, color: '#94a3b8' };
};

const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
};

export default function RecentActions({ actions = [] }: { actions?: T.RecentAction[] }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 20, padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
            height: '100%'
        }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>Recent Actions</h3>

            {actions.length > 0 ? (
                actions.map(action => {
                    const styles = getActionStyles(action.action);
                    return (
                        <ActionItem 
                            key={action.id} 
                            businessName={action.businessName} 
                            action={action.action.replace(/_/g, ' ')} 
                            time={formatRelativeTime(action.timestamp)} 
                            icon={styles.icon} 
                            color={styles.color} 
                        />
                    );
                })
            ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '40px 0' }}>No recent actions</div>
            )}
        </div>
    );
}
