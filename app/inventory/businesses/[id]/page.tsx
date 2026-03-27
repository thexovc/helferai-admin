'use client';
import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Topbar from '../../../../components/Topbar';
import Pagination from '../../../../components/Pagination';
import StatusBadge from '../../../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, getDaysRemainingColor } from '../../../lib/utils';
import { Plus, Search, Eye, Edit2, Trash2, Calendar, DollarSign, Package, TrendingUp, Sparkles, MapPin, Globe, Mail, Phone, Building, ArrowLeft, Ban, Users, CreditCard, ShoppingCart, Receipt, MessageSquare as Whatsapp, Link2, Tag, LayoutGrid, UserCircle, Truck, BarChart2 } from 'lucide-react';
import { SkeletonPulse, TableSkeleton, KPISkeleton, DetailHeaderSkeleton } from '../../../../components/Skeleton';
import {
    useInventoryBusiness,
    useBusinessUsers,
    useBusinessSubscriptions,
    useBusinessProducts,
    useBusinessSales,
    useBusinessExpenses,
    useBusinessWhatsapp,
    useBusinessIntegrations,
    useBusinessAi
} from '@/api/inventory';
import { toast } from 'sonner';


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

const ActionBtn = ({ label, color = '#6c9e4e', icon, onClick }: { label: string; color?: string; icon: React.ReactNode; onClick?: () => void }) => (
    <button
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {icon} {label}
    </button>
);

