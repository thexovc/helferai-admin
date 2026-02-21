import type { AdminUser, Business, Role, Permission, StudioUser, ChartDataPoint } from './types';

// ─── Permissions ──────────────────────────────────────────────────────────────
export const PERMISSIONS: Permission[] = [
  { id: 'p1', label: 'View Dashboard', key: 'view_dashboard' },
  { id: 'p2', label: 'Manage Subscriptions', key: 'manage_subscriptions' },
  { id: 'p3', label: 'Manage Users', key: 'manage_users' },
  { id: 'p4', label: 'Edit Settings', key: 'edit_settings' },
  { id: 'p5', label: 'View Financial Data', key: 'view_financial' },
  { id: 'p6', label: 'Manage Businesses', key: 'manage_businesses' },
  { id: 'p7', label: 'Suspend Accounts', key: 'suspend_accounts' },
  { id: 'p8', label: 'Force Logout', key: 'force_logout' },
  { id: 'p9', label: 'Manage Roles', key: 'manage_roles' },
  { id: 'p10', label: 'View Reports', key: 'view_reports' },
  { id: 'p11', label: 'Export Data', key: 'export_data' },
  { id: 'p12', label: 'Reset Passwords', key: 'reset_passwords' },
];

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES: Role[] = [
  {
    id: 'r1', name: 'SuperAdmin', description: 'Full platform access, all permissions', userCount: 2,
    permissions: ['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12'],
  },
  {
    id: 'r2', name: 'Admin', description: 'Manage day-to-day operations', userCount: 5,
    permissions: ['p1','p2','p3','p5','p6','p7','p10','p12'],
  },
  {
    id: 'r3', name: 'Analyst', description: 'Read-only analytics and reports', userCount: 4,
    permissions: ['p1','p5','p10'],
  },
  {
    id: 'r4', name: 'Support', description: 'Customer support operations', userCount: 8,
    permissions: ['p1','p3','p12'],
  },
  {
    id: 'r5', name: 'Viewer', description: 'Dashboard view only', userCount: 3,
    permissions: ['p1'],
  },
];

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const ADMIN_USERS: AdminUser[] = [
  { id: 'u1', name: 'Daniel Osariemen', email: 'daniel@helferai.com', role: 'SuperAdmin', area: 'Both', status: 'Active', lastLogin: '2026-02-21T07:30:00Z', createdAt: '2024-01-10T09:00:00Z' },
  { id: 'u2', name: 'Amina Okafor', email: 'amina@helferai.com', role: 'Admin', area: 'Inventory', status: 'Active', lastLogin: '2026-02-20T15:00:00Z', createdAt: '2024-03-12T09:00:00Z' },
  { id: 'u3', name: 'Tunde Adeyemi', email: 'tunde@helferai.com', role: 'Analyst', area: 'Both', status: 'Active', lastLogin: '2026-02-19T10:00:00Z', createdAt: '2024-05-01T09:00:00Z' },
  { id: 'u4', name: 'Chisom Eze', email: 'chisom@helferai.com', role: 'Support', area: 'Studio', status: 'Active', lastLogin: '2026-02-20T11:00:00Z', createdAt: '2024-07-15T09:00:00Z' },
  { id: 'u5', name: 'Nkechi Bello', email: 'nkechi@helferai.com', role: 'Viewer', area: 'Inventory', status: 'Suspended', lastLogin: '2026-01-05T09:00:00Z', createdAt: '2024-09-08T09:00:00Z' },
  { id: 'u6', name: 'Emeka Johnson', email: 'emeka@helferai.com', role: 'Admin', area: 'Studio', status: 'Active', lastLogin: '2026-02-18T08:00:00Z', createdAt: '2024-11-20T09:00:00Z' },
  { id: 'u7', name: 'Fatimah Sule', email: 'fatimah@helferai.com', role: 'Support', area: 'Both', status: 'Active', lastLogin: '2026-02-21T06:00:00Z', createdAt: '2025-01-05T09:00:00Z' },
  { id: 'u8', name: 'Olumide Adegoke', email: 'olumide@helferai.com', role: 'Analyst', area: 'Inventory', status: 'Inactive', lastLogin: '2026-01-20T09:00:00Z', createdAt: '2025-02-14T09:00:00Z' },
];

