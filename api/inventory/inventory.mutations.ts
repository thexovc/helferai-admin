import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './inventory.api';
import { inventoryKeys } from './inventory.queries';
import { Business } from './inventory.types';
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
