import { inventoryClient } from '../api-client';
import * as T from './inventory.types';

export const inventoryApi = {
  getKpis: () => inventoryClient.get<T.KPIMetrics>('/admin/api/inventory/dashboard/kpis'),
  getCharts: () => inventoryClient.get<T.ChartData[]>('/admin/api/inventory/dashboard/charts'),
  getBusinesses: (page = 1, pageSize = 10) => 
    inventoryClient.get<T.PaginatedResponse<T.Business>>(`/admin/api/inventory/businesses?page=${page}&pageSize=${pageSize}`),
  getBusinessById: (id: string) => inventoryClient.get<T.Business>(`/admin/api/inventory/businesses/${id}`),
  getTransactions: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Transaction>>(`/admin/api/inventory/finance/transactions?page=${page}&pageSize=${pageSize}`),
  getProducts: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Product>>(`/admin/api/inventory/products?page=${page}&pageSize=${pageSize}`),
  getAiUsage: () => inventoryClient.get<T.AIUsage>('/admin/api/inventory/ai/usage'),
  getBroadcastHistory: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Broadcast>>(`/admin/api/inventory/broadcasts/history?page=${page}&pageSize=${pageSize}`),
  getReferralAnalytics: () => inventoryClient.get<T.ReferralAnalytics>('/admin/api/inventory/referrals/analytics'),
  getIntegrations: () => inventoryClient.get<T.Integration[]>('/admin/api/inventory/integrations'),
  getTestimonials: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Testimonial>>(`/admin/api/inventory/testimonials?page=${page}&pageSize=${pageSize}`),
  getActivityLogs: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.ActivityLog>>(`/admin/api/inventory/activity-logs?page=${page}&pageSize=${pageSize}`),
  
  // Business Specific Sub-resources
  getBusinessUsers: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessUser>>(`/admin/api/inventory/businesses/${id}/users?page=${page}&pageSize=${pageSize}`),
  getBusinessSubscriptions: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessSubscription>>(`/admin/api/inventory/businesses/${id}/subscriptions?page=${page}&pageSize=${pageSize}`),
  getBusinessProducts: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessProduct>>(`/admin/api/inventory/businesses/${id}/products?page=${page}&pageSize=${pageSize}`),
  getBusinessSales: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessSale>>(`/admin/api/inventory/businesses/${id}/sales?page=${page}&pageSize=${pageSize}`),
  getBusinessExpenses: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessExpense>>(`/admin/api/inventory/businesses/${id}/expenses?page=${page}&pageSize=${pageSize}`),
  getBusinessWhatsapp: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessWhatsapp>>(`/admin/api/inventory/businesses/${id}/whatsapp?page=${page}&pageSize=${pageSize}`),
  getBusinessIntegrations: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessIntegrationItem>>(`/admin/api/inventory/businesses/${id}/integrations?page=${page}&pageSize=${pageSize}`),
  getBusinessAi: (id: string) => inventoryClient.get<T.AIUsage>(`/admin/api/inventory/businesses/${id}/ai`),

  getBrands: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Brand>>(`/admin/api/inventory/brands?page=${page}&pageSize=${pageSize}`),
  getCategories: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Category>>(`/admin/api/inventory/categories?page=${page}&pageSize=${pageSize}`),
  getUnits: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Unit>>(`/admin/api/inventory/units?page=${page}&pageSize=${pageSize}`),
  getWhatsappNumbers: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.WhatsappNumber>>(`/admin/api/inventory/whatsapp-numbers?page=${page}&pageSize=${pageSize}`),
  getSubscriptions: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Subscription>>(`/admin/api/inventory/subscriptions?page=${page}&pageSize=${pageSize}`),
  getReferralTiers: () => inventoryClient.get<T.ReferralTier[]>('/admin/api/inventory/referrals/tiers'),
  getPointConfigs: () => inventoryClient.get<T.PointConfig[]>('/admin/api/inventory/referrals/points/config'),
  getReferralRewards: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.ReferralReward>>(`/admin/api/inventory/referrals/rewards?page=${page}&pageSize=${pageSize}`),
  getFinanceSummary: () => inventoryClient.get<T.FinanceSummary>('/admin/api/inventory/finance/summary'),
};
