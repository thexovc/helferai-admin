export type SubStatus = 'Active' | 'Trial' | 'Expired' | 'Cancelled';
export type BillingCycle = 'Monthly' | 'Annual';

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


export interface KPIMetrics {
  mrr: { value: number; trend: string; trendUp: boolean };
  arr: { value: number; trend: string; trendUp: boolean };
  revenueToday: { value: number; trend: string; trendUp: boolean };
  revenueMonth: { value: number; trend: string; trendUp: boolean };
  arpu: { value: number; trend: string; trendUp: boolean };
  pendingRenewals: { value: number };
}

export interface ChartData {
  month: string;
  mrr: number;
  revenue: number;
  arpu: number;
}

export interface Transaction {
  id: string;
  businessName: string;
  date: string;
  plan: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod: string;
  billingCycle: BillingCycle;
}


export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stockLevel: number;
  status: string;
}

export interface AIUsage {
  totalPredictions: number;
  forecastsSent: number;
  lowStockAlerts: number;
  avgAccuracy: string;
  usageByBusiness: Array<{ biz: string; pred: number; acc: string }>;
}

export interface Broadcast {
  id: string;
  title: string;
  sentAt: string;
  recipients: number;
  deliveryRate: string;
  readRate: string;
  status: string;
  channel: string;
}


export interface ReferralAnalytics {
  totalInvites: number;
  conversions: number;
  conversionRate: string;
  pointsDistributed: number;
  topReferrers: Array<{ name: string; referrals: number; points: number }>;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: string;
  activeUsers: number;
  provider: string;
  authStatus: string;
  lastSync: string;
}


export interface Testimonial {
  id: string;
  userName: string;
  rating: number;
  content: string;
  status: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  targetId?: string;
  timestamp: string;
  ip: string;
}

export interface Brand {
  id: string;
  name: string;
  manufacturer: string;
  productCount: number;
  status: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  status: string;
}

export interface WhatsappNumber {
  id: string;
  number: string;
  businessName: string;
  status: string;
  lastActive: string;
}

export interface Subscription {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  plan: string;
  status: SubStatus;
  startDate: string;
  endDate: string;
  amountPaying: number;
  billingCycle: BillingCycle;
  daysRemaining: number;
  autoRenew: boolean;
  paymentMethod: string;
}

export interface ReferralTier {
  id: string;
  name: string;
  minReferrals: number;
  rewardMultiplier: number;
  status: string;
}

export interface PointConfig {
  id: string;
  action: string;
  points: number;
  status: string;
}

export interface ReferralReward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  status: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  growth: string;
}
