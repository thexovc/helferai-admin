'use client';
import React, { useState, use } from 'react';
import Link from 'next/link';
import Topbar from '../../../../components/Topbar';
import StatusBadge from '../../../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, getDaysRemainingColor } from '../../../lib/utils';
import {
    ArrowLeft, Edit2, Ban, Users, CreditCard, Package, ShoppingCart, Receipt,
    MessageSquare as Whatsapp, Link2, Tag, LayoutGrid, UserCircle, Truck, Sparkles, Plus, Trash2, Eye,
    DollarSign, BarChart2,
} from 'lucide-react';
import { useInventoryBusiness } from '@/api/inventory';


const TABS = [
    { key: 'users', label: 'Users', icon: <Users size={14} /> },
    { key: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={14} /> },
    { key: 'products', label: 'Products', icon: <Package size={14} /> },
    { key: 'sales', label: 'Sales', icon: <ShoppingCart size={14} /> },
    { key: 'expenses', label: 'Expenses', icon: <Receipt size={14} /> },
    { key: 'whatsapp', label: 'WhatsApp', icon: <span style={{ fontSize: 12 }}>💬</span> },
    { key: 'integrations', label: 'Integrations', icon: <Link2 size={14} /> },
    { key: 'brands', label: 'Brands', icon: <Tag size={14} /> },
    { key: 'categories', label: 'Categories', icon: <LayoutGrid size={14} /> },
    { key: 'customers', label: 'Customers', icon: <UserCircle size={14} /> },
    { key: 'suppliers', label: 'Suppliers', icon: <Truck size={14} /> },
    { key: 'ai', label: 'AI', icon: <Sparkles size={14} /> },
];

const ActionBtn = ({ label, color = '#6c9e4e', icon }: { label: string; color?: string; icon: React.ReactNode }) => (
    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {icon} {label}
    </button>
);

