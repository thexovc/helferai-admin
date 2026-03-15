import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  kpis: () => [...inventoryKeys.all, 'kpis'] as const,
  charts: () => [...inventoryKeys.all, 'charts'] as const,
  businesses: () => [...inventoryKeys.all, 'businesses'] as const,
  business: (id: string) => [...inventoryKeys.all, 'business', id] as const,
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
};

export const useInventoryKpis = () => {
  return useQuery({
    queryKey: inventoryKeys.kpis(),
    queryFn: inventoryApi.getKpis,
  });
};

export const useInventoryCharts = () => {
  return useQuery({
    queryKey: inventoryKeys.charts(),
    queryFn: inventoryApi.getCharts,
  });
};

export const useInventoryBusinesses = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...inventoryKeys.businesses(), page, pageSize],
    queryFn: () => inventoryApi.getBusinesses(page, pageSize),
  });
};

export const useInventoryBusiness = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.business(id),
    queryFn: () => inventoryApi.getBusinessById(id),
    enabled: !!id,
  });
};

export const useInventoryTransactions = () => {
  return useQuery({
    queryKey: inventoryKeys.transactions(),
    queryFn: inventoryApi.getTransactions,
  });
};

export const useInventoryProducts = () => {
  return useQuery({
    queryKey: inventoryKeys.products(),
    queryFn: inventoryApi.getProducts,
  });
};

export const useInventoryAiUsage = () => {
  return useQuery({
    queryKey: inventoryKeys.aiUsage(),
    queryFn: inventoryApi.getAiUsage,
  });
};

export const useInventoryBroadcasts = () => {
  return useQuery({
    queryKey: inventoryKeys.broadcasts(),
    queryFn: inventoryApi.getBroadcastHistory,
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

export const useInventoryTestimonials = () => {
  return useQuery({
    queryKey: inventoryKeys.testimonials(),
    queryFn: inventoryApi.getTestimonials,
  });
};

export const useInventoryActivityLogs = () => {
  return useQuery({
    queryKey: inventoryKeys.activityLogs(),
    queryFn: inventoryApi.getActivityLogs,
  });
};

export const useInventoryBrands = () => {
  return useQuery({
    queryKey: inventoryKeys.brands(),
    queryFn: inventoryApi.getBrands,
  });
};

export const useInventoryCategories = () => {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: inventoryApi.getCategories,
  });
};

export const useInventoryUnits = () => {
  return useQuery({
    queryKey: inventoryKeys.units(),
    queryFn: inventoryApi.getUnits,
  });
};

export const useInventoryWhatsappNumbers = () => {
  return useQuery({
    queryKey: inventoryKeys.whatsappNumbers(),
    queryFn: inventoryApi.getWhatsappNumbers,
  });
};

export const useInventorySubscriptions = () => {
  return useQuery({
    queryKey: inventoryKeys.subscriptions(),
    queryFn: inventoryApi.getSubscriptions,
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

export const useInventoryReferralRewards = () => {
  return useQuery({
    queryKey: inventoryKeys.referralRewards(),
    queryFn: inventoryApi.getReferralRewards,
  });
};

export const useInventoryFinanceSummary = () => {
  return useQuery({
    queryKey: inventoryKeys.financeSummary(),
    queryFn: inventoryApi.getFinanceSummary,
  });
};
