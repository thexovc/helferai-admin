export type SubStatus = 'Active' | 'Trial' | 'Expired' | 'Cancelled' | 'Suspended';
export type BillingCycle = 'Monthly' | 'Annual';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface Business {
  id: string;
  name: string;
  email: string;
  logo?: string;
  address?: string;
  registrationNumber?: string;
  website?: string;
  taxNumber?: string;
  industry?: string;
  country?: string;
  status: SubStatus;
  currentPlan: string;
  previousPlan?: string;
  subStartDate?: string;
  subEndDate?: string;
  daysRemaining: number;
  amountPaying: number;
  billingCycle: BillingCycle;
  autoRenew?: boolean;
  lastLogin?: string;
  dateJoined?: string;
  totalRevenue?: number;
  totalSales?: number;
  totalExpenses?: number;
  totalProducts?: number;
  totalUsers?: number;
}


export interface KPIValue {
  value: number;
  trend: string;
  trendUp: boolean;
}

export interface InventoryOverview {
  totalBusiness?: KPIValue;
  totalSubscribingBusiness?: KPIValue;
  trialUsers?: KPIValue;
  expiredSubscription?: KPIValue;
  cancelledBusinesses?: KPIValue;
  newBusinessThisMonth?: KPIValue;
  newPayingBusinesses?: KPIValue;
  conversionRate?: KPIValue;
  activeToday?: KPIValue;
  activeVsInactiveRatio?: KPIValue;
}

export interface KPIMetrics {
  mrr: { value: number; trend: string; trendUp: boolean };
  arr: { value: number; trend: string; trendUp: boolean };
  revenueToday: { value: number; trend: string; trendUp: boolean };
  revenueMonth: { value: number; trend: string; trendUp: boolean };
  arpu: { value: number; trend: string; trendUp: boolean };
  pendingRenewals: { value: number };
  conversionRate: { value: string; trend: string; trendUp: boolean };
  renewalForecast: Array<{ month: string; amount: number }>;
  newThisMonth?: { value: number };
  newPaying?: { value: number };
  overview?: InventoryOverview;
}

export interface ChartData {
  month: string;
  mrr: number;
  revenue: number;
  arpu: number;
  totalBusiness?: number;
  subscribing?: number;
}

export interface RenewalTimelineItem {
  week: string;
  amount: number;
}

export interface InventoryCharts {
  monthlyTrends: ChartData[];
  pendingRenewalsTimeline: RenewalTimelineItem[];
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

export interface AIUsageMetric {
  value: number | string;
  trend: string;
  comparisonColor: 'green' | 'blue' | 'red';
}

export interface AIUsage {
  totalPredictions: AIUsageMetric;
  forecastsSent: AIUsageMetric;
  lowStockAlerts: AIUsageMetric;
  avgAccuracy: AIUsageMetric;
  usageByBusiness: Array<{ biz: string; pred: number; acc: string }>;
  trends?: any;
}

export interface BusinessUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface BusinessSubscription {
  id: string;
  plan: string;
  amount: number;
  status: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface BusinessProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  sellingPrice: number;
  openingStock: number;
  unit: string;
}

export interface BusinessSale {
  id: string;
  receiptNumber: string;
  customer: string;
  totalAmount: number;
  paymentStatus: string;
  processingStatus: string;
  createdAt: string;
}

export interface BusinessExpense {
  id: string;
  amount: number;
  purpose: string;
  account: string;
  date: string;
  referenceNumber: string;
}

export interface BusinessWhatsapp {
  id: string;
  name: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

export interface BusinessIntegrationItem {
  id: string;
  name: string;
  status: string;
  connectedAt: string;
  slug: string;
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
