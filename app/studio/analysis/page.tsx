'use client';
import React from 'react';
import Topbar from '../../../components/Topbar';
import { StudioService } from '../../lib/services/studio';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Settings, BarChart as BarChartIcon, Users, Sliders } from 'lucide-react';

const COLORS = ['#7c5cbf', '#6c9e4e', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

export default function AnalysisPage() {
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const load = async () => {
            const res = await StudioService.getAnalysisData();
            setData(res);
        };
        load();
    }, []);

    if (!data) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Analysis...</div>;

    const { overview, tryonCategories, roleDistribution, configuration } = data;

    return (
        <div>
            <Topbar title="Studio Analysis" subtitle="AI Try-On & User Analytics" product="studio" />
            <div style={{ padding: 'var(--content-padding)' }}>

                {/* Analysis Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
                    {overview.map((s: any) => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {s.icon === 'bar' ? <BarChartIcon size={20} /> : s.icon === 'settings' ? <Settings size={20} /> : <Sliders size={20} />}
                            </div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
                    {/* Try-On Categories Bar Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Try-On Categories</h3>
                        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>Breakdown of product try-ons by category</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tryonCategories} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#1a1a2e' }} width={80} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{ background: '#1a1a2e', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                                                    {payload[0].payload.category}: <b>{payload[0].value.toLocaleString()}</b> ({payload[0].payload.percentage}%)
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" fill="#7c5cbf" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Role Distribution Pie Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>User Role Distribution</h3>
                        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>Breakdown of user segments in Studio</p>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="role"
                                >
                                    {roleDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{ background: '#1a1a2e', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                                                    {payload[0].name}: <b>{payload[0].value.toLocaleString()}</b>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Try-On Configuration */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(20px, 5vw, 32px)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0ebff', color: '#7c5cbf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sliders size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Try-On Configuration</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        <div style={{ padding: 20, background: '#fafafa', borderRadius: 16, border: '1px solid #f0f0f0' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1a1a2e' }}>Core Engine Settings</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {configuration.core.map((c: any) => (
                                    <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, color: '#6b7280' }}>{c.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', background: c.bg || '#fff', color: c.color || '#7c5cbf', borderRadius: 6, border: c.bg ? 'none' : '1px solid #e5e7eb' }}>{c.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: 20, background: '#fafafa', borderRadius: 16, border: '1px solid #f0f0f0' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1a1a2e' }}>System Health</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {configuration.health.map((h: any) => (
                                    <div key={h.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, color: '#6b7280' }}>{h.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: h.color || '#1a1a2e' }}>{h.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