// ─── Businesses ───────────────────────────────────────────────────────────────
export const BUSINESSES: Business[] = [
  {
    id: 'b1', name: 'Konga Retail Ltd', email: 'admin@konga.ng', address: '1 Konga Way, Lagos', registrationNumber: 'RC-123456', website: 'konga.com', taxNumber: 'TIN-789012', industry: 'Retail', country: 'Nigeria',
    status: 'Active', currentPlan: 'Enterprise', previousPlan: 'Pro', subStartDate: '2026-01-01', subEndDate: '2026-12-31', daysRemaining: 313, amountPaying: 250000, billingCycle: 'Annual', autoRenew: true, lastLogin: '2026-02-21T08:00:00Z', dateJoined: '2023-06-01', totalRevenue: 15000000, totalSales: 820, totalExpenses: 340, totalProducts: 1200, totalUsers: 45,
  },
  {
    id: 'b2', name: 'Shoprite Nigeria', email: 'admin@shoprite.ng', address: '5 Shoprite Plaza, Abuja', registrationNumber: 'RC-654321', website: 'shoprite.co.za', taxNumber: 'TIN-345678', industry: 'Grocery', country: 'Nigeria',
    status: 'Active', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2026-02-01', subEndDate: '2026-07-31', daysRemaining: 160, amountPaying: 85000, billingCycle: 'Monthly', autoRenew: true, lastLogin: '2026-02-20T14:00:00Z', dateJoined: '2024-02-01', totalRevenue: 8500000, totalSales: 540, totalExpenses: 210, totalProducts: 840, totalUsers: 28,
  },
  {
    id: 'b3', name: 'Adunni Boutique', email: 'hello@adunni.ng', address: '12 Fashion St, Lagos', registrationNumber: 'RC-112233', website: 'adunni.ng', taxNumber: 'TIN-998877', industry: 'Fashion', country: 'Nigeria',
    status: 'Trial', currentPlan: 'Basic Helfer', previousPlan: '-', subStartDate: '2026-02-10', subEndDate: '2026-03-12', daysRemaining: 19, amountPaying: 0, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2026-02-19T10:00:00Z', dateJoined: '2026-02-10', totalRevenue: 120000, totalSales: 42, totalExpenses: 18, totalProducts: 95, totalUsers: 3,
  },
  {
    id: 'b4', name: 'TechBridge Solutions', email: 'ops@techbridge.ng', address: '8 Innovation Hub, PH', registrationNumber: 'RC-445566', website: 'techbridge.ng', taxNumber: 'TIN-556677', industry: 'Technology', country: 'Nigeria',
    status: 'Expired', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2025-11-01', subEndDate: '2026-01-31', daysRemaining: -21, amountPaying: 65000, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2026-02-01T12:00:00Z', dateJoined: '2025-08-15', totalRevenue: 3200000, totalSales: 180, totalExpenses: 90, totalProducts: 230, totalUsers: 12,
  },
  {
    id: 'b5', name: 'Mama Chukwu Foods', email: 'info@mamachukwu.ng', address: '3 Market Rd, Onitsha', registrationNumber: 'RC-778899', website: '-', taxNumber: 'TIN-112233', industry: 'Food & Beverage', country: 'Nigeria',
    status: 'Cancelled', currentPlan: '-', previousPlan: 'Basic', subStartDate: '2025-06-01', subEndDate: '2025-12-01', daysRemaining: -82, amountPaying: 0, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2025-11-30T09:00:00Z', dateJoined: '2025-06-01', totalRevenue: 450000, totalSales: 88, totalExpenses: 55, totalProducts: 120, totalUsers: 5,
  },
  {
    id: 'b6', name: 'GlowUp Cosmetics', email: 'store@glowup.ng', address: '7 Beauty Ave, Lagos', registrationNumber: 'RC-334411', website: 'glowup.ng', taxNumber: 'TIN-667788', industry: 'Beauty', country: 'Nigeria',
    status: 'Active', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2026-01-15', subEndDate: '2026-07-14', daysRemaining: 143, amountPaying: 85000, billingCycle: 'Monthly', autoRenew: true, lastLogin: '2026-02-21T07:30:00Z', dateJoined: '2024-09-10', totalRevenue: 2100000, totalSales: 320, totalExpenses: 140, totalProducts: 410, totalUsers: 9,
  },
  {
    id: 'b7', name: 'AgroFresh Farms', email: 'hello@agrofresh.ng', address: '20 Farm Rd, Kaduna', registrationNumber: 'RC-556677', website: 'agrofresh.ng', taxNumber: 'TIN-223344', industry: 'Agriculture', country: 'Nigeria',
    status: 'Trial', currentPlan: 'Basic Helfer', previousPlan: '-', subStartDate: '2026-02-18', subEndDate: '2026-03-20', daysRemaining: 27, amountPaying: 0, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2026-02-20T16:00:00Z', dateJoined: '2026-02-18', totalRevenue: 60000, totalSales: 21, totalExpenses: 12, totalProducts: 55, totalUsers: 2,
  },
  {
    id: 'b8', name: 'SwiftPrint Hub', email: 'sales@swiftprint.ng', address: '11 Print Lane, Ibadan', registrationNumber: 'RC-889900', website: 'swiftprint.ng', taxNumber: 'TIN-889900', industry: 'Printing', country: 'Nigeria',
    status: 'Active', currentPlan: 'Basic', previousPlan: '-', subStartDate: '2026-02-05', subEndDate: '2026-03-05', daysRemaining: 12, amountPaying: 25000, billingCycle: 'Monthly', autoRenew: true, lastLogin: '2026-02-19T11:00:00Z', dateJoined: '2025-11-20', totalRevenue: 780000, totalSales: 210, totalExpenses: 95, totalProducts: 180, totalUsers: 6,
  },
];

