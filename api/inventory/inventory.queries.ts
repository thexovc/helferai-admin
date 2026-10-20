import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

export const inventoryKeys = {
  all: ['inventory'] as const,
  dashboard: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'dashboard', startDate, endDate] as const,
  kpis: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'kpis', startDate, endDate] as const,
  charts: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'charts', startDate, endDate] as const,
  businesses: () => [...inventoryKeys.all, 'businesses'] as const,
  business: (id: string) => [...inventoryKeys.all, 'businesses', id] as const,
  businessMetrics: (id: string) => [...inventoryKeys.all, 'businesses', id, 'metrics'] as const,
  businessRoles: (id: string) => [...inventoryKeys.all, 'businesses', id, 'roles'] as const,
  transactions: () => [...inventoryKeys.all, 'transactions'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  aiUsage: () => [...inventoryKeys.all, 'ai-usage'] as const,
  broadcasts: () => [...inventoryKeys.all, 'broadcasts'] as const,
  broadcastDetails: (id: string) => [...inventoryKeys.all, 'broadcasts', id] as const,
  referrals: () => [...inventoryKeys.all, 'referrals'] as const,
  referralsList: () => [...inventoryKeys.all, 'referrals', 'list'] as const,
  integrations: () => [...inventoryKeys.all, 'integrations'] as const,
  testimonials: () => [...inventoryKeys.all, 'testimonials'] as const,
  activityLogs: () => [...inventoryKeys.all, 'activity-logs'] as const,
  brands: () => [...inventoryKeys.all, 'brands'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  units: () => [...inventoryKeys.all, 'units'] as const,
  whatsappNumbers: () => [...inventoryKeys.all, 'whatsapp-numbers'] as const,
  subscriptions: () => [...inventoryKeys.all, 'subscriptions'] as const,
  subscriptionPlans: () => [...inventoryKeys.all, 'subscriptions', 'plans'] as const,
  referralTiers: () => [...inventoryKeys.all, 'referrals', 'tiers'] as const,
  pointConfigs: () => [...inventoryKeys.all, 'referrals', 'points-config'] as const,
  referralRewards: () => [...inventoryKeys.all, 'referrals', 'rewards'] as const,
  financeSummary: () => [...inventoryKeys.all, 'finance', 'summary'] as const,
  finance: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'finance', startDate, endDate] as const,
  admins: () => [...inventoryKeys.all, 'admins'] as const,
  roles: () => [...inventoryKeys.all, 'roles'] as const,
  platformUsers: () => [...inventoryKeys.all, 'platform-users'] as const,
  userActivities: (userId: string) => [...inventoryKeys.all, 'platform-users', userId, 'activities'] as const,
  
  // Business sub-resources
  businessUsers: (id: string) => [...inventoryKeys.business(id), 'users'] as const,
  businessSubscriptions: (id: string) => [...inventoryKeys.business(id), 'subscriptions'] as const,
  businessProducts: (id: string) => [...inventoryKeys.business(id), 'products'] as const,
  businessSales: (id: string) => [...inventoryKeys.business(id), 'sales'] as const,
  businessExpenses: (id: string) => [...inventoryKeys.business(id), 'expenses'] as const,
  businessWhatsapp: (id: string) => [...inventoryKeys.business(id), 'whatsapp'] as const,
  businessIntegrations: (id: string) => [...inventoryKeys.business(id), 'integrations'] as const,
};

export const useInventoryDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.dashboard(startDate, endDate),
    queryFn: () => inventoryApi.getDashboardData(startDate, endDate),
    placeholderData: keepPreviousData,
  });
};

export const useInventoryKpis = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.kpis(startDate, endDate),
    queryFn: () => inventoryApi.getKpis(startDate, endDate),
  });
};

export const useInventoryCharts = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.charts(startDate, endDate),
    queryFn: () => inventoryApi.getCharts(startDate, endDate),
  });
};

export const useInventoryBusinesses = (page = 1, pageSize = 10, searchInput = '', filter = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.businesses(), page, pageSize, search, filter],
    queryFn: () => inventoryApi.getBusinesses(page, pageSize, search, filter),
    placeholderData: keepPreviousData,
  });
};

export const useInventoryBusiness = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.business(id),
    queryFn: () => inventoryApi.getBusinessById(id),
    enabled: !!id,
  });
};

export const useBusinessRoles = (businessId: string) => {
  return useQuery({
    queryKey: inventoryKeys.businessRoles(businessId),
    queryFn: () => inventoryApi.getBusinessRoles(businessId),
    enabled: !!businessId,
  });
};

export const useInventoryTransactions = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.transactions(), page, pageSize],
    queryFn: () => inventoryApi.getTransactions(page, pageSize),
  });
};

export const useInventoryProducts = (page = 1, pageSize = 10, searchInput = '', status = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.products(), page, pageSize, search, status],
    queryFn: () => inventoryApi.getProducts(page, pageSize, search, status),
  });
};

export const useInventoryAiUsage = () => {
  return useQuery({
    queryKey: inventoryKeys.aiUsage(),
    queryFn: inventoryApi.getAiUsage,
  });
};

export const useInventoryBroadcasts = (page = 1, pageSize = 10, searchInput = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.broadcasts(), page, pageSize, search],
    queryFn: () => inventoryApi.getBroadcastHistory(page, pageSize, search),
  });
};

export const useBroadcastDetails = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.broadcastDetails(id),
    queryFn: () => inventoryApi.getBroadcastById(id),
    enabled: !!id,
  });
};

