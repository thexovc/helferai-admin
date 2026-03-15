import { inventoryClient } from '../api-client';
import * as T from './inventory.types';

export const inventoryApi = {
  getKpis: () => inventoryClient.get<T.KPIMetrics>('/admin/api/inventory/dashboard/kpis'),
  getCharts: () => inventoryClient.get<T.ChartData[]>('/admin/api/inventory/dashboard/charts'),
  getBusinesses: (page = 1, pageSize = 10) => 
    inventoryClient.get<{ data: T.Business[]; meta: { total: number } }>(`/admin/api/inventory/businesses?page=${page}&pageSize=${pageSize}`),
  getBusinessById: (id: string) => inventoryClient.get<T.Business>(`/admin/api/inventory/businesses/${id}`),
  getTransactions: () => inventoryClient.get<T.Transaction[]>('/admin/api/inventory/finance/transactions'),
  getProducts: () => inventoryClient.get<T.Product[]>('/admin/api/inventory/products'),
  getAiUsage: () => inventoryClient.get<T.AIUsage>('/admin/api/inventory/ai/usage'),
  getBroadcastHistory: () => inventoryClient.get<T.Broadcast[]>('/admin/api/inventory/broadcasts/history'),
  getReferralAnalytics: () => inventoryClient.get<T.ReferralAnalytics>('/admin/api/inventory/referrals/analytics'),
  getIntegrations: () => inventoryClient.get<T.Integration[]>('/admin/api/inventory/integrations'),
  getTestimonials: () => inventoryClient.get<T.Testimonial[]>('/admin/api/inventory/testimonials'),
  getActivityLogs: () => inventoryClient.get<T.ActivityLog[]>('/admin/api/inventory/activity-logs'),
  
  getBrands: () => inventoryClient.get<T.Brand[]>('/admin/api/inventory/brands'),
  getCategories: () => inventoryClient.get<T.Category[]>('/admin/api/inventory/categories'),
  getUnits: () => inventoryClient.get<T.Unit[]>('/admin/api/inventory/units'),
  getWhatsappNumbers: () => inventoryClient.get<T.WhatsappNumber[]>('/admin/api/inventory/whatsapp-numbers'),
  getSubscriptions: () => inventoryClient.get<T.Subscription[]>('/admin/api/inventory/subscriptions'),
  getReferralTiers: () => inventoryClient.get<T.ReferralTier[]>('/admin/api/inventory/referrals/tiers'),
  getPointConfigs: () => inventoryClient.get<T.PointConfig[]>('/admin/api/inventory/referrals/points/config'),
  getReferralRewards: () => inventoryClient.get<T.ReferralReward[]>('/admin/api/inventory/referrals/rewards'),
  getFinanceSummary: () => inventoryClient.get<T.FinanceSummary>('/admin/api/inventory/finance/summary'),
};