function TabContent({ tab, businessId }: { tab: string; businessId: string }) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
    const thStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
    const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5' };

    // Reset page when tab changes
    React.useEffect(() => {
        setPage(1);
    }, [tab]);

    // Lazy matching hooks to tabs
    const { data: usersResp, isLoading: usersLoading } = useBusinessUsers(tab === 'users' ? businessId : '', page, pageSize);
    const { data: subsResp, isLoading: subsLoading } = useBusinessSubscriptions(tab === 'subscriptions' ? businessId : '', page, pageSize);
    const { data: productsResp, isLoading: productsLoading } = useBusinessProducts(tab === 'products' ? businessId : '', page, pageSize);
    const { data: salesResp, isLoading: salesLoading } = useBusinessSales(tab === 'sales' ? businessId : '', page, pageSize);
    const { data: expensesResp, isLoading: expensesLoading } = useBusinessExpenses(tab === 'expenses' ? businessId : '', page, pageSize);
    const { data: whatsappResp, isLoading: whatsappLoading } = useBusinessWhatsapp(tab === 'whatsapp' ? businessId : '', page, pageSize);
    const { data: integrationsResp, isLoading: integrationsLoading } = useBusinessIntegrations(tab === 'integrations' ? businessId : '', page, pageSize);
    const { data: aiData, isLoading: aiLoading } = useBusinessAi(tab === 'ai' ? businessId : '');

    const users = usersResp?.data || [];
    const subscriptions = subsResp?.data || [];
    const products = productsResp?.data || [];
    const sales = salesResp?.data || [];
    const expenses = expensesResp?.data || [];
    const whatsapp = whatsappResp?.data || [];
    const integrations = integrationsResp?.data || [];

    const getMeta = (resp: any) => resp?.meta || { total: 0, page: 1, pageSize: 10 };

    const handleCreateNew = () => {
        toast.info(`Create feature for ${tab} coming soon!`);
    };

    const handleAction = (type: 'view' | 'edit' | 'delete', item: any) => {
        const name = item.name || item.receiptNumber || item.plan || item.purpose || 'item';
        if (type === 'delete') {
            if (confirm(`Are you sure you want to delete ${name}?`)) {
                toast.success(`${name} deleted successfully`);
            }
        } else {
            toast.info(`${type.charAt(0).toUpperCase() + type.slice(1)}ing ${name}...`);
        }
    };

    const createBtn = (
        <button
            onClick={handleCreateNew}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#6c9e4e', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
            <Plus size={14} /> Create New
        </button>
    );

    const acts = (item: any) => (
        <div style={{ display: 'flex', gap: 4 }}>
            <button
                onClick={() => handleAction('view', item)}
                style={{ padding: 5, background: '#f0f9f0', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6c9e4e', display: 'flex' }}><Eye size={12} /></button>
            <button
                onClick={() => handleAction('edit', item)}
                style={{ padding: 5, background: '#f0f9ff', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#0284c7', display: 'flex' }}><Edit2 size={12} /></button>
            <button
                onClick={() => handleAction('delete', item)}
                style={{ padding: 5, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}><Trash2 size={12} /></button>
        </div>
    );

    const loadingEl = <TableSkeleton rows={5} cols={6} />;

    if (tab === 'users') {
        if (usersLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(users || []).map((u, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={tdStyle}><b>{u.name}</b></td>
                            <td style={tdStyle}>{u.email}</td>
                            <td style={tdStyle}>{u.role}</td>
                            <td style={tdStyle}><StatusBadge status={u.status} size="sm" /></td>
                            <td style={tdStyle}>{formatDate(u.createdAt)}</td>
                            <td style={tdStyle}>{acts(u)}</td>
                        </tr>)}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(usersResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(usersResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'subscriptions') {
        if (subsLoading) return loadingEl;
        return (
            <div>{createBtn}
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}><thead><tr>{['Plan', 'Amount', 'Start Date', 'End Date', 'Status', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>
                            {(subscriptions || []).map((s, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                                <td style={tdStyle}><b>{s.plan}</b></td>
                                <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(s.amount)}</td>
                                <td style={tdStyle}>{formatDate(s.startsAt)}</td>
                                <td style={tdStyle}>{formatDate(s.endsAt)}</td>
                                <td style={tdStyle}><StatusBadge status={s.status} size="sm" /></td>
                                <td style={tdStyle}>{acts(s)}</td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(subsResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(subsResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'products') {
        if (productsLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Name', 'SKU', 'Category', 'Brand', 'Price', 'Stock', 'Unit', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(products || []).map((p, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={tdStyle}><b>{p.name}</b></td>
                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{p.sku}</td>
                            <td style={tdStyle}>{p.category}</td>
                            <td style={tdStyle}>{p.brand}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(p.sellingPrice)}</td>
                            <td style={tdStyle}>{p.openingStock}</td>
                            <td style={tdStyle}>{p.unit}</td>
                            <td style={tdStyle}>{acts(p)}</td>
                        </tr>)}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(productsResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(productsResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'sales') {
        if (salesLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Receipt #', 'Customer', 'Amount', 'Payment', 'Processing', 'Date', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(sales || []).map((s, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{s.receiptNumber}</td>
                            <td style={tdStyle}>{s.customer}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(s.totalAmount)}</td>
                            <td style={tdStyle}><StatusBadge status={s.paymentStatus} size="sm" /></td>
                            <td style={tdStyle}><span style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: 6, fontSize: 11 }}>{s.processingStatus}</span></td>
                            <td style={tdStyle}>{formatDate(s.createdAt)}</td>
                            <td style={tdStyle}>{acts(s)}</td>
                        </tr>)}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(salesResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(salesResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'expenses') {
        if (expensesLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Date', 'Purpose', 'Account', 'Amount', 'Ref #', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(expenses || []).map((e, i) => <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                            <td style={tdStyle}>{formatDate(e.date)}</td>
                            <td style={tdStyle}>{e.purpose}</td>
                            <td style={tdStyle}>{e.account}</td>
                            <td style={{ ...tdStyle, fontWeight: 700 }}>{formatCurrency(e.amount)}</td>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11 }}>{e.referenceNumber}</td>
                            <td style={tdStyle}>{acts(e)}</td>
                        </tr>)}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(expensesResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(expensesResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'whatsapp') {
        if (whatsappLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Name', 'Number', 'Status', 'Connected', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(whatsapp || []).map((w, i) => (
                            <tr key={i}><td style={tdStyle}><b>{w.name}</b></td><td style={tdStyle}>{w.phoneNumber}</td>
                                <td style={tdStyle}><StatusBadge status={w.status} size="sm" /></td>
                                <td style={tdStyle}>{formatDate(w.createdAt)}</td>
                                <td style={tdStyle}>{acts(w)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(whatsappResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(whatsappResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'integrations') {
        if (integrationsLoading) return loadingEl;
        return (
            <div>{createBtn}
                <table style={tableStyle}><thead><tr>{['Name', 'Status', 'Connected At', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                        {(integrations || []).map((item, i) => (
                            <tr key={i} style={{ background: i % 2 ? '#fafafa' : '#fff' }}>
                                <td style={tdStyle}><b>{item.name}</b></td>
                                <td style={tdStyle}><StatusBadge status={item.status} size="sm" /></td>
                                <td style={tdStyle}>{formatDate(item.connectedAt)}</td>
                                <td style={tdStyle}>{acts(item)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: 20 }}>
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(getMeta(integrationsResp).total / pageSize)}
                        onPageChange={setPage}
                        totalItems={getMeta(integrationsResp).total}
                        pageSize={pageSize}
                    />
                </div>
            </div>
        );
    }

    if (tab === 'ai') {
        if (aiLoading) return loadingEl;
        if (!aiData) return null;
        return (
            <div style={{ padding: 8 }}>
                <div style={{ background: 'linear-gradient(135deg, #f0f9f0, #eaf4e3)', borderRadius: 16, padding: 28, border: '1.5px solid #6c9e4e20' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Sparkles size={22} color="#fff" />
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>AI Features Overview</h3>
                    <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>This business is using HelferAI's built-in AI features for inventory insights and demand forecasting.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            { label: 'Total AI Predictions', value: aiData.totalPredictions.value },
                            { label: 'Avg AI Accuracy', value: aiData.avgAccuracy.value },
                            { label: 'Tokens (In)', value: (aiData as any).inputTokensUsed || 0 },
                            { label: 'Tokens (Out)', value: (aiData as any).outputTokensUsed || 0 }
                        ].map(m => (
                            <div key={m.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 16px' }}>
                                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{m.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#6c9e4e' }}>{m.value}</div>
                            </div>
                        ))}
                    </div>
                    {aiData.trends && <p style={{ marginTop: 14, fontSize: 12, color: '#6c9e4e', fontWeight: 600 }}>Trend: {aiData.totalPredictions.trend}</p>}
                </div>
            </div>
        );
    }

    return null;
}

export default function BusinessDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const { data: business, isLoading, error } = useInventoryBusiness(params.id);
    const [activeTab, setActiveTab] = useState('users');

    const handleEditBusiness = () => {
        if (!business) return;
        toast.info(`Editing ${business.name}...`);
    };

    const handleSuspendBusiness = () => {
        if (!business) return;
        const msg = business.status === 'Suspended' ? 'unsuspend' : 'suspend';
        if (confirm(`Are you sure you want to ${msg} ${business.name}?`)) {
            toast.success(`Business ${business.name} has been ${msg}ed`);
        }
    };

    if (isLoading) {
        return (
            <div>
                <Topbar title="Business Detail" subtitle="..." product="inventory" />
                <div style={{ padding: 'var(--content-padding)' }}>
                    <DetailHeaderSkeleton />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                        {Array(4).fill(0).map((_, i) => <KPISkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }
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
                                    <span>📅 Joined: {business.dateJoined ? formatDate(business.dateJoined) : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleEditBusiness}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                <Edit2 size={14} /> Edit Business
                            </button>
                            <button
                                onClick={handleSuspendBusiness}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                <Ban size={14} /> {business.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 14 }}>
                    {[
                        { label: 'Sales Records', value: business.totalSales || 0, icon: <ShoppingCart size={16} />, accent: '#6c9e4e' },
                        { label: 'Expense Records', value: business.totalExpenses || 0, icon: <Receipt size={16} />, accent: '#f59e0b' },
                        { label: 'Products', value: business.totalProducts || 0, icon: <Package size={16} />, accent: '#7c5cbf' },
                        { label: 'Sub Ends', value: business.subEndDate ? formatDate(business.subEndDate) : 'N/A', icon: <CreditCard size={16} />, accent: '#6c9e4e' },
                        { label: 'Days Remaining', value: business.daysRemaining < 0 ? `${Math.abs(business.daysRemaining)}d overdue` : `${business.daysRemaining || 0}d`, icon: <BarChart2 size={16} />, accent: daysColor },
                        { label: 'Total Revenue', value: formatCurrency(business.totalRevenue || 0), icon: <DollarSign size={16} />, accent: '#22c55e' },
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
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{business.totalUsers || 0}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Total Users</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0', borderLeft: '3px solid #6b7280' }}>
                        <div style={{ color: '#6b7280', marginBottom: 6 }}><span>🕐</span></div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{business.lastLogin ? formatDateTime(business.lastLogin) : 'Never'}</div>
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
                        <TabContent tab={activeTab} businessId={business.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