export const useInventoryReferrals = (rawParams: { search?: string; pointsFilter?: string; page?: number; pageSize?: number } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.referrals(), params],
    queryFn: () => inventoryApi.getReferralAnalytics(params),
  });
};

export const useReferralsList = (rawParams: { search?: string; status?: string; page?: number; pageSize?: number } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.referralsList(), params],
    queryFn: () => inventoryApi.getReferralsList(params),
  });
};

export const useInventoryIntegrations = (rawParams: { search?: string; status?: string; authStatus?: string; page?: number; pageSize?: number } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.integrations(), params],
    queryFn: () => inventoryApi.getIntegrations(params),
  });
};

export const useInventoryTestimonials = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.testimonials(), page, pageSize],
    queryFn: () => inventoryApi.getTestimonials(page, pageSize),
  });
};

export const useInventoryActivityLogs = (rawParams: { page?: number; pageSize?: number; search?: string; businessId?: string; userId?: string; action?: string; startDate?: string; endDate?: string } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.activityLogs(), params],
    queryFn: () => inventoryApi.getActivityLogs(params),
  });
};

export const useInventoryBrands = (rawParams: { page?: number; pageSize?: number; search?: string; start_date?: string; end_date?: string; sort_by?: string; sort_order?: string } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.brands(), params],
    queryFn: () => inventoryApi.getBrands(params),
  });
};

export const useInventoryCategories = (page = 1, pageSize = 10, searchInput = '', businessId = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.categories(), page, pageSize, search, businessId],
    queryFn: () => inventoryApi.getCategories(page, pageSize, search, businessId),
  });
};

export const useInventoryUnits = (page = 1, pageSize = 10, searchInput = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.units(), page, pageSize, search],
    queryFn: () => inventoryApi.getUnits(page, pageSize, search),
  });
};

export const useInventoryWhatsappNumbers = (page = 1, pageSize = 10, searchInput = '', status = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.whatsappNumbers(), page, pageSize, search, status],
    queryFn: () => inventoryApi.getWhatsappNumbers(page, pageSize, search, status),
  });
};

export const useInventorySubscriptions = (rawParams: { page?: number; pageSize?: number; search?: string; plan?: string; status?: string; startDate?: string; endDate?: string; billing?: string } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.subscriptions(), params],
    queryFn: () => inventoryApi.getSubscriptions(params),
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: inventoryKeys.subscriptionPlans(),
    queryFn: inventoryApi.getSubscriptionPlans,
  });
};

export const useInventoryReferralTiers = () => {
  return useQuery({
    queryKey: inventoryKeys.referralTiers(),
    queryFn: inventoryApi.getReferralTiers,
  });
};

export const useInventoryPointConfigs = () => {
  return useQuery({
    queryKey: inventoryKeys.pointConfigs(),
    queryFn: inventoryApi.getPointConfigs,
  });
};

export const useInventoryReferralRewards = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.referralRewards(), page, pageSize],
    queryFn: () => inventoryApi.getReferralRewards(page, pageSize),
  });
};

export const useInventoryFinanceSummary = () => {
  return useQuery({
    queryKey: inventoryKeys.financeSummary(),
    queryFn: inventoryApi.getFinanceSummary,
  });
};

export const useInventoryFinance = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.finance(startDate, endDate),
    queryFn: () => inventoryApi.getFinanceData(startDate, endDate),
    placeholderData: keepPreviousData,
  });
};

export const useFinanceSubscriptions = (page = 1, pageSize = 10, searchInput = '', planFilter = '', statusFilter = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.all, 'finance-subscriptions', page, pageSize, search, planFilter, statusFilter],
    queryFn: () => inventoryApi.getFinanceSubscriptions({ page, pageSize, search, planFilter, statusFilter }),
    placeholderData: keepPreviousData,
  });
};

export const useInventoryAdmins = (page = 1, pageSize = 10, searchInput = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.admins(), page, pageSize, search],
    queryFn: () => inventoryApi.getAdmins(page, pageSize, search),
  });
};

export const useInventoryRoles = (page = 1, pageSize = 20, searchInput = '') => {
  const search = useDebouncedValue(searchInput);
  return useQuery({
    queryKey: [...inventoryKeys.roles(), page, pageSize, search],
    queryFn: () => inventoryApi.getRoles(page, pageSize, search),
  });
};

export const usePlatformUsers = (rawParams: { page?: number; pageSize?: number; search?: string; status?: string; businessId?: string } = {}) => {
  const params = { ...rawParams, search: useDebouncedValue(rawParams.search) };
  return useQuery({
    queryKey: [...inventoryKeys.platformUsers(), params],
    queryFn: () => inventoryApi.getPlatformUsers(params),
  });
};

export const useUserActivities = (userId: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: [...inventoryKeys.userActivities(userId), page, pageSize],
    queryFn: () => inventoryApi.getUserActivities(userId, page, pageSize),
    enabled: !!userId,
  });
};

export const useBusinessUsers = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessUsers(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessUsers(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessSubscriptions = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessSubscriptions(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessSubscriptions(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessProducts = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessProducts(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessProducts(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessSales = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessSales(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessSales(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessExpenses = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessExpenses(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessExpenses(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessWhatsapp = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessWhatsapp(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessWhatsapp(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessIntegrations = (id: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businessIntegrations(id), page, pageSize],
    queryFn: () => inventoryApi.getBusinessIntegrations(id, page, pageSize),
    enabled: !!id,
  });
};

export const useBusinessAi = (id: string) => {
  return useQuery({
    queryKey: [...inventoryKeys.business(id), 'ai'],
    queryFn: () => inventoryApi.getBusinessAi(id),
    enabled: !!id,
  });
};
