const fs = require('fs');
const path = require('path');

const appStudioDir = path.join(__dirname, '..', 'app', 'studio');
const compStudioDir = path.join(__dirname, '..', 'components', 'studio');

if (!fs.existsSync(compStudioDir)) {
    fs.mkdirSync(compStudioDir, { recursive: true });
}

// Ensure try-ons and analytics directories exist
const tryOnsDir = path.join(appStudioDir, 'try-ons');
if (!fs.existsSync(tryOnsDir)) fs.mkdirSync(tryOnsDir, { recursive: true });

const analyticsDir = path.join(appStudioDir, 'analytics');
if (!fs.existsSync(analyticsDir)) fs.mkdirSync(analyticsDir, { recursive: true });

// 1. Rename Analysis -> Analytics
const analysisPagePath = path.join(appStudioDir, 'analysis', 'page.tsx');
if (fs.existsSync(analysisPagePath)) {
    let content = fs.readFileSync(analysisPagePath, 'utf8');
    // Change to client component
    let clientContent = content.replace(/export default function AnalysisPage\(\)/, 'export default function AnalyticsPageClient()');
    clientContent = clientContent.replace(/import Topbar from '\.\.\/\.\.\/\.\.\/components\/Topbar';/, "import Topbar from '../Topbar';");
    clientContent = clientContent.replace(/title="Studio Analysis"/, 'title="Studio Analytics"');
    
    fs.writeFileSync(path.join(compStudioDir, 'AnalyticsPageClient.tsx'), clientContent);
    
    // Create new analytics page
    fs.writeFileSync(path.join(analyticsDir, 'page.tsx'), `import React from 'react';
import AnalyticsPageClient from '../../../components/studio/AnalyticsPageClient';

export default function AnalyticsPage() {
    return <AnalyticsPageClient />;
}
`);
    // Delete old analysis folder
    fs.rmSync(path.join(appStudioDir, 'analysis'), { recursive: true, force: true });
    console.log('Refactored Analysis -> Analytics');
}

// 2. Refactor Users
const usersPagePath = path.join(appStudioDir, 'users', 'page.tsx');
if (fs.existsSync(usersPagePath)) {
    let content = fs.readFileSync(usersPagePath, 'utf8');
    let clientContent = content.replace(/export default function UsersPage\(\)/, 'export default function UsersPageClient()');
    clientContent = clientContent.replace(/import Topbar from '\.\.\/\.\.\/\.\.\/components\/Topbar';/, "import Topbar from '../Topbar';");
    
    fs.writeFileSync(path.join(compStudioDir, 'UsersPageClient.tsx'), clientContent);
    
    fs.writeFileSync(usersPagePath, `import React from 'react';
import UsersPageClient from '../../../components/studio/UsersPageClient';

export default function UsersPage() {
    return <UsersPageClient />;
}
`);
    console.log('Refactored Users');
}

// 3. Create Try-Ons
const tryOnsClientContent = `'use client';
import React from 'react';
import Topbar from '../Topbar';
import { Camera, Search, Filter, MoreVertical } from 'lucide-react';

export default function TryOnsPageClient() {
    return (
        <div>
            <Topbar title="Try-Ons" subtitle="Manage and view user AI try-ons" product="studio" />
            
            <div style={{ padding: 'var(--content-padding)' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0ebff', color: '#7c5cbf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Camera size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' }}>Try-Ons</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>View all AI generated try-on images.</p>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input 
                            placeholder="Search try-ons..." 
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
                                <th>Image ID</th>
                                <th>User</th>
                                <th>Original Product</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th style={{ width: 60 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Dummy Rows */}
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
                                    <td><div style={{ height: 20, width: '100%', background: '#f5f5f5', borderRadius: 4 }} className="animate-pulse-soft"></div></td>
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

fs.writeFileSync(path.join(compStudioDir, 'TryOnsPageClient.tsx'), tryOnsClientContent);
fs.writeFileSync(path.join(tryOnsDir, 'page.tsx'), `import React from 'react';
import TryOnsPageClient from '../../../components/studio/TryOnsPageClient';

export default function TryOnsPage() {
    return <TryOnsPageClient />;
}
`);
console.log('Created Try-Ons');
