import { inventoryClient } from '../api-client';
import * as T from './inventory.types';

export const inventoryApi = {
  getDashboardData: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return inventoryClient.get<T.UnifiedDashboardData>(`/admin/api/inventory/dashboard${query ? `?${query}` : ''}`);
  },
  getKpis: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return inventoryClient.get<T.KPIMetrics>(`/admin/api/inventory/dashboard/kpis${query ? `?${query}` : ''}`);
  },
  getCharts: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return inventoryClient.get<T.InventoryCharts>(`/admin/api/inventory/dashboard/charts${query ? `?${query}` : ''}`);
  },
  getBusinesses: (page = 1, pageSize = 10, search = '', filter = '') =>
    inventoryClient.get<T.PaginatedResponse<T.Business>>(`/admin/api/inventory/businesses?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`),
  getBusinessById: (id: string) => inventoryClient.get<T.Business>(`/admin/api/inventory/businesses/${id}`),
  getBusinessMetrics: (id: string) => inventoryClient.get<T.BusinessMetrics>(`/admin/api/inventory/businesses/${id}/metrics`),
  createBusiness: (data: Partial<T.Business>) => inventoryClient.post<T.Business>('/admin/api/inventory/businesses', data),
  updateBusiness: (id: string, data: Partial<T.Business>) => inventoryClient.put<T.Business>(`/admin/api/inventory/businesses/${id}`, data),
  deleteBusiness: (id: string) => inventoryClient.delete<T.Business>(`/admin/api/inventory/businesses/${id}`),
  getTransactions: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Transaction>>(`/admin/api/inventory/finance/transactions?page=${page}&pageSize=${pageSize}`),
  getProducts: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Product>>(`/admin/api/inventory/products?page=${page}&pageSize=${pageSize}`),
  getAiUsage: () => inventoryClient.get<T.AIUsage>('/admin/api/inventory/ai/usage'),
  getBroadcastHistory: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Broadcast>>(`/admin/api/inventory/broadcasts/history?page=${page}&pageSize=${pageSize}`),
  getReferralAnalytics: () => inventoryClient.get<T.ReferralAnalytics>('/admin/api/inventory/referrals/analytics'),
  getIntegrations: (params?: { search?: string; status?: string; authStatus?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.authStatus && params.authStatus !== 'All') query.append('authStatus', params.authStatus);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    const queryString = query.toString();
    return inventoryClient.get<T.PaginatedResponse<T.Integration>>(`/admin/api/inventory/integrations${queryString ? `?${queryString}` : ''}`);
  },
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

  getBrands: (page = 1, pageSize = 10, search = '', sortBy?: string, sortOrder?: string, status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    return inventoryClient.get<T.PaginatedResponse<T.Brand>>(`/admin/api/inventory/brands?${params.toString()}`);
  },
  createBrand: (data: { name: string; manufacturer?: string }) => inventoryClient.post<T.Brand>('/admin/api/inventory/brands', data),
  updateBrand: (id: string, data: { name?: string; manufacturer?: string }) => inventoryClient.put<T.Brand>(`/admin/api/inventory/brands/${id}`, data),
  deleteBrand: (id: string) => inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/brands/${id}`),
  getCategories: (page = 1, pageSize = 10, search = '', sortBy?: string, sortOrder?: string, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);
    if (status) params.append('status', status);
    
    return inventoryClient.get<T.PaginatedResponse<T.Category>>(`/admin/api/inventory/categories?${params.toString()}`);
  },
  updateCategory: (id: string, data: Partial<T.Category>) => inventoryClient.put<T.Category>(`/admin/api/inventory/categories/${id}`, data),
  deleteCategory: (id: string) => inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/categories/${id}`),
  getUnits: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.Unit>>(`/admin/api/inventory/units?page=${page}&pageSize=${pageSize}`),
  getWhatsappNumbers: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.WhatsappNumber>>(`/admin/api/inventory/whatsapp-numbers?page=${page}&pageSize=${pageSize}`),
  getSubscriptions: (
    page = 1,
    pageSize = 10,
    filters?: {
      search?: string;
      plan?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (filters?.search?.trim()) params.set('search', filters.search.trim());
    if (filters?.plan?.trim()) params.set('plan', filters.plan.trim());
    if (filters?.status?.trim()) params.set('status', filters.status.trim());
    if (filters?.startDate?.trim()) params.set('startDate', filters.startDate.trim());
    if (filters?.endDate?.trim()) params.set('endDate', filters.endDate.trim());

    return inventoryClient.get<T.PaginatedResponse<T.Subscription>>(
      `/admin/api/inventory/subscriptions?${params.toString()}`,
    );
  },
  getReferralTiers: () => inventoryClient.get<T.ReferralTier[]>('/admin/api/inventory/referrals/tiers'),
  getPointConfigs: () => inventoryClient.get<T.PointConfig[]>('/admin/api/inventory/referrals/points/config'),
  getReferralRewards: (page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.ReferralReward>>(`/admin/api/inventory/referrals/rewards?page=${page}&pageSize=${pageSize}`),
  getFinanceSummary: () => inventoryClient.get<T.FinanceSummary>('/admin/api/inventory/finance/summary'),
  getFinanceData: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return inventoryClient.get<T.UnifiedFinanceData>(`/admin/api/inventory/finance${query ? `?${query}` : ''}`);
  },
  getFinanceSubscriptions: (paramsObj: any) => {
    const params = new URLSearchParams();
    if (paramsObj.search) params.append('search', paramsObj.search);
    if (paramsObj.planFilter && paramsObj.planFilter !== 'All') params.append('planFilter', paramsObj.planFilter);
    if (paramsObj.statusFilter && paramsObj.statusFilter !== 'All') params.append('statusFilter', paramsObj.statusFilter);
    if (paramsObj.startDateFrom) params.append('startDateFrom', paramsObj.startDateFrom);
    if (paramsObj.startDateTo) params.append('startDateTo', paramsObj.startDateTo);
    if (paramsObj.expiryDateFrom) params.append('expiryDateFrom', paramsObj.expiryDateFrom);
    if (paramsObj.expiryDateTo) params.append('expiryDateTo', paramsObj.expiryDateTo);
    if (paramsObj.page) params.append('page', String(paramsObj.page));
    if (paramsObj.pageSize) params.append('pageSize', String(paramsObj.pageSize));
    const query = params.toString();
    return inventoryClient.get<T.PaginatedResponse<T.FinanceSubscription>>(`/admin/api/inventory/finance/subscriptions${query ? `?${query}` : ''}`);
  },
};
