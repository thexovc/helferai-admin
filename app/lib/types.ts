export type AdminRole = 'SuperAdmin' | 'Admin' | 'Analyst' | 'Support' | 'Viewer';
export type AdminArea = 'Inventory' | 'Studio' | 'Both';
export type UserStatus = 'Active' | 'Suspended' | 'Inactive';
export type SubStatus = 'Active' | 'Trial' | 'Expired' | 'Cancelled';
export type BillingCycle = 'Monthly' | 'Annual';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  area: AdminArea;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

export interface Permission {
  id: string;
  label: string;
  key: string;
}

export interface Role {
  id: string;
  name: AdminRole;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  logo?: string;
  address: string;
  registrationNumber: string;
  website: string;
  taxNumber: string;
  industry: string;
  country: string;
  status: SubStatus;
  currentPlan: string;
  previousPlan: string;
  subStartDate: string;
  subEndDate: string;
  daysRemaining: number;
  amountPaying: number;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  lastLogin: string;
  dateJoined: string;
  totalRevenue: number;
  totalSales: number;
  totalExpenses: number;
  totalProducts: number;
  totalUsers: number;
}

export interface StudioUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  address: string;
  country: string;
  status: SubStatus;
  currentPlan: string;
  previousPlan: string;
  subStartDate: string;
  subEndDate: string;
  daysRemaining: number;
  amountPaying: number;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  lastLogin: string;
  dateJoined: string;
  imagesGenerated: number;
  reelsGenerated: number;
  editsCount: number;
  totalRevenue: number;
}

export interface KPIMetric {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export interface ChartDataPoint {
  month: string;
  value: number;
  value2?: number;
}
