export type SubStatus = 'Active' | 'Trial' | 'Expired' | 'Cancelled' | 'Suspended' | 'Unpaid checkout';
export type BillingCycle = 'Monthly' | 'Annual';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
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
  planId?: string;
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

export interface KPIMetrics {
  totalBusiness?: KPIValue;
  totalSubscribingBusiness?: KPIValue;
  trialUsers?: { value: number; trend?: string; trendUp?: boolean };
  expiredSubscription?: { value: number; trend?: string; trendUp?: boolean };
  cancelledBusinesses?: { value: number; trend?: string; trendUp?: boolean };
  newBusinessThisMonth?: KPIValue;
  activeToday?: KPIValue;
  mrr: KPIValue;
  arr: KPIValue;
  revenueToday: KPIValue;
  revenueMonth: KPIValue;
  arpu: KPIValue;
  pendingRenewalsValue?: { value: number };
  pendingRenewals?: { value: number };
  revenuePeriod?: KPIValue;
  payingSubscriptions?: { value: number };
  conversionRate?: { value: number; trend?: string; trendUp?: boolean };
  activeVsInactiveRatio?: KPIValue;
  newPayingBusinesses?: KPIValue;
}

export interface ChartData {
  month: string;
  mrr: number;
  revenue: number;
  arpu: number;
  totalBusiness?: number;
  newBusinesses?: number;
  paidSubscriptions?: number;
  subscribing?: number;
  salesVolume?: number;
}

export interface RenewalTimelineItem {
  week: string;
  amount: number;
}

export interface ConversionFunnel {
  registered: number;
  trialing: number;
  paying: number;
  trialConversionRate: number;
  payingConversionRate: number;
  stillTrialing?: number;
  trialEnded?: number;
  trialToPaidRate?: number | null;
}

export interface RetentionStats {
  retained: number;
  lost: number;
  new: number;
  paying: number;
  retentionRate: number | null;
}

export interface RetentionChurnItem extends Partial<RetentionStats> {
  week: string;
  active: number;
  inactive: number;
}

export interface InventoryCharts {
  granularity?: 'day' | 'week' | 'month';
  monthlyTrends: ChartData[];
  pendingRenewalsTimeline: RenewalTimelineItem[];
  conversionFunnel?: ConversionFunnel;
  retentionChurn?: RetentionChurnItem[];
  retentionSummary?: RetentionStats | null;
}

export interface RecentAction {
  id: string;
  action: string;
  resourceType: string;
  businessName: string;
  adminName: string;
  timestamp: string;
  metadata?: any;
}

export interface UnifiedDashboardData {
  kpis: KPIMetrics;
  charts: InventoryCharts;
  recentActions: RecentAction[];
}

export interface SubscriptionAggregates {
  totalActive: number;
  totalTrial: number;
  totalExpired: number;
  totalCancelled: number;
  totalMRR: number;
  totalARR: number;
}

export interface SubscriptionsResponse extends PaginatedResponse<Subscription> {
  aggregates?: SubscriptionAggregates;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  frequency: string;
  features?: string[];
  maxUsers?: number;
  maxProducts?: number;
}

export interface Subscription {
  id: string;
  businessId: string;
  businessName: string;
  businessEmail: string;
  plan: string;
  planId?: string;
  status: SubStatus;
  startDate: string;
  endDate: string;
  amountPaying: number;
  billingCycle: BillingCycle;
  daysRemaining: number;
  autoRenew: boolean;
  paymentMethod: string;
}

export interface FinanceSubscription {
  id: string;
  businessName: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: string;
}

export interface AnomalousEvent {
  id: number | string;
  type: string;
  clientId: string;
  businessName?: string;
  time: string;
  amount: number;
  status: string;
}

