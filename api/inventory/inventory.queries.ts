import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  kpis: () => [...inventoryKeys.all, 'kpis'] as const,
  charts: () => [...inventoryKeys.all, 'charts'] as const,
  dashboard: () => [...inventoryKeys.all, 'dashboard'] as const,
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
  referrals: () => [...inventoryKeys.all, 'referrals'] as const,
  integrations: () => [...inventoryKeys.all, 'integrations'] as const,
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
  finance: () => [...inventoryKeys.all, 'finance'] as const,
};

export const useInventoryKpis = () => {
  return useQuery({
    queryKey: inventoryKeys.kpis(),
    queryFn: inventoryApi.getKpis,
  });
};

export const useInventoryDashboard = () => {
  return useQuery({
    queryKey: inventoryKeys.dashboard(),
    queryFn: inventoryApi.getDashboardData,
  });
};

export const useInventoryCharts = () => {
  return useQuery({
    queryKey: inventoryKeys.charts(),
    queryFn: inventoryApi.getCharts,
  });
};

export const useInventoryBusinesses = (page = 1, pageSize = 10, search = '', filter = '') => {
  return useQuery({
    queryKey: [...inventoryKeys.businesses(), page, pageSize, search, filter],
    queryFn: () => inventoryApi.getBusinesses(page, pageSize, search, filter),
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

export const useInventoryReferrals = () => {
  return useQuery({
    queryKey: inventoryKeys.referrals(),
    queryFn: inventoryApi.getReferralAnalytics,
  });
};

export const useInventoryIntegrations = () => {
  return useQuery({
    queryKey: inventoryKeys.integrations(),
    queryFn: inventoryApi.getIntegrations,
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

export const useInventoryBrands = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.brands(), page, pageSize],
    queryFn: () => inventoryApi.getBrands(page, pageSize),
  });
};

export const useInventoryCategories = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.categories(), page, pageSize],
    queryFn: () => inventoryApi.getCategories(page, pageSize),
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

export const useInventorySubscriptions = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.subscriptions(), page, pageSize],
    queryFn: () => inventoryApi.getSubscriptions(page, pageSize),
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

export const useInventoryFinance = () => {
  return useQuery({
    queryKey: inventoryKeys.finance(),
    queryFn: inventoryApi.getFinanceData,
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
