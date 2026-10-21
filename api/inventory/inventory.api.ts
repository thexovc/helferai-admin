import { inventoryClient } from '../api-client';
import * as T from './inventory.types';

export const inventoryApi = {
  // --- Dashboard ---
  getDashboardData: (startDate?: string, endDate?: string) => {
    let url = '/admin/api/inventory/dashboard';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    return inventoryClient.get<T.UnifiedDashboardData>(url);
  },
  getKpis: (startDate?: string, endDate?: string) => {
    let url = '/admin/api/inventory/dashboard/kpis';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    return inventoryClient.get<T.KPIMetrics>(url);
  },
  getCharts: (startDate?: string, endDate?: string) => {
    let url = '/admin/api/inventory/dashboard/charts';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    return inventoryClient.get<T.InventoryCharts>(url);
  },

  // --- Businesses ---
  getBusinesses: (page = 1, pageSize = 10, search = '', filter = '', managerId = '') =>
    inventoryClient.get<T.PaginatedResponse<T.Business>>(`/admin/api/inventory/businesses?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}&managerId=${encodeURIComponent(managerId)}`),
  setAccountManager: (id: string, adminId: string | null) =>
    inventoryClient.put<{ accountManager: { id: string; name: string } | null }>(`/admin/api/inventory/businesses/${id}/account-manager`, { adminId }),
  getBusinessById: (id: string) => inventoryClient.get<T.Business>(`/admin/api/inventory/businesses/${id}`),
  getBusinessMetrics: (id: string) => inventoryClient.get<T.BusinessMetrics>(`/admin/api/inventory/businesses/${id}/metrics`),
  getBusinessRoles: (id: string) => inventoryClient.get<Array<{ id: number; name: string; description?: string }>>(`/admin/api/inventory/businesses/${id}/roles`),
  createBusiness: (dto: any) => inventoryClient.post<T.Business>('/admin/api/inventory/businesses', dto),
  updateBusiness: (id: string, dto: any) => inventoryClient.put<T.Business>(`/admin/api/inventory/businesses/${id}`, dto),
  updateBusinessProfile: (id: string, dto: any) => inventoryClient.put<T.Business>(`/admin/api/inventory/businesses/${id}/profile`, dto),
  deleteBusiness: (id: string) => inventoryClient.delete<{ success: boolean }>(`/admin/api/inventory/businesses/${id}`),

  // --- Business Sub-resources ---
  getBusinessUsers: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessUser>>(`/admin/api/inventory/businesses/${id}/users?page=${page}&pageSize=${pageSize}`),
  createBusinessUser: (businessId: string, dto: { name: string; email: string; password?: string; roleId?: string | number; status?: string }) =>
    inventoryClient.post<T.BusinessUser>(`/admin/api/inventory/businesses/${businessId}/users`, dto),
  updateBusinessUser: (businessId: string, userId: string, dto: { name?: string; email?: string; password?: string; roleId?: string | number; status?: string }) =>
    inventoryClient.put<T.BusinessUser>(`/admin/api/inventory/businesses/${businessId}/users/${userId}`, dto),
  getBusinessSubscriptions: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessSubscription>>(`/admin/api/inventory/businesses/${id}/subscriptions?page=${page}&pageSize=${pageSize}`),
  getBusinessProducts: (id: string, page = 1, pageSize = 10, range: { from?: string; to?: string } = {}) => inventoryClient.get<T.PaginatedResponse<T.BusinessProduct>>(`/admin/api/inventory/businesses/${id}/products?page=${page}&pageSize=${pageSize}${range.from ? `&from=${range.from}` : ''}${range.to ? `&to=${range.to}` : ''}`),
  getBusinessSales: (id: string, page = 1, pageSize = 10, range: { from?: string; to?: string } = {}) => inventoryClient.get<T.PaginatedResponse<T.BusinessSale>>(`/admin/api/inventory/businesses/${id}/sales?page=${page}&pageSize=${pageSize}${range.from ? `&from=${range.from}` : ''}${range.to ? `&to=${range.to}` : ''}`),
  getBusinessExpenses: (id: string, page = 1, pageSize = 10, range: { from?: string; to?: string } = {}) => inventoryClient.get<T.PaginatedResponse<T.BusinessExpense>>(`/admin/api/inventory/businesses/${id}/expenses?page=${page}&pageSize=${pageSize}${range.from ? `&from=${range.from}` : ''}${range.to ? `&to=${range.to}` : ''}`),
  getBusinessWhatsapp: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessWhatsapp>>(`/admin/api/inventory/businesses/${id}/whatsapp?page=${page}&pageSize=${pageSize}`),
  getBusinessIntegrations: (id: string, page = 1, pageSize = 10) => inventoryClient.get<T.PaginatedResponse<T.BusinessIntegrationItem>>(`/admin/api/inventory/businesses/${id}/integrations?page=${page}&pageSize=${pageSize}`),
  getBusinessExpenseOptions: (id: string) => inventoryClient.get<{
    purposes: { id: string; name: string }[];
    accounts: { id: string; name: string }[];
    people: { id: string; name: string; hasLogin: boolean; userId?: string | null }[];
  }>(`/admin/api/inventory/businesses/${id}/expense-options`),
  getBusinessSaleOptions: (id: string, search = '') => inventoryClient.get<{
    customers: { id: string; name: string; phone?: string | null }[];
    products: { id: string; name: string; sku: string; sellingPrice: number; costPrice: number; stock: number }[];
    paymentMethods: { id: string; name: string }[];
    salespeople: { id: string; name: string }[];
  }>(`/admin/api/inventory/businesses/${id}/sale-options?search=${encodeURIComponent(search)}`),
  createBusinessSale: (id: string, dto: any) => inventoryClient.post<any>(`/admin/api/inventory/businesses/${id}/sales`, dto),
  getBusinessProductOptions: (id: string) => inventoryClient.get<{
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    vendors: { id: string; name: string }[];
    units: { id: string; name: string }[];
    stores: { id: string; name: string; isDefault: boolean }[];
  }>(`/admin/api/inventory/businesses/${id}/product-options`),
  getBusinessAi: (id: string) => inventoryClient.get<T.AIUsage>(`/admin/api/inventory/businesses/${id}/ai`),

  // --- Products ---
  getProducts: (page = 1, pageSize = 10, search = '', status = '') => {
    let url = `/admin/api/inventory/products?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Product>>(url);
  },
  createProduct: (dto: { name: string; sku?: string; price: number; costPrice?: number; stockLevel?: number; categoryId?: string | number; brandId?: string | number; unitId?: string | number; businessId?: string | number; vendorId?: string | number; storeId?: string | number; lowStockAlert?: number }) =>
    inventoryClient.post<T.Product>('/admin/api/inventory/products', dto),
  updateProduct: (id: string, dto: { name?: string; sku?: string; price?: number; costPrice?: number; stockLevel?: number; categoryId?: string | number; brandId?: string | number; unitId?: string | number }) =>
    inventoryClient.put<T.Product>(`/admin/api/inventory/products/${id}`, dto),
  deleteProduct: (id: string) => inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/products/${id}`),

  // --- Subscriptions ---
  getSubscriptions: (params: { page?: number; pageSize?: number; search?: string; plan?: string; status?: string; startDate?: string; endDate?: string; billing?: string; expiringDays?: number } = {}) => {
    const { page = 1, pageSize = 10, search = '', plan = '', status = '', startDate = '', endDate = '', billing = '', expiringDays } = params;
    let url = `/admin/api/inventory/subscriptions?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (plan) url += `&plan=${encodeURIComponent(plan)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    if (billing) url += `&billing=${encodeURIComponent(billing)}`;
    if (expiringDays) url += `&expiringDays=${expiringDays}`;
    return inventoryClient.get<T.SubscriptionsResponse>(url);
  },
  getSubscriptionPlans: () => inventoryClient.get<T.SubscriptionPlan[]>('/admin/api/inventory/subscriptions/plans'),
  createSubscription: (dto: { businessId: string | number; planId: string | number; startsAt?: string; endsAt?: string; billingCycle?: string; amount?: number; paymentMethod?: string }) =>
    inventoryClient.post<T.Subscription>('/admin/api/inventory/subscriptions', dto),
  updateSubscription: (id: string, dto: { planId?: string | number; startDate?: string; endDate?: string; status?: string; paymentStatus?: string }) =>
    inventoryClient.put<T.Subscription>(`/admin/api/inventory/subscriptions/${id}`, dto),
  cancelSubscription: (id: string) => inventoryClient.patch<{ id: string; isCancelled: boolean }>(`/admin/api/inventory/subscriptions/${id}/cancel`),
  extendSubscription: (id: string, days = 30) => inventoryClient.patch<{ id: string; endsAt: string }>(`/admin/api/inventory/subscriptions/${id}/extend`, { days }),
  deleteSubscription: (id: string) => inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/subscriptions/${id}`),

  // --- Categories ---
  getCategories: (page = 1, pageSize = 10, search = '', businessId = '') => {
    let url = `/admin/api/inventory/categories?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (businessId) url += `&businessId=${encodeURIComponent(businessId)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Category>>(url);
  },
  createCategory: (dto: { name: string; businessId?: string | number }) =>
    inventoryClient.post<T.Category>('/admin/api/inventory/categories', dto),
  updateCategory: (id: string | number, dto: { name?: string }) =>
    inventoryClient.put<T.Category>(`/admin/api/inventory/categories/${id}`, dto),
  deleteCategory: (id: string | number) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/categories/${id}`),

  // --- Brands ---
  getBrands: (params: { page?: number; pageSize?: number; search?: string; start_date?: string; end_date?: string; sort_by?: string; sort_order?: string } = {}) => {
    const { page = 1, pageSize = 10, search = '', start_date = '', end_date = '', sort_by = '', sort_order = '' } = params;
    let url = `/admin/api/inventory/brands?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (start_date) url += `&start_date=${encodeURIComponent(start_date)}`;
    if (end_date) url += `&end_date=${encodeURIComponent(end_date)}`;
    if (sort_by) url += `&sort_by=${encodeURIComponent(sort_by)}`;
    if (sort_order) url += `&sort_order=${encodeURIComponent(sort_order)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Brand>>(url);
  },
  createBrand: (dto: { name: string; manufacturer?: string }) =>
    inventoryClient.post<T.Brand>('/admin/api/inventory/brands', dto),
  updateBrand: (id: string, dto: { name?: string; manufacturer?: string }) =>
    inventoryClient.put<T.Brand>(`/admin/api/inventory/brands/${id}`, dto),
  deleteBrand: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/brands/${id}`),

  // --- Units ---
  getUnits: (page = 1, pageSize = 10, search = '') => {
    let url = `/admin/api/inventory/units?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Unit>>(url);
  },
  createUnit: (dto: { name: string; abbreviation: string; businessId?: string | number }) =>
    inventoryClient.post<T.Unit>('/admin/api/inventory/units', dto),
  updateUnit: (id: string, dto: { name?: string; abbreviation?: string }) =>
    inventoryClient.put<T.Unit>(`/admin/api/inventory/units/${id}`, dto),
  deleteUnit: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/units/${id}`),

  // --- WhatsApp Numbers ---
  getWhatsappNumbers: (page = 1, pageSize = 10, search = '', status = '', businessId = '') => {
    let url = `/admin/api/inventory/whatsapp-numbers?page=${page}&pageSize=${pageSize}`;
    if (businessId) url += `&businessId=${encodeURIComponent(businessId)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return inventoryClient.get<T.PaginatedResponse<T.WhatsappNumber>>(url);
  },
  createWhatsappNumber: (dto: { phoneNumber?: string; number?: string; name?: string; businessName?: string; businessId?: string | number; status?: string }) =>
    inventoryClient.post<T.WhatsappNumber>('/admin/api/inventory/whatsapp-numbers', dto),
  updateWhatsappNumber: (id: string, dto: { phoneNumber?: string; number?: string; name?: string; businessName?: string; status?: string }) =>
    inventoryClient.put<T.WhatsappNumber>(`/admin/api/inventory/whatsapp-numbers/${id}`, dto),
  deleteWhatsappNumber: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/whatsapp-numbers/${id}`),

  // --- Admins Management ---
  getAdmins: (page = 1, pageSize = 10, search = '') => {
    let url = `/admin/api/inventory/admins?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return inventoryClient.get<T.PaginatedResponse<T.AdminUserRecord>>(url);
  },
  createAdmin: (dto: { name: string; email: string; password?: string; roleId?: string | number; status?: string }) =>
    inventoryClient.post<T.AdminUserRecord>('/admin/api/inventory/admins', dto),
  updateAdmin: (id: string, dto: { name?: string; email?: string; password?: string; roleId?: string | number; status?: string }) =>
    inventoryClient.put<T.AdminUserRecord>(`/admin/api/inventory/admins/${id}`, dto),
  deleteAdmin: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/admins/${id}`),

  // --- Roles Management ---
  getRoles: (page = 1, pageSize = 20, search = '') => {
    let url = `/admin/api/inventory/roles?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return inventoryClient.get<T.PaginatedResponse<T.AdminRoleRecord>>(url);
  },
  createRole: (dto: { name: string; description?: string; permissions?: string[] }) =>
    inventoryClient.post<T.AdminRoleRecord>('/admin/api/inventory/roles', dto),
  updateRole: (id: string, dto: { name?: string; description?: string; permissions?: string[] }) =>
    inventoryClient.put<T.AdminRoleRecord>(`/admin/api/inventory/roles/${id}`, dto),
  deleteRole: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/roles/${id}`),

  // --- Platform Users ---
  getPlatformUsers: (params: { page?: number; pageSize?: number; search?: string; status?: string; businessId?: string; inactiveHours?: number } = {}) => {
    const { page = 1, pageSize = 10, search = '', status = '', businessId = '', inactiveHours } = params;
    let url = `/admin/api/inventory/users?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (businessId) url += `&businessId=${encodeURIComponent(businessId)}`;
    if (inactiveHours) url += `&inactiveHours=${inactiveHours}`;
    return inventoryClient.get<T.PaginatedResponse<T.PlatformUserRecord>>(url);
  },
  getUserActivities: (userId: string, page = 1, pageSize = 20) =>
    inventoryClient.get<T.PaginatedResponse<T.ActivityLog>>(`/admin/api/inventory/users/${userId}/activities?page=${page}&pageSize=${pageSize}`),
  updatePlatformUserStatus: (userId: string, status: string) =>
    inventoryClient.patch<{ id: string; status: string }>(`/admin/api/inventory/users/${userId}/status`, { status }),

  // --- Broadcasts ---
  getBroadcastHistory: (page = 1, pageSize = 10, search = '', kind = 'admin') => {
    let url = `/admin/api/inventory/broadcasts/history?page=${page}&pageSize=${pageSize}&kind=${kind}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Broadcast>>(url);
  },
  getBroadcastById: (id: string) => inventoryClient.get<T.Broadcast>(`/admin/api/inventory/broadcasts/${id}`),
  sendBroadcast: (dto: T.SendBroadcastDto) =>
    inventoryClient.post<T.Broadcast>('/admin/api/inventory/broadcasts/send', dto),
  sendTestBroadcastEmail: (dto: T.SendTestEmailDto) =>
    inventoryClient.post<{ success: boolean; message: string }>('/admin/api/inventory/broadcasts/send-test', dto),
  sendDirectEmail: (dto: T.SendDirectEmailDto) =>
    inventoryClient.post<{ success: boolean; message: string; broadcastId?: string; recipients: number }>('/admin/api/inventory/broadcasts/send-direct', dto),
  deleteBroadcast: (id: string) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/broadcasts/${id}`),

  // --- Referrals ---
  getReferralAnalytics: (params: { search?: string; pointsFilter?: string; page?: number; pageSize?: number } = {}) => {
    const { search = '', pointsFilter = '', page = 1, pageSize = 10 } = params;
    let url = `/admin/api/inventory/referrals/analytics?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (pointsFilter) url += `&pointsFilter=${encodeURIComponent(pointsFilter)}`;
    return inventoryClient.get<T.ReferralAnalytics>(url);
  },
  getReferralTiers: () => inventoryClient.get<T.ReferralTier[]>('/admin/api/inventory/referrals/tiers'),
  createReferralTier: (dto: { name: string; slug: string; min_points: number; max_points?: number; color?: string; order?: number }) =>
    inventoryClient.post<T.ReferralTier>('/admin/api/inventory/referrals/tiers', dto),
  updateReferralTier: (id: string, dto: { name?: string; slug?: string; min_points?: number; max_points?: number; color?: string; order?: number }) =>
    inventoryClient.put<T.ReferralTier>(`/admin/api/inventory/referrals/tiers/${id}`, dto),
  deleteReferralTier: (id: string) =>
    inventoryClient.delete<{ success: boolean }>(`/admin/api/inventory/referrals/tiers/${id}`),

  getPointConfigs: () => inventoryClient.get<T.PointConfig[]>('/admin/api/inventory/referrals/points/config'),
  createPointConfig: (dto: { activity_type: string; user_points: number; referrer_points: number; description?: string; is_active?: boolean }) =>
    inventoryClient.post<T.PointConfig>('/admin/api/inventory/referrals/points/config', dto),
  updatePointConfig: (id: string, dto: { activity_type?: string; user_points?: number; referrer_points?: number; description?: string; is_active?: boolean }) =>
    inventoryClient.put<T.PointConfig>(`/admin/api/inventory/referrals/points/config/${id}`, dto),
  deletePointConfig: (id: string) =>
    inventoryClient.delete<{ success: boolean }>(`/admin/api/inventory/referrals/points/config/${id}`),

  getReferralRewards: (page = 1, pageSize = 10) =>
    inventoryClient.get<T.PaginatedResponse<T.ReferralReward>>(`/admin/api/inventory/referrals/rewards?page=${page}&pageSize=${pageSize}`),
  getReferralsList: (params: { search?: string; status?: string; page?: number; pageSize?: number } = {}) => {
    const { search = '', status = '', page = 1, pageSize = 10 } = params;
    let url = `/admin/api/inventory/referrals/list?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    return inventoryClient.get<T.PaginatedResponse<T.ReferralAuditItem>>(url);
  },

  // --- Testimonials ---
  getTestimonials: (page = 1, pageSize = 10) =>
    inventoryClient.get<T.PaginatedResponse<T.Testimonial>>(`/admin/api/inventory/testimonials?page=${page}&pageSize=${pageSize}`),
  createTestimonial: (dto: { author: string; role?: string; company?: string; content: string; avatar?: string; rating?: number; isActive?: boolean }) =>
    inventoryClient.post<T.Testimonial>('/admin/api/inventory/testimonials', dto),
  updateTestimonial: (id: string | number, dto: any) =>
    inventoryClient.put<T.Testimonial>(`/admin/api/inventory/testimonials/${id}`, dto),
  deleteTestimonial: (id: string | number) =>
    inventoryClient.delete<{ success: boolean; message: string }>(`/admin/api/inventory/testimonials/${id}`),

  // --- Integrations ---
  getIntegrations: (params: { search?: string; status?: string; authStatus?: string; page?: number; pageSize?: number } = {}) => {
    const { search = '', status = '', authStatus = '', page = 1, pageSize = 10 } = params;
    let url = `/admin/api/inventory/integrations?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (authStatus) url += `&authStatus=${encodeURIComponent(authStatus)}`;
    return inventoryClient.get<T.PaginatedResponse<T.Integration> | T.Integration[]>(url);
  },

  // --- Activity Logs ---
  getActivityLogs: (params: { page?: number; pageSize?: number; search?: string; businessId?: string; userId?: string; action?: string; startDate?: string; endDate?: string } = {}) => {
    const { page = 1, pageSize = 10, search = '', businessId = '', userId = '', action = '', startDate = '', endDate = '' } = params;
    let url = `/admin/api/inventory/activity-logs?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (businessId) url += `&businessId=${encodeURIComponent(businessId)}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    return inventoryClient.get<T.PaginatedResponse<T.ActivityLog>>(url);
  },

  // --- AI ---
  getAiUsage: () => inventoryClient.get<T.AIUsage>('/admin/api/inventory/ai/usage'),

  // --- Finance ---
  getFinanceData: (startDate?: string, endDate?: string) => {
    let url = '/admin/api/inventory/finance';
    const params: string[] = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length) url += `?${params.join('&')}`;
    return inventoryClient.get<T.UnifiedFinanceData>(url);
  },
  getFinanceSubscriptions: (params: { page?: number; pageSize?: number; search?: string; planFilter?: string; statusFilter?: string } = {}) => {
    const { page = 1, pageSize = 10, search = '', planFilter = '', statusFilter = '' } = params;
    let url = `/admin/api/inventory/finance/subscriptions?page=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (planFilter) url += `&planFilter=${encodeURIComponent(planFilter)}`;
    if (statusFilter) url += `&statusFilter=${encodeURIComponent(statusFilter)}`;
    return inventoryClient.get<T.PaginatedResponse<T.FinanceSubscription>>(url);
  },
  getFinanceSummary: () => inventoryClient.get<T.FinanceSummary>('/admin/api/inventory/finance/summary'),
  getTransactions: (page = 1, pageSize = 10) =>
    inventoryClient.get<T.PaginatedResponse<T.Transaction>>(`/admin/api/inventory/finance/transactions?page=${page}&pageSize=${pageSize}`),
};
