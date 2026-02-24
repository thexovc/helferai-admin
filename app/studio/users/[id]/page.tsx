'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Topbar from '../../../../components/Topbar';
import StatusBadge from '../../../../components/StatusBadge';
import { STUDIO_USERS } from '../../../lib/data';
import { formatCurrency, formatDate, formatDateTime, getDaysRemainingColor } from '../../../lib/utils';
import {
    ArrowLeft, Edit2, Ban, UserCircle, Image as ImageIcon, Video, Wand2,
    Calendar, CreditCard, DollarSign, MapPin, Mail, RefreshCw, Trash2, Plus
} from 'lucide-react';

export default function StudioUserDetailPage({ params }: { params: { id: string } }) {
    const user = STUDIO_USERS.find(u => u.id === params.id) || STUDIO_USERS[0];
    const daysColor = getDaysRemainingColor(user.daysRemaining);

    return (
        <div>
            <Topbar title={user.name} subtitle="User Profile Details" product="studio" />
            <div style={{ padding: 28 }}>
                <Link href="/studio/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
                    <ArrowLeft size={14} /> Back to Users
                </Link>

                {/* Header Card */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #7c5cbf, #6347a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124,92,191,0.2)' }}>
                                <UserCircle size={40} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>{user.name}</h2>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                    <StatusBadge status={user.status} />
                                    <span style={{ padding: '4px 12px', background: '#f0ebff', color: '#7c5cbf', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{user.currentPlan} Plan</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '10px 32px', fontSize: 14, color: '#6b7280' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> {user.email}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} /> {user.address}, {user.country}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} /> Joined: {formatDate(user.dateJoined)}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={16} /> Last Login: {formatDateTime(user.lastLogin)}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#7c5cbf', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,92,191,0.3)' }}>
                                <Edit2 size={16} /> Edit Profile
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                                <Ban size={16} /> Suspend Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {[
                        { label: 'Images Generated', value: user.imagesGenerated.toLocaleString(), icon: <ImageIcon size={20} />, color: '#7c5cbf', bg: '#f0ebff' },
                        { label: 'Reels Created', value: user.reelsGenerated.toLocaleString(), icon: <Video size={20} />, color: '#7c5cbf', bg: '#f0ebff' },
                        { label: 'Studio Edits', value: user.editsCount.toLocaleString(), icon: <Wand2 size={20} />, color: '#7c5cbf', bg: '#f0ebff' },
                        { label: 'Sub Ends', value: formatDate(user.subEndDate), icon: <Calendar size={20} />, color: '#7c5cbf', bg: '#f0ebff' },
                        { label: 'Days Remaining', value: user.daysRemaining < 0 ? `${Math.abs(user.daysRemaining)}d overdue` : `${user.daysRemaining}d`, icon: <Calendar size={20} />, color: daysColor, bg: `${daysColor}15` },
                        { label: 'Revenue Generated', value: formatCurrency(user.totalRevenue), icon: <DollarSign size={20} />, color: '#22c55e', bg: '#dcfce7' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderTop: `4px solid ${s.color}` }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                {s.icon}
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Subscription History */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Subscription History</h3>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#7c5cbf', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
                        <Plus size={14} /> Create New
                    </button>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Plan', 'Payment Method', 'Start Date', 'End Date', 'Price', 'Billing', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, textAlign: 'left' as const, borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' as const }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ background: '#fff' }}>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13, fontWeight: 600 }}>{user.currentPlan}</td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 12, color: '#6b7280' }}>Paystack Card •••• 6011</td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>{formatDate(user.subStartDate)}</td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>{formatDate(user.subEndDate)}</td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13, fontWeight: 700 }}>{user.amountPaying > 0 ? formatCurrency(user.amountPaying) : '—'}</td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}>
                                        <span style={{ padding: '2px 8px', background: user.billingCycle === 'Annual' ? '#f0ebff' : '#f3f4f6', color: user.billingCycle === 'Annual' ? '#7c5cbf' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{user.billingCycle}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}><StatusBadge status={user.status} size="sm" /></td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button>
                                            <button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                                {user.previousPlan !== '-' && (
                                    <tr style={{ background: '#fafafa' }}>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13, fontWeight: 600 }}>{user.previousPlan}</td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 12, color: '#6b7280' }}>Paystack Card •••• 6011</td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>—</td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>—</td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', fontSize: 13, fontWeight: 700 }}>—</td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}>
                                            <span style={{ padding: '2px 8px', background: '#f3f4f6', color: '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{user.billingCycle}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}><StatusBadge status="Expired" size="sm" /></td>
                                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button>
                                                <button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
