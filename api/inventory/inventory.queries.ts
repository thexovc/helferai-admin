import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import * as T from './inventory.types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  kpis: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'kpis', { startDate, endDate }] as const,
  charts: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'charts', { startDate, endDate }] as const,
  dashboard: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'dashboard', { startDate, endDate }] as const,
  businesses: () => [...inventoryKeys.all, 'businesses'] as const,
  business: (id: string) => [...inventoryKeys.all, 'business', id] as const,
  businessUsers: (id: string) => [...inventoryKeys.business(id), 'users'] as const,
  businessSubscriptions: (id: string) => [...inventoryKeys.business(id), 'subscriptions'] as const,
  businessProducts: (id: string) => [...inventoryKeys.business(id), 'products'] as const,
  businessSales: (id: string) => [...inventoryKeys.business(id), 'sales'] as const,
  businessExpenses: (id: string) => [...inventoryKeys.business(id), 'expenses'] as const,
  businessWhatsapp: (id: string) => [...inventoryKeys.business(id), 'whatsapp'] as const,
  businessIntegrations: (id: string) => [...inventoryKeys.business(id), 'integrations'] as const,
  businessAi: (id: string) => [...inventoryKeys.business(id), 'ai'] as const,
  transactions: () => [...inventoryKeys.all, 'transactions'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  aiUsage: () => [...inventoryKeys.all, 'aiUsage'] as const,
  broadcasts: () => [...inventoryKeys.all, 'broadcasts'] as const,
  referrals: (params?: { search?: string; pointsFilter?: string; page?: number; pageSize?: number }) =>
    [...inventoryKeys.all, 'referrals', params] as const,
  integrations: (params?: any) => [...inventoryKeys.all, 'integrations', params] as const,
  testimonials: () => [...inventoryKeys.all, 'testimonials'] as const,
  activityLogs: () => [...inventoryKeys.all, 'activityLogs'] as const,
  brands: () => [...inventoryKeys.all, 'brands'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  units: () => [...inventoryKeys.all, 'units'] as const,
  whatsappNumbers: () => [...inventoryKeys.all, 'whatsappNumbers'] as const,
  subscriptions: () => [...inventoryKeys.all, 'subscriptions'] as const,
  referralTiers: () => [...inventoryKeys.all, 'referralTiers'] as const,
  pointConfigs: () => [...inventoryKeys.all, 'pointConfigs'] as const,
  referralRewards: () => [...inventoryKeys.all, 'referralRewards'] as const,
  financeSummary: () => [...inventoryKeys.all, 'financeSummary'] as const,
  finance: (startDate?: string, endDate?: string) => [...inventoryKeys.all, 'finance', { startDate, endDate }] as const,
  financeSubscriptions: (params: any) => [...inventoryKeys.all, 'financeSubscriptions', params] as const,
};

export const useInventoryKpis = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.kpis(startDate, endDate),
    queryFn: () => inventoryApi.getKpis(startDate, endDate),
  });
};

export const useInventoryDashboard = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.dashboard(startDate, endDate),
    queryFn: () => inventoryApi.getDashboardData(startDate, endDate),
  });
};

export const useInventoryCharts = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: inventoryKeys.charts(startDate, endDate),
    queryFn: () => inventoryApi.getCharts(startDate, endDate),
  });
};

export const useInventoryBusinesses = (page = 1, pageSize = 10, search = '', filter = '') => {
  return useQuery<T.PaginatedResponse<T.Business>>({
    queryKey: [...inventoryKeys.businesses(), page, pageSize, search, filter],
    queryFn: () => inventoryApi.getBusinesses(page, pageSize, search, filter),
    placeholderData: (previousData) => previousData,
  });
};

export const useInventoryBusiness = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.business(id),
    queryFn: () => inventoryApi.getBusinessById(id),
    enabled: !!id,
  });
};

export const useInventoryTransactions = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.transactions(), page, pageSize],
    queryFn: () => inventoryApi.getTransactions(page, pageSize),
  });
};

export const useInventoryProducts = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.products(), page, pageSize],
    queryFn: () => inventoryApi.getProducts(page, pageSize),
  });
};

export const useInventoryAiUsage = () => {
  return useQuery({
    queryKey: inventoryKeys.aiUsage(),
    queryFn: inventoryApi.getAiUsage,
  });
};

export const useInventoryBroadcasts = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.broadcasts(), page, pageSize],
    queryFn: () => inventoryApi.getBroadcastHistory(page, pageSize),
  });
};

export const useInventoryReferrals = (params?: { search?: string; pointsFilter?: string; page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: inventoryKeys.referrals(params),
    queryFn: () => inventoryApi.getReferralAnalytics(params),
  });
};

export const useInventoryIntegrations = (params?: { search?: string; status?: string; authStatus?: string; page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: inventoryKeys.integrations(params),
    queryFn: () => inventoryApi.getIntegrations(params),
  });
};

export const useInventoryTestimonials = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.testimonials(), page, pageSize],
    queryFn: () => inventoryApi.getTestimonials(page, pageSize),
  });
};

export const useInventoryActivityLogs = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.activityLogs(), page, pageSize],
    queryFn: () => inventoryApi.getActivityLogs(page, pageSize),
  });
};

export const useInventoryBrands = (page = 1, pageSize = 10, search = '', sortBy?: string, sortOrder?: string, status?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...inventoryKeys.brands(), page, pageSize, search, sortBy, sortOrder, status, startDate, endDate],
    queryFn: () => inventoryApi.getBrands(page, pageSize, search, sortBy, sortOrder, status, startDate, endDate),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; manufacturer?: string } }) =>
      inventoryApi.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.brands() });
    },
  });
};

export const useInventoryCategories = (page = 1, pageSize = 10, search = '', sortBy?: string, sortOrder?: string, status?: string) => {
  return useQuery({
    queryKey: [...inventoryKeys.categories(), page, pageSize, search, sortBy, sortOrder, status],
    queryFn: () => inventoryApi.getCategories(page, pageSize, search, sortBy, sortOrder, status),
  });
};

export const useInventoryUnits = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.units(), page, pageSize],
    queryFn: () => inventoryApi.getUnits(page, pageSize),
  });
};

export const useInventoryWhatsappNumbers = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.whatsappNumbers(), page, pageSize],
    queryFn: () => inventoryApi.getWhatsappNumbers(page, pageSize),
  });
};

interface SubscriptionFilters {
  search?: string;
  plan?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const useInventorySubscriptions = (
  page = 1,
  pageSize = 10,
  filters?: SubscriptionFilters,
) => {
  return useQuery({
    queryKey: [...inventoryKeys.subscriptions(), page, pageSize, filters],
    queryFn: () => inventoryApi.getSubscriptions(page, pageSize, filters),
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
  return useQuery<T.UnifiedFinanceData>({
    queryKey: inventoryKeys.finance(startDate, endDate),
    queryFn: () => inventoryApi.getFinanceData(startDate, endDate),
    staleTime: 2 * 60 * 1000,
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

export const useInventoryFinanceSubscriptions = (params: any) => {
  return useQuery<T.PaginatedResponse<T.FinanceSubscription>>({
    queryKey: inventoryKeys.financeSubscriptions(params),
    queryFn: () => inventoryApi.getFinanceSubscriptions(params),
    staleTime: 60 * 1000,
    placeholderData: previousData => previousData,
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T.Category> }) => inventoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
};