function TabContent({ tab, business }: { tab: string; business: any }) {
    const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
    const thStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
    const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5' };
    const createBtn = (
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#6c9e4e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
            <Plus size={14} /> Create New
        </button>
    );

    const acts = (
        <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ padding: 5, background: '#f0f9f0', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6c9e4e', display: 'flex' }}><Eye size={12} /></button>
            <button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button>
            <button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button>
        </div>
    );

    if (tab === 'users') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Name', 'Email', 'Role', 'Phone', 'Store', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[{ name: 'Aisha Bello', email: 'aisha@konga.ng', role: 'Manager', phone: '+234 801 000 0001', store: 'Main Store', status: 'Active' },
                    { name: 'Emeka Obi', email: 'emeka@konga.ng', role: 'Cashier', phone: '+234 802 000 0002', store: 'Branch 2', status: 'Active' },
                    { name: 'Lola Ade', email: 'lola@konga.ng', role: 'Viewer', phone: '+234 803 000 0003', store: 'Main Store', status: 'Suspended' },
                    ].map((u, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                        <td style={tdStyle}><b>{u.name}</b></td><td style={tdStyle}>{u.email}</td><td style={tdStyle}>{u.role}</td>
                        <td style={tdStyle}>{u.phone}</td><td style={tdStyle}>{u.store}</td>
                        <td style={tdStyle}><StatusBadge status={u.status} size="sm" /></td><td style={tdStyle}>{acts}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'subscriptions') return (
        <div>{createBtn}
            <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}><thead><tr>{['Plan', 'Payment Method', 'Start Date', 'End Date', 'Price', 'Billing', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {[{ plan: 'Enterprise', paymentMethod: 'Paystack Card •••• 4242', start: '2026-01-01', end: '2026-12-31', price: 250000, billingCycle: 'Annual', status: 'Active' },
                        { plan: 'Pro', paymentMethod: 'Paystack Card •••• 4242', start: '2025-01-01', end: '2025-12-31', price: 85000, billingCycle: 'Annual', status: 'Expired' },
                        ].map((s, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={tdStyle}><b>{s.plan}</b></td>
                            <td style={{ ...tdStyle, fontSize: 12, color: '#6b7280' }}>{s.paymentMethod}</td>
                            <td style={tdStyle}>{formatDate(s.start)}</td>
                            <td style={tdStyle}>{formatDate(s.end)}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>{s.price > 0 ? formatCurrency(s.price) : '—'}</td>
                            <td style={tdStyle}><span style={{ padding: '2px 8px', background: s.billingCycle === 'Annual' ? '#eaf4e3' : '#f3f4f6', color: s.billingCycle === 'Annual' ? '#5b8441' : '#6b7280', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.billingCycle}</span></td>
                            <td style={tdStyle}><StatusBadge status={s.status} size="sm" /></td>
                            <td style={tdStyle}><div style={{ display: 'flex', gap: 4 }}><button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button><button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button></div></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );


    if (tab === 'products') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Name', 'Brand', 'Category', 'SKU', 'Qty', 'Unit', 'Cost', 'Price', 'Tax', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[
                        { name: 'Smart TV 55"', brand: 'Samsung', cat: 'Electronics', sku: 'SMT-55', qty: 12, unit: 'PC', cost: '₦180K', price: '₦220K', tax: '7.5%' },
                        { name: 'iPhone 16 Pro', brand: 'Apple', cat: 'Phones', sku: 'IPH-16P', qty: 8, unit: 'PC', cost: '₦600K', price: '₦750K', tax: '7.5%' },
                        { name: 'Office Chair', brand: 'Ikea', cat: 'Furniture', sku: 'OFC-CH1', qty: 25, unit: 'PC', cost: '₦45K', price: '₦65K', tax: '5%' },
                    ].map((p, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                        <td style={tdStyle}><b>{p.name}</b></td><td style={tdStyle}>{p.brand}</td><td style={tdStyle}>{p.cat}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{p.sku}</td><td style={tdStyle}>{p.qty}</td>
                        <td style={tdStyle}>{p.unit}</td><td style={tdStyle}>{p.cost}</td><td style={tdStyle}>{p.price}</td>
                        <td style={tdStyle}>{p.tax}</td><td style={tdStyle}>{acts}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'sales') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Customer', 'Receipt #', 'Date', 'Product', 'SKU', 'Unit Price', 'Outstanding', 'Total', 'Payment', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[
                        { customer: 'John Doe', receipt: 'RCP-0001', date: '2026-02-20', product: 'Smart TV 55"', sku: 'SMT-55', price: '₦220K', outstanding: '₦0', total: '₦220K', payment: 'Paid' },
                        { customer: 'Mary Eze', receipt: 'RCP-0002', date: '2026-02-19', product: 'iPhone 16 Pro', sku: 'IPH-16P', price: '₦750K', outstanding: '₦100K', total: '₦750K', payment: 'Partial' },
                    ].map((s, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                        <td style={tdStyle}>{s.customer}</td><td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{s.receipt}</td>
                        <td style={tdStyle}>{formatDate(s.date)}</td><td style={tdStyle}>{s.product}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{s.sku}</td>
                        <td style={tdStyle}>{s.price}</td><td style={{ ...tdStyle, color: s.outstanding !== '₦0' ? '#ef4444' : '#22c55e' }}>{s.outstanding}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{s.total}</td>
                        <td style={tdStyle}><span style={{ padding: '2px 8px', background: s.payment === 'Paid' ? '#dcfce7' : '#fef9c3', color: s.payment === 'Paid' ? '#15803d' : '#a16207', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.payment}</span></td>
                        <td style={tdStyle}>{acts}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'expenses') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Date', 'Purpose', 'Employee', 'Approved By', 'Cost', 'Account', 'Ref #', 'Description'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[
                        { date: '2026-02-18', purpose: 'Office Supplies', emp: 'Aisha Bello', approver: 'Emeka Obi', cost: '₦25K', account: 'Petty Cash', ref: 'EXP-0001', desc: 'Printer paper and pens' },
                        { date: '2026-02-15', purpose: 'Logistics', emp: 'Lola Ade', approver: 'Aisha Bello', cost: '₦80K', account: 'Operations', ref: 'EXP-0002', desc: 'Delivery van fuel' },
                    ].map((e, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                        <td style={tdStyle}>{formatDate(e.date)}</td><td style={tdStyle}>{e.purpose}</td><td style={tdStyle}>{e.emp}</td>
                        <td style={tdStyle}>{e.approver}</td><td style={{ ...tdStyle, fontWeight: 700 }}>{e.cost}</td>
                        <td style={tdStyle}>{e.account}</td><td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{e.ref}</td>
                        <td style={{ ...tdStyle, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'whatsapp') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Name', 'Number', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[{ name: 'Support Bot', number: '+234 800 000 0099', status: 'Active' }].map((w, i) => (
                        <tr key={i}><td style={tdStyle}><b>{w.name}</b></td><td style={tdStyle}>{w.number}</td>
                            <td style={tdStyle}><StatusBadge status={w.status} size="sm" /></td>
                            <td style={tdStyle}><div style={{ display: 'flex', gap: 4 }}><button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button><button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'integrations') return (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Name', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {[{ name: 'Paystack', status: 'Active' }, { name: 'Flutterwave', status: 'Inactive' }, { name: 'Termii SMS', status: 'Active' }].map((item, i) => (
                        <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={tdStyle}><b>{item.name}</b></td><td style={tdStyle}><StatusBadge status={item.status} size="sm" /></td>
                            <td style={tdStyle}>{acts}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Brands, Categories, Customers, Suppliers — same simple pattern
    const simpleList = (items: { name: string; count: number }[]) => (
        <div>{createBtn}
            <table style={tableStyle}><thead><tr>{['Name', 'Product Count', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                    {items.map((item, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                        <td style={tdStyle}><b>{item.name}</b></td>
                        <td style={tdStyle}><span style={{ padding: '2px 10px', background: '#eaf4e3', color: '#5b8441', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{item.count}</span></td>
                        <td style={tdStyle}><div style={{ display: 'flex', gap: 4 }}><button style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button><button style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button></div></td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );

    if (tab === 'brands') return simpleList([{ name: 'Samsung', count: 45 }, { name: 'Apple', count: 32 }, { name: 'Ikea', count: 18 }]);
    if (tab === 'categories') return simpleList([{ name: 'Electronics', count: 120 }, { name: 'Furniture', count: 60 }, { name: 'Phones', count: 95 }]);
    if (tab === 'customers') return simpleList([{ name: 'John Doe', count: 12 }, { name: 'Mary Eze', count: 5 }, { name: 'Ahmed Aliyu', count: 8 }]);
    if (tab === 'suppliers') return simpleList([{ name: 'TechImports Ltd', count: 200 }, { name: 'Lagos Distributors', count: 150 }]);

    if (tab === 'ai') return (
        <div style={{ padding: 8 }}>
            <div style={{ background: 'linear-gradient(135deg, #f0f9f0, #eaf4e3)', borderRadius: 16, padding: 28, border: '1.5px solid #6c9e4e20' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Sparkles size={22} color="#fff" />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>AI Features Overview</h3>
                <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>This business is using HelferAI's built-in AI features for inventory insights and demand forecasting.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[{ label: 'AI Predictions Run', value: '142' }, { label: 'Demand Forecasts', value: '38' }, { label: 'Low Stock Alerts', value: '12' }, { label: 'AI Accuracy Rate', value: '94%' }].map(m => (
                        <div key={m.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{m.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#6c9e4e' }}>{m.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return null;
}

export default function BusinessDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const { data: business, isLoading, error } = useInventoryBusiness(params.id);
    const [activeTab, setActiveTab] = useState('users');

    if (isLoading) return <div style={{ padding: 40, color: '#9ca3af' }}>Loading Business Details...</div>;
    if (error || !business) return <div style={{ padding: 40, color: '#ef4444' }}>Error: Business not found</div>;

    const daysColor = getDaysRemainingColor(business.daysRemaining);


    return (
        <div>
            <Topbar title={business.name} subtitle="Business Details" product="inventory" />
            <div style={{ padding: 28 }}>
                <Link href="/inventory/businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
                    <ArrowLeft size={14} /> Back to Businesses
                </Link>

                {/* Identity Card */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #6c9e4e, #5b8441)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{business.name[0]}</span>
                            </div>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{business.name}</h2>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                    <StatusBadge status={business.status} />
                                    <span style={{ padding: '3px 10px', background: '#eaf4e3', color: '#5b8441', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{business.currentPlan}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '4px 24px', fontSize: 13, color: '#6b7280' }}>
                                    <span>📧 {business.email}</span>
                                    <span>🌐 {business.website}</span>
                                    <span>📍 {business.address}</span>
                                    <span>🏭 {business.industry} · {business.country}</span>
                                    <span>📋 Reg: {business.registrationNumber}</span>
                                    <span>💰 Tax: {business.taxNumber}</span>
                                    <span>📅 Joined: {formatDate(business.dateJoined)}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                <Edit2 size={14} /> Edit Business
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                <Ban size={14} /> Suspend
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 14 }}>
                    {[
                        { label: 'Sales Records', value: business.totalSales, icon: <ShoppingCart size={16} />, accent: '#6c9e4e' },
                        { label: 'Expense Records', value: business.totalExpenses, icon: <Receipt size={16} />, accent: '#f59e0b' },
                        { label: 'Products', value: business.totalProducts, icon: <Package size={16} />, accent: '#7c5cbf' },
                        { label: 'Sub Ends', value: formatDate(business.subEndDate), icon: <CreditCard size={16} />, accent: '#6c9e4e' },
                        { label: 'Days Remaining', value: business.daysRemaining < 0 ? `${Math.abs(business.daysRemaining)}d overdue` : `${business.daysRemaining}d`, icon: <BarChart2 size={16} />, accent: daysColor },
                        { label: 'Total Revenue', value: formatCurrency(business.totalRevenue), icon: <DollarSign size={16} />, accent: '#22c55e' },
                    ].map(k => (
                        <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: `3px solid ${k.accent}` }}>
                            <div style={{ color: k.accent, marginBottom: 6 }}>{k.icon}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{k.value}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{k.label}</div>
                        </div>
                    ))}
                </div>
                {/* KPI Row 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: '3px solid #0ea5e9' }}>
                        <div style={{ color: '#0ea5e9', marginBottom: 6 }}><Users size={16} /></div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{business.totalUsers}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Total Users</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: '3px solid #6b7280' }}>
                        <div style={{ color: '#6b7280', marginBottom: 6 }}><span>🕐</span></div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{formatDateTime(business.lastLogin)}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Last Login</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: '1px solid #f0f0f0', background: '#f9fafb' }}>
                        {TABS.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', border: 'none',
                                background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                color: activeTab === tab.key ? '#6c9e4e' : '#6b7280',
                                borderBottom: activeTab === tab.key ? '2px solid #6c9e4e' : '2px solid transparent',
                                transition: 'all 0.15s',
                            }}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ padding: 20 }}>
                        <TabContent tab={activeTab} business={business} />
                    </div>
                </div>
            </div>
        </div>
    );
}