export interface UnifiedFinanceData {
  kpis: KPIMetrics;
  charts: {
    granularity?: 'day' | 'week' | 'month';
    monthlyRevenue: Array<{ month: string; amount: number }>;
    subscriptionGrowth: Array<{ month: string; basic: number; smart: number; genius: number; platinum?: number }>;
  };
  subscriptions?: FinanceSubscription[];
  anomalousEvents: AnomalousEvent[];
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
  id?: string;
  sku: string;
  name: string;
  category: string;
  categoryId?: string | null;
  brand: string;
  brandId?: string | null;
  unit: string;
  unitId?: string | null;
  businessName?: string;
  businessId?: string;
  price: number;
  costPrice?: number;
  stockLevel: number;
  batchesCount?: number;
  status: string;
  createdAt?: string;
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
  roleId?: string;
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
  message?: string;
  segment?: string;
  sentAt: string;
  createdAt?: string;
  recipients: number;
  deliveredCount?: number;
  readCount?: number;
  deliveryRate: string;
  readRate: string;
  status: string;
  channel: string;
  preheader?: string;
  isHtml?: boolean;
}

export interface SendBroadcastDto {
  title: string;
  message: string;
  channel?: string;
  target?: string;
  segment?: string;
  businessId?: string;
  businessIds?: string[];
  userIds?: string[];
  preheader?: string;
  isHtml?: boolean;
}

export interface SendTestEmailDto {
  testEmail: string;
  title: string;
  message: string;
  preheader?: string;
}

export interface SendDirectEmailDto {
  userId?: string | number;
  userIds?: (string | number)[];
  email?: string;
  emails?: string[];
  title: string;
  message: string;
  preheader?: string;
}

export interface ReferralAnalytics {
  totalInvites: number;
  conversions: number;
  conversionRate: string;
  pointsDistributed: number;
  topReferrers: Array<{ name: string; referrals: number; points: number }>;
}

export interface ReferralAuditItem {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  referralCode: string;
  status: string;
  pointsAwarded: number;
  createdAt: string;
  rewardedAt?: string | null;
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
  userName?: string;
  author?: string;
  role?: string;
  company?: string;
  rating: number;
  content: string;
  status: string;
  isActive?: boolean;
  avatar?: string;
  date?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  adminName: string;
  userEmail?: string;
  businessId?: string | null;
  businessName?: string;
  action: string;
  resourceType: string;
  targetId?: string;
  details?: string;
  timestamp: string;
  ip: string;
  metadata?: any;
}

export interface Brand {
  id: string;
  name: string;
  manufacturer?: string;
  productCount: number;
  status: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  businessName?: string;
  businessId?: string | null;
  description?: string;
  productCount: number;
  status: string;
  createdAt?: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  productCount?: number;
  businessName?: string;
  status: string;
  createdAt?: string;
}

export interface WhatsappNumber {
  id: string;
  number: string;
  phoneNumber?: string;
  name?: string;
  businessName: string;
  businessId?: string;
  status: string;
  lastActive: string;
  createdAt?: string;
  businessLogo?: string | null;
  integrationId?: string | null;
  // The merchant's WhatsApp entry in Business Integrations: active, inactive or not set up
  integrationStatus?: string;
  lastUsed?: string | null;
  merchantLastUsed?: string | null;
}

export interface ReferralTier {
  id: string;
  name: string;
  slug?: string;
  min_points?: number;
  max_points?: number;
  minReferrals?: number;
  rewardMultiplier?: number;
  color?: string;
  icon?: string;
  order?: number;
  status: string;
}

export interface PointConfig {
  id: string;
  activity_type?: string;
  action?: string;
  user_points?: number;
  referrer_points?: number;
  points?: number;
  description?: string;
  status: string;
}

export interface ReferralReward {
  id: string;
  name: string;
  pointsRequired?: number;
  points?: number;
  type?: string;
  description: string;
  status: string;
  date?: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  growth: string;
}

export interface BusinessMetrics {
  salesRecords: number;
  expenseRecords: number;
  products: number;
  subEnds: string;
  daysRemaining: string;
  totalRevenue: number;
  totalUsers: number;
  lastLogin: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
  roleId?: string;
  status: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminRoleRecord {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  adminCount?: number;
  userCount?: number;
  createdAt?: string;
}

export interface PlatformUserRecord {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  businessName?: string;
  businessId?: string;
  businesses?: Array<{ id: string; name: string }>;
  role?: string;
  status: string;
  lastLogin?: string;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
  lastActive?: string | null;
  storeName?: string | null;
  isPrimaryUser?: boolean;
  createdAt: string;
  totalSales?: number;
  totalExpenses?: number;
}