// ─── Studio Users ─────────────────────────────────────────────────────────────
export const STUDIO_USERS: StudioUser[] = [
  { id: 'su1', name: 'Zainab Musa', email: 'zainab@mail.com', address: '3 Gwarimpa, Abuja', country: 'Nigeria', status: 'Active', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2026-01-01', subEndDate: '2026-12-31', daysRemaining: 313, amountPaying: 15000, billingCycle: 'Annual', autoRenew: true, lastLogin: '2026-02-21T07:00:00Z', dateJoined: '2024-06-10', imagesGenerated: 1240, reelsGenerated: 85, editsCount: 340, totalRevenue: 15000 },
  { id: 'su2', name: 'Bola Tinubu Jr.', email: 'bola@creative.ng', address: '1 Lagos Island', country: 'Nigeria', status: 'Trial', currentPlan: 'Basic', previousPlan: '-', subStartDate: '2026-02-10', subEndDate: '2026-03-12', daysRemaining: 19, amountPaying: 0, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2026-02-20T10:00:00Z', dateJoined: '2026-02-10', imagesGenerated: 42, reelsGenerated: 3, editsCount: 12, totalRevenue: 0 },
  { id: 'su3', name: 'Kehinde Fashola', email: 'kehinde@studio.ng', address: '5 Ikeja GRA, Lagos', country: 'Nigeria', status: 'Active', currentPlan: 'Enterprise', previousPlan: 'Pro', subStartDate: '2025-12-01', subEndDate: '2026-11-30', daysRemaining: 281, amountPaying: 45000, billingCycle: 'Annual', autoRenew: true, lastLogin: '2026-02-21T06:45:00Z', dateJoined: '2024-03-15', imagesGenerated: 5600, reelsGenerated: 420, editsCount: 1800, totalRevenue: 90000 },
  { id: 'su4', name: 'Damilola Obi', email: 'damilola@design.co', address: '9 Victoria Island, Lagos', country: 'Nigeria', status: 'Expired', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2025-10-01', subEndDate: '2026-01-01', daysRemaining: -51, amountPaying: 20000, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2026-01-05T14:00:00Z', dateJoined: '2025-07-08', imagesGenerated: 380, reelsGenerated: 22, editsCount: 95, totalRevenue: 60000 },
  { id: 'su5', name: 'Aisha Garba', email: 'aisha@fashion.ng', address: '2 Kano City Centre', country: 'Nigeria', status: 'Active', currentPlan: 'Pro', previousPlan: 'Basic', subStartDate: '2026-01-15', subEndDate: '2026-07-14', daysRemaining: 143, amountPaying: 20000, billingCycle: 'Monthly', autoRenew: true, lastLogin: '2026-02-20T17:00:00Z', dateJoined: '2024-11-02', imagesGenerated: 890, reelsGenerated: 67, editsCount: 215, totalRevenue: 40000 },
  { id: 'su6', name: 'Olu Martins', email: 'olu@pics.com', address: '15 Surulere, Lagos', country: 'Nigeria', status: 'Cancelled', currentPlan: '-', previousPlan: 'Basic', subStartDate: '2025-05-01', subEndDate: '2025-11-01', daysRemaining: -112, amountPaying: 0, billingCycle: 'Monthly', autoRenew: false, lastLogin: '2025-11-01T09:00:00Z', dateJoined: '2025-05-01', imagesGenerated: 120, reelsGenerated: 8, editsCount: 30, totalRevenue: 15000 },
];

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const MRR_DATA: ChartDataPoint[] = [
  { month: 'Aug', value: 1200000 }, { month: 'Sep', value: 1450000 }, { month: 'Oct', value: 1680000 },
  { month: 'Nov', value: 1520000 }, { month: 'Dec', value: 1990000 }, { month: 'Jan', value: 2250000 },
  { month: 'Feb', value: 2520000 },
];

export const MONTHLY_REVENUE_DATA: ChartDataPoint[] = [
  { month: 'Aug', value: 3800000 }, { month: 'Sep', value: 4200000 }, { month: 'Oct', value: 5100000 },
  { month: 'Nov', value: 4700000 }, { month: 'Dec', value: 6300000 }, { month: 'Jan', value: 7200000 },
  { month: 'Feb', value: 8150000 },
];

export const ARPU_DATA: ChartDataPoint[] = [
  { month: 'Aug', value: 24000 }, { month: 'Sep', value: 26000 }, { month: 'Oct', value: 28500 },
  { month: 'Nov', value: 27000 }, { month: 'Dec', value: 31000 }, { month: 'Jan', value: 33500 },
  { month: 'Feb', value: 36000 },
];

export const RENEWAL_FORECAST: ChartDataPoint[] = [
  { month: 'Wk 1', value: 200000 }, { month: 'Wk 2', value: 500000 },
  { month: 'Wk 3', value: 1000000 }, { month: 'Wk 4', value: 750000 },
];

export const STUDIO_MRR_DATA: ChartDataPoint[] = [
  { month: 'Aug', value: 420000 }, { month: 'Sep', value: 510000 }, { month: 'Oct', value: 630000 },
  { month: 'Nov', value: 590000 }, { month: 'Dec', value: 780000 }, { month: 'Jan', value: 890000 },
  { month: 'Feb', value: 1040000 },
];

export const TRYON_DATA = [
  { category: 'Top', count: 12400, percentage: 34 },
  { category: 'Bottom', count: 8900, percentage: 24 },
  { category: 'Full Outfit', count: 7200, percentage: 20 },
  { category: 'Footwear', count: 4100, percentage: 11 },
  { category: 'Jewellery', count: 2800, percentage: 8 },
  { category: 'Accessories', count: 1100, percentage: 3 },
];

export const ROLE_DISTRIBUTION = [
  { role: 'Fashion Designer', count: 3200 },
  { role: 'Content Creator', count: 5100 },
  { role: 'E-commerce Seller', count: 2800 },
  { role: 'Photographer', count: 1900 },
  { role: 'Brand Manager', count: 1400 },
  { role: 'Individual', count: 4200 },
];

// ─── Active Sessions ──────────────────────────────────────────────────────────
export const ACTIVE_SESSIONS = [
  { id: 's1', device: 'MacBook Pro — Chrome', location: 'Lagos, Nigeria', ip: '102.90.45.12', time: 'Current session', current: true },
  { id: 's2', device: 'iPhone 15 — Safari', location: 'Abuja, Nigeria', ip: '41.213.25.88', time: '2 hours ago', current: false },
  { id: 's3', device: 'Windows PC — Firefox', location: 'London, UK', ip: '185.22.44.11', time: '1 day ago', current: false },
];
