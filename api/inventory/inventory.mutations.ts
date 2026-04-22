import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import { inventoryKeys } from './inventory.queries';
import { Business, PointConfig, ReferralTier } from './inventory.types';
import { toast } from 'sonner';

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Business>) => inventoryApi.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      toast.success('Business created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while creating the business');
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) =>
      inventoryApi.updateBusiness(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.business(data.id) });
      toast.success('Business updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating the business');
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.businesses() });
      toast.success('Business deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while deleting the business');
    },
  });
};

// Referral Tier Mutations
export const useCreateReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ReferralTier>) => inventoryApi.createReferralTier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create referral tier');
    },
  });
};

export const useUpdateReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReferralTier> }) =>
      inventoryApi.updateReferralTier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update referral tier');
    },
  });
};

export const useDeleteReferralTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteReferralTier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.referralTiers() });
      toast.success('Referral tier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete referral tier');
    },
  });
};

// Point Config Mutations
export const useCreatePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PointConfig>) => inventoryApi.createPointConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create point configuration');
    },
  });
};

export const useUpdatePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PointConfig> }) =>
      inventoryApi.updatePointConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update point configuration');
    },
  });
};

export const useDeletePointConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deletePointConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.pointConfigs() });
      toast.success('Point configuration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete point configuration');
    },
  });
};
