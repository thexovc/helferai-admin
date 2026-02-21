const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'app/inventory/brands', title: 'Brands', icon: 'Tag', desc: 'Manage your product brands, logos, and manufacturer details.', columns: ['Brand Name', 'Manufacturer', 'Products Count', 'Status', 'Date Added'] },
  { path: 'app/inventory/categories', title: 'Categories', icon: 'Layers', desc: 'Organize your inventory into hierarchical categories.', columns: ['Category Name', 'Parent Category', 'Items Count', 'Status', 'Last Updated'] },
  { path: 'app/inventory/products', title: 'Products', icon: 'ShoppingBag', desc: 'Master list of all inventory items and SKUs.', columns: ['Product Name', 'SKU', 'Category', 'Price', 'Stock Level', 'Status'] },
  { path: 'app/inventory/units', title: 'Units', icon: 'Scale', desc: 'Define measurement units for your inventory items.', columns: ['Unit Name', 'Abbreviation', 'Base Unit', 'Conversion Rate', 'Status'] },
  
  { path: 'app/inventory/business-integrations', title: 'Business Integrations', icon: 'Building', desc: 'Manage integrations with partner businesses and B2B workflows.', columns: ['Business Name', 'Integration Type', 'API Key Status', 'Last Sync', 'Status'] },
  { path: 'app/inventory/integrations', title: 'Integrations', icon: 'Puzzle', desc: 'Manage external software integrations (e.g., ERP, Accounting)', columns: ['Integration Name', 'Provider', 'Auth Status', 'Last Sync', 'Status'] },
  { path: 'app/inventory/whatsapp-numbers', title: 'WhatsApp Numbers', icon: 'Phone', desc: 'Manage connected WhatsApp business numbers for communication.', columns: ['Phone Number', 'Display Name', 'Quality Rating', 'Messaging Limit', 'Status'] },
  
  { path: 'app/inventory/referral-analytics', title: 'Referral Analytics', icon: 'BarChart3', desc: 'Track performance metrics and ROI of your referral programs.', columns: ['Campaign', 'Total Referrals', 'Conversion Rate', 'Revenue Generated', 'Trend'] },
  { path: 'app/inventory/referral-tiers', title: 'Referral Tiers', icon: 'Trophy', desc: 'Manage tiered rewards for top referrers.', columns: ['Tier Name', 'Required Referrals', 'Reward Multiplier', 'Active Users', 'Status'] },
  { path: 'app/inventory/referrals', title: 'Referrals', icon: 'UserPlus', desc: 'View and audit individual user referrals and status.', columns: ['Referrer', 'Referred User', 'Date', 'Status', 'Reward Issued'] },
  { path: 'app/inventory/referral-configs', title: 'Referral Point Configs', icon: 'Settings', desc: 'Configure point values and rules for referral actions.', columns: ['Action Type', 'Points Awarded', 'Cool-down Period', 'Max Per Day', 'Status'] },
  { path: 'app/inventory/referral-rewards', title: 'Referral Rewards', icon: 'Gift', desc: 'Manage the catalog of rewards redeemable via points.', columns: ['Reward Name', 'Point Cost', 'Inventory Limit', 'Redeemed Count', 'Status'] },
  
  { path: 'app/inventory/send-broadcast', title: 'Send Broadcast', icon: 'Send', desc: 'Compose and send bulk messages to segmented audiences.', columns: ['Draft Name', 'Target Segment', 'Estimated Audience', 'Channel', 'Last Edited'] },
  { path: 'app/inventory/broadcast-history', title: 'Broadcast History', icon: 'Mail', desc: 'Review past broadcasts and delivery analytics.', columns: ['Broadcast Name', 'Date Sent', 'Channel', 'Delivered', 'Read Rate', 'Status'] },
  
  { path: 'app/inventory/admins', title: 'Admins', icon: 'ShieldCheck', desc: 'Manage administrative accounts and system access.', columns: ['Admin Name', 'Email', 'Role', 'Last Login', 'Status'] },
  { path: 'app/inventory/roles', title: 'Roles', icon: 'Users', desc: 'Define RBAC roles and granular permissions.', columns: ['Role Name', 'Description', 'Users Assigned', 'Permissions Count', 'Status'] },
  
  { path: 'app/inventory/activity-logs', title: 'User Activity Logs', icon: 'ClipboardList', desc: 'Audit trail of all administrative and user actions.', columns: ['User', 'Action', 'Resource', 'IP Address', 'Timestamp'] },
  { path: 'app/inventory/testimonials', title: 'Testimonials', icon: 'MessageSquare', desc: 'Manage user testimonials and reviews for public display.', columns: ['User Name', 'Rating', 'Content Snippet', 'Date Submitted', 'Status'] },
];

function generateComponent(page) {
    const iconImport = page.icon;
    const colHeaders = page.columns.map(c => `<th>${c}</th>`).join('\n                                ');
    const rowTds = page.columns.map(c => `<td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>`).join('\n                                    ');
    
    return `'use client';
import React from 'react';
import Topbar from '../../../components/Topbar';
import { Plus, Search, Filter, ${iconImport}, MoreVertical } from 'lucide-react';

export default function ${page.title.replace(/\s+/g, '')}Page() {
    return (
        <div>
            <Topbar title="${page.title}" subtitle="${page.desc}" product="inventory" />
            
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <${iconImport} size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>${page.title}</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage and organize your ${page.title.toLowerCase()}.</p>
                        </div>
                    </div>
                    <button style={{ 
                        background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 8, 
                        padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(108,158,78,0.2)'
                    }}>
                        <Plus size={18} /> Add New
                    </button>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input 
                            placeholder="Search ${page.title.toLowerCase()}..." 
                            style={{ 
                                width: '100%', height: 44, paddingLeft: 44, paddingRight: 16, 
                                borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
                                outline: 'none', fontSize: 14, color: '#1a1a2e', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }} 
                        />
                    </div>
                    <button style={{ 
                        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, 
                        padding: '0 16px', height: 44, display: 'flex', alignItems: 'center', gap: 8,
                        color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                    }}>
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {/* Data Table */}
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                ${colHeaders}
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Dummy Rows */}
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    ${rowTds}
                                    <td style={{ textAlign: 'center' }}>
                                        <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination Footer */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Showing 1 to 5 of 24 entries</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#9ca3af', cursor: 'pointer' }} disabled>Previous</button>
                            <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, fontSize: 13, color: '#1a1a2e', cursor: 'pointer' }}>Next</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
`;
}

pages.forEach(p => {
    const dir = path.join(__dirname, '..', p.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'page.tsx'), generateComponent(p));
    console.log('Created: ' + p.path);
});
