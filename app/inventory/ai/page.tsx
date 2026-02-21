'use client';
import React from 'react';
import Topbar from '../../../components/Topbar';
import { Sparkles, Brain, BarChart2, Zap, TrendingUp } from 'lucide-react';
import { InventoryService } from '../../lib/services/inventory';

export default function AIPage() {
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const load = async () => {
            const res = await InventoryService.getAIUsage();
            setData(res);
        };
        load();
    }, []);

    if (!data) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading AI Insights...</div>;

    const { stats, usageByBusiness } = data;

    return (
        <div>
            <Topbar title="AI Features" subtitle="Artificial intelligence insights for Inventory" product="inventory" />
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Hero */}
                <div style={{ background: 'linear-gradient(135deg, #6c9e4e, #4a7a36)', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                    <Sparkles size={24} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
                    <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#fff' }}>HelferAI Inventory Intelligence</h2>
                    <p style={{ margin: 0, fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'rgba(255,255,255,0.8)', maxWidth: 500 }}>AI-powered demand forecasting, low stock alerts, and business insights across all your customers.</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {stats.map((s: any) => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: `4px solid ${s.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                                <span style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: s.trend.startsWith('+') ? '#22c55e' : '#ef4444', fontWeight: 700, marginTop: 4 }}>{s.trend} this month</div>
                        </div>
                    ))}
                </div>

                {/* Business AI usage table */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f5' }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>AI Usage by Business</h3>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead>
                                <tr>
                                    {['Business', 'Predictions', 'Forecasts', 'Alerts', 'Accuracy', 'Status'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {usageByBusiness.map((r: any, i: number) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{r.biz}</td>
                                        <td style={{ color: '#374151' }}>{r.pred.toLocaleString()}</td>
                                        <td style={{ color: '#374151' }}>{r.forecast.toLocaleString()}</td>
                                        <td style={{ color: '#374151' }}>{r.alerts}</td>
                                        <td style={{ fontWeight: 700, color: '#22c55e' }}>{r.acc}</td>
                                        <td>
                                            <span style={{ padding: '3px 10px', background: r.active ? '#dcfce7' : '#f3f4f6', color: r.active ? '#15803d' : '#6b7280', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                                                {r.active ? 'Active' : 'Trial'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
